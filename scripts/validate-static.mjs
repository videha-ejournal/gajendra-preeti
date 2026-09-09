import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const root='dist/client/gajendra-preeti';
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const english=fs.readFileSync(path.join(root,'en/index.html'),'utf8');
const manifest=JSON.parse(fs.readFileSync('dist/server/vinext-prerender.json','utf8'));
for(const route of ['/','/en'])assert.equal(manifest.routes.find(r=>r.route.replace(/\/$/,'')===route.replace(/\/$/,''))?.status,'rendered',`${route} must be statically rendered`);
assert.match(html,/<html lang="mai"/);
assert.match(html,/<title>प्रीति ठाकुर आ गजेन्द्र ठाकुर<\/title>/);
assert.match(english,/lang="en" class="english-edition"/);
assert.match(english,/<title>Preeti Thakur &amp; Gajendra Thakur/);
assert.match(html,/hreflang="en"/i);assert.match(english,/hreflang="mai"/i);
const files=fs.readdirSync(path.join(root,'criticism')).filter(f=>f.endsWith('.html')).map(f=>'criticism/'+f);
assert.equal(files.length,60,'59 criticism pages plus index');
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
   if(!url.startsWith('/gajendra-preeti/'))continue;
   const [pathname,fragment]=url.slice('/gajendra-preeti/'.length).split('#');
   let target=pathname.split('?')[0];if(!target||target.endsWith('/'))target+='index.html';
   assert(fs.existsSync(path.join(root,target)),`Missing local link ${url} in ${file}`);
   if(fragment&&idSets.has(target))assert(idSets.get(target).has(fragment),`Missing target anchor ${url}`);
 }
}
const works=JSON.parse(fs.readFileSync('app/works.json','utf8'));
assert.equal(new Set(works.map(w=>w.id)).size,26);
for(const w of works){assert(w.title&&w.name&&w.titleEn&&w.nameEn&&w.kindEn);assert.equal(new URL(w.url).protocol,'https:');assert.equal(new URL(w.source).protocol,'https:')}
const readings=JSON.parse(fs.readFileSync(path.join(root,'criticism/manifest.json'),'utf8'));
const catalogue=JSON.parse(fs.readFileSync('content/catalogue-snapshot.json','utf8'));
assert.equal(readings.filter(r=>r.group==='preeti').length,17);assert.equal(readings.filter(r=>r.group==='gajendra').length,42);
assert.deepEqual(new Set(readings.map(r=>r.id)),new Set(catalogue.map(r=>r.id)));
assert.equal(readings.filter(r=>r.basis==='interface').length,3);
for(const r of readings){const text=fs.readFileSync(path.join(root,`criticism/${r.id}.html`),'utf8');assert.match(text,/id="evidence"/);assert.match(text,/id="question"/);assert.match(text,/prepared with AI assistance/);}
for(const id of ['writers','paths','archive','journey','videha','criticism','sources']){assert(idSets.get('index.html').has(id));assert(idSets.get('en/index.html').has(id));}
assert(fs.existsSync(path.join(root,'.nojekyll')));
const sitemap=fs.readFileSync(path.join(root,'sitemap.xml'),'utf8');
const sitemapUrls=[...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);
assert.equal(sitemapUrls.length,idSets.size,'Every public page belongs in the sitemap');
assert.equal(new Set(sitemapUrls).size,sitemapUrls.length,'No duplicate sitemap URLs');
for(const file of idSets.keys()){
 const route=file.replace(/(^|\/)index\.html$/,'$1');
 assert(sitemapUrls.includes(`https://videha-ejournal.github.io/gajendra-preeti/${route}`),`Missing sitemap page: ${file}`);
}
console.log(`Static validation passed: bilingual homepages, ${readings.length} source-linked readings, ${idSets.size} HTML pages; all local assets and anchors resolve.`);

// Reading controls, discoverability and preservation checks.
for(const [file, ids] of idSets){
 const source=fs.readFileSync(path.join(root,file),'utf8');
 assert(ids.has('videha-reading-tools'),`Missing reading controls: ${file}`);
 const expected='https://videha-ejournal.github.io/gajendra-preeti/'+file.replace(/(^|\/)index\.html$/,'$1');
 assert(source.includes(`rel="canonical" href="${expected}"`),`Canonical: ${file}`);
 assert.match(source,/<meta name="description" content="[^"]+"/);
 if(file.startsWith('criticism/')){
  assert(source.includes('reading-tools.js'));assert(source.includes('reading-tools.css'));
  assert(source.includes('no named human editorial review is recorded'));
 }
}
for(const file of ['index.html','en/index.html']){
 const source=fs.readFileSync(path.join(root,file),'utf8');
 for(const w of works)assert(idSets.get(file).has('work-'+w.id));
 const graph=JSON.parse(source.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])['@graph'];
 assert.equal(graph.filter(x=>x['@type']==='Person').length,2);
 assert.equal(graph.filter(x=>x['@type']==='CreativeWork').length,26);
}
const {createHash}=await import('node:crypto');
const mirrors=JSON.parse(fs.readFileSync('content/book-mirrors.json','utf8'));
assert.equal(mirrors.length,9);
for(const mirror of mirrors){
 const bytes=fs.readFileSync(path.join(root,'books',mirror.id+'.pdf'));
 assert.equal(bytes.subarray(0,5).toString(),'%PDF-');assert.equal(bytes.length,mirror.bytes);
 assert.equal(createHash('sha256').update(bytes).digest('hex'),mirror.sha256);
}
console.log('Extended validation passed: 62 reading tool mounts and canonical descriptions, 26 work anchors and structured records per edition, nine verified PDF mirrors.');
for(const file of idSets.keys()){
 const source=fs.readFileSync(path.join(root,file),'utf8');
 for(const tag of ['og:title','og:description','og:image','twitter:card'])assert(source.includes('"'+tag+'"'),`${file}: ${tag}`);
}
for(const file of ['index.html','en/index.html']){
 const source=fs.readFileSync(path.join(root,file),'utf8');
 assert(source.indexOf('id="search-guidance"')<source.indexOf('id="work-search"'));
 assert.match(source,/class="braille" aria-hidden="true"/);
}
assert(fs.readFileSync(path.join(root,'robots.txt'),'utf8').includes('Sitemap: https://videha-ejournal.github.io/gajendra-preeti/sitemap.xml'));
console.log('Social previews, search guidance, decorative Braille and sitemap discovery passed.');
