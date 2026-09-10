import fs from 'node:fs';
import assert from 'node:assert/strict';

const preeti=JSON.parse(fs.readFileSync('content/preeti-children-provenance.json','utf8'));
const gajendra=JSON.parse(fs.readFileSync('content/gajendra-maithili-translations-provenance.json','utf8'));
const works=JSON.parse(fs.readFileSync('app/works.json','utf8'));
const structured=fs.readFileSync('app/structured-data.tsx','utf8');
const mai=fs.readFileSync('dist/client/gajendra-preeti/index.html','utf8');
const en=fs.readFileSync('dist/client/gajendra-preeti/en/index.html','utf8');

assert.equal(preeti.originalMaithili.length,4,'Preeti original children corpus must contain exactly 4 works.');
assert.equal(preeti.englishToMaithiliTranslations.length,12,'Preeti translated picture-book corpus must contain exactly 12 works.');
assert.deepEqual(preeti.originalMaithili.map(x=>x.id),['p0','p13','p14','p15'],'Preeti original-work membership must remain exact.');
assert.deepEqual(preeti.englishToMaithiliTranslations.map(x=>x.id),Array.from({length:12},(_,i)=>`p${i+1}`),'Preeti translation membership must remain p1..p12.');
for(const x of preeti.originalMaithili){assert.equal(x.role,'author');assert.equal(x.originalLanguage,'mai');}
for(const x of preeti.englishToMaithiliTranslations){assert.equal(x.role,'translator');assert.equal(x.sourceLanguage,'en');assert.equal(x.translationLanguage,'mai');}
for(const x of [...preeti.originalMaithili,...preeti.englishToMaithiliTranslations]){
 const w=works.find(y=>y.id===x.id);assert(w,`Missing selected-work record ${x.id}`);assert.equal(w.title,x.titleMai,`${x.id}: title drift`);assert.equal(w.year,x.year,`${x.id}: year drift`);
}

assert.equal(gajendra.items.length,46,'Gajendra Maithili translation corpus must contain exactly 46 entries.');
assert.deepEqual(gajendra.items.map(x=>x.number),Array.from({length:46},(_,i)=>i+1),'Gajendra translation numbering must stay 1..46.');
assert.equal(gajendra.items.filter(x=>x.route==='indian-via-english').length,3,'Exactly items 1–3 must use Indian-language → English → Maithili route.');
assert.deepEqual(gajendra.items.filter(x=>x.route==='indian-via-english').map(x=>x.number),[1,2,3]);
assert.equal(gajendra.items.filter(x=>x.route==='english-direct').length,43,'Exactly items 4–46 must use direct English → Maithili route.');
for(const x of gajendra.items.slice(0,3)){assert.equal(x.sourceLanguage,'various Indian languages');assert.equal(x.intermediaryLanguage,'en');assert.equal(x.targetLanguage,'mai');assert.equal(x.translator,'Gajendra Thakur');}
for(const x of gajendra.items.slice(3)){assert.equal(x.sourceLanguage,'en');assert.equal(x.targetLanguage,'mai');assert.equal(x.translator,'Gajendra Thakur');assert(!('intermediaryLanguage' in x));}
assert.equal(new Set(gajendra.items.map(x=>x.url)).size,46,'All 46 Gajendra translation URLs must remain unique.');
assert(gajendra.items.every(x=>x.url.startsWith('https://')),'All Gajendra translation URLs must remain HTTPS.');
const item46=gajendra.items.find(x=>x.number===46);
assert(item46,'Item 46 must be present.');
assert.equal(item46.titleMai,'मू परियोजना — देवनागरी लिपि');
assert.equal(item46.route,'english-direct');
assert.equal(item46.sourceLanguage,'en');
assert.equal(item46.targetLanguage,'mai');
assert.equal(item46.translator,'Gajendra Thakur');

for(const [lang,html] of [['mai',mai],['en',en]]){
 assert(html.includes('data-provenance="preeti-children-16"'),`${lang}: Preeti 16-work provenance callout missing.`);
 assert(html.includes('data-provenance="gajendra-maithili-translations-46"'),`${lang}: Gajendra 46-entry provenance callout missing.`);
 assert.equal((html.match(/class="translation-meta"/g)||[]).length,16,`${lang}: all 4 Preeti originals + 12 translations must carry explicit role/language metadata.`);
}
assert(en.includes('4 original Maithili works — author: Preeti Thakur'));
assert(en.includes('12 picture-book translations: English → Maithili — translator: Preeti Thakur'));
assert(mai.includes('४ मूल मैथिली कृति — लेखिका: प्रीति ठाकुर'));
assert(mai.includes('१२ बाल-चित्रपोथीक अनुवाद: English → मैथिली — अनुवादिका: प्रीति ठाकुर'));
assert(en.includes('Items 1–3: various Indian-language originals → English intermediary → Maithili by Gajendra Thakur'));
assert(en.includes('Items 4–46: English → Maithili by Gajendra Thakur'));
assert(mai.includes('१–३: विभिन्न भारतीय भाषाक मूलसँ English माध्यमेँ मैथिली'));
assert(mai.includes('४–४६: English सँ सीधे मैथिली'));

assert(!structured.includes("roleName:'Adaptation'"),'Vidyapati’s Purusha Pariksha must not retain the obsolete Adaptation role.');
assert(structured.includes("preetiOriginalIds.has(w.id)?{author:preeti}"),'Preeti original children works must be authored by Preeti in JSON-LD.');
assert(structured.includes("preetiTranslationIds.has(w.id)?{translator:preeti}"),'Preeti translations must credit Preeti as translator in JSON-LD.');
assert(structured.includes("#gajendra-maithili-translations-46"),'Gajendra 46-entry translation corpus must be present in JSON-LD.');

console.log('Author corpus provenance PASS: Preeti 4 original Maithili + 12 English→Maithili translations; Gajendra 46 Maithili translations with items 1–3 via English and 4–46 direct from English.');
