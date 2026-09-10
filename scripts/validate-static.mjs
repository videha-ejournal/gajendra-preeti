import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const root='dist/client/gajendra-preeti';
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const english=fs.readFileSync(path.join(root,'en/index.html'),'utf8');
const manifest=JSON.parse(fs.readFileSync('dist/server/vinext-prerender.json','utf8'));
for(const route of ['/','/en']) assert.equal(manifest.routes.find(r=>r.route.replace(/\/$/,'')===route.replace(/\/$/,''))?.status,'rendered',`${route} must be statically rendered`);
assert.match(html,/<html lang="mai"/);
assert.match(html,/<title>प्रीति ठाकुर आ गजेन्द्र ठाकुर<\/title>/);
assert.match(english,/<html lang="en"/);
assert.match(english,/lang="en" class="english-edition"/);
assert.match(english,/<title>Preeti Thakur &amp; Gajendra Thakur/);
assert.match(html,/hreflang="en"/i);
assert.match(english,/hreflang="mai"/i);

const files=fs.readdirSync(path.join(root,'criticism')).filter(f=>f.endsWith('.html')).map(f=>'criticism/'+f);
assert.equal(files.length,JSON.parse(fs.readFileSync('content/catalogue-snapshot.json','utf8')).length+1,'Every catalogue entry plus index');
files.push(...fs.readdirSync(path.join(root,'criticism/reception')).filter(f=>f.endsWith('.html')).map(f=>'criticism/reception/'+f));
const idSets=new Map();
for(const file of ['index.html','en/index.html',...files]){
  const source=fs.readFileSync(path.join(root,file),'utf8');
  const ids=[...source.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
  assert.equal(new Set(ids).size,ids.length,`Duplicate IDs: ${file}`);
  idSets.set(file,new Set(ids));
}
for(const [file,ids] of idSets){
  const source=fs.readFileSync(path.join(root,file),'utf8');
  if(file.startsWith('criticism/')){assert.match(source,/<html lang="en"/);assert.match(source,/THE VIDEHA LITERARY ATLAS/);}
  for(const [,raw] of source.matchAll(/(?:href|src)="([^"]+)"/g)){
    const url=raw.replaceAll('&amp;','&');
    if(url.startsWith('#')){assert(ids.has(url.slice(1)),`Missing anchor ${url} in ${file}`);continue;}
    if(!url.startsWith('/gajendra-preeti/')) continue;
    const [pathname,fragment]=url.slice('/gajendra-preeti/'.length).split('#');
    let target=pathname.split('?')[0];
    if(!target||target.endsWith('/')) target+='index.html';
    assert(fs.existsSync(path.join(root,target)),`Missing local link ${url} in ${file}`);
    if(fragment&&idSets.has(target)) assert(idSets.get(target).has(fragment),`Missing target anchor ${url}`);
  }
}

const works=JSON.parse(fs.readFileSync('app/works.json','utf8'));
assert.equal(new Set(works.map(w=>w.id)).size,works.length);
for(const w of works){assert(w.title&&w.name&&w.titleEn&&w.nameEn&&w.kindEn);assert.equal(new URL(w.url).protocol,'https:');assert.equal(new URL(w.source).protocol,'https:');}
const readings=JSON.parse(fs.readFileSync(path.join(root,'criticism/manifest.json'),'utf8'));
const catalogue=JSON.parse(fs.readFileSync('content/catalogue-snapshot.json','utf8'));
for(const prefix of ['p','g']) assert.equal(readings.filter(r=>r.id.startsWith(prefix)).length,catalogue.filter(r=>r.id.startsWith(prefix)).length);
assert.deepEqual(new Set(readings.map(r=>r.id)),new Set(catalogue.map(r=>r.id)));
for(const r of readings){
  const text=fs.readFileSync(path.join(root,`criticism/${r.id}.html`),'utf8');
  assert.match(text,/id="evidence"/);assert.match(text,/id="question"/);assert.match(text,/prepared with AI assistance/);
}
for(const id of ['writers','paths','archive','journey','videha','criticism','sources']){assert(idSets.get('index.html').has(id));assert(idSets.get('en/index.html').has(id));}
assert(fs.existsSync(path.join(root,'.nojekyll')));

