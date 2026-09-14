import fs from 'node:fs';

function patch(file, transform) {
  const before = fs.readFileSync(file, 'utf8');
  const after = transform(before);
  if (after === before) console.log(`${file}: already consolidated`);
  else fs.writeFileSync(file, after);
}

patch('app/(maithili)/page.tsx', source => {
  let out = source;
  const replacements = [
    ['<small lang="en">THE VIDEHA LITERARY ATLAS</small>', '<small>विदेह साहित्यिक एटलस</small>'],
    ['<small lang="en">Criticism</small>', ''],
    ['<small lang="en">Writers</small>', ''],
    ['<small lang="en">Works</small>', ''],
    ['<small lang="en">Timeline</small>', ''],
    ['<span lang="en">VIDEHA / LITERARY ATLAS</span>', '<span>विदेह / साहित्यिक एटलस</span>'],
    ['<p className="english" lang="en">Two bodies of work.<br/>A language in common.</p>', ''],
    ['<p className="eyebrow" lang="en">01 / THE WRITERS</p>', '<p className="eyebrow">01 / रचनाकार</p>'],
    ['<span className="number">01 / PREETI THAKUR</span>', '<span className="number">01 / प्रीति ठाकुर</span>'],
    ['<span className="number">02 / GAJENDRA THAKUR</span>', '<span className="number">02 / गजेन्द्र ठाकुर</span>'],
    ['<small lang="en">external</small>', '<small>बाहरी कड़ी</small>'],
    ["A READER'S COMPASS", 'पाठकक दिशासूचक'],
    ['For the curious reader', 'जिज्ञासु पाठक लेल'],
    ['02 / SELECTED WORKS', '02 / चुनल रचना'],
    ['THE WORK OF PRESERVATION', 'संरक्षणक काज'],
    ['03 / A LITERARY CHRONOLOGY', '03 / साहित्यिक कालक्रम'],
    ['प्लेटफॉर्म / META', 'प्लेटफॉर्म / सन्दर्भ'],
    ['04 / BEYOND THIS PAGE', '04 / एहि पन्नासँ आगाँ'],
    ['01 / JOURNAL', '01 / ई-पत्रिका'],
    ['02 / LIBRARY', '02 / ग्रन्थागार'],
    ['03 / YOUNG READERS', '03 / बाल-पाठक'],
    ['04 / COLLECTED WORKS', '04 / समग्र'],
    ['EDITORIAL NOTES', 'सम्पादकीय टिप्पणी'],
    ['A VIDEHA LITERARY ATLAS · MAITHILI', 'विदेह साहित्यिक एटलस · मैथिली']
  ];
  for (const [from, to] of replacements) out = out.replaceAll(from, to);
  const banned = ['THE WRITERS', "A READER'S COMPASS", 'SELECTED WORKS', 'THE WORK OF PRESERVATION', 'A LITERARY CHRONOLOGY', 'BEYOND THIS PAGE', 'EDITORIAL NOTES'];
  for (const text of banned) if (out.includes(text)) throw new Error(`Maithili UI localization incomplete: ${text}`);
  return out;
});

patch('app/atlas.tsx', source => {
  let out = source;
  const replacements = [
    ["en:'For the curious reader'", "en:'जिज्ञासु पाठक लेल'"],
    ["en:'For the literary explorer'", "en:'साहित्यक खोजी पाठक लेल'"],
    ["en:'For the archive explorer'", "en:'अभिलेखक खोजी पाठक लेल'"],
    ['<p className="eyebrow" lang="en">{s.en}</p>', '<p className="eyebrow" lang={[\'children\',\'literature\',\'memory\'].includes(s.id)?\'mai\':\'en\'}>{s.en}</p>']
  ];
  for (const [from, to] of replacements) {
    if (!out.includes(from) && !out.includes(to)) throw new Error(`Reading Paths localization anchor missing: ${from}`);
    out = out.replaceAll(from, to);
  }
  for (const text of ['For the curious reader','For the literary explorer','For the archive explorer']) if (out.includes(text)) throw new Error(`Maithili Reading Paths still contains English scaffold: ${text}`);
  return out;
});

patch('app/site-enhancements.tsx', source => {
  let out = source;
  if (!out.includes("const isbn=en?'/gajendra-preeti/en/isbn/':'/gajendra-preeti/isbn/';")) {
    const anchor = " const bibliography=en?'/gajendra-preeti/en/bibliography/':'/gajendra-preeti/bibliography/';";
    if (!out.includes(anchor)) throw new Error('site-enhancements bibliography anchor missing');
    out = out.replace(anchor, `${anchor}\n const isbn=en?'/gajendra-preeti/en/isbn/':'/gajendra-preeti/isbn/';`);
  }
  if (!out.includes('<a href={isbn}>{en?\'ISBN registry\':\'ISBN सूची\'}</a>')) {
    const nav = "   <a href={bibliography}>{en?'Complete bibliography':'पूर्ण ग्रन्थ-सूची'}</a>";
    if (!out.includes(nav)) throw new Error('quick navigation bibliography link missing');
    out = out.replace(nav, `${nav}\n   <a href={isbn}>{en?'ISBN registry':'ISBN सूची'}</a>`);
    const research = "     <a href={bibliography}>{en?'Complete bibliography':'पूर्ण ग्रन्थ-सूची'}</a>";
    if (!out.includes(research)) throw new Error('research bibliography link missing');
    out = out.replace(research, `${research}\n     <a href={isbn}>{en?'Authoritative ISBN registry':'प्रामाणिक ISBN सूची'}</a>`);
  }
  return out;
});

