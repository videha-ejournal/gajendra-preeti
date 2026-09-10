import fs from 'node:fs';
import assert from 'node:assert/strict';

const targets=[
 ['public/drama-classics/translation-provenance.json',13,'Thirteen Sanskrit drama/classics works'],
 ['public/classical-philosophy/translation-provenance.json',4,'Four Sanskrit philosophical works']
];
for(const [file,count,scope] of targets){
 assert(fs.existsSync(file),`${file}: provenance file missing`);
 const p=JSON.parse(fs.readFileSync(file,'utf8'));
 assert.equal(p.scope,scope,`${file}: scope changed`);
 assert.equal(p.count,count,`${file}: count changed`);
 assert.equal(p.translationChain.sourceLanguage,'sa',`${file}: Sanskrit source language required`);
 assert.equal(p.translationChain.intermediateLanguage,'mai',`${file}: Maithili intermediate language required`);
 assert.equal(p.translationChain.finalLanguage,'en',`${file}: English final language required`);
 assert.equal(p.translationChain.intermediateTranslator?.name,'Gajendra Thakur',`${file}: Sanskrit→Maithili translator must be Gajendra Thakur`);
 assert.equal(p.translationChain.finalTranslator?.name,'Gajendra Thakur',`${file}: Maithili→English translator must be Gajendra Thakur`);
 assert.equal(p.works.length,count,`${file}: work list must match declared count`);
 assert.equal(new Set(p.works.map(w=>w.id)).size,count,`${file}: work ids must be unique`);
}

for(const [dir,count] of [['public/drama-classics',13],['public/classical-philosophy',4]]){
 for(const edition of ['index.html','en/index.html']){
  const file=`${dir}/${edition}`;
  const html=fs.readFileSync(file,'utf8');
  assert(html.includes('data-translation-provenance="sa-mai-en"'),`${file}: visible provenance note missing`);
  assert(html.includes('Gajendra Thakur')||html.includes('गजेन्द्र ठाकुर'),`${file}: translator credit missing`);
  assert(html.includes('data-provenance-jsonld="sa-mai-en"'),`${file}: provenance JSON-LD missing`);
  const script=html.match(/<script type="application\/ld\+json" data-provenance-jsonld="sa-mai-en">([\s\S]*?)<\/script>/)?.[1];
  assert(script,`${file}: provenance JSON-LD payload missing`);
  const json=JSON.parse(script);
  assert.equal(json.numberOfItems,count,`${file}: JSON-LD work count mismatch`);
  const text=JSON.stringify(json);
  assert((text.match(/"inLanguage":"sa"/g)||[]).length===count,`${file}: every original must be Sanskrit`);
  assert((text.match(/"inLanguage":"mai"/g)||[]).length===count,`${file}: every intermediate translation must be Maithili`);
  assert((text.match(/"inLanguage":"en"/g)||[]).length===count,`${file}: every final translation must be English`);
  assert((text.match(/"name":"Gajendra Thakur"/g)||[]).length===count*2,`${file}: both translation stages of every work must credit Gajendra Thakur`);
 }
}

console.log('Classics provenance PASS: 13 drama/classics + 4 philosophical works are Sanskrit → Maithili → English, both translation stages credited to Gajendra Thakur.');
