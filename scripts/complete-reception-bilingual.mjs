import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const base='/gajendra-preeti';
const dir='public/criticism/reception';
const source=JSON.parse(fs.readFileSync('content/reception-gists.json','utf8'));
const translations=[
 ...JSON.parse(fs.readFileSync('content/reception-gists-mai-preeti-karan-1.json','utf8')),
 ...JSON.parse(fs.readFileSync('content/reception-gists-mai-preeti-karan-2.json','utf8')),
 ...JSON.parse(fs.readFileSync('content/reception-gists-mai-setusham.json','utf8'))
];
const key=x=>`${x.book}:${x.id}`;
assert.equal(source.articles.length,63,'Expected 63 reception records');
assert.equal(translations.length,63,'Expected 63 Maithili reception records');
assert.equal(new Set(translations.map(key)).size,63,'Duplicate Maithili reception keys');
assert.deepEqual(new Set(translations.map(key)),new Set(source.articles.map(key)),'Maithili reception keys must exactly match English source records');
for(const x of translations){assert(x.titleMai?.trim(),`${key(x)} missing titleMai`);assert(x.gistMai?.trim().length>120,`${key(x)} gistMai too short`);assert(typeof x.noteMai==='string',`${key(x)} missing noteMai field`);}
const mai=Object.fromEntries(translations.map(x=>[key(x),x]));
const e=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const files=['index.html','preeti-karan.html','setusham.html'];
const enDir=path.join(dir,'en');fs.rmSync(enDir,{recursive:true,force:true});fs.mkdirSync(enDir,{recursive:true});
for(const file of files)fs.copyFileSync(path.join(dir,file),path.join(enDir,file));

const route=file=>file==='index.html'?`${base}/criticism/reception/`:`${base}/criticism/reception/${file}`;
const routeEn=file=>file==='index.html'?`${base}/criticism/reception/en/`:`${base}/criticism/reception/en/${file}`;
function addAlternates(html,maiUrl,enUrl){const tags=`<link rel="alternate" hreflang="mai" href="https://videha-ejournal.github.io${maiUrl}"><link rel="alternate" hreflang="en" href="https://videha-ejournal.github.io${enUrl}"><link rel="alternate" hreflang="x-default" href="https://videha-ejournal.github.io${maiUrl}">`;return html.replace('<meta name="theme-color"',tags+'<meta name="theme-color"');}
function englishPage(html,file){const maiUrl=route(file),enUrl=routeEn(file);html=html.replaceAll(`https://videha-ejournal.github.io${maiUrl}`,`https://videha-ejournal.github.io${enUrl}`);for(const f of files.slice(1)){html=html.replaceAll(`${base}/criticism/reception/${f}`,`${base}/criticism/reception/en/${f}`);}html=html.replaceAll(`${base}/criticism/reception/"`,`${base}/criticism/reception/en/"`);html=html.replace('<nav aria-label="Main navigation">',`<nav aria-label="Main navigation"><a href="${maiUrl}" lang="mai">मैथिली सार</a>`);return addAlternates(html,maiUrl,enUrl);}
for(const file of files){const p=path.join(enDir,file);fs.writeFileSync(p,englishPage(fs.readFileSync(p,'utf8'),file));}

