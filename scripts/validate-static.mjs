import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';

const root='dist/client/gajendra-preeti';
const BASE='https://videha-ejournal.github.io/gajendra-preeti/';
const read=(file)=>fs.readFileSync(path.join(root,file),'utf8');
const canonicalForFile=(file)=>file==='index.html'?BASE:file.endsWith('/index.html')?BASE+file.slice(0,-'index.html'.length):BASE+file;

const html=read('index.html');
const english=read('en/index.html');
const prerender=JSON.parse(fs.readFileSync('dist/server/vinext-prerender.json','utf8'));
for(const route of ['/','/en']) assert.equal(prerender.routes.find(r=>r.route.replace(/\/$/,'')===route.replace(/\/$/,''))?.status,'rendered',`${route} must be statically rendered`);
assert.match(html,/<html lang="mai"/); assert.match(html,/<title>प्रीति ठाकुर आ गजेन्द्र ठाकुर<\/title>/); assert.match(html,/hreflang="en"/i);
assert.match(english,/<html lang="en"/); assert.match(english,/lang="en" class="english-edition"/); assert.match(english,/<title>Preeti Thakur &amp; Gajendra Thakur/); assert.match(english,/hreflang="mai"/i);

const catalogue=JSON.parse(fs.readFileSync('content/catalogue-snapshot.json','utf8'));
const criticismMaiFiles=fs.readdirSync(path.join(root,'criticism')).filter(f=>f.endsWith('.html')).map(f=>'criticism/'+f);
const criticismEnFiles=fs.readdirSync(path.join(root,'criticism/en')).filter(f=>f.endsWith('.html')).map(f=>'criticism/en/'+f);
const receptionMaiFiles=fs.readdirSync(path.join(root,'criticism/reception')).filter(f=>f.endsWith('.html')).map(f=>'criticism/reception/'+f);
const receptionEnFiles=fs.readdirSync(path.join(root,'criticism/reception/en')).filter(f=>f.endsWith('.html')).map(f=>'criticism/reception/en/'+f);
assert.equal(criticismMaiFiles.length,catalogue.length+1,'Every catalogue entry plus Maithili criticism index');
assert.equal(criticismEnFiles.length,catalogue.length+1,'Every catalogue entry plus English criticism index');
assert.equal(receptionMaiFiles.length,3,'Reception must expose Maithili index + two book pages');
assert.equal(receptionEnFiles.length,3,'Reception must expose English index + two book pages');
const files=[...criticismMaiFiles,...criticismEnFiles,...receptionMaiFiles,...receptionEnFiles];
for(const entry of fs.readdirSync(path.join(root,'six-books'),{recursive:true}))if(String(entry).endsWith('.html'))files.push('six-books/'+String(entry).replaceAll('\\','/'));
const idSets=new Map();
for(const file of ['index.html','en/index.html',...files]){
  const source=read(file), ids=[...source.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
  assert.equal(new Set(ids).size,ids.length,`Duplicate IDs: ${file}`); idSets.set(file,new Set(ids));
}
for(const [file,ids] of idSets){
  const source=read(file);
  if(file.startsWith('criticism/en/')||file.startsWith('criticism/reception/en/')){assert.match(source,/<html lang="en"/);assert.match(source,/THE VIDEHA LITERARY ATLAS/);} else if(file.startsWith('criticism/')){assert.match(source,/<html lang="mai"/);assert.match(source,/THE VIDEHA LITERARY ATLAS/);}
  for(const [,raw] of source.matchAll(/(?:href|src)="([^"]+)"/g)){
    const url=raw.replaceAll('&amp;','&');
    if(url.startsWith('#')){assert(ids.has(url.slice(1)),`Missing anchor ${url} in ${file}`);continue;}
    if(!url.startsWith('/gajendra-preeti/')) continue;
    const [pathname,fragment]=url.slice('/gajendra-preeti/'.length).split('#'); let target=pathname.split('?')[0];
    if(!target||target.endsWith('/')) target+='index.html';
    assert(fs.existsSync(path.join(root,target)),`Missing local link ${url} in ${file}`);
    if(fragment&&idSets.has(target)) assert(idSets.get(target).has(fragment),`Missing target anchor ${url}`);
  }
}

