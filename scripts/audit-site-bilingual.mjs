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
for(const work of works){for(const [mai,en] of pairedWorkFields){const a=String(work[mai]??'').trim(),b=String(work[en]??'').trim();assert.equal(Boolean(a),Boolean(b),`${work.id}: ${mai}/${en} exists in only one language`);}}

// 2. Main homepage Reader's Compass: both editions expose the same path IDs.
const maiAtlas=fs.readFileSync('app/atlas.tsx','utf8');
const enAtlas=fs.readFileSync('app/english-atlas.tsx','utf8');
const pathIds=s=>[...s.matchAll(/\{id:'([^']+)'/g)].map(m=>m[1]);
assert.deepEqual(pathIds(maiAtlas),pathIds(enAtlas),'Maithili and English Reader’s Compass path IDs differ.');

// 3. Major paired research families.
const pairedFamilies=['parallel-philosophy','parallel-history','classical-philosophy','drama-classics'];
for(const family of pairedFamilies){assert(exists(`${family}/index.html`),`${family}: missing Maithili/default index`);assert(exists(`${family}/en/index.html`),`${family}: missing English index`);assert.equal(langOf(`${family}/index.html`),'mai',`${family}: default route must be Maithili`);assert.equal(langOf(`${family}/en/index.html`),'en',`${family}: /en route must be English`);}

// 4. Reading Room remediation is complete only when all 59 individual essays are paired.
const criticismManifest=JSON.parse(fs.readFileSync('public/criticism/manifest.json','utf8'));
assert.equal(criticismManifest.length,59,'Reading Room must contain 59 criticism records');
const translationFiles=['content/criticism-mai-g01-g20.json','content/criticism-mai-g21-g42.json','content/criticism-mai-preeti.json'];
const criticismMai=translationFiles.flatMap(f=>JSON.parse(fs.readFileSync(f,'utf8')));
assert.equal(criticismMai.length,59,'Reading Room must contain 59 Maithili critical translations');
assert.deepEqual(new Set(criticismMai.map(x=>x.id)),new Set(criticismManifest.map(x=>x.id)),'Reading Room translation IDs differ from manifest');
assert(exists('criticism/index.html')&&exists('criticism/en/index.html'),'Reading Room index pair missing');
assert.equal(langOf('criticism/index.html'),'mai','Reading Room default must be Maithili');
assert.equal(langOf('criticism/en/index.html'),'en','Reading Room /en must be English');
for(const r of criticismManifest){
 const mai=`criticism/${r.id}.html`,en=`criticism/en/${r.id}.html`;
 assert(exists(mai),`${r.id}: missing Maithili criticism page`);assert(exists(en),`${r.id}: missing English criticism page`);
 assert.equal(langOf(mai),'mai',`${r.id}: Maithili page lang mismatch`);assert.equal(langOf(en),'en',`${r.id}: English page lang mismatch`);
 assert(text(mai).includes(`hreflang="en"`),`${r.id}: Maithili page missing English alternate`);
 assert(text(en).includes(`hreflang="mai"`),`${r.id}: English page missing Maithili alternate`);
 assert(text(en).includes(`/criticism/en/${r.id}.html`),`${r.id}: English canonical/internal route missing`);
}

// 5. Repository-wide route audit. Outstanding families stay visible instead of being silently treated as bilingual.
const families=[
 {id:'home',mai:'index.html',en:'en/index.html'},
 ...pairedFamilies.map(id=>({id,mai:`${id}/index.html`,en:`${id}/en/index.html`})),
 {id:'when-dreams-merge',mai:'when-dreams-merge/index.html',en:'when-dreams-merge/en/index.html'},
 {id:'water-burial-among-the-crocodiles',mai:'water-burial-among-the-crocodiles/index.html',en:'water-burial-among-the-crocodiles/en/index.html'},
 {id:'criticism',mai:'criticism/index.html',en:'criticism/en/index.html'},
 {id:'criticism-reception',mai:'criticism/reception/index.html',en:'criticism/reception/en/index.html'}
];
const routeAudit=families.map(f=>({id:f.id,maiPath:f.mai,enPath:f.en,maiExists:exists(f.mai),enExists:exists(f.en),maiLang:exists(f.mai)?langOf(f.mai):null,enLang:exists(f.en)?langOf(f.en):null}));
const unpaired=routeAudit.filter(x=>!x.maiExists||!x.enExists||x.maiLang!=='mai'||x.enLang!=='en');
const report={generatedAt:new Date().toISOString(),catalogueRecords:works.length,readerPathIds:pathIds(maiAtlas),criticismRecords:criticismManifest.length,criticismPairsVerified:59,routeAudit,unpairedFamilies:unpaired.map(x=>x.id),policy:'A real bilingual pair requires authored/source-grounded Maithili and English display text. The 41-language machine-translation control is not counted as a counterpart.'};
fs.writeFileSync(path.join(built,'bilingual-audit.json'),JSON.stringify(report,null,2));
console.log(`Site-wide bilingual audit: ${routeAudit.length-unpaired.length}/${routeAudit.length} route families fully paired; Reading Room 59/59 paired; outstanding: ${unpaired.map(x=>x.id).join(', ')||'none'}.`);
