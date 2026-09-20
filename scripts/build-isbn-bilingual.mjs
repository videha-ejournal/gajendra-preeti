import fs from 'node:fs';

const base='https://videha-ejournal.github.io/gajendra-preeti';
const dataPath='public/isbn/isbn-authority-293.json';
const manifest=JSON.parse(fs.readFileSync('content/isbn-authority-293.json','utf8'));
if(!fs.existsSync(dataPath)) throw new Error('ISBN authority JSON missing; run build-isbn-authority first.');
const data=JSON.parse(fs.readFileSync(dataPath,'utf8'));
const records=data.records||[];
if(records.length!==293) throw new Error(`Expected 293 ISBN authority records, found ${records.length}`);
for(const r of records){
 if('publisher' in r||'_discardedPublishingAgencyPublisher' in r) throw new Error(`Forbidden discarded field leaked into ISBN record ${r.isbn}`);
}
const atma=records.find(r=>r.isbn==='978-93-5943-857-3');
if(!atma||atma.title!=='आत्मतत्त्वविवेक') throw new Error('Editor authority missing: आत्मतत्त्वविवेक => 978-93-5943-857-3');
const required=[['978-93-341-0402-8','Videha Sadeha 28'],['978-93-5890-150-4','Videha Sadeha 37']];
for(const [isbn,label] of required)if(!records.some(r=>r.isbn===isbn))throw new Error(`Required ISBN identity missing: ${label} => ${isbn}`);

const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const normalize=v=>String(v??'').normalize('NFKC').toLowerCase().replace(/\s+/g,' ').trim();
const aliasByIsbn=new Map();
for(const rule of manifest.identityOverrides||[])aliasByIsbn.set(rule.canonicalIsbn,[rule.canonicalLabel,...rule.sameWorkAliases].join(' · '));
for(const rule of manifest.recordOverrides||[])aliasByIsbn.set(rule.isbn,[rule.canonicalTitle,...rule.aliases].join(' · '));

const strings={
 mai:{lang:'mai',dir:'',title:'VIDEHA 293 ISBN सूची | प्रामाणिक ISBN अभिलेख',h1:'VIDEHA 293 ISBN सूची',kicker:'विदेह · प्रामाणिक ISBN अभिलेख',lede:'भारत सरकारक ISBN पोर्टलसँ प्राप्त 293 ISBN कऽ प्रामाणिक विदेह सूची। पुरान सूची वा परस्पर-विरोधी ISBN/शीर्षक विवरणक ठाम ई अभिलेख मान्य अछि।',policy:'प्रामाणिकता नियम:',policyText:'सम्पादकक स्पष्ट सुधार सभसँ ऊपर मान्य अछि; तकर बाद एहि 293-ISBN अभिलेखक विवरण मान्य अछि।',unique:'अद्वितीय ISBN',gaj:'Gajendra प्रशासक',prity:'Kumari Prity प्रशासक',identity:'सम्पादक द्वारा निश्चित कृति-परिचय',search:'293 अभिलेखमे खोजू',placeholder:'ISBN, शीर्षक, लेखक/सम्पादक, भाषा, वर्ष…',records:'अभिलेख',cols:['#','ISBN','पोथीक शीर्षक','लेखक / सम्पादक','भाषा','संस्करण','वर्ष','प्रकाशन तिथि','प्रशासक'],machine:'मशीन-पठनीय प्रामाणिक अभिलेख',back:'← विदेह साहित्यिक एटलस',other:'English edition',otherHref:`${base}/en/isbn/`,canonical:`${base}/isbn/`},
 en:{lang:'en',dir:'en/',title:'VIDEHA 293 ISBN LIST | Authoritative ISBN Registry',h1:'VIDEHA 293 ISBN LIST',kicker:'Videha · authoritative ISBN registry',lede:'The authoritative Videha registry of 293 ISBNs retrieved from the Government of India ISBN portal. It supersedes older lists and conflicting ISBN/title metadata.',policy:'Authority rule:',policyText:'Explicit editor corrections take precedence; the 293-ISBN authority record governs thereafter.',unique:'unique ISBNs',gaj:'Gajendra administrator',prity:'Kumari Prity administrator',identity:'Same-work identities fixed by the editor',search:'Search all 293 records',placeholder:'ISBN, title, author/editor, language, year…',records:'records',cols:['#','ISBN','Book title','Author / Editor','Language','Edition','Year','Publication date','Administrator'],machine:'Machine-readable authority',back:'← Videha Literary Atlas',other:'मैथिली संस्करण',otherHref:`${base}/isbn/`,canonical:`${base}/en/isbn/`}
};