patch('app/improvements.css', source => {
  if (source.includes('/* bilingual-consolidation-mobile-nav */')) return source;
  return `${source.trimEnd()}\n\n/* bilingual-consolidation-mobile-nav */\n.atlas-section-nav{width:100%;max-width:100%;justify-content:flex-start;overscroll-behavior-inline:contain}\n@media(max-width:640px){.atlas-section-nav{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));width:100%;max-width:100%;padding:6px 12px;gap:4px;overflow-x:visible;scroll-snap-type:none}.atlas-section-nav a{width:100%;min-width:0;justify-content:center;padding:8px 6px;white-space:normal;text-align:center;line-height:1.25}}\n@media(max-width:340px){.atlas-section-nav{grid-template-columns:1fr}}\n`;
});

patch('scripts/validate-home-parity.mjs', source => {
  let out = source;
  out = out.replace(
    `assert(/Site updated: <time dateTime="2026-09-13">13 September 2026<\\/time> · Sources checked: <time dateTime="2026-09-13">13 September 2026<\\/time>/.test(en),'English footer must carry semantic maintenance and source-check dates.');`,
    `assert(/Site updated: <time date(?:T|t)ime="2026-09-14">14 September 2026<\\/time> · Sources checked: <time date(?:T|t)ime="2026-09-13">13 September 2026<\\/time>/.test(en),'English footer must separate production maintenance date from scholarly source-check date.');`
  );
  out = out.replace(
    `assert(/साइट अद्यतन: <time dateTime="2026-09-13">13 सितम्बर 2026<\\/time> · स्रोत-जाँच: <time dateTime="2026-09-13">13 सितम्बर 2026<\\/time>/.test(mai),'Maithili footer must carry semantic maintenance and source-check dates.');`,
    `assert(/साइट अद्यतन: <time date(?:T|t)ime="2026-09-14">14 सितम्बर 2026<\\/time> · स्रोत-जाँच: <time date(?:T|t)ime="2026-09-13">13 सितम्बर 2026<\\/time>/.test(mai),'Maithili footer must separate production maintenance date from scholarly source-check date.');`
  );
  return out;
});

patch('scripts/validate-bilingual-consolidation.mjs', source => {
  let out = source;
  out = out.replace(
    "const banned=['THE WRITERS',\"A READER'S COMPASS\",'02 / SELECTED WORKS','THE WORK OF PRESERVATION','03 / A LITERARY CHRONOLOGY','04 / BEYOND THIS PAGE','EDITORIAL NOTES','A VIDEHA LITERARY ATLAS · MAITHILI'];",
    "const banned=['THE WRITERS',\"A READER'S COMPASS\",'02 / SELECTED WORKS','THE WORK OF PRESERVATION','03 / A LITERARY CHRONOLOGY','04 / BEYOND THIS PAGE','EDITORIAL NOTES','A VIDEHA LITERARY ATLAS · MAITHILI','For the curious reader','For the literary explorer','For the archive explorer'];"
  );
  out = out.replace(
    "need(css.includes('scroll-snap-type:x proximity'),'Mobile navigation does not use start-safe horizontal snap');",
    "need(css.includes('grid-template-columns:repeat(2,minmax(0,1fr))'),'Mobile navigation must use a two-column start-safe grid');\nneed(css.includes('overflow-x:visible'),'Mobile section navigation must not retain an internal horizontal scroller');"
  );
  return out;
});

patch('scripts/browser-hardening.mjs', source => {
  let out = source;
  const old = "report.routes[report.routes.length-1].mobileOverflow=o;\n        assert(o.s<=o.c+2,`${route.lang}: mobile reflow without horizontal overflow: scrollWidth=${o.s}, clientWidth=${o.c}, offenders=${JSON.stringify(o.offenders)}`);\n        const boxes=await host.locator('.vt-bar button,.vt-editions a').evaluateAll(ns=>ns.map(n=>{const r=n.getBoundingClientRect();return {w:r.width,h:r.height,text:n.textContent?.trim()};}));for(const b of boxes)assert(b.w>=24&&b.h>=24,`${route.lang}: target ${b.text} must be >=24x24 CSS px`);";
  const next = "report.routes[report.routes.length-1].mobileOverflow=o;\n        assert(o.s<=o.c+2,`${route.lang}: mobile reflow without horizontal overflow: scrollWidth=${o.s}, clientWidth=${o.c}, offenders=${JSON.stringify(o.offenders)}`);\n        const utilityNav=await page.locator('.atlas-section-nav a').evaluateAll(ns=>ns.map(n=>{const r=n.getBoundingClientRect();return {text:n.textContent?.trim(),left:Math.round(r.left),right:Math.round(r.right),width:Math.round(r.width)};}));\n        report.routes[report.routes.length-1].utilityNav=utilityNav;\n        for(const item of utilityNav)assert(item.left>=-2&&item.right<=viewport.width+2,`${route.lang}: mobile utility navigation link must stay inside viewport: ${JSON.stringify(item)}`);\n        const boxes=await host.locator('.vt-bar button,.vt-editions a').evaluateAll(ns=>ns.map(n=>{const r=n.getBoundingClientRect();return {w:r.width,h:r.height,text:n.textContent?.trim()};}));for(const b of boxes)assert(b.w>=24&&b.h>=24,`${route.lang}: target ${b.text} must be >=24x24 CSS px`);";
  if (!out.includes(old) && !out.includes(next)) throw new Error('browser-hardening mobile audit anchor missing');
  out = out.replace(old, next);
  return out;
});

console.log('Bilingual source consolidation PASS: Maithili interface, Reading Paths, ISBN navigation, semantic dates and non-scrolling mobile navigation patched.');
