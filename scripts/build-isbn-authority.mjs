import fs from 'node:fs';
import path from 'node:path';

const manifestPath='content/isbn-authority-293.json';
const manifest=JSON.parse(fs.readFileSync(manifestPath,'utf8'));
const rows=manifest.parts.flatMap(file=>JSON.parse(fs.readFileSync(path.join('content',file),'utf8')));
const columns=manifest.columns;
const rawRecords=rows.map(row=>Object.fromEntries(columns.map((key,index)=>[key,row[index]]).filter(([key])=>!key.startsWith('_'))));
const recordOverrideByIsbn=new Map((manifest.recordOverrides||[]).map(rule=>[rule.isbn,rule]));
const records=rawRecords.map(record=>{
 const override=recordOverrideByIsbn.get(record.isbn);
 if(!override)return record;
 return {
  ...record,
  sourceTitle:record.title,
  title:override.canonicalTitle||record.title,
  editorOverride:{editorialBasis:override.editorialBasis||null,aliases:override.aliases||[]}
 };
});
const byIsbn=new Map(records.map(record=>[record.isbn,record]));
const digits='०१२३४५६७८९';
const normalize=value=>String(value??'').normalize('NFKC').toLowerCase().replace(/[०-९]/g,d=>String(digits.indexOf(d))).replace(/[’'“”"`´·•:;,.!?()\[\]{}_/\\|+*=~^<>–—-]+/g,' ').replace(/\s+/g,' ').trim();
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const isbnOk=value=>{const d=String(value).replace(/-/g,'');if(!/^978\d{10}$/.test(d))return false;const sum=[...d.slice(0,12)].reduce((n,x,i)=>n+Number(x)*(i%2?3:1),0);return (10-(sum%10))%10===Number(d[12]);};

const failures=[];
if(manifest.schemaVersion!==1)failures.push(`Unsupported ISBN authority schema ${manifest.schemaVersion}`);
if(records.length!==manifest.counts.total)failures.push(`Expected ${manifest.counts.total} authority rows, found ${records.length}`);
if(new Set(records.map(r=>r.isbn)).size!==records.length)failures.push('ISBN authority contains duplicate ISBN numbers');
if(columns.includes('publisher'))failures.push('Publisher must not be used by the ISBN authority model');
if(!manifest.discardedSourceColumns?.includes('Name of Publishing Agency/Publisher'))failures.push('Publisher source column must be explicitly discarded');
for(const record of records){
 if('publisher' in record||'_discardedPublishingAgencyPublisher' in record)failures.push(`Publisher data leaked into authority record: ${record.isbn}`);
 if(!isbnOk(record.isbn))failures.push(`Invalid ISBN-13 check digit: ${record.isbn} — ${record.title}`);
}
for(const rule of manifest.recordOverrides||[]){
 const raw=rawRecords.find(r=>r.isbn===rule.isbn);
 const corrected=byIsbn.get(rule.isbn);
 if(!raw)failures.push(`Editor override ISBN absent from imported authority: ${rule.isbn}`);
 if(!String(rule.canonicalTitle||'').trim())failures.push(`Editor override missing canonical title: ${rule.isbn}`);
 if(corrected?.title!==rule.canonicalTitle)failures.push(`Editor override failed to apply canonical title: ${rule.isbn}`);
}
const gajendra=records.filter(r=>r.administrator==='Gajendra').length;
const prity=records.filter(r=>r.administrator==='Kumari Prity').length;
if(gajendra!==manifest.counts.gajendraAdministrator)failures.push(`Gajendra administrator count ${gajendra} != ${manifest.counts.gajendraAdministrator}`);
if(prity!==manifest.counts.kumariPrityAdministrator)failures.push(`Kumari Prity administrator count ${prity} != ${manifest.counts.kumariPrityAdministrator}`);

const aliasToIsbn=new Map();
const addAlias=(alias,isbn)=>{
 const key=normalize(alias),prior=aliasToIsbn.get(key);
 if(!key)return;
 if(prior&&prior!==isbn)failures.push(`Alias resolves to two ISBNs: ${alias}`);
 aliasToIsbn.set(key,isbn);
};
for(const rule of manifest.identityOverrides){
 const canonical=byIsbn.get(rule.canonicalIsbn);
 if(!canonical)failures.push(`Identity override ISBN absent from authority: ${rule.canonicalIsbn}`);
 for(const alias of [rule.canonicalLabel,...rule.sameWorkAliases])addAlias(alias,rule.canonicalIsbn);
}
for(const rule of manifest.recordOverrides||[]){
 for(const alias of [rule.canonicalTitle,...(rule.aliases||[])])addAlias(alias,rule.isbn);
}
const requiredIdentity={
 'gadya padya bharti 1':'978-93-341-0402-8',
 'videha sadeha 28':'978-93-341-0402-8',
 'gadya padya bharti 2':'978-93-5890-150-4',
 'videha sadeha 37':'978-93-5890-150-4',
 'आत्मतत्त्वविवेक':'978-93-5943-857-3',
 'atmatattvaviveka':'978-93-5943-857-3',
 'ātmatattvaviveka':'978-93-5943-857-3'
};
for(const [alias,isbn] of Object.entries(requiredIdentity))if(aliasToIsbn.get(normalize(alias))!==isbn)failures.push(`Required identity rule failed: ${alias} => ${isbn}`);

const titleIndex=new Map();
for(const record of records){const key=normalize(record.title);if(!titleIndex.has(key))titleIndex.set(key,[]);titleIndex.get(key).push(record);}
const worksPath='app/works.json';
const works=JSON.parse(fs.readFileSync(worksPath,'utf8'));
let changed=0,mapped=0,cleared=0,ambiguous=0;
for(const work of works){
 const keys=[normalize(work.title),normalize(work.titleEn)].filter(Boolean);
 const candidateIsbns=new Set();
 for(const key of keys){
  for(const record of titleIndex.get(key)||[])candidateIsbns.add(record.isbn);
  const alias=aliasToIsbn.get(key);if(alias)candidateIsbns.add(alias);
 }
 let authoritative=null;
 if(candidateIsbns.size===1)authoritative=[...candidateIsbns][0];
 else if(candidateIsbns.size>1){
  ambiguous++;
  if(typeof work.isbn==='string'&&candidateIsbns.has(work.isbn))authoritative=work.isbn;
 }
 if(authoritative){mapped++;if(work.isbn!==authoritative){work.isbn=authoritative;changed++;}}
 else if('isbn' in work){delete work.isbn;changed++;cleared++;}
}
if(changed)fs.writeFileSync(worksPath,JSON.stringify(works,null,2)+'\n');

if(failures.length){console.error(failures.join('\n'));process.exit(1);}

const expanded=records.map(record=>({
 ...record,
 productForm:record.productFormOverride||manifest.defaults.productForm,
 country:manifest.defaults.country,
 status:manifest.defaults.status,
 verificationNotes:manifest.actionNoteCodes[record.actionNoteCode],
 allocation:{earmarked:1,available:0,used:1,totalEarmarked:1,booksSubmitted:0,booksPending:0,booksSurrendered:0}
}));
const authorityOut={
 schemaVersion:manifest.schemaVersion,authority:manifest.authority,authorityPolicy:manifest.authorityPolicy,retrieved:manifest.retrieved,
 sourceUrls:manifest.sourceUrls,counts:manifest.counts,discardedSourceColumns:manifest.discardedSourceColumns,recordOverrides:manifest.recordOverrides||[],identityOverrides:manifest.identityOverrides,records:expanded
};
fs.mkdirSync('public/isbn',{recursive:true});
fs.writeFileSync('public/isbn/isbn-authority-293.json',JSON.stringify(authorityOut,null,2)+'\n');

const aliases=new Map();
for(const rule of manifest.identityOverrides)aliases.set(rule.canonicalIsbn,[rule.canonicalLabel,...rule.sameWorkAliases].join(' · '));
for(const rule of manifest.recordOverrides||[]){
 const current=aliases.get(rule.isbn);
 const label=[rule.canonicalTitle,...(rule.aliases||[])].filter((v,i,a)=>v&&a.indexOf(v)===i).join(' · ');
 aliases.set(rule.isbn,[current,label].filter(Boolean).join(' · '));
}
const rowsHtml=expanded.map((r,i)=>`<tr data-q="${esc(normalize([r.isbn,r.title,r.sourceTitle,r.authorEditor,r.language,r.year,r.administrator,aliases.get(r.isbn)||''].join(' ')))}"><td>${i+1}</td><td><code>${esc(r.isbn)}</code>${aliases.has(r.isbn)?`<small class="alias">${esc(aliases.get(r.isbn))}</small>`:''}</td><td>${esc(r.title)}</td><td>${esc(r.authorEditor)}</td><td>${esc(r.language)}</td><td>${esc(r.edition||'—')}</td><td>${esc(r.year)}</td><td>${esc(r.publicationDate||'—')}</td><td>${esc(r.administrator)}</td></tr>`).join('');
const jsonLd={'@context':'https://schema.org','@type':'ItemList',name:'VIDEHA 293 ISBN LIST',numberOfItems:expanded.length,itemListElement:expanded.map((r,i)=>({'@type':'ListItem',position:i+1,item:{'@type':'Book',name:r.title,isbn:r.isbn,inLanguage:r.language,datePublished:r.publicationDate||String(r.year)}}))};
const html=`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>VIDEHA 293 ISBN LIST | Authoritative ISBN Registry</title><meta name="description" content="Authoritative Videha registry of 293 allotted ISBNs, retrieved 14 September 2026. Supersedes older ISBN lists."><link rel="canonical" href="https://videha-ejournal.github.io/gajendra-preeti/isbn/"><script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g,'\\u003c')}</script><style>*{box-sizing:border-box}body{margin:0;background:#f5f1e8;color:#18202a;font:16px/1.55 system-ui,'Noto Sans Devanagari',sans-serif}header,main,footer{max-width:1500px;margin:auto;padding:1.25rem clamp(1rem,3vw,2.5rem)}header{background:#18202a;color:#fff;max-width:none}header>div{max-width:1450px;margin:auto}h1{margin:.2rem 0;font:600 clamp(2rem,5vw,4rem)/1.1 Georgia,serif}.lede{max-width:900px;color:#dce2e8}.policy{border-left:4px solid #9c182f;padding:.7rem 1rem;background:#fff}.stats{display:flex;gap:.8rem;flex-wrap:wrap;margin:1rem 0}.stats span{background:#fff;border:1px solid #c9c3b8;padding:.55rem .8rem}.identity{background:#fff8d9;border:1px solid #d8c56b;padding:1rem;margin:1rem 0}.tools{position:sticky;top:0;background:#f5f1e8;padding:.7rem 0;z-index:2}.tools input{width:min(720px,100%);font:inherit;padding:.75rem;border:1px solid #7f7a70;border-radius:.35rem}table{width:100%;border-collapse:collapse;background:#fff;font-size:.9rem}th,td{padding:.65rem;border:1px solid #d8d2c8;text-align:left;vertical-align:top}th{position:sticky;top:62px;background:#18202a;color:#fff;z-index:1}tbody tr:nth-child(even){background:#faf8f2}code{white-space:nowrap}.alias{display:block;margin-top:.3rem;color:#6b2433;font-weight:700}.hidden{display:none}footer{color:#5a5a5a}a{color:inherit} @media(max-width:900px){.tablewrap{overflow:auto}th{top:60px}}</style></head><body><header><div><p>Videha · ISBN authority</p><h1>VIDEHA 293 ISBN LIST</h1><p class="lede">Retrieved 14 September 2026 from the Government of India ISBN portal. This registry is authoritative for Videha ISBN metadata and supersedes older ISBN lists or conflicting ISBN/title mappings. Explicit editor corrections recorded in the authority manifest prevail over incomplete source-row wording.</p></div></header><main><p class="policy"><strong>Override policy:</strong> where older Videha metadata conflicts with this registry, this registry prevails.</p><div class="stats"><span><strong>293</strong> unique ISBNs</span><span><strong>182</strong> Gajendra administrator</span><span><strong>111</strong> Kumari Prity administrator</span></div><section class="identity"><strong>Editor-fixed identities:</strong><br>Gadya Padya Bharti 1 = Videha Sadeha 28 = <code>978-93-341-0402-8</code><br>Gadya Padya Bharti 2 = Videha Sadeha 37 = <code>978-93-5890-150-4</code><br>आत्मतत्त्वविवेक / Ātmatattvaviveka = <code>978-93-5943-857-3</code></section><div class="tools"><label for="q"><strong>Search all 293 records</strong></label><br><input id="q" type="search" placeholder="ISBN, title, author/editor, language, year…" autocomplete="off"><span id="count" aria-live="polite">293 records</span></div><div class="tablewrap"><table><thead><tr><th>#</th><th>ISBN</th><th>Book title</th><th>Author / Editor</th><th>Language</th><th>Edition</th><th>Year</th><th>Publication date</th><th>Administrator</th></tr></thead><tbody>${rowsHtml}</tbody></table></div><p>Machine-readable authority: <a href="isbn-authority-293.json">isbn-authority-293.json</a></p></main><footer><p>Sources: ${manifest.sourceUrls.map(u=>`<a href="${esc(u)}">${esc(u)}</a>`).join(' · ')}</p><p><a href="/gajendra-preeti/">← Videha Literary Atlas</a></p></footer><script>const q=document.getElementById('q'),rows=[...document.querySelectorAll('tbody tr')],count=document.getElementById('count');function f(){const s=q.value.normalize('NFKC').toLowerCase().trim();let n=0;for(const r of rows){const show=!s||r.dataset.q.includes(s);r.classList.toggle('hidden',!show);if(show)n++}count.textContent=n+' record'+(n===1?'':'s')}q.addEventListener('input',f)</script></body></html>`;
fs.writeFileSync('public/isbn/index.html',html);

const sitemapPath='public/sitemap.xml';
if(fs.existsSync(sitemapPath)){
 let sitemap=fs.readFileSync(sitemapPath,'utf8');
 const url='https://videha-ejournal.github.io/gajendra-preeti/isbn/';
 if(!sitemap.includes(`<loc>${url}</loc>`))sitemap=sitemap.replace('</urlset>',`<url><loc>${url}</loc><lastmod>${manifest.retrieved}</lastmod></url>\n</urlset>`);
 fs.writeFileSync(sitemapPath,sitemap);
}
console.log(`VIDEHA ISBN authority PASS: ${records.length} unique ISBNs; administrators ${gajendra}/${prity}; publisher column discarded; ${mapped} atlas work(s) mapped; ${ambiguous} ambiguous title match(es); ${cleared} stale work ISBN(s) cleared; ${manifest.identityOverrides.length} same-work rule(s); ${(manifest.recordOverrides||[]).length} editor record correction(s) enforced.`);