const works=JSON.parse(fs.readFileSync('app/works.json','utf8'));
assert.equal(new Set(works.map(w=>w.id)).size,works.length);
for(const w of works){assert(w.title&&w.name&&w.titleEn&&w.nameEn&&w.kindEn);assert.equal(new URL(w.url).protocol,'https:');assert.equal(new URL(w.source).protocol,'https:');}
const readings=JSON.parse(read('criticism/manifest.json'));
for(const prefix of ['p','g']) assert.equal(readings.filter(r=>r.id.startsWith(prefix)).length,catalogue.filter(r=>r.id.startsWith(prefix)).length);
assert.deepEqual(new Set(readings.map(r=>r.id)),new Set(catalogue.map(r=>r.id)));
for(const r of readings){for(const file of [`criticism/${r.id}.html`,`criticism/en/${r.id}.html`]){const text=read(file);assert.match(text,/id="evidence"/);assert.match(text,/id="question"/);assert.match(text,/AI-(?:सहायता|assistance)|AI assistance/);}}
for(const id of ['writers','paths','archive','journey','videha','criticism','sources']){assert(idSets.get('index.html').has(id));assert(idSets.get('en/index.html').has(id));}
assert(fs.existsSync(path.join(root,'.nojekyll')));

const sitemapUrls=[...read('sitemap.xml').matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);
const standalone=[
 ['parallel-philosophy/index.html',BASE+'parallel-philosophy/','parallel'],['parallel-philosophy/en/index.html',BASE+'parallel-philosophy/en/','parallel'],
 ['parallel-history/index.html',BASE+'parallel-history/','history'],['parallel-history/en/index.html',BASE+'parallel-history/en/','history'],
 ['classical-philosophy/index.html',BASE+'classical-philosophy/','classical'],['classical-philosophy/en/index.html',BASE+'classical-philosophy/en/','classical'],
 ['drama-classics/index.html',BASE+'drama-classics/','drama'],['drama-classics/en/index.html',BASE+'drama-classics/en/','drama']
];
const pairedExtra=[
 ['when-dreams-merge/index.html',BASE+'when-dreams-merge/','mai'],
 ['when-dreams-merge/en/index.html',BASE+'when-dreams-merge/en/','en'],
 ['water-burial-among-the-crocodiles/index.html',BASE+'water-burial-among-the-crocodiles/','mai'],
 ['water-burial-among-the-crocodiles/en/index.html',BASE+'water-burial-among-the-crocodiles/en/','en'],
 ['media-learning/index.html',BASE+'media-learning/','mai'],
 ['media-learning/en/index.html',BASE+'media-learning/en/','en']
];
assert.equal(sitemapUrls.length,idSets.size+standalone.length+pairedExtra.length,'Every indexed page and standalone guide belongs in sitemap');
for(const [file,url,lang] of pairedExtra){
 assert(fs.existsSync(path.join(root,file)),`Missing paired standalone route: ${file}`);
 assert(sitemapUrls.includes(url),`Missing sitemap paired route: ${file}`);
 const source=read(file);
 assert(source.includes(`rel="canonical" href="${url}"`),`Canonical: ${file}`);
 assert.match(source,new RegExp(`<html[^>]*lang=["']${lang}["']`),`Language: ${file}`);
 assert(source.includes('hreflang="mai"')&&source.includes('hreflang="en"'),`Language alternates: ${file}`);
 assert.match(source,/<meta name="description" content="[^"]+"/);
 assert.match(source,/property="og:title"/);
 assert.match(source,/name="twitter:card"/);
}
assert.equal(new Set(sitemapUrls).size,sitemapUrls.length,'No duplicate sitemap URLs');
for(const file of idSets.keys()) assert(sitemapUrls.includes(canonicalForFile(file)),`Missing sitemap page: ${file}`);
const guideDirs={water:'water-burial-among-the-crocodiles',parallel:'parallel-philosophy',history:'parallel-history',classical:'classical-philosophy',drama:'drama-classics'};
for(const [file,url,kind] of standalone){
  assert(fs.existsSync(path.join(root,file)),`Missing standalone guide: ${file}`); assert(sitemapUrls.includes(url),`Missing sitemap guide: ${file}`);
  const source=read(file); assert(source.includes(`rel="canonical" href="${url}"`),`Canonical: ${file}`); assert.match(source,/<meta name="description" content="[^"]+"/); assert.match(source,/property="og:title"/); assert(source.includes('reader.js'),`Missing guide reader: ${file}`);
  const dir=guideDirs[kind]; assert(dir,`Unknown standalone guide kind: ${kind}`);
  assert(fs.existsSync(path.join(root,dir,'manifest.json')),`Missing ${kind} manifest`);
}

