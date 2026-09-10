import fs from 'node:fs';
import assert from 'node:assert/strict';

const root='dist/client/gajendra-preeti';
const mai=fs.readFileSync(`${root}/index.html`,'utf8');
const en=fs.readFileSync(`${root}/en/index.html`,'utf8');
const sourceCatalogue=fs.readFileSync('app/catalogue-view.tsx','utf8');
const sourceCss=fs.readFileSync('app/globals.css','utf8');

const timelineYears=html=>[...html.matchAll(/class="timeline-year">([^<]+)</g)].map(m=>m[1]);
const expected=['2002','2004','2007','2008','2009','2012','2016','2018','2019','2022','2024','2026'];
assert.deepEqual(timelineYears(mai),expected,'Maithili chronology must keep all 12 sourced stops.');
assert.deepEqual(timelineYears(en),expected,'English chronology must keep the same 12 sourced stops.');

for(const [lang,html] of [['mai',mai],['en',en]]){
  assert.equal((html.match(/class="work-card /g)||[]).length,26,`${lang}: all 26 works must render by default.`);
  assert(html.includes('catalogue-refine'),`${lang}: genre/year refinement controls must render.`);
  assert(html.includes('reception-teaser'),`${lang}: contributor/reception block must render.`);
  assert(html.includes('8 September 2026')||html.includes('8 सितम्बर 2026'),`${lang}: source-check date must be visible.`);
  assert(html.includes('10 September 2026')||html.includes('10 सितम्बर 2026'),`${lang}: site-update date must be visible.`);
  assert(html.includes('Displayed without modification.'),`${lang}: shared Wikimedia wording must match.`);
  assert(!html.includes('Displayed without alteration.'),`${lang}: obsolete Wikimedia wording must be absent.`);
}

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

const basisRule=sourceCss.match(/\.basis-breakdown\s*\{([^}]*)\}/s)?.[1]||'';
assert(basisRule.includes('max-width:90ch'),'Criticism summary count block must retain a readable maximum width.');
assert(basisRule.includes('line-height:1.9'),'Criticism summary count block must retain generous line-height.');

const maiFooter=mai.match(/<footer>[\s\S]*?<\/footer>/)?.[0]||'';
assert.equal((maiFooter.match(/https:\/\/github\.com\/videha-ejournal\/gajendra-preeti/g)||[]).length,1,'Maithili footer must show the repository link once.');
assert(/Site updated: 10 September 2026 · Sources checked: 8 September 2026/.test(en),'English footer must carry both maintenance and source-check dates.');
assert(/साइट अद्यतन: 10 सितम्बर 2026 · स्रोत-जाँच: 8 सितम्बर 2026/.test(mai),'Maithili footer must carry both maintenance and source-check dates.');

console.log('Home parity validation PASS: 12/12 timeline stops, 26/26 works, shared filters, reception discovery, local P0 target, aligned provenance and credit wording.');
