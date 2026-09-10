import fs from 'node:fs';
import assert from 'node:assert/strict';

function patch(file,replacements){
  let s=fs.readFileSync(file,'utf8');
  for(const [before,after,label] of replacements){
    if(s.includes(after)) continue;
    assert(s.includes(before),`${file}: patch point changed (${label})`);
    s=s.replace(before,after);
  }
  fs.writeFileSync(file,s,'utf8');
}

patch('app/(english)/en/page.tsx',[
  [
    '<a href="/gajendra-preeti/criticism/">Criticism</a><a href="#writers">Writers</a>',
    '<a href="/gajendra-preeti/criticism/en/">Criticism</a><a href="/gajendra-preeti/criticism/reception/en/">Contributors</a><a href="#writers">Writers</a>',
    'English top navigation'
  ],
  ['Displayed without alteration.','Displayed without modification.','Wikimedia credit wording'],
  [
    '<a href="/gajendra-preeti/criticism/">Criticism</a><a href="#sources">Sources and credits</a>',
    '<a href="/gajendra-preeti/criticism/en/">Criticism</a><a href="/gajendra-preeti/criticism/reception/en/">Contributors</a><a href="#sources">Sources and credits</a>',
    'English footer navigation'
  ],
  [
    '<small className="maintenance-stamp">Site updated: 9 September 2026 · <a href="https://github.com/videha-ejournal/gajendra-preeti" lang="en">GitHub ↗</a></small>',
    '<small className="maintenance-stamp">Site updated: 10 September 2026 · Sources checked: 8 September 2026 · <a href="https://github.com/videha-ejournal/gajendra-preeti" lang="en">GitHub ↗</a></small>',
    'English maintenance stamp'
  ]
]);

patch('app/(maithili)/page.tsx',[
  [
    '<a href="/gajendra-preeti/criticism/">समालोचना<small lang="en">Criticism</small></a><a href="#writers">परिचय',
    '<a href="/gajendra-preeti/criticism/">समालोचना<small lang="en">Criticism</small></a><a href="/gajendra-preeti/criticism/reception/">योगदानकर्ता</a><a href="#writers">परिचय',
    'Maithili top navigation'
  ],
  [
    '<div><a href="#sources">स्रोत आ श्रेय</a><a href="https://github.com/videha-ejournal/gajendra-preeti">GitHub ↗</a><a href="#top">ऊपर जाउ ↑</a></div>',
    '<div><a href="#sources">स्रोत आ श्रेय</a><a href="/gajendra-preeti/criticism/reception/">योगदानकर्ता</a><a href="#top">ऊपर जाउ ↑</a></div>',
    'Maithili footer duplicate GitHub link'
  ],
  [
    '<small className="maintenance-stamp">साइट अद्यतन: 9 सितम्बर 2026 · <a href="https://github.com/videha-ejournal/gajendra-preeti" lang="en">GitHub ↗</a></small>',
    '<small className="maintenance-stamp">साइट अद्यतन: 10 सितम्बर 2026 · स्रोत-जाँच: 8 सितम्बर 2026 · <a href="https://github.com/videha-ejournal/gajendra-preeti" lang="en">GitHub ↗</a></small>',
    'Maithili maintenance stamp'
  ]
]);

patch('app/catalogue-view.tsx',[
  [
    '<a href="/gajendra-preeti/criticism/" lang={english?\'en\':\'mai\'}>{english?\'English criticism →\':\'इंग्लिश समालोचना →\'}</a>',
    '<a href={english?\'/gajendra-preeti/criticism/en/\':\'/gajendra-preeti/criticism/\'} lang={english?\'en\':\'mai\'}>{english?\'English criticism →\':\'मैथिली समालोचना →\'}</a>',
    'Catalogue criticism edition link'
  ],
  [
    "{review&&<a href={'/gajendra-preeti/criticism/'+review+'.html'}>{english?'English criticism':'अंग्रेजी समालोचना'} →</a>}",
    "{review&&<a href={english?'/gajendra-preeti/criticism/en/'+review+'.html':'/gajendra-preeti/criticism/'+review+'.html'}>{english?'English criticism':'मैथिली समालोचना'} →</a>}",
    'Per-work criticism edition link'
  ]
]);

console.log('Polished home-page bilingual parity: contributor discovery, criticism targets, footer provenance and shared credit wording.');