const pm=JSON.parse(read('parallel-philosophy/manifest.json')); assert.equal(pm.chapterCount,172); assert.deepEqual(pm.volumeCounts,{'1':72,'2':100}); assert.equal(pm.partCount,23);
const pc=[]; for(const file of pm.files) pc.push(...(JSON.parse(read('parallel-philosophy/'+file)).chapters||[])); pc.sort((a,b)=>a.volume-b.volume||a.n-b.n); assert.equal(pc.length,172);
for(const [volume,count] of [[1,72],[2,100]]) assert.deepEqual(pc.filter(c=>c.volume===volume).map(c=>c.n),Array.from({length:count},(_,i)=>i+1));
for(const c of pc) for(const lang of ['mai','en']){assert(String(c[lang]?.title||'').trim());assert(String(c[lang]?.summary||'').trim());}

const hm=JSON.parse(read('parallel-history/manifest.json')); assert.equal(hm.chapterCount,178); assert.deepEqual(hm.bookCounts,{'1':28,'2':150}); assert.equal(hm.sectionCount,20); assert.equal(hm.sections?.length,20);
const hc=[]; for(const file of hm.files) hc.push(...(JSON.parse(read('parallel-history/'+file)).chapters||[])); hc.sort((a,b)=>a.book-b.book||a.n-b.n); assert.equal(hc.length,178);
for(const [book,count] of [[1,28],[2,150]]) assert.deepEqual(hc.filter(c=>c.book===book).map(c=>c.n),Array.from({length:count},(_,i)=>i+1));
for(const c of hc){assert(hm.sections.some(s=>s.id===c.section&&s.book===c.book));for(const lang of ['mai','en']){assert(String(c[lang]?.title||'').trim());assert(String(c[lang]?.summary||'').trim());}}
for(const s of hm.sections){const group=hc.filter(c=>c.section===s.id);assert.equal(group.length,s.count);assert.deepEqual(group.map(c=>c.n),Array.from({length:s.end-s.start+1},(_,i)=>s.start+i));}

const cm=JSON.parse(read('classical-philosophy/manifest.json')); assert.equal(cm.unitCount,32); assert.equal(cm.bookCount,4); assert.equal(cm.translationAnnexureCount,8); assert.deepEqual(cm.bookCounts,{atmatattvaviveka:4,bhamati:4,nyayakusumanjali:12,tattvacintamani:12});
const cd=JSON.parse(read('classical-philosophy/data.json')); assert.equal(cd.records.length,32); assert.equal(new Set(cd.records.map(r=>r.id)).size,32); assert.equal(cd.records.filter(r=>r.translationAnnexure===true).length,8);
for(const [bookId,count] of Object.entries(cm.bookCounts)){const rows=cd.records.filter(r=>r.bookId===bookId);assert.equal(rows.length,count);assert.deepEqual(rows.map(r=>r.order),Array.from({length:count},(_,i)=>i+1));}
for(const r of cd.records){assert(String(r.titleMai||'').trim());assert(String(r.titleEn||'').trim());assert(String(r.summaryMai||'').trim());assert(String(r.summaryEn||'').trim());}

const dm=JSON.parse(read('drama-classics/manifest.json')); assert.equal(dm.workCount,22); assert.deepEqual(dm.collectionCounts,{'sanskrit-classics':13,'rang-sangam':9});
const dd=JSON.parse(read('drama-classics/data.json')); assert.equal(dd.records.length,22); assert.equal(new Set(dd.records.map(r=>r.id)).size,22);
for(const [collectionId,total] of Object.entries(dm.collectionCounts)){const rows=dd.records.filter(r=>r.collectionId===collectionId);assert.equal(rows.length,total);assert.deepEqual(rows.map(r=>r.order),Array.from({length:total},(_,i)=>i+1));}
for(const r of dd.records){assert(String(r.titleMai||'').trim());assert(String(r.titleEn||'').trim());assert(String(r.summaryMai||'').trim());assert(String(r.summaryEn||'').trim());assert(Array.isArray(r.units)&&r.units.length>0);for(const u of r.units){assert(String(u.mai||'').trim());assert(String(u.en||'').trim());assert(String(u.gistMai||'').trim());assert(String(u.gistEn||'').trim());}}
const dramaAudit=JSON.parse(fs.readFileSync('content/drama-classics/source-audit.json','utf8'));
const auditedSanskrit=dramaAudit.collections.find(c=>c.id==='sanskrit-classics'), auditedRang=dramaAudit.collections.find(c=>c.id==='rang-sangam');
assert.deepEqual(dd.records.filter(r=>r.collectionId==='sanskrit-classics').map(r=>r.id),auditedSanskrit.works.map(w=>w.id));
assert.deepEqual(dd.records.filter(r=>r.collectionId==='rang-sangam').map(r=>r.id),auditedRang.works.map(w=>w.id));

