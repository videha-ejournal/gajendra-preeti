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
  ],
  [
    '<a href="https://www.videha.co.in/ratna.htm">Videha / Mithila Ratna ↗</a>',
    '<a href="https://www.videha.co.in/ratna.htm">Videha Mithila Ratna <small>(editorial heritage gallery)</small> ↗</a>',
    'Mithila Ratna English gloss'
  ],
  [
    '<a href="https://drive.google.com/file/d/13tKREg6BqXkfk3n1jGfrgnQVx-Y5hQMs/view?usp=sharing">Open the Panji archive ↗</a></article>',
    '<a href="https://drive.google.com/file/d/13tKREg6BqXkfk3n1jGfrgnQVx-Y5hQMs/view?usp=sharing">Open the source Drive copy ↗</a><a href="https://archive.org/download/maithili_202209/11000_PALM_LEAF_PANJI_MERGE.pdf">Combined Archive.org PDF · 840 MB ↗</a><details className="panji-access"><summary>Volume and part structure</summary><p>Videha documents the archive as Volumes I–XXII. Google Play separately describes the digital edition as available in 10 parts. The verified listings do not state an exact volume-to-part mapping, so this atlas does not guess one.</p><a href="https://play.google.com/store/books/details/Preeti_Thakur_11000_PALM_LEAF_PANJI_INSCRIPTIONS_V?id=VfG2EAAAQBAJ">Open a verified Google Play part (6/10) ↗</a></details></article>',
    'Panji access structure English'
  ],
  [
    '<li key={year} id={"timeline-"+year} data-citation-title={year+" — "+title}>',
    '<li key={year} className={year===\'2026\'?\'timeline-platform\':undefined} id={"timeline-"+year} data-citation-title={year+" — "+title}>',
    'English platform milestone class'
  ],
  [
    '<span className="timeline-name">{who}</span><h3>',
    '<span className="timeline-name">{who}</span>{year===\'2026\'&&<span className="timeline-kind">PLATFORM / META</span>}<h3>',
    'English platform milestone label'
  ],
  [
    '</div></section>\n<CriticismTeaser lang="en"/>',
    '</div><p className="journal-rss">The journal is an actively updating resource. <a href="https://www.videha.co.in/videha-rss.xml">Subscribe to new Videha issues via RSS ↗</a></p></section>\n<CriticismTeaser lang="en"/>',
    'English RSS discovery'
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
  ],
  [
    '<a href="https://www.videha.co.in/ratna.htm">विदेह / मिथिला रत्न ↗</a>',
    '<a href="https://www.videha.co.in/ratna.htm">विदेह मिथिला रत्न <small>(सम्पादकीय विरासत-संग्रह)</small> ↗</a>',
    'Mithila Ratna Maithili gloss'
  ],
  [
    '<a href="https://drive.google.com/file/d/13tKREg6BqXkfk3n1jGfrgnQVx-Y5hQMs/view?usp=sharing">पञ्जी-अभिलेख खोलू ↗</a></article>',
    '<a href="https://drive.google.com/file/d/13tKREg6BqXkfk3n1jGfrgnQVx-Y5hQMs/view?usp=sharing">मूल Drive प्रति खोलू ↗</a><a href="https://archive.org/download/maithili_202209/11000_PALM_LEAF_PANJI_MERGE.pdf">संयुक्त Archive.org PDF · 840 MB ↗</a><details className="panji-access"><summary>खण्ड आ डिजिटल भागक बनावट</summary><p>विदेह पञ्जी-अभिलेखकेँ खण्ड I–XXII रूपमे दर्ज करैत अछि। Google Play अलगसँ डिजिटल संस्करणकेँ 10 भागमे उपलब्ध कहैत अछि। सत्यापित सूचीमे खण्डक संग भागक सटीक मिलान नहि देल अछि, तेँ एहि अटलसमे अनुमान नहि कएल गेल अछि।</p><a href="https://play.google.com/store/books/details/Preeti_Thakur_11000_PALM_LEAF_PANJI_INSCRIPTIONS_V?id=VfG2EAAAQBAJ">सत्यापित Google Play भाग 6/10 खोलू ↗</a></details></article>',
    'Panji access structure Maithili'
  ],
  [
    '<li key={t.year} id={"timeline-"+t.year} data-citation-title={t.year+" — "+t.title}>',
    '<li key={t.year} className={t.year===\'2026\'?\'timeline-platform\':undefined} id={"timeline-"+t.year} data-citation-title={t.year+" — "+t.title}>',
    'Maithili platform milestone class'
  ],
  [
    '<span className="timeline-name">{t.name}</span><h3>',
    '<span className="timeline-name">{t.name}</span>{t.year===\'2026\'&&<span className="timeline-kind">प्लेटफॉर्म पड़ाव</span>}<h3>',
    'Maithili platform milestone label'
  ],
  [
    '<p lang="en">Use browser zoom to enlarge text. Search accepts Maithili text, English author names and either Devanagari or Latin year numerals.</p>',
    '<p>पूरा अन्तरफलक पैघ करबाक लेल ब्राउजरक जूम उपयोग करू। खोजमे मैथिली पाठ, अंग्रेजी लेखक-नाम आ देवनागरी वा 0–9 अंकमे वर्ष स्वीकार होइत अछि।</p>',
    'Maithili accessibility localization'
  ],
  [
    '</div></section>\n\n<CriticismTeaser lang="mai"/>',
    '</div><p className="journal-rss">ई-पत्रिकाक नूतन अंक नियमित अद्यतन होइत अछि। <a href="https://www.videha.co.in/videha-rss.xml">RSS सँ नूतन विदेह अंक पाउ ↗</a></p></section>\n\n<CriticismTeaser lang="mai"/>',
    'Maithili RSS discovery'
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

console.log('Polished scholarly home parity: provenance, accessibility, Panji access, platform chronology, RSS discovery and source-grounded labels.');