const sitemap=fs.readFileSync(path.join(root,'sitemap.xml'),'utf8');
const sitemapUrls=[...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);
const standaloneGuides=[
  {file:'water-burial-among-the-crocodiles/index.html',url:'https://videha-ejournal.github.io/gajendra-preeti/water-burial-among-the-crocodiles/',kind:'water'},
  {file:'parallel-philosophy/index.html',url:'https://videha-ejournal.github.io/gajendra-preeti/parallel-philosophy/',kind:'parallel'},
  {file:'parallel-philosophy/en/index.html',url:'https://videha-ejournal.github.io/gajendra-preeti/parallel-philosophy/en/',kind:'parallel'},
  {file:'parallel-history/index.html',url:'https://videha-ejournal.github.io/gajendra-preiti/parallel-history/',kind:'history'},
  {file:'parallel-history/en/index.html',url:'https://videha-ejournal.github.io/gajendra-preiti/parallel-history/en/',kind:'history'},
  {file:'classical-philosophy/index.html',url:'https://videha-ejournal.github.io/gajendra-preiti/classical-philosophy/',kind:'classical'},
  {file:'classical-philosophy/en/index.html',url:'https://videha-ejournal.github.io/gajendra-preiti/classical-philosophy/en/',kind:'classical'}
];
assert.equal(sitemapUrls.length,idSets.size+standaloneGuides.length,'Every indexed public page and standalone guide belongs in the sitemap');
assert.equal(new Set(sitemapUrls).size,sitemapUrls.length,'No duplicate sitemap URLs');
for(const file of idSets.keys()){
  const route=file.replace(/(^|\/)index\.html$/,'$1');
  assert(sitemapUrls.includes(`https://videha-ejournal.github.io/gajendra-preiti/${route}`),`Missing sitemap page: ${file}`);
}
for(const guide of standaloneGuides){
  assert(fs.existsSync(path.join(root,guide.file)),`Missing standalone guide: ${guide.file}`);
  assert(sitemapUrls.includes(guide.url),`Missing sitemap guide: ${guide.file}`);
  const source=fs.readFileSync(path.join(root,guide.file),'utf8');
  assert(source.includes(`rel="canonical" href="${guide.url}"`),`Canonical: ${guide.file}`);
  assert.match(source,/<meta name="description" content="[^"]+"/);
  assert.match(source,/property="og:title"/);
  assert(source.includes('reader.js'),`Missing guide reader: ${guide.file}`);
  if(guide.kind==='water') assert(fs.existsSync(path.join(root,'water-burial-among-the-crocodiles/manifest.json')),'Missing Water-Burial guide manifest');
  if(guide.kind==='parallel') assert(fs.existsSync(path.join(root,'parallel-philosophy/manifest.json')),'Missing Parallel Philosophy guide manifest');
  if(guide.kind==='history') assert(fs.existsSync(path.join(root,'parallel-history/manifest.json')),'Missing Parallel History guide manifest');
  if(guide.kind==='classical') assert(fs.existsSync(path.join(root,'classical-philosophy/manifest.json')),'Missing Classical Philosophy guide manifest');
}

const parallelManifest=JSON.parse(fs.readFileSync(path.join(root,'parallel-philosophy/manifest.json'),'utf8'));
assert.equal(parallelManifest.chapterCount,172,'Parallel Philosophy static manifest must expose 172 chapters.');
assert.deepEqual(parallelManifest.volumeCounts,{'1':72,'2':100},'Parallel Philosophy static volume counts must be 72 and 100.');
assert.equal(parallelManifest.partCount,23,'Parallel Philosophy static manifest must expose 23 thematic parts.');
const parallelChapters=[];
for(const file of parallelManifest.files){const payload=JSON.parse(fs.readFileSync(path.join(root,'parallel-philosophy',file),'utf8'));parallelChapters.push(...(payload.chapters||[]));}
parallelChapters.sort((a,b)=>a.volume-b.volume||a.n-b.n);
assert.equal(parallelChapters.length,172,'Parallel Philosophy static output must contain 172 chapter records.');
for(const [volume,count] of [[1,72],[2,100]]){const nums=parallelChapters.filter(c=>c.volume===volume).map(c=>c.n);assert.deepEqual(nums,Array.from({length:count},(_,i)=>i+1),`Parallel Philosophy Volume ${volume} chapter sequence incomplete.`);}
for(const c of parallelChapters) for(const lang of ['mai','en']){assert(String(c[lang]?.title||'').trim(),`Parallel Philosophy V${c.volume} Ch${c.n} missing ${lang} title`);assert(String(c[lang]?.summary||'').trim(),`Parallel Philosophy V${c.volume} Ch${c.n} missing ${lang} summary`);}