const atlasSource=fs.readFileSync('app/atlas.tsx','utf8'), englishAtlasSource=fs.readFileSync('app/english-atlas.tsx','utf8');
assert(atlasSource.includes("href:'/gajendra-preeti/classical-philosophy/'"),'Maithili Reader’s Compass must link to Classical Philosophy.');
assert(englishAtlasSource.includes("href:'/gajendra-preeti/classical-philosophy/en/'"),'English Reader’s Compass must link to Classical Philosophy.');
assert(atlasSource.includes("href:'/gajendra-preeti/drama-classics/'"),'Maithili Reader’s Compass must link to Drama & Sanskrit Classics.');
assert(englishAtlasSource.includes("href:'/gajendra-preeti/drama-classics/en/'"),'English Reader’s Compass must link to Drama & Sanskrit Classics.');

for(const [file,ids] of idSets){const source=read(file);assert(ids.has('videha-reading-tools'),`Missing reading controls: ${file}`);assert(source.includes(`rel="canonical" href="${canonicalForFile(file)}"`),`Canonical: ${file}`);assert.match(source,/<meta name="description" content="[^"]+"/);if(file.startsWith('criticism/')){assert(source.includes('reading-tools.js'));assert(source.includes('reading-tools.css'));assert.match(source,/no named human editorial review is recorded|कोनो नामित मानवीय सम्पादकीय समीक्षा दर्ज नहि अछि/);}}
for(const file of ['index.html','en/index.html']){const source=read(file);for(const w of works) assert(idSets.get(file).has('work-'+w.id));const graph=JSON.parse(source.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])['@graph'];assert.equal(graph.filter(x=>x['@type']==='Person').length,2);const bibliographic=graph.filter(x=>x['@type']==='Book'||x['@type']==='CreativeWork');assert.equal(bibliographic.length,works.length);assert(graph.some(x=>x['@type']==='Book'),'Book-like works must emit schema.org Book.');}
const mirrors=JSON.parse(fs.readFileSync('content/book-mirrors.json','utf8')); assert.equal(mirrors.length,9);
for(const m of mirrors){const bytes=fs.readFileSync(path.join(root,'books',m.id+'.pdf'));assert.equal(bytes.subarray(0,5).toString(),'%PDF-');assert.equal(bytes.length,m.bytes);assert.equal(createHash('sha256').update(bytes).digest('hex'),m.sha256);}
for(const file of idSets.keys()){const source=read(file);for(const tag of ['og:title','og:description','og:image','twitter:card']) assert(source.includes('"'+tag+'"'),`${file}: ${tag}`);}
for(const file of ['index.html','en/index.html']){const source=read(file);assert(source.indexOf('id="search-guidance"')<source.indexOf('id="work-search"'));assert.match(source,/class="braille" aria-hidden="true"/);}
assert(read('robots.txt').includes('Sitemap: '+BASE+'sitemap.xml'));
const reception=JSON.parse(fs.readFileSync('content/reception-gists.json','utf8'));
for(const a of reception.articles){const file=`criticism/reception/${a.book}.html`;assert(idSets.get(file).has(a.id),`Missing contribution: ${a.book}/${a.id}`);assert(read(file).includes(`pp. ${a.start}–${a.end}`),`Missing page reference: ${a.id}`);}

console.log(`Static validation passed: ${readings.length} source-linked readings, ${idSets.size} indexed HTML pages, ${standalone.length} standalone guides, 172 philosophy chapters, 178 history chapters, 32 Classical Philosophy units with 8 translation annexures, and 22 Drama & Sanskrit Classics works (13 + 9).`);
