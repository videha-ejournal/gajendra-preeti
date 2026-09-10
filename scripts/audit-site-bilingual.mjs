import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const repo=process.cwd();
const built=path.join(repo,'dist','client','gajendra-preeti');
const exists=p=>fs.existsSync(path.join(built,p));
const text=p=>fs.readFileSync(path.join(built,p),'utf8');
const langOf=p=>text(p).match(/<html[^>]*\blang=["']([^"']+)/i)?.[1]||null;
const countMatches=(s,re)=>(s.match(re)||[]).length;
const jsonRecords=dir=>fs.readdirSync(dir).filter(n=>n.endsWith('.json')).sort().flatMap(n=>{const p=JSON.parse(fs.readFileSync(path.join(dir,n),'utf8'));return Array.isArray(p.records)?p.records:[]});

// Catalogue: required visible fields must have both language forms; optional note asymmetry is reported.
const works=JSON.parse(fs.readFileSync('app/works.json','utf8'));
for(const work of works) for(const [mai,en] of [['title','titleEn'],['kind','kindEn'],['name','nameEn']]){
 const a=String(work[mai]??'').trim(),b=String(work[en]??'').trim();assert.equal(Boolean(a),Boolean(b),`${work.id}: ${mai}/${en} exists in only one language`);
}
const optionalCatalogueAsymmetry=works.filter(w=>Boolean(String(w.note??'').trim())!==Boolean(String(w.noteEn??'').trim())).map(w=>w.id);

// Reader's Compass parity, including the new Media & Learning path.
const maiAtlas=fs.readFileSync('app/atlas.tsx','utf8'),enAtlas=fs.readFileSync('app/english-atlas.tsx','utf8');
const pathIds=s=>[...s.matchAll(/\{id:'([^']+)'/g)].map(m=>m[1]);
assert.deepEqual(pathIds(maiAtlas),pathIds(enAtlas),'Maithili and English Reader’s Compass path IDs differ.');
assert(pathIds(maiAtlas).includes('media'),'Reader’s Compass must expose Media & Learning in both languages.');
assert(enAtlas.includes("href:'/gajendra-preeti/when-dreams-merge/en/'"),'English Dreams card must point to /en/.');
assert(enAtlas.includes("href:'/gajendra-preeti/water-burial-among-the-crocodiles/en/'"),'English Water card must point to /en/.');

// Completed source-grounded large-guide content.
const dreams=jsonRecords('content/when-dreams-merge-mai').sort((a,b)=>Number(a.id.slice(4))-Number(b.id.slice(4)));
const water=jsonRecords('content/water-burial-mai').sort((a,b)=>a.n-b.n);
assert.equal(dreams.length,447,'When Dreams Merge must have all 447 Maithili source-grounded records.');
assert.deepEqual(dreams.map(x=>x.id),Array.from({length:447},(_,i)=>`wdm-${String(i+1).padStart(3,'0')}`));
assert.equal(water.length,301,'Water-Burial must have all 301 Maithili source-grounded chapters.');
assert.deepEqual(water.map(x=>x.n),Array.from({length:301},(_,i)=>i-100));
const dreamsFrame=JSON.parse(fs.readFileSync('content/when-dreams-merge-mai/guide-frame.json','utf8'));
const dreamsExpanded=JSON.parse(fs.readFileSync('content/when-dreams-merge-mai/expanded-readings.json','utf8'));
const waterFrame=JSON.parse(fs.readFileSync('content/water-burial-mai/guide-frame.json','utf8'));
const waterUi=JSON.parse(fs.readFileSync('content/water-burial-mai/ui.json','utf8'));
assert.equal(dreamsFrame.sections.length,10);assert.equal(dreamsExpanded.discussions.length,11);
assert.equal(waterFrame.parts.length,3);assert.equal(waterFrame.arcs.length,19);assert.equal(waterFrame.motifs.length,18);assert.equal(waterFrame.additional.length,5);assert.equal(waterUi.tracks.length,3);

// Media & Learning catalogue: preserve every user-supplied URL exactly once in the source catalogue.
const media=JSON.parse(fs.readFileSync('content/media-learning-links.json','utf8'));
const mediaItems=media.groups.flatMap(g=>g.items);
assert.equal(media.count,28);assert.equal(mediaItems.length,28);assert.equal(new Set(mediaItems.map(x=>x.url)).size,28);
const teaching=media.groups.find(g=>g.id==='water-teaching');assert(teaching&&teaching.items.length===3,'Water teaching group must contain all three supplied resources.');

// Major paired research and media families.
const pairedFamilies=['parallel-philosophy','parallel-history','classical-philosophy','drama-classics','when-dreams-merge','water-burial-among-the-crocodiles','media-learning'];
for(const family of pairedFamilies){
 assert(exists(`${family}/index.html`)&&exists(`${family}/en/index.html`),`${family}: language pair missing`);
 assert.equal(langOf(`${family}/index.html`),'mai',`${family}: default route must be Maithili`);
 assert.equal(langOf(`${family}/en/index.html`),'en',`${family}: /en route must be English`);
 assert(text(`${family}/index.html`).includes('hreflang="en"'),`${family}: Maithili route needs English alternate`);
 assert(text(`${family}/en/index.html`).includes('hreflang="mai"'),`${family}: English route needs Maithili alternate`);
}

// Generated large-guide integrity and media integration.
const dreamsMai=text('when-dreams-merge/index.html');
const waterMai=text('water-burial-among-the-crocodiles/index.html');
const waterEn=text('water-burial-among-the-crocodiles/en/index.html');
const mediaMai=text('media-learning/index.html'),mediaEn=text('media-learning/en/index.html');
assert.equal(countMatches(dreamsMai,/\bdata-entry\b/g),447,'Generated Maithili Dreams page must expose all 447 records.');
assert.equal(countMatches(waterMai,/\bdata-chapter\b/g),301,'Generated Maithili Water page must expose all 301 chapters.');
assert.equal(countMatches(mediaMai,/\bdata-resource\b/g),28,'Maithili media hub must show all 28 resources.');
assert.equal(countMatches(mediaEn,/\bdata-resource\b/g),28,'English media hub must show all 28 resources.');
for(const x of teaching.items){assert(waterMai.includes(x.url),`Maithili Water guide missing teaching resource ${x.id}`);assert(waterEn.includes(x.url),`English Water guide missing teaching resource ${x.id}`);}
assert(dreamsMai.includes('/gajendra-preeti/media-learning/'),'Dreams Maithili guide must link the media hub.');
assert(waterMai.includes('/gajendra-preeti/media-learning/'),'Water Maithili guide must link the media hub.');

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

const families=[
 {id:'home',mai:'index.html',en:'en/index.html'},...pairedFamilies.map(id=>({id,mai:`${id}/index.html`,en:`${id}/en/index.html`})),
 {id:'criticism',mai:'criticism/index.html',en:'criticism/en/index.html'},
 {id:'criticism-reception',mai:'criticism/reception/index.html',en:'criticism/reception/en/index.html'}
];
const routeAudit=families.map(f=>({id:f.id,maiPath:f.mai,enPath:f.en,maiExists:exists(f.mai),enExists:exists(f.en),maiLang:exists(f.mai)?langOf(f.mai):null,enLang:exists(f.en)?langOf(f.en):null}));
const unpaired=routeAudit.filter(x=>!x.maiExists||!x.enExists||x.maiLang!=='mai'||x.enLang!=='en');
assert.equal(unpaired.length,0,`Unpaired route families remain: ${unpaired.map(x=>x.id).join(', ')}`);
const report={generatedAt:new Date().toISOString(),catalogueRecords:works.length,optionalCatalogueAsymmetry,readerPathIds:pathIds(maiAtlas),largeGuides:{whenDreamsMerge:447,waterBurial:301,dreamsExpandedReadings:11,waterNarrativeArcs:19},mediaLearning:{links:28,groups:4,waterTeachingResources:3},criticismRecords:59,criticismPairsVerified:59,receptionRecords:63,receptionPairsVerified:63,routeAudit,unpairedFamilies:[],policy:'A real bilingual pair requires authored/source-grounded Maithili and English display text. Machine translation is not counted as a counterpart.'};
fs.writeFileSync(path.join(built,'bilingual-audit.json'),JSON.stringify(report,null,2));
console.log(`Site-wide bilingual audit PASS: ${routeAudit.length}/${routeAudit.length} route families paired; Dreams 447/447; Water 301/301; media links 28/28; Reading Room 59/59; Reception 63/63.`);
