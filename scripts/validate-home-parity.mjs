import fs from 'node:fs';
import assert from 'node:assert/strict';

const root='dist/client/gajendra-preeti';
const en=fs.readFileSync(`${root}/en/index.html`,'utf8');
const mai=fs.readFileSync(`${root}/index.html`,'utf8');
const enText=en.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ');
const maiText=mai.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ');

const sections=['writers','paths','archive','preservation','journey','videha','criticism','sources'];
for(const id of sections){
 assert(en.includes(`id="${id}"`),`English home missing #${id}`);
 assert(mai.includes(`id="${id}"`),`Maithili home missing #${id}`);
}
const order=html=>sections.map(id=>html.indexOf(`id="${id}"`));
const sorted=arr=>arr.every((v,i)=>i===0||v>arr[i-1]);
assert(sorted(order(en)),'English homepage sections must appear in canonical order.');
assert(sorted(order(mai)),'Maithili homepage sections must appear in canonical order.');

const workIds=html=>[...html.matchAll(/<article id="(work-[^"]+)"/g)].map(x=>x[1]);
assert.deepEqual(workIds(mai),workIds(en),'Maithili and English home pages must expose the same work-card order.');
const timelineYears=html=>[...html.matchAll(/<time>([^<]+)<\/time>/g)].map(x=>x[1]);
assert.deepEqual(timelineYears(mai),timelineYears(en),'Maithili and English timelines must expose the same milestone sequence.');

for(const html of [mai,en]){
 assert(html.includes('data-provenance="preeti-children-16"'),'Home must expose Preeti children-series provenance block.');
 assert(html.includes('data-provenance="gajendra-children-37"'),'Home must expose Gajendra children-series provenance block.');
 assert(html.includes('data-provenance="gajendra-maithili-translations-46"'),'Home must expose Gajendra translation-series provenance block.');
 assert(html.includes('class="research-gateway"'),'Home must expose research gateway.');
 assert(html.includes('class="atlas-section-nav"'),'Home must expose quick section navigation.');
}
assert(en.includes('37 Maithili children’s novels / graphic novels'),'English home must name the 37-book Gajendra children series.');
assert(en.includes('Original Maithili author: Gajendra Thakur · English translator: Gajendra Thakur.'),'English home must credit Gajendra as both original author and English translator.');
assert(mai.includes('३७ मैथिली बाल-उपन्यास / ग्राफिक उपन्यास'),'Maithili home must name the 37-book Gajendra children series.');
assert(mai.includes('मूल मैथिली रचनाकार: गजेन्द्र ठाकुर · English अनुवादक: गजेन्द्र ठाकुर।'),'Maithili home must credit Gajendra as both original author and English translator.');
assert(en.includes('4 original Maithili works — author: Preeti Thakur'),'English home must identify Preeti’s four original Maithili children works.');
assert(en.includes('12 picture-book translations: English → Maithili — translator: Preeti Thakur'),'English home must identify Preeti’s twelve English→Maithili translations.');
assert(mai.includes('४ मूल मैथिली कृति — लेखिका: प्रीति ठाकुर'),'Maithili home must identify Preeti’s four original works.');
assert(mai.includes('१२ बाल-चित्रपोथीक अनुवाद: English → मैथिली — अनुवादिका: प्रीति ठाकुर'),'Maithili home must identify Preeti’s twelve translations.');
assert(en.includes('Items 1–3: various Indian-language originals → English intermediary → Maithili by Gajendra Thakur'),'English home must state Gajendra items 1–3 route.');
assert(en.includes('Items 4–46: English → Maithili by Gajendra Thakur'),'English home must state Gajendra items 4–46 route.');
assert(mai.includes('१–३: विभिन्न भारतीय भाषाक मूलसँ English माध्यमेँ मैथिली'),'Maithili home must state Gajendra items 1–3 route.');
assert(mai.includes('४–४६: English सँ सीधे मैथिली'),'Maithili home must state Gajendra items 4–46 route.');
assert(!mai.includes('Use browser zoom to enlarge text.'),'Maithili accessibility note must not retain untranslated English prose.');
assert(!mai.includes('Search accepts Maithili text, English author names and either Devanagari or Latin year numerals.'),'Maithili accessibility note must be fully localized.');
assert(mai.includes('पूरा अन्तरफलक पैघ करबाक लेल ब्राउजरक जूम उपयोग करू।'),'Maithili zoom guidance must be localized.');
assert(en.includes('PLATFORM / META'),'English 2026 milestone must carry a non-colour platform label.');
assert(mai.includes('प्लेटफॉर्म / सन्दर्भ'),'Maithili 2026 milestone must carry a localized non-colour platform label.');
assert(en.includes('editorial heritage gallery'),'English Mithila Ratna link must explain that it is an editorial heritage gallery, not imply an external state honour.');
assert(mai.includes('सम्पादकीय विरासत-संग्रह'),'Maithili Mithila Ratna link must carry the same restrained gloss.');
assert(en.includes('available in 10 parts')&&en.includes('does not guess one'),'English Panji note must disclose the verified 10-part edition without inventing a volume mapping.');
assert(mai.includes('10 भागमे उपलब्ध')&&mai.includes('अनुमान नहि कएल गेल'),'Maithili Panji note must disclose the verified 10-part edition without inventing a volume mapping.');

function p0ActionTarget(html){
  const m=html.match(/<article id="work-p0"[\s\S]*?<div class="work-actions"><a href="([^"]+)"/);
  assert(m,'P0 work card must expose a primary READ action.');
  return m[1];
}
function p0TitleTarget(html){
  const m=html.match(/<article id="work-p0"[\s\S]*?<h3><a href="([^"]+)"/);
  assert(m,'P0 work card title must be present.');
  return m[1];
}
assert.equal(p0ActionTarget(mai),p0TitleTarget(mai),'Maithili P0 card title and READ action must share one target.');
assert.equal(p0ActionTarget(en),p0TitleTarget(en),'English P0 card title and READ action must share one target.');

const counts=[...mai.matchAll(/data-provenance=/g)].length;
assert.equal(counts,[...en.matchAll(/data-provenance=/g)].length,'Home provenance-block count must match across languages.');
assert(!maiText.includes('Series provenance:'),'Maithili visible copy must not retain English provenance label.');
console.log(`Home parity PASS: ${workIds(mai).length} mirrored work cards; ${timelineYears(mai).length} mirrored timeline entries; localized platform label; series provenance aligned.`);
