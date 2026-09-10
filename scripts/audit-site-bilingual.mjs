import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const repo=process.cwd();
const built=path.join(repo,'dist','client','gajendra-preeti');
const exists=p=>fs.existsSync(path.join(built,p));
const text=p=>fs.readFileSync(path.join(built,p),'utf8');
const langOf=p=>{const m=text(p).match(/<html[^>]*\blang=["']([^"']+)/i);return m?.[1]||null};

// 1. Main catalogue: every visible Maithili field must have its English partner.
const works=JSON.parse(fs.readFileSync('app/works.json','utf8'));
const pairedWorkFields=[['title','titleEn'],['kind','kindEn'],['name','nameEn'],['note','noteEn']];
for(const work of works){
  for(const [mai,en] of pairedWorkFields){
    const a=String(work[mai]??'').trim(),b=String(work[en]??'').trim();
    assert.equal(Boolean(a),Boolean(b),`${work.id}: ${mai}/${en} exists in only one language`);
  }
}

// 2. Main homepage Reader's Compass: Maithili and English must expose identical path IDs.
const maiAtlas=fs.readFileSync('app/atlas.tsx','utf8');
const enAtlas=fs.readFileSync('app/english-atlas.tsx','utf8');
const ids=s=>[...s.matchAll(/\{id:'([^']+)'/g)].map(m=>m[1]);
assert.deepEqual(ids(maiAtlas),ids(enAtlas),'Maithili and English Reader’s Compass path IDs differ.');

// 3. Families already designed as true paired editions.
const pairedFamilies=['parallel-philosophy','parallel-history','classical-philosophy','drama-classics'];
for(const family of pairedFamilies){
  assert(exists(`${family}/index.html`),`${family}: missing Maithili/default index`);
  assert(exists(`${family}/en/index.html`),`${family}: missing English index`);
}

// 4. Repository-wide route audit. These families are intentionally recorded even while remediation is in progress.
const families=[
  {id:'home',mai:'index.html',en:'en/index.html'},
  ...pairedFamilies.map(id=>({id,mai:`${id}/index.html`,en:`${id}/en/index.html`})),
  {id:'when-dreams-merge',mai:'when-dreams-merge/index.html',en:'when-dreams-merge/en/index.html'},
  {id:'water-burial-among-the-crocodiles',mai:'water-burial-among-the-crocodiles/index.html',en:'water-burial-among-the-crocodiles/en/index.html'},
  {id:'criticism',mai:'criticism/index.html',en:'criticism/en/index.html'},
  {id:'criticism-reception',mai:'criticism/reception/index.html',en:'criticism/reception/en/index.html'}
];
const routeAudit=families.map(f=>({
  id:f.id,
  maiPath:f.mai,
  enPath:f.en,
  maiExists:exists(f.mai),
  enExists:exists(f.en),
  maiLang:exists(f.mai)?langOf(f.mai):null,
  enLang:exists(f.en)?langOf(f.en):null
}));

const unpaired=routeAudit.filter(x=>!x.maiExists||!x.enExists||x.maiLang!=='mai'||x.enLang!=='en');
const report={
  generatedAt:new Date().toISOString(),
  catalogueRecords:works.length,
  readerPathIds:ids(maiAtlas),
  routeAudit,
  unpairedFamilies:unpaired.map(x=>x.id),
  policy:'A real bilingual pair requires authored/source-grounded Maithili and English display text. The 41-language machine-translation control is not counted as a counterpart.'
};
fs.writeFileSync(path.join(built,'bilingual-audit.json'),JSON.stringify(report,null,2));
console.log(`Site-wide bilingual audit: ${routeAudit.length-unpaired.length}/${routeAudit.length} route families fully paired; outstanding: ${unpaired.map(x=>x.id).join(', ')||'none'}.`);
