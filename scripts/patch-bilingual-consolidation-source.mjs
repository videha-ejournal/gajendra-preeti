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
  return `${source.trimEnd()}\n\n/* bilingual-consolidation-mobile-nav */\n.atlas-section-nav{width:100%;max-width:100%;justify-content:flex-start;scroll-padding-inline:12px;overscroll-behavior-inline:contain}\n@media(max-width:640px){.atlas-section-nav{width:100vw;max-width:100vw;padding-left:12px;padding-right:12px;scroll-snap-type:x proximity}.atlas-section-nav a{flex:0 0 auto;scroll-snap-align:start}.atlas-section-nav a:first-child{margin-left:0}}\n`;
});

console.log('Bilingual source consolidation PASS: Maithili interface, ISBN navigation and mobile navigation patched.');