const historyManifest=JSON.parse(fs.readFileSync(path.join(root,'parallel-history/manifest.json'),'utf8'));
assert.equal(historyManifest.chapterCount,178,'Parallel History static manifest must expose all 178 chapters.');
assert.deepEqual(historyManifest.bookCounts,{'1':28,'2':150},'Parallel History static book counts must be 28 and 150.');
assert.equal(historyManifest.sectionCount,20,'Parallel History static manifest must expose all 20 source sections.');
assert.equal(historyManifest.sections?.length,20,'Parallel History static manifest must list 20 source sections.');
const historyChapters=[];
for(const file of historyManifest.files){const payload=JSON.parse(fs.readFileSync(path.join(root,'parallel-history',file),'utf8'));historyChapters.push(...(payload.chapters||[]));}
historyChapters.sort((a,b)=>a.book-b.book||a.n-b.n);
assert.equal(historyChapters.length,178,'Parallel History static output must contain 178 chapter records.');
for(const [book,count] of [[1,28],[2,150]]){const nums=historyChapters.filter(c=>c.book===book).map(c=>c.n);assert.deepEqual(nums,Array.from({length:count},(_,i)=>i+1),`Parallel History Book ${book} chapter sequence incomplete.`);}
for(const c of historyChapters){assert(historyManifest.sections.some(section=>section.id===c.section&&section.book===c.book),`Parallel History Book ${c.book} Ch${c.n} has invalid source section.`);for(const lang of ['mai','en']){assert(String(c[lang]?.title||'').trim(),`Parallel History Book ${c.book} Ch${c.n} missing ${lang} title`);assert(String(c[lang]?.summary||'').trim(),`Parallel History Book ${c.book} Ch${c.n} missing ${lang} summary`);}}
for(const section of historyManifest.sections){const group=historyChapters.filter(c=>c.section===section.id);assert.equal(group.length,section.count,`Parallel History ${section.id} count mismatch.`);assert.deepEqual(group.map(c=>c.n),Array.from({length:section.end-section.start+1},(_,i)=>section.start+i),`Parallel History ${section.id} range incomplete.`);}

const classicalManifest=JSON.parse(fs.readFileSync(path.join(root,'classical-philosophy/manifest.json'),'utf8'));
assert.equal(classicalManifest.unitCount,32,'Classical Philosophy must expose exactly 32 source units.');
assert.equal(classicalManifest.bookCount,4,'Classical Philosophy must expose exactly four works.');
assert.equal(classicalManifest.translationAnnexureCount,8,'Classical Philosophy must expose exactly eight translation annexures.');
assert.deepEqual(classicalManifest.bookCounts,{atmatattvaviveka:4,bhamati:4,nyayakusumanjali:12,tattvacintamani:12},'Classical Philosophy source-unit distribution must remain 4 + 4 + 12 + 12.');
const classicalData=JSON.parse(fs.readFileSync(path.join(root,'classical-philosophy/data.json'),'utf8'));
assert.equal(classicalData.records.length,32,'Classical Philosophy output data must contain 32 records.');
assert.equal(new Set(classicalData.records.map(r=>r.id)).size,32,'Classical Philosophy record ids must be unique.');
assert.equal(classicalData.records.filter(r=>r.translationAnnexure===true).length,8,'Classical Philosophy output must contain eight translation annexures.');
for(const [bookId,count] of Object.entries(classicalManifest.bookCounts)){
  const rows=classicalData.records.filter(r=>r.bookId===bookId);
  assert.equal(rows.length,count,`${bookId}: output unit count mismatch`);
  assert.deepEqual(rows.map(r=>r.order),Array.from({length:count},(_,i)=>i+1),`${bookId}: output order incomplete`);
}
for(const r of classicalData.records){assert(String(r.titleMai||'').trim(),`${r.id}: missing Maithili title`);assert(String(r.titleEn||'').trim(),`${r.id}: missing English title`);assert(String(r.summaryMai||'').trim(),`${r.id}: missing Maithili summary`);assert(String(r.summaryEn||'').trim(),`${r.id}: missing English summary`);}
assert(html.includes('/gajendra-preeti/classical-philosophy/'),'Maithili homepage must link to Classical Philosophy.');
assert(english.includes('/gajendra-preeti/classical-philosophy/en/'),'English homepage must link to Classical Philosophy.');