function makeHtml(s){
 const rows=records.map((r,i)=>`<tr data-q="${esc(normalize([r.isbn,r.title,r.authorEditor,r.language,r.year,r.administrator,aliasByIsbn.get(r.isbn)||''].join(' ')))}"><td>${i+1}</td><td><code>${esc(r.isbn)}</code>${aliasByIsbn.has(r.isbn)?`<small class="alias">${esc(aliasByIsbn.get(r.isbn))}</small>`:''}</td><td>${esc(r.title)}</td><td>${esc(r.authorEditor)}</td><td>${esc(r.language)}</td><td>${esc(r.edition||'—')}</td><td>${esc(r.year)}</td><td>${esc(r.publicationDate||'—')}</td><td>${esc(r.administrator)}</td></tr>`).join('');
 const jsonLd={'@context':'https://schema.org','@type':'ItemList',name:s.h1,numberOfItems:records.length,itemListElement:records.map((r,i)=>({'@type':'ListItem',position:i+1,item:{'@type':'Book',name:r.title,isbn:r.isbn,inLanguage:r.language,datePublished:r.publicationDate||String(r.year)}}))};
 const identities=`Gadya Padya Bharti 1 = Videha Sadeha 28 = <code>978-93-341-0402-8</code><br>Gadya Padya Bharti 2 = Videha Sadeha 37 = <code>978-93-5890-150-4</code><br>आत्मतत्त्वविवेक / Ātmatattvaviveka = <code>978-93-5943-857-3</code>`;
 return `<!doctype html><html lang="${s.lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(s.title)}</title><meta name="description" content="${esc(s.lede)}"><link rel="canonical" href="${s.canonical}"><link rel="alternate" hreflang="mai" href="${base}/isbn/"><link rel="alternate" hreflang="en" href="${base}/en/isbn/"><link rel="alternate" hreflang="x-default" href="${base}/isbn/"><script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g,'\\u003c')}</script><style>*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:#f5f1e8;color:#18202a;font:16px/1.55 system-ui,'Noto Sans Devanagari',sans-serif}a{color:inherit}header,main,footer{max-width:1500px;margin:auto;padding:1.25rem clamp(1rem,3vw,2.5rem)}header{background:#18202a;color:#fff;max-width:none}header>div{max-width:1450px;margin:auto}h1{margin:.2rem 0;font:600 clamp(2rem,5vw,4rem)/1.1 Georgia,'Noto Serif Devanagari',serif}.lede{max-width:900px;color:#dce2e8}.switch{display:inline-block;margin-top:.8rem}.policy{border-left:4px solid #9c182f;padding:.7rem 1rem;background:#fff}.stats{display:flex;gap:.8rem;flex-wrap:wrap;margin:1rem 0}.stats span{background:#fff;border:1px solid #c9c3b8;padding:.55rem .8rem}.identity{background:#fff8d9;border:1px solid #d8c56b;padding:1rem;margin:1rem 0}.tools{position:sticky;top:0;background:#f5f1e8;padding:.7rem 0;z-index:2}.tools input{width:min(720px,100%);font:inherit;padding:.75rem;border:1px solid #7f7a70;border-radius:.35rem}.count{margin-left:.6rem}table{width:100%;border-collapse:collapse;background:#fff;font-size:.9rem}th,td{padding:.65rem;border:1px solid #d8d2c8;text-align:left;vertical-align:top}th{position:sticky;top:62px;background:#18202a;color:#fff;z-index:1}tbody tr:nth-child(even){background:#faf8f2}code{white-space:nowrap}.alias{display:block;margin-top:.3rem;color:#6b2433;font-weight:700}.hidden{display:none}footer{color:#5a5a5a}@media(max-width:900px){.tablewrap{overflow:auto}th{top:60px}}</style></head><body><header><div><p>${esc(s.kicker)}</p><h1>${esc(s.h1)}</h1><p class="lede">${esc(s.lede)}</p><a class="switch" href="${s.otherHref}" hreflang="${s.lang==='mai'?'en':'mai'}">${esc(s.other)} →</a></div></header><main><p class="policy"><strong>${esc(s.policy)}</strong> ${esc(s.policyText)}</p><div class="stats"><span><strong>293</strong> ${esc(s.unique)}</span><span><strong>182</strong> ${esc(s.gaj)}</span><span><strong>111</strong> ${esc(s.prity)}</span></div><section class="identity"><strong>${esc(s.identity)}:</strong><br>${identities}</section><div class="tools"><label for="q"><strong>${esc(s.search)}</strong></label><br><input id="q" type="search" placeholder="${esc(s.placeholder)}" autocomplete="off"><span id="count" class="count" aria-live="polite">293 ${esc(s.records)}</span></div><div class="tablewrap"><table><thead><tr>${s.cols.map(x=>`<th>${esc(x)}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table></div><p>${esc(s.machine)}: <a href="isbn-authority-293.json">isbn-authority-293.json</a></p></main><footer><p><a href="${s.lang==='mai'?'/gajendra-preeti/':'/gajendra-preeti/en/'}">${esc(s.back)}</a></p></footer><script>const q=document.getElementById('q'),rows=[...document.querySelectorAll('tbody tr')],count=document.getElementById('count');function f(){const s=q.value.normalize('NFKC').toLowerCase().trim();let n=0;for(const r of rows){const show=!s||r.dataset.q.includes(s);r.classList.toggle('hidden',!show);if(show)n++}count.textContent=n+' ${s.records.replaceAll("'","\\'")}'}q.addEventListener('input',f)</script></body></html>`;
}

fs.mkdirSync('public/isbn',{recursive:true});
fs.mkdirSync('public/en/isbn',{recursive:true});
fs.writeFileSync('public/isbn/index.html',makeHtml(strings.mai));
fs.writeFileSync('public/en/isbn/index.html',makeHtml(strings.en));
const json=fs.readFileSync(dataPath,'utf8');
fs.writeFileSync('public/en/isbn/isbn-authority-293.json',json);

function addBibliographyLink(file,href,label){
 if(!fs.existsSync(file))return;
 let html=fs.readFileSync(file,'utf8');
 if(html.includes(`href="${href}"`))return;
 const block=`<p class="isbn-authority-route"><a href="${href}">${esc(label)}</a></p>`;
 html=html.includes('</main>')?html.replace('</main>',`${block}</main>`):html.replace('</body>',`${block}</body>`);
 fs.writeFileSync(file,html);
}
addBibliographyLink('public/bibliography/index.html','/gajendra-preeti/isbn/','प्रामाणिक ISBN सूची →');
addBibliographyLink('public/en/bibliography/index.html','/gajendra-preeti/en/isbn/','Authoritative ISBN registry →');

const sitemap='public/sitemap.xml';
if(fs.existsSync(sitemap)){
 let xml=fs.readFileSync(sitemap,'utf8');
 const urls=[`${base}/changelog/`,`${base}/isbn/`,`${base}/en/isbn/`];
 for(const url of urls)if(!xml.includes(`<loc>${url}</loc>`))xml=xml.replace('</urlset>',`<url><loc>${url}</loc><lastmod>${manifest.retrieved}</lastmod></url>\n</urlset>`);
 fs.writeFileSync(sitemap,xml);
}
console.log('Bilingual ISBN registry PASS: 293 records; Maithili/English routes, bibliography links and sitemap routes generated.');
