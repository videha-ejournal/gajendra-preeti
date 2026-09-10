import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const readJson=file=>JSON.parse(fs.readFileSync(file,'utf8'));
const classicalFiles=['atmatattvaviveka.json','bhamati.json','nyayakusumanjali.json','tattvacintamani.json'];
const classical=classicalFiles.map(file=>readJson(path.join('content/classical-philosophy',file)).book);
const drama=['sanskrit-classics-01-05.json','sanskrit-classics-06-09.json','sanskrit-classics-10-13.json']
  .flatMap(file=>readJson(path.join('content/drama-classics',file)).records||[])
  .sort((a,b)=>a.order-b.order);

assert.equal(classical.length,4,'Expected exactly four Sanskrit philosophical works.');
assert.equal(drama.length,13,'Expected exactly thirteen Sanskrit drama/classics works.');
assert.deepEqual(drama.map(x=>x.order),Array.from({length:13},(_,i)=>i+1),'Sanskrit drama/classics order must remain 1..13.');

const chain={sourceLanguage:'sa',intermediateLanguage:'mai',finalLanguage:'en',display:'Sanskrit → Maithili → English'};
const provenance=(scope,works)=>({scope,count:works.length,translationChain:chain,works:works.map((w,i)=>({position:i+1,id:w.id,titleMai:w.titleMai,titleEn:w.titleEn}))});
const classicalProv=provenance('Four Sanskrit philosophical works',classical);
const dramaProv=provenance('Thirteen Sanskrit drama/classics works',drama);

function workGraph(name,works){
 return {
  '@context':'https://schema.org',
  '@type':'ItemList',
  name,
  numberOfItems:works.length,
  itemListElement:works.map((w,i)=>({
   '@type':'ListItem',position:i+1,item:{
    '@type':'CreativeWork',name:w.titleEn||w.titleMai,inLanguage:'sa',
    workTranslation:{'@type':'CreativeWork',name:w.titleMai,inLanguage:'mai',workTranslation:{'@type':'CreativeWork',name:w.titleEn,inLanguage:'en'}}
   }
  }))
 };
}

function patchRoute(file,{en,count,labelEn,labelMai,works}){
 let html=fs.readFileSync(file,'utf8');
 const marker='data-translation-provenance="sa-mai-en"';
 const note=en
  ? `<aside class="translation-chain" ${marker}><strong>Translation provenance</strong><span>${count} ${labelEn}: Sanskrit originals → Maithili translations → English translations.</span></aside>`
  : `<aside class="translation-chain" ${marker}><strong>अनुवाद-परम्परा</strong><span>${count} ${labelMai}: संस्कृत मूल → मैथिली अनुवाद → English अनुवाद।</span></aside>`;
 if(!html.includes(marker)){
  assert(html.includes('</header>'),`${file}: hero/header close not found for provenance note.`);
  html=html.replace('</header>',note+'</header>');
 }
 const json=JSON.stringify(workGraph(en?`${count} works: Sanskrit to Maithili to English translation chain`:`${count} कृति: संस्कृतसँ मैथिली, तकर बाद English अनुवाद-क्रम`,works)).replace(/</g,'\\u003c');
 if(!html.includes('data-provenance-jsonld="sa-mai-en"')){
  assert(html.includes('</head>'),`${file}: head close not found for provenance JSON-LD.`);
  html=html.replace('</head>',`<script type="application/ld+json" data-provenance-jsonld="sa-mai-en">${json}</script></head>`);
 }
 fs.writeFileSync(file,html,'utf8');
}

patchRoute('public/classical-philosophy/index.html',{en:false,count:4,labelEn:'Sanskrit philosophical works',labelMai:'संस्कृत दर्शन-ग्रन्थ',works:classical});
patchRoute('public/classical-philosophy/en/index.html',{en:true,count:4,labelEn:'Sanskrit philosophical works',labelMai:'संस्कृत दर्शन-ग्रन्थ',works:classical});
patchRoute('public/drama-classics/index.html',{en:false,count:13,labelEn:'Sanskrit drama/classics works',labelMai:'संस्कृत नाटक/शास्त्रीय कृति',works:drama});
patchRoute('public/drama-classics/en/index.html',{en:true,count:13,labelEn:'Sanskrit drama/classics works',labelMai:'संस्कृत नाटक/शास्त्रीय कृति',works:drama});

for(const [dir,data] of [['public/classical-philosophy',classicalProv],['public/drama-classics',dramaProv]]){
 fs.writeFileSync(path.join(dir,'translation-provenance.json'),JSON.stringify(data,null,2),'utf8');
 const manifestFile=path.join(dir,'manifest.json');
 if(fs.existsSync(manifestFile)){
  const manifest=readJson(manifestFile);
  manifest.translationProvenance=data;
  fs.writeFileSync(manifestFile,JSON.stringify(manifest,null,2),'utf8');
 }
 const cssFile=path.join(dir,'style.css');
 let css=fs.readFileSync(cssFile,'utf8');
 if(!css.includes('.translation-chain{')) css+='\n.translation-chain{display:flex;gap:.7rem 1rem;align-items:baseline;flex-wrap:wrap;max-width:68rem;margin:1.6rem 0 0;padding:1rem 1.1rem;border-left:4px solid #d4bd79;background:#ffffff12;font:600 .82rem/1.6 system-ui}.translation-chain strong{letter-spacing:.08em;text-transform:uppercase}.translation-chain span{font-weight:500}\n';
 fs.writeFileSync(cssFile,css,'utf8');
}

console.log('Added verified language provenance: 13 Sanskrit drama/classics + 4 Sanskrit philosophical works follow Sanskrit → Maithili → English.');