console.log(`Static validation passed: bilingual homepages, ${readings.length} source-linked readings, ${idSets.size} indexed HTML pages and ${standaloneGuides.length} standalone guides; all local assets and anchors resolve.`);

for(const [file,ids] of idSets){
  const source=fs.readFileSync(path.join(root,file),'utf8');
  assert(ids.has('videha-reading-tools'),`Missing reading controls: ${file}`);
  const expected='https://videha-ejournal.github.io/gajendra-preiti/'+file.replace(/(^|\/)index\.html$/,'$1');
  assert(source.includes(`rel="canonical" href="${expected}"`),`Canonical: ${file}`);
  assert.match(source,/<meta name="description" content="[^"]+"/);
  if(file.startsWith('criticism/')){assert(source.includes('reading-tools.js'));assert(source.includes('reading-tools.css'));assert(source.includes('no named human editorial review is recorded'));}
}
for(const file of ['index.html','en/index.html']){
  const source=fs.readFileSync(path.join(root,file),'utf8');
  for(const w of works) assert(idSets.get(file).has('work-'+w.id));
  const graph=JSON.parse(source.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])['@graph'];
  assert.equal(graph.filter(x=>x['@type']==='Person').length,2);
  assert.equal(graph.filter(x=>x['@type']==='CreativeWork').length,works.length);
}
const {createHash}=await import('node:crypto');
const mirrors=JSON.parse(fs.readFileSync('content/book-mirrors.json','utf8'));
assert.equal(mirrors.length,9);
for(const mirror of mirrors){const bytes=fs.readFileSync(path.join(root,'books',mirror.id+'.pdf'));assert.equal(bytes.subarray(0,5).toString(),'%PDF-');assert.equal(bytes.length,mirror.bytes);assert.equal(createHash('sha256').update(bytes).digest('hex'),mirror.sha256);}
console.log(`Extended validation passed: ${idSets.size} reading tool mounts and canonical descriptions, ${works.length} work anchors and structured records per edition, nine verified PDF mirrors.`);
for(const file of idSets.keys()){const source=fs.readFileSync(path.join(root,file),'utf8');for(const tag of ['og:title','og:description','og:image','twitter:card']) assert(source.includes('"'+tag+'"'),`${file}: ${tag}`);}
for(const file of ['index.html','en/index.html']){const source=fs.readFileSync(path.join(root,file),'utf8');assert(source.indexOf('id="search-guidance"')<source.indexOf('id="work-search"'));assert.match(source,/class="braille" aria-hidden="true"/);}
assert(fs.readFileSync(path.join(root,'robots.txt'),'utf8').includes('Sitemap: https://videha-ejournal.github.io/gajendra-preiti/sitemap.xml'));
console.log('Social previews, search guidance, decorative Braille and sitemap discovery passed.');
const reception=JSON.parse(fs.readFileSync('content/reception-gists.json','utf8'));
for(const a of reception.articles){const file=`criticism/reception/${a.book}.html`;assert(idSets.get(file).has(a.id),`Missing contribution: ${a.book}/${a.id}`);const source=fs.readFileSync(path.join(root,file),'utf8');assert(source.includes(`pp. ${a.start}–${a.end}`),`Missing page reference: ${a.id}`);}
console.log(`Reception coverage passed: ${reception.articles.length} attributed summaries across both supplied books.`);
