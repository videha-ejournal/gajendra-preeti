import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const ROOT='dist/client/gajendra-preeti';
const source=JSON.parse(fs.readFileSync('content/reception-gists.json','utf8'));
const translations=[
 ...JSON.parse(fs.readFileSync('content/reception-gists-mai-preeti-karan-1.json','utf8')),
 ...JSON.parse(fs.readFileSync('content/reception-gists-mai-preeti-karan-2.json','utf8')),
 ...JSON.parse(fs.readFileSync('content/reception-gists-mai-setusham.json','utf8'))
];
const gt=[
 ...JSON.parse(fs.readFileSync('content/criticism-mai-preeti.json','utf8')),
 ...JSON.parse(fs.readFileSync('content/criticism-mai-g01-g20.json','utf8')),
 ...JSON.parse(fs.readFileSync('content/criticism-mai-g21-g42.json','utf8'))
];
const tByKey=new Map(translations.map(x=>[`${x.book}:${x.id}`,x]));
const strip=s=>s.replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/&[a-z#0-9]+;/gi,' ').replace(/\s+/g,' ').trim();
const must=file=>{assert(fs.existsSync(file),`Missing ${file}`);return fs.readFileSync(file,'utf8');};
const sha=/^[0-9a-f]{64}$/i;
const pairs={
 'preeti-karan':['PREETI_KARAN_SETU_BANHAL.pdf','ENGLISH_PREETI_KARAN_SETU_BANHAL.pdf'],
 'setusham':['SETUSHAM.pdf','ENGLISH_SETUSHAM.pdf']
};
assert.equal(source.articles.length,63,'Normalized reception corpus must retain 63 records.');
assert.equal(translations.length,63,'All 63 reception records need Maithili descriptions.');
assert.equal(new Set(gt.map(x=>x.id)).size,gt.length,'GT/PT chapter IDs unique.');
assert(gt.length>=50,'GT/PT collection must remain a substantial multi-chapter critical corpus.');

for(const [book,pdfs] of Object.entries(pairs)){
 const rows=source.articles.filter(x=>x.book===book);assert(rows.length>0,`${book} records`);
 for(const en of [false,true]){
  const landing=path.join(ROOT,'criticism/reception',en?'en':'',`${book}.html`);
  const html=must(landing);
  assert(html.includes('id="permanent-chapter-pages"'),`${book} permanent chapter section`);
  for(const a of rows){
   const rel=`/gajendra-preeti/criticism/reception/${en?'en/':''}${book}/${a.id}.html`;
   assert(html.includes(rel),`${book}:${a.id} linked from landing`);
   const file=path.join(ROOT,'criticism/reception',en?'en':'',book,`${a.id}.html`);
   const page=must(file), text=strip(page);
   assert(text.length>700,`${file} must be a detailed page, not a stub`);
   assert(page.includes('Detailed description')||page.includes('विस्तृत विवरण'),`${file} detailed-description section`);
   assert(page.includes(en?pdfs[1]:pdfs[0]),`${file} exact edition PDF`);
   assert(page.includes(en?pdfs[0]:pdfs[1]),`${file} paired edition PDF`);
   assert(page.includes(a.author),`${file} contributor attribution`);
   const gist=en?a.gist:tByKey.get(`${book}:${a.id}`)?.gistMai;
   assert(gist?.length>120,`${book}:${a.id} substantive gist source`);
   assert(page.includes(gist.slice(0,40).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))),`${file} substantive gist rendered`);
   const ld=page.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);assert(ld,`${file} JSON-LD`);
   const schema=JSON.parse(ld[1]);assert.equal(schema['@type'],'ScholarlyArticle',`${file} scholarly article schema`);
   assert(schema.isPartOf?.encoding?.identifier?.value&&sha.test(schema.isPartOf.encoding.identifier.value),`${file} PDF SHA in schema`);
  }
 }
}

const gtLanding=must(path.join(ROOT,'criticism/reception/gt-pt-criticism.html'));
assert(gtLanding.includes('GT_PT_Criticism.pdf'),'GT/PT landing exact PDF');
for(const x of gt){
 const link=`/gajendra-preeti/criticism/reception/gt-pt-criticism/${x.id}.html`;
 assert(gtLanding.includes(link),`GT/PT landing link ${x.id}`);
 const file=path.join(ROOT,'criticism/reception/gt-pt-criticism',`${x.id}.html`);
 const page=must(file), text=strip(page);
 assert(text.length>900,`${file} detailed critical chapter, not a stub`);
 assert(page.includes('विस्तृत समालोचनात्मक विवरण'),`${file} detailed analysis section`);
 assert(page.includes('शोध-प्रश्न'),`${file} research question`);
 assert(page.includes('GT_PT_Criticism.pdf'),`${file} exact source PDF`);
 for(const p of x.paragraphsMai)assert(page.includes(p.slice(0,45).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))),`${file} analytical paragraph rendered`);
 const ld=page.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);assert(ld,`${file} JSON-LD`);const schema=JSON.parse(ld[1]);assert.equal(schema['@type'],'Chapter',`${file} chapter schema`);assert(sha.test(schema.isPartOf?.encoding?.identifier?.value||''),`${file} GT/PT source fingerprint`);
}

for(const en of [false,true]){
 const index=must(path.join(ROOT,'criticism/reception',en?'en':'','index.html'));
 assert(index.includes('id="five-critical-appreciation-books"'),`Five-book corpus doorway ${en?'English':'Maithili'}`);
 for(const p of ['PREETI_KARAN_SETU_BANHAL.pdf','ENGLISH_PREETI_KARAN_SETU_BANHAL.pdf','SETUSHAM.pdf','ENGLISH_SETUSHAM.pdf','GT_PT_Criticism.pdf'])assert(index.includes(p),`Five-book corpus includes ${p}`);
}

const sitemap=must(path.join(ROOT,'sitemap.xml'));
for(const a of source.articles.slice(0,3))assert(sitemap.includes(`/criticism/reception/${a.book}/${a.id}.html`),'Sitemap includes reception chapter pages');
assert(sitemap.includes('/criticism/reception/gt-pt-criticism.html'),'Sitemap includes GT/PT landing');
assert(sitemap.includes(`/criticism/reception/gt-pt-criticism/${gt[0].id}.html`),'Sitemap includes GT/PT chapters');

console.log(`Critical-appreciation corpus PASS: 5 verified repository book manifestations; ${source.articles.length} normalized reception records have English + Maithili permanent pages; ${gt.length} GT/PT Maithili critical chapters have detailed permanent pages.`);