const bookMai={
 'preeti-karan':{title:'प्रीति कारण सेतु बान्हल',subtitle:'प्रीतिक कारण बनल सेतु · मैथिलीक नव परिभाषा',description:'चित्र-आख्यान, साहित्यिक रूप, सार्वजनिक पुस्तकालय आ संरक्षणक काज।'},
 'setusham':{title:'सेतुशम: जीवन्त मैथिली',subtitle:'दोसर खण्ड · शीर्षक-पृष्ठ: सेतुशमा: जीवन्त मैथिली',description:'डिजिटल भाषा, नव लेखक, विविधता आ साहित्यिक सार्वजनिकताक दायित्व।'}
};
const common=[
 ['<html lang="en">','<html lang="mai">'],['Skip to main content','मुख्य सामग्रीपर जाउ'],['Main navigation','मुख्य नेविगेशन'],['English home','English home'],['Reading room','पाठ-कक्ष'],['Criticism','समालोचना'],['Contributors’ perspectives','योगदानकर्तासभक दृष्टि'],['CONTRIBUTORS’ PERSPECTIVES / ENGLISH BOOK GISTS','योगदानकर्तासभक दृष्टि / मैथिली लेख-सार'],['Many voices.<br><em>Two volumes.</em>','अनेक स्वर।<br><em>दू खण्ड।</em>'],['Criticism, memories, interviews and editorial debate—each returned to its author and its place in the book.','समालोचना, संस्मरण, साक्षात्कार आ सम्पादकीय बहस—प्रत्येककेँ ओकर लेखक आ पोथीक ठामसँ जोड़ल गेल अछि।'],['main contributions','मुख्य योगदान'],['editorial introductions','सम्पादकीय भूमिका'],['supporting summaries','सहायक सार'],['Every main contribution in both supplied English volumes is summarized below. These contributor perspectives sit alongside the atlas’s existing editorial readings.','दुनू उपलब्ध अंग्रेजी खण्डक प्रत्येक मुख्य योगदानक मैथिली सार देल अछि। ई योगदानकर्ता-दृष्टि एटलसक अलग सम्पादकीय समालोचनात्मक पाठक संग-संग पढ़ल जाए।'],['VOLUME 1 / 40 CONTRIBUTIONS','खण्ड १ / 40 योगदान'],['VOLUME 2 / 16 CONTRIBUTIONS','खण्ड २ / 16 योगदान'],['Read every article’s gist →','प्रत्येक लेखक सार पढ़ू →'],['Find a contributor or a subject','योगदानकर्ता वा विषय खोजू'],['Search title, contributor or gist','शीर्षक, योगदानकर्ता वा सार खोजू'],['Try Panji, children, Kalpana…','पञ्जी, बाल-साहित्य, कल्पना…'],['Focus','केन्द्र'],['All subjects','सभ विषय'],['Preeti Thakur','प्रीति ठाकुर'],['Gajendra / Videha','गजेन्द्र / विदेह'],['Editorial & contextual material','सम्पादकीय आ सन्दर्भ-सामग्री'],['Reset','फेरसँ आरम्भ'],['All entries shown','सभ प्रविष्टि देखाओल गेल'],['Signed contribution','हस्ताक्षरित योगदान'],['Editorial framing','सम्पादकीय रूपरेखा'],['Supporting material','सहायक सामग्री'],['Citation & context →','सन्दर्भ आ प्रसंग →'],['SOURCE EDITIONS / CONSULTED 9 SEPTEMBER 2026','स्रोत-संस्करण / 9 सितम्बर 2026 केँ देखल गेल'],['Read the attribution as closely as the gist.','सार जतेक ध्यानसँ पढ़ू, श्रेय सेहो ओतबे ध्यानसँ पढ़ू।'],['Edition identification and coverage','संस्करण-पहिचान आ कवरेज'],['SUPPLIED ENGLISH EDITION','उपलब्ध अंग्रेजी संस्करण'],['MAIN CONTRIBUTIONS','मुख्य योगदान'],['Gists of the contributors’ writing, with full references. Each summary reports the argument of its source; it does not replace the article or certify all of its claims.','योगदानकर्तासभक लेखनक सार पूर्ण सन्दर्भसहित। प्रत्येक सार अपन स्रोतक तर्क बतबैत अछि; ई मूल लेखक स्थान नहि लैत आ ओकर सभ दावाक सत्यापन नहि करैत।'],['Edition details ↓','संस्करण-विवरण ↓'],['Search both books →','दुनू पोथीमे खोजू →'],['In the book’s order','पोथीक क्रममे'],['Book reference','पोथी-सन्दर्भ'],['Source note.','स्रोत-टिप्पणी।'],['Related atlas criticism:','सम्बद्ध एटलस-समालोचना:'],['The edition behind these references','ई सन्दर्भ जाहि संस्करणपर आधारित अछि'],['Continue to','आगाँ पढ़ू:'],['More than one way to read a life’s work.','जीवनक काज पढ़बाक एकसँ अधिक बाट अछि।'],['All editorial readings','सभ सम्पादकीय पाठ'],['Source editions & method','स्रोत-संस्करण आ पद्धति'],['Back to top ↑','ऊपर लौटू ↑'],['Prepared from the supplied English editions · 9 September 2026.','उपलब्ध अंग्रेजी संस्करणसभसँ तैयार · 9 सितम्बर 2026।']
];
const disclosureEn='These AI-assisted gists summarize the named contributors’ arguments in the supplied English PDFs. The original authors did not write these summaries; no named human editorial review is recorded. Attribution does not certify every historical claim, priority claim or reported incident. Translation fidelity against the Maithili originals has not been independently checked.';
const disclosureMai='ई AI-सहायित मैथिली सार उपलब्ध अंग्रेजी PDF मे नामित योगदानकर्तासभक तर्क संक्षेप करैत अछि। मूल लेखकसभ ई सार नहि लिखने छथि; कोनो नामित मानवीय सम्पादकीय समीक्षा दर्ज नहि अछि। श्रेय देब प्रत्येक ऐतिहासिक दावा, प्राथमिकता-दावा वा वर्णित घटनाकेँ सत्य प्रमाणित नहि करैत। मैथिली मूलसँ अंग्रेजी अनुवादक निष्ठाक स्वतंत्र मिलान नहि कएल गेल अछि।';
function maithiliPage(html,file){const maiUrl=route(file),enUrl=routeEn(file);html=html.replace('<html lang="en">','<html lang="mai">');
 for(const a of source.articles){const t=mai[key(a)];html=html.replaceAll(e(a.title),e(t.titleMai));html=html.replaceAll(e(a.gist),e(t.gistMai));if(a.note)html=html.replaceAll(e(a.note),e(t.noteMai||a.note));}
 for(const b of source.books){const bm=bookMai[b.id];html=html.replaceAll(e(b.title),e(bm.title));html=html.replaceAll(e(b.subtitle),e(bm.subtitle));html=html.replaceAll(e(b.description),e(bm.description));}
 html=html.replaceAll(e(disclosureEn),e(disclosureMai));for(const [a,b] of common)html=html.replaceAll(a,b);
 html=html.replaceAll('Edited by <strong>','सम्पादक <strong>').replaceAll('English translation: <strong>','अंग्रेजी अनुवाद: <strong>').replaceAll('PDF pages.','PDF पृष्ठ।').replaceAll('Consulted file:','देखल फाइल:').replaceAll('Supplied by the site owner; citations refer to this English edition, not a verified online facsimile.','साइट-स्वामी द्वारा उपलब्ध; सन्दर्भ एहि अंग्रेजी संस्करणक अछि, स्वतंत्र सत्यापित ऑनलाइन प्रतिरूपक नहि।').replaceAll('Page references count PDF pages, including front matter; a shared boundary page may contain the end of one contribution and the start of the next.','पृष्ठ-सन्दर्भ आरम्भिक सामग्री सहित PDF पृष्ठ गनैत अछि; साझा सीमा-पृष्ठपर एक योगदानक अन्त आ दोसरक आरम्भ दुनू रहि सकैत अछि।');
 html=html.replace('<nav aria-label="मुख्य नेविगेशन">',`<nav aria-label="मुख्य नेविगेशन"><a href="${enUrl}" lang="en">English gists</a>`);return addAlternates(html,maiUrl,enUrl);}
for(const file of files){const en=path.join(enDir,file),out=path.join(dir,file);fs.writeFileSync(out,maithiliPage(fs.readFileSync(en,'utf8'),file));}

// Add English paired routes to the sitemap without duplicating them.
const sitemap='public/sitemap.xml';if(fs.existsSync(sitemap)){let xml=fs.readFileSync(sitemap,'utf8');for(const file of files){const url='https://videha-ejournal.github.io'+routeEn(file);if(!xml.includes(`<loc>${url}</loc>`))xml=xml.replace('</urlset>',`  <url><loc>${url}</loc></url>\n</urlset>`);}fs.writeFileSync(sitemap,xml);}
console.log('Completed Contributors’ Perspectives bilingual pair: 63 source-grounded Maithili gists + preserved English edition across 3 paired routes.');
