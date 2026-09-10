import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const repo=process.cwd();
const built=path.join(repo,'dist','client','gajendra-preeti');
const exists=p=>fs.existsSync(path.join(built,p));
const text=p=>fs.readFileSync(path.join(built,p),'utf8');
const langOf=p=>text(p).match(/<html[^>]*\blang=["']([^"']+)/i)?.[1]||null;

// Catalogue: required visible fields must have both language forms; optional note asymmetry is reported.
const works=JSON.parse(fs.readFileSync('app/works.json','utf8'));
for(const work of works) for(const [mai,en] of [['title','titleEn'],['kind','kindEn'],['name','nameEn']]){
 const a=String(work[mai]??'').trim(),b=String(work[en]??'').trim();assert.equal(Boolean(a),Boolean(b),`${work.id}: ${mai}/${en} exists in only one language`);
}
const optionalCatalogueAsymmetry=works.filter(w=>Boolean(String(w.note??'').trim())!==Boolean(String(w.noteEn??'').trim())).map(w=>w.id);

// Reader's Compass parity.
const maiAtlas=fs.readFileSync('app/atlas.tsx','utf8'),enAtlas=fs.readFileSync('app/english-atlas.tsx','utf8');
const pathIds=s=>[...s.matchAll(/\{id:'([^']+)'/g)].map(m=>m[1]);
assert.deepEqual(pathIds(maiAtlas),pathIds(enAtlas),'Maithili and English Reader’s Compass path IDs differ.');

// Major paired research families.
const pairedFamilies=['parallel-philosophy','parallel-history','classical-philosophy','drama-classics'];
for(const family of pairedFamilies){
 assert(exists(`${family}/index.html`)&&exists(`${family}/en/index.html`),`${family}: language pair missing`);
 assert.equal(langOf(`${family}/index.html`),'mai',`${family}: default route must be Maithili`);
 assert.equal(langOf(`${family}/en/index.html`),'en',`${family}: /en route must be English`);
}

// Reading Room: all 59 individual essays and both indices must be paired.
const criticismManifest=JSON.parse(fs.readFileSync('public/criticism/manifest.json','utf8'));
const criticismMai=['content/criticism-mai-g01-g20.json','content/criticism-mai-g21-g42.json','content/criticism-mai-preeti.json'].flatMap(f=>JSON.parse(fs.readFileSync(f,'utf8')));
assert.equal(criticismManifest.length,59);assert.equal(criticismMai.length,59);
assert.deepEqual(new Set(criticismMai.map(x=>x.id)),new Set(criticismManifest.map(x=>x.id)));
assert.equal(langOf('criticism/index.html'),'mai');assert.equal(langOf('criticism/en/index.html'),'en');
for(const r of criticismManifest){const mai=`criticism/${r.id}.html`,en=`criticism/en/${r.id}.html`;assert(exists(mai)&&exists(en),`${r.id}: criticism pair missing`);assert.equal(langOf(mai),'mai');assert.equal(langOf(en),'en');assert(text(mai).includes('hreflang="en"'));assert(text(en).includes('hreflang="mai"'));}

// Contributors’ Perspectives: all 63 source records have a Maithili counterpart and all 3 route pairs exist.
const reception=JSON.parse(fs.readFileSync('content/reception-gists.json','utf8'));
const receptionMai=['content/reception-gists-mai-preeti-karan-1.json','content/reception-gists-mai-preeti-karan-2.json','content/reception-gists-mai-setusham.json'].flatMap(f=>JSON.parse(fs.readFileSync(f,'utf8')));
const rkey=x=>`${x.book}:${x.id}`;
assert.equal(reception.articles.length,63,'Reception source must contain 63 records');assert.equal(receptionMai.length,63,'Reception Maithili layer must contain 63 records');
assert.deepEqual(new Set(receptionMai.map(rkey)),new Set(reception.articles.map(rkey)),'Reception language records differ');
for(const x of receptionMai){assert(String(x.titleMai||'').trim());assert(String(x.gistMai||'').trim().length>120);assert(typeof x.noteMai==='string');}
for(const file of ['index.html','preeti-karan.html','setusham.html']){const mai=`criticism/reception/${file}`,en=`criticism/reception/en/${file}`;assert(exists(mai)&&exists(en),`Reception pair missing: ${file}`);assert.equal(langOf(mai),'mai');assert.equal(langOf(en),'en');assert(text(mai).includes('hreflang="en"'));assert(text(en).includes('hreflang="mai"'));}

// Route-family audit keeps genuinely unfinished families visible.
const families=[
 {id:'home',mai:'index.html',en:'en/index.html'},...pairedFamilies.map(id=>({id,mai:`${id}/index.html`,en:`${id}/en/index.html`})),
 {id:'when-dreams-merge',mai:'when-dreams-merge/index.html',en:'when-dreams-merge/en/index.html'},
 {id:'water-burial-among-the-crocodiles',mai:'water-burial-among-the-crocodiles/index.html',en:'water-burial-among-the-crocodiles/en/index.html'},
 {id:'criticism',mai:'criticism/index.html',en:'criticism/en/index.html'},
 {id:'criticism-reception',mai:'criticism/reception/index.html',en:'criticism/reception/en/index.html'}
];
const routeAudit=families.map(f=>({id:f.id,maiPath:f.mai,enPath:f.en,maiExists:exists(f.mai),enExists:exists(f.en),maiLang:exists(f.mai)?langOf(f.mai):null,enLang:exists(f.en)?langOf(f.en):null}));
const unpaired=routeAudit.filter(x=>!x.maiExists||!x.enExists||x.maiLang!=='mai'||x.enLang!=='en');
const report={generatedAt:new Date().toISOString(),catalogueRecords:works.length,optionalCatalogueAsymmetry,readerPathIds:pathIds(maiAtlas),criticismRecords:59,criticismPairsVerified:59,receptionRecords:63,receptionPairsVerified:63,routeAudit,unpairedFamilies:unpaired.map(x=>x.id),policy:'A real bilingual pair requires authored/source-grounded Maithili and English display text. Machine translation is not counted as a counterpart.'};
fs.writeFileSync(path.join(built,'bilingual-audit.json'),JSON.stringify(report,null,2));
console.log(`Site-wide bilingual audit: Reading Room 59/59 paired; Reception 63/63 paired; route families ${routeAudit.length-unpaired.length}/${routeAudit.length} paired; outstanding: ${unpaired.map(x=>x.id).join(', ')||'none'}.`);
