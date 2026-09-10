import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const root='public/drama-classics';
const dataPath=path.join(root,'data.json');
const readerPath=path.join(root,'reader.js');
const completion=JSON.parse(fs.readFileSync('content/drama-classics/bilingual-completions.json','utf8'));
const data=JSON.parse(fs.readFileSync(dataPath,'utf8'));
const records=data.records||[];

for(const r of records){
  const kind=completion.kindLabels[r.kind];
  assert(kind,`Missing bilingual kind label for ${r.id}: ${r.kind}`);
  r.kindMai=kind.mai;
  r.kindEn=kind.en;

  if(r.collectionId==='rang-sangam'){
    r.authorMai=r.authorMai||completion.rangSangamAuthor.mai;
    r.authorEn=r.authorEn||completion.rangSangamAuthor.en;
  }
  const relation=completion.collectionRelation[r.collectionId];
  assert(relation,`Missing bilingual relation metadata for ${r.id}`);
  r.relationMai=relation.mai;
  r.relationEn=relation.en;

  for(const key of ['titleMai','titleEn','summaryMai','summaryEn','authorMai','authorEn','kindMai','kindEn','relationMai','relationEn']){
    assert(String(r[key]||'').trim(),`${r.id}: missing bilingual display field ${key}`);
  }
  if(Boolean(r.subtitleMai)!==Boolean(r.subtitleEn)) throw new Error(`${r.id}: subtitle exists in only one language.`);

  for(const u of r.units||[]){
    for(const key of ['mai','en','gistMai','gistEn']) assert(String(u[key]||'').trim(),`${r.id}: unit missing ${key}`);
    const nested=Array.isArray(u.subunits)?u.subunits:[];
    for(const x of nested){
      assert(x&&typeof x==='object'&&!Array.isArray(x),`${r.id}: one-language nested heading remains: ${String(x)}`);
      assert(String(x.mai||'').trim(),`${r.id}: nested heading missing Maithili counterpart.`);
      assert(String(x.en||'').trim(),`${r.id}: nested heading missing English counterpart.`);
    }
  }
}

const sourcePolicyEn='Preserve the supplied Maithili-first / English-second architecture. Do not infer missing divisions. All listed internal divisions come from the supplied DOCX sources; continuous texts are marked as such rather than assigned invented chapter headings.';
const sourcePolicyMai='देल मैथिली-पहिल / English-दोसर स्रोत-संरचना सुरक्षित राखू। स्रोतमे नहि देल विभाजन गढ़ू नहि। सभ सूचीबद्ध भीतरी विभाजन देल DOCX स्रोतसँ लेल गेल अछि; निरन्तर पाठकेँ कृत्रिम अध्याय वा अंक नहि देल गेल अछि।';
data.manifest.sourcePolicy=sourcePolicyEn;
data.manifest.sourcePolicyEn=sourcePolicyEn;
data.manifest.sourcePolicyMai=sourcePolicyMai;
data.manifest.generatedFrom='source-audited bilingual study records';
data.manifest.generatedFromEn='Source-audited bilingual study records';
data.manifest.generatedFromMai='स्रोत-जाँचल द्विभाषी अध्ययन-प्रविष्टि';
data.manifest.languageCoverage={mai:'पूर्ण मैथिली प्रदर्शन-पाठ',en:'Complete English display text',status:'paired'};

fs.writeFileSync(dataPath,JSON.stringify(data));

let js=fs.readFileSync(readerPath,'utf8');
const oldMeta="<span>'+esc(r.kind||'work')+'</span>";
const newMeta="<span>'+esc(lang0==='en'?r.kindEn:r.kindMai)+'</span>";
assert(js.includes(oldMeta),'Reader kind badge expression changed; could not install bilingual kind label safely.');
js=js.replace(oldMeta,newMeta);

const oldHead="+'</div><div class=\"'+(mode==='both'?'bilingual':'')+'\">'";
const newHead="+'</div><p class=\"byline\">'+esc(lang0==='en'?r.authorEn:r.authorMai)+' · '+esc(lang0==='en'?r.relationEn:r.relationMai)+'</p><div class=\"'+(mode==='both'?'bilingual':'')+'\">'";
assert(js.includes(oldHead),'Reader card header changed; could not add bilingual author/relation safely.');
js=js.replace(oldHead,newHead);

const oldSearch="r.titleMai,r.titleEn,r.subtitleMai,r.subtitleEn,r.summaryMai,r.summaryEn,r.authorMai,r.authorEn,r.kind,";
const newSearch="r.titleMai,r.titleEn,r.subtitleMai,r.subtitleEn,r.summaryMai,r.summaryEn,r.authorMai,r.authorEn,r.kindMai,r.kindEn,r.relationMai,r.relationEn,";
assert(js.includes(oldSearch),'Reader search fields changed; could not add bilingual metadata to search safely.');
js=js.replace(oldSearch,newSearch);

fs.writeFileSync(readerPath,js);
console.log('Completed bilingual display audit for Drama & Sanskrit Classics: all 22 works now have paired titles, summaries, authors, genre labels, relation metadata, unit headings/gists and nested headings in Maithili + English.');
