import fs from 'node:fs';
import assert from 'node:assert/strict';

const root='dist/client/gajendra-preeti';
const mai=fs.readFileSync(`${root}/index.html`,'utf8');
const en=fs.readFileSync(`${root}/en/index.html`,'utf8');
const sourceCatalogue=fs.readFileSync('app/catalogue-view.tsx','utf8');
const sourceReferenceCss=fs.readFileSync('app/reference.css','utf8');
const sourceStructured=fs.readFileSync('app/structured-data.tsx','utf8');
const readingTools=fs.readFileSync('public/reading-tools.js','utf8');

const timelineYears=html=>[...html.matchAll(/class="timeline-year">([^<]+)</g)].map(m=>m[1]);
const expected=['2002','2004','2007','2008','2009','2012','2016','2018','2019','2022','2024','2026'];
assert.deepEqual(timelineYears(mai),expected,'Maithili chronology must keep all 12 sourced stops.');
assert.deepEqual(timelineYears(en),expected,'English chronology must keep the same 12 sourced stops.');

for(const [lang,html] of [['mai',mai],['en',en]]){
  assert.equal((html.match(/class="work-card /g)||[]).length,26,`${lang}: all 26 works must render by default.`);
  assert.equal((html.match(/class="edition-meta"/g)||[]).length,26,`${lang}: every work must carry explicit edition-status metadata.`);
  assert.equal((html.match(/class="translation-meta"/g)||[]).length,16,`${lang}: Preeti’s 4 originals + 12 translated picture-books must carry explicit role/language metadata.`);
  assert.equal((html.match(/class="catalogue-verification"/g)||[]).length,1,`${lang}: catalogue verification date should appear once globally.`);
  assert.equal((html.match(/class="verified-note"/g)||[]).length,0,`${lang}: repeated per-card catalogue-check labels must stay removed.`);
  assert.equal((html.match(/data-provenance="gajendra-children-37"/g)||[]).length,1,`${lang}: Gajendra’s 37-book children-series provenance must appear once.`);
  assert.equal((html.match(/data-provenance="preeti-children-16"/g)||[]).length,1,`${lang}: Preeti’s 16-work children corpus provenance must appear once.`);
  assert.equal((html.match(/data-provenance="gajendra-maithili-translations-46"/g)||[]).length,1,`${lang}: Gajendra’s 46-entry Maithili translation corpus must appear once.`);
  assert(html.includes('catalogue-refine'),`${lang}: genre/year refinement controls must render.`);
  assert(html.includes('reception-teaser'),`${lang}: contributor/reception block must render.`);
  assert(html.includes('8 September 2026')||html.includes('8 सितम्बर 2026'),`${lang}: source-check date must be visible.`);
  assert(html.includes('10 September 2026')||html.includes('10 सितम्बर 2026'),`${lang}: site-update date must be visible.`);
  assert(html.includes('Displayed without modification.'),`${lang}: shared Wikimedia wording must match.`);
  assert(!html.includes('Displayed without alteration.'),`${lang}: obsolete Wikimedia wording must be absent.`);
  assert(html.includes('https://www.videha.co.in/videha-rss.xml'),`${lang}: JOURNAL area must expose the Videha RSS route.`);
  assert.equal((html.match(/class="timeline-platform"/g)||[]).length,1,`${lang}: exactly one platform/meta milestone must be visually distinguished.`);
  assert(html.includes('class="panji-access"'),`${lang}: Panji access structure must be expandable.`);
  assert(html.includes('840 MB'),`${lang}: combined Panji size must remain explicit.`);
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
assert(mai.includes('प्लेटफॉर्म पड़ाव'),'Maithili 2026 milestone must carry a non-colour platform label.');
assert(en.includes('editorial heritage gallery'),'English Mithila Ratna link must explain that it is an editorial heritage gallery, not imply an external state honour.');
assert(mai.includes('सम्पादकीय विरासत-संग्रह'),'Maithili Mithila Ratna link must carry the same restrained gloss.');
assert(en.includes('available in 10 parts')&&en.includes('does not guess one'),'English Panji note must disclose the verified 10-part edition without inventing a volume mapping.');
assert(mai.includes('10 भागमे उपलब्ध')&&mai.includes('अनुमान नहि कएल गेल'),'Maithili Panji note must disclose the verified 10-part edition without inventing a volume mapping.');

function p0Target(html){
  const m=html.match(/<article id="work-p0"[\s\S]*?<h3><a href="([^"]+)"/);
  assert(m,'P0 work card must be present.');
  return m[1];
}
const p0='https://videha-ejournal.github.io/gajendra-preeti/books/p0.pdf';
assert.equal(p0Target(mai),p0,'Maithili P0 must use the controlled local mirror.');
assert.equal(p0Target(en),p0,'English P0 must use the same controlled local mirror.');

assert(en.includes('/gajendra-preeti/criticism/reception/en/'),'English home must directly expose Contributors’ Perspectives.');
assert(mai.includes('/gajendra-preeti/criticism/reception/'),'Maithili home must directly expose योगदानकर्ता access.');
assert(en.includes('/gajendra-preeti/criticism/en/'),'English criticism links must stay in the English edition.');
assert(sourceCatalogue.includes("english?'/gajendra-preeti/criticism/en/'"),'Catalogue-level criticism link must switch editions.');
assert(sourceCatalogue.includes("english?'/gajendra-preeti/criticism/en/'+review+'.html'"),'Per-work criticism links must switch editions.');

assert(sourceCatalogue.includes("const filtered=works.filter"),'Shared catalogue filtering logic must remain active.');
assert(sourceCatalogue.includes("onChange={e=>setGenre(e.target.value)}"),'Genre filter must remain interactive.');
assert(sourceCatalogue.includes("onChange={e=>setYear(e.target.value)}"),'Year filter must remain interactive.');
assert(!/Show 20 more works/i.test(en),'English home must not collapse the catalogue behind a 20-more toggle.');
assert(sourceCatalogue.includes('Original Maithili · Author: Preeti Thakur'),'Preeti original children cards must state authorship.');
assert(sourceCatalogue.includes('English → Maithili · Translator: Preeti Thakur'),'Preeti translated picture-book cards must state English → Maithili provenance and translator.');
assert(sourceCatalogue.includes('मूल मैथिली · लेखिका: प्रीति ठाकुर'),'Maithili original cards must state Preeti authorship.');
assert(sourceCatalogue.includes('English → मैथिली · अनुवादिका: प्रीति ठाकुर'),'Maithili translation cards must state Preeti translator credit.');
assert(!sourceCatalogue.includes('source language not recorded'),'Confirmed source-language provenance must not be replaced by an uncertainty disclaimer.');
assert(sourceCatalogue.includes("Cite':'उद्धरण'"),'Per-work cite anchors must remain visible in both editions.');
assert(readingTools.includes('Cite this page')&&readingTools.includes('Suggested citation'),'Shared Reading Tools must retain the actual citation generator.');

const basisRule=sourceReferenceCss.match(/\.basis-breakdown\s*\{([^}]*)\}/s)?.[1]||'';
assert(basisRule.includes('max-width:90ch'),'Criticism summary count block must retain a readable maximum width.');
assert(basisRule.includes('line-height:1.9'),'Criticism summary count block must retain generous line-height.');
assert(sourceReferenceCss.includes('.timeline .timeline-platform'),'Platform milestone must have distinct styling.');
assert(sourceReferenceCss.includes('.catalogue-verification'),'Global verification note must have deliberate styling.');
assert(sourceReferenceCss.includes('.writer-series-provenance'),'Author/translator provenance callouts must retain deliberate responsive styling.');

assert(sourceStructured.includes("isBook?'Book':'CreativeWork'"),'Book-like catalogue records must emit schema.org Book JSON-LD.');
assert(sourceStructured.includes("preetiOriginalIds.has(w.id)?{author:preeti}"),'Preeti original children works must credit Preeti as author in JSON-LD.');
assert(sourceStructured.includes("preetiTranslationIds.has(w.id)?{translator:preeti}"),'Preeti translated picture-books must credit Preeti as translator in JSON-LD.');
assert(!sourceStructured.includes("roleName:'Adaptation'"),'Vidyapati’s Purusha Pariksha must not retain the obsolete Adaptation role.');
assert(sourceStructured.includes("'@type':'CreativeWorkSeries'"),'Gajendra 37-book and Preeti children provenance must use structured series nodes.');
assert(sourceStructured.includes("#gajendra-maithili-translations-46"),'Gajendra 46-entry translation corpus must be represented in JSON-LD.');
for(const html of [mai,en]){
  assert(html.includes('application/ld+json'),'Both home editions must expose JSON-LD.');
  const graph=JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])['@graph'];
  assert.equal(graph.filter(x=>x['@type']==='Person').length,2,'JSON-LD must contain two Person entities.');
  assert(graph.some(x=>x['@type']==='Book'),'JSON-LD must contain Book entities.');
  const g37=graph.filter(x=>x['@type']==='CreativeWorkSeries'&&String(x['@id']||'').includes('gajendra-children-37'));
  assert.equal(g37.length,2,'JSON-LD must contain original-Maithili and English-translation Gajendra 37-series nodes.');
  const gTranslations=graph.find(x=>String(x['@id']||'').includes('gajendra-maithili-translations-46'));
  assert.equal(gTranslations?.numberOfItems,46,'JSON-LD must preserve the 46-entry Gajendra Maithili translation corpus.');
}

const maiFooter=mai.match(/<footer>[\s\S]*?<\/footer>/)?.[0]||'';
assert.equal((maiFooter.match(/https:\/\/github\.com\/videha-ejournal\/gajendra-preeti/g)||[]).length,1,'Maithili footer must show the repository link once.');
assert(/Site updated: 10 September 2026 · Sources checked: 8 September 2026/.test(en),'English footer must carry both maintenance and source-check dates.');
assert(/साइट अद्यतन: 10 सितम्बर 2026 · स्रोत-जाँच: 8 सितम्बर 2026/.test(mai),'Maithili footer must carry both maintenance and source-check dates.');

console.log('Scholarly home consistency PASS: Preeti 4 original + 12 English→Maithili children works, Gajendra 37 original-Maithili→English children novels, Gajendra 46 Maithili translations, and all prior parity/accessibility/provenance guards.');
