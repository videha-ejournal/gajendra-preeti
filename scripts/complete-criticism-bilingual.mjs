import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const base='/gajendra-preeti';
const dir='public/criticism';
const manifest=JSON.parse(fs.readFileSync(`${dir}/manifest.json`,'utf8'));
const translations=[
 ...JSON.parse(fs.readFileSync('content/criticism-mai-g01-g20.json','utf8')),
 ...JSON.parse(fs.readFileSync('content/criticism-mai-g21-g42.json','utf8')),
 ...JSON.parse(fs.readFileSync('content/criticism-mai-preeti.json','utf8'))
];
assert.equal(manifest.length,59,'Expected 59 criticism records');
assert.equal(translations.length,59,'Expected 59 Maithili criticism translations');
assert.equal(new Set(translations.map(x=>x.id)).size,59,'Duplicate Maithili criticism IDs');
assert.deepEqual(new Set(translations.map(x=>x.id)),new Set(manifest.map(x=>x.id)),'Maithili criticism IDs must exactly match manifest');
const maiById=Object.fromEntries(translations.map(x=>[x.id,x]));
for(const x of translations){assert(x.lensMai?.trim());assert.equal(x.paragraphsMai?.length,2);assert(x.paragraphsMai.every(p=>p.trim().length>100));assert(x.questionMai?.trim());}

const catalogue=JSON.parse(fs.readFileSync('content/catalogue-snapshot.json','utf8').replace(/^\uFEFF/,''));
const sourceById=Object.fromEntries(catalogue.map(x=>[x.id,x]));
const e=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const enDir=path.join(dir,'en');
fs.rmSync(enDir,{recursive:true,force:true});fs.mkdirSync(enDir,{recursive:true});

const ids=manifest.map(x=>x.id);
const pages=['index.html',...ids.map(id=>`${id}.html`)];
for(const file of pages)fs.copyFileSync(path.join(dir,file),path.join(enDir,file));

function alternates(html,maiUrl,enUrl){
 const tags=`<link rel="alternate" hreflang="mai" href="https://videha-ejournal.github.io${maiUrl}"><link rel="alternate" hreflang="en" href="https://videha-ejournal.github.io${enUrl}"><link rel="alternate" hreflang="x-default" href="https://videha-ejournal.github.io${maiUrl}">`;
 return html.replace('<meta name="theme-color"',tags+'<meta name="theme-color"');
}
function patchEnglish(html,file){
 const leaf=file==='index.html'?'':file;
 const maiUrl=`${base}/criticism/${leaf}`;
 const enUrl=`${base}/criticism/en/${leaf}`;
 html=html.replaceAll(`https://videha-ejournal.github.io${maiUrl}`,`https://videha-ejournal.github.io${enUrl}`);
 for(const id of ids)html=html.replaceAll(`${base}/criticism/${id}.html`,`${base}/criticism/en/${id}.html`);
 html=html.replaceAll(`${base}/criticism/#`,`${base}/criticism/en/#`);
 html=html.replace('<nav aria-label="Main navigation">',`<nav aria-label="Main navigation"><a href="${maiUrl}" lang="mai">मैथिली समालोचना</a>`);
 html=alternates(html,maiUrl,enUrl);
 return html;
}
for(const file of pages){const p=path.join(enDir,file);fs.writeFileSync(p,patchEnglish(fs.readFileSync(p,'utf8'),file));}

const replacements=new Map([
 ['<html lang="en">','<html lang="mai">'],
 ['Skip to main content','मुख्य सामग्रीपर जाउ'],['English home','English home'],['Reading room','पाठ-कक्ष'],['Main navigation','मुख्य नेविगेशन'],
 ['THE READING ROOM / ENGLISH CRITICISM','पाठ-कक्ष / मैथिली समालोचना'],['Sources checked: 8 September 2026','स्रोत-जाँच: 8 सितम्बर 2026'],
 ['Read.<br><em>Question.</em><br>Return.','पढ़ू।<br><em>प्रश्न करू।</em><br>फेर लौटू।'],['ways into the work.','रचनाक भीतर प्रवेशक बाट।'],['Interpretation, evidence and questions worth carrying back to the page.','व्याख्या, प्रमाण आ एहन प्रश्न जे पाठक फेर मूल पन्नापर लऽ जा सकैत छथि।'],
 ['HOW TO READ THIS LIBRARY','ई पाठ-कक्ष कोना पढ़ी'],['A reading, with its evidence in view.','पाठ, प्रमाणकेँ दृष्टिमे रखैत।'],['Critical readings','समालोचनात्मक पाठ'],['Find a reading','पाठ खोजू'],['Title, theme, author…','शीर्षक, विषय, लेखक…'],['Collection','संग्रह'],['Both writers','दुनू रचनाकार'],['Gajendra / Main Samagra','गजेन्द्र / मुख्य समग्र'],['Reading basis','पाठक आधार'],['All sources','सभ स्रोत'],['Direct text / visual reading','प्रत्यक्ष पाठ / दृश्य-पाठ'],['Publisher / catalogue introduction','प्रकाशक / सूची-आधारित परिचय'],['Digital companion','डिजिटल अध्ययन-सहचर'],['Reset','फेरसँ आरम्भ'],['entries','प्रविष्टि'],['No matching readings. Try another title or reset the filters.','मेल खाइत पाठ नहि भेटल। आन शीर्षक खोजू वा छनौट फेरसँ आरम्भ करू।'],
 ['Picture stories, translations and the work of preservation.','चित्रकथा, अनुवाद आ संरक्षणक काज।'],['Every entry in “00 मुख्य समग्र”, including collected editions and three digital companions.','“00 मुख्य समग्र”क प्रत्येक प्रविष्टि—संकलित संस्करण आ तीन डिजिटल अध्ययन-सहचर सहित।'],
 ['ENGLISH CRITICISM','मैथिली समालोचना'],['ON THIS PAGE','एहि पन्नापर'],['The critical reading','समालोचनात्मक पाठ'],['A question to carry','संग लऽ जाएबला प्रश्न'],['Evidence & source','प्रमाण आ स्रोत'],['Text size','अक्षर आकार'],['Open the source ↗','मूल स्रोत खोलू ↗'],['Corresponding selected-work entry','सम्बद्ध रचना-प्रविष्टि'],['Homepage reading feature','मुख्य पृष्ठक पाठ-प्रवेश'],['Homepage criticism collection','मुख्य पृष्ठक समालोचना-संग्रह'],['मैथिली मुख्य पृष्ठ →','मैथिली मुख्य पृष्ठ →'],
 ['A QUESTION TO CARRY BACK','फेर मूल पाठक दिस लऽ जाएबला प्रश्न'],['THE BASIS OF THIS ASSESSMENT','एहि अध्ययनक आधार'],['Examples consulted · PDF pages','देखल उदाहरण · PDF पृष्ठ'],['Page numbers include front matter; viewer numbering may differ.','पृष्ठ-संख्या आरम्भिक सामग्री सहित अछि; viewer क क्रम भिन्न भऽ सकैत अछि।'],['Read the source edition','मूल संस्करण पढ़ू'],['Catalogue context:','सूची-सन्दर्भ:'],['Consulted 8 September 2026.','देखल गेल: 8 सितम्बर 2026।'],['Full method and coverage','सम्पूर्ण पद्धति आ कवरेज'],['CONTINUE THE CONVERSATION','आगाँ पढ़ू'],['Read alongside','संग-संग पढ़ू'],['FROM THE EDITED VOLUMES','सम्पादित पोथीसभसँ'],['Contributors’ perspectives','योगदानकर्तासभक दृष्टि'],['Summaries of signed contributions; related editions and projects are distinguished on the source pages.','हस्ताक्षरित योगदानक सार; सम्बद्ध संस्करण आ परियोजना स्रोत-पन्नापर अलग चिन्हित अछि।'],['← PREVIOUS','← पछिला'],['NEXT →','अगिला →'],['Return to all readings →','सभ पाठक दिस लौटू →'],
 ['Literature invites another reading.','साहित्य फेर पढ़बाक निमन्त्रण दैत अछि।'],['The literary atlas ↗','साहित्यिक एटलस ↗'],['Sources & method','स्रोत आ पद्धति'],['Back to top ↑','ऊपर लौटू ↑'],['Site updated: 9 September 2026','साइट अद्यतन: 9 सितम्बर 2026'],['GitHub repository ↗','GitHub repository ↗'],['English editorial notes prepared with AI assistance for this atlas · 8 September 2026.','एहि एटलस लेल मैथिली समालोचनात्मक पाठ AI-सहायतासँ तैयार कएल गेल · 10 सितम्बर 2026।'],['Source and automated checks were performed during preparation. Review status: no named human editorial review is recorded. These notes are not signed by the featured writers.','तैयारीमे स्रोत-जाँच आ स्वचालित जाँच कएल गेल। समीक्षा-स्थिति: कोनो नामित मानवीय सम्पादकीय समीक्षा दर्ज नहि अछि। ई टिप्पणीक लेखक विशेष रूपसँ प्रस्तुत रचनाकार नहि छथि।'],
 ['Selected-passage criticism','चुनल अंश-आधारित समालोचना'],['Selected-page visual criticism','चुनल पृष्ठक दृश्य-समालोचना'],['Whole short-book visual reading','सम्पूर्ण लघु चित्र-पोथीक दृश्य-पाठ'],['Publisher-based critical introduction','प्रकाशक-आधारित समालोचनात्मक परिचय'],['Catalogue-based critical introduction','सूची-आधारित समालोचनात्मक परिचय'],['Digital companion assessment','डिजिटल अध्ययन-सहचरक मूल्यांकन'],
 ['Based on selected passages from the linked edition, not a complete reading. Page references below count PDF pages, including front matter. Translation fidelity has not been independently verified.','जोड़ल संस्करणक चुनल अंशपर आधारित; ई सम्पूर्ण पोथीक पाठ नहि अछि। नीचाँ देल पृष्ठ-सन्दर्भ आरम्भिक सामग्री सहित PDF पृष्ठ गनैत अछि। अनुवाद-निष्ठाक स्वतंत्र सत्यापन नहि कएल गेल अछि।'],['Based on visual inspection of the listed pages, not a complete reading. Page references count PDF pages, including front matter.','सूचीबद्ध पृष्ठसभक दृश्य निरीक्षणपर आधारित; ई सम्पूर्ण पाठ नहि अछि। पृष्ठ-सन्दर्भ आरम्भिक सामग्री सहित PDF पृष्ठ गनैत अछि।'],['The complete short picture-book sequence was visually inspected. The listed PDF pages identify the main examples discussed. This is interpretation, not a classroom study.','सम्पूर्ण लघु चित्र-पोथी क्रमक दृश्य निरीक्षण कएल गेल। सूचीबद्ध PDF पृष्ठ मुख्य चर्चित उदाहरण चिन्हित करैत अछि। ई व्याख्या अछि, कक्षा-अध्ययन नहि।'],['Based on the publisher’s public description or contents and the Samagra listing. The complete book or series was not read. This introduction identifies critical questions; it does not claim a full-text review.','प्रकाशकक सार्वजनिक विवरण वा विषय-सूची आ समग्र-सूचीपर आधारित। सम्पूर्ण पोथी वा शृंखला नहि पढ़ल गेल। ई परिचय समालोचनात्मक प्रश्न चिन्हित करैत अछि; सम्पूर्ण-पाठ समीक्षा होएबाक दावा नहि करैत।'],['Based on the public Videha catalogue and its resource links. The complete source was not examined. This is a critical introduction to the listed resource, not a full-text review.','विदेहक सार्वजनिक सूची आ ओकर संसाधन-लिंकपर आधारित। सम्पूर्ण स्रोत नहि जाँचल गेल। ई सूचीबद्ध संसाधनक समालोचनात्मक परिचय अछि, सम्पूर्ण-पाठ समीक्षा नहि।'],['Based on the published page’s text, controls and resource structure. The underlying course was not read in full; playback and assistive-technology behaviour were not tested.','प्रकाशित पन्नाक पाठ, नियंत्रण आ संसाधन-संरचनापर आधारित। मूल पाठ्यक्रम सम्पूर्ण नहि पढ़ल गेल; playback आ सहायक-तकनीक व्यवहारक परीक्षण नहि कएल गेल।']
]);
const kindMai={"Picture stories":"चित्रकथा","Folklore & picture narrative":"लोक-संस्कृति आ चित्र-आख्यान","Archive & preservation":"अभिलेख आ संरक्षण","Children's translation":"बाल-अनुवाद","Children's translation & counting":"बाल-अनुवाद आ गणना","Children's translation & alphabet":"बाल-अनुवाद आ वर्णमाला","Children's translation & anthology":"बाल-अनुवाद आ संकलन","Adaptation & picture narrative":"रूपान्तर आ चित्र-आख्यान","Language & reference":"भाषा आ सन्दर्भ","Criticism":"समालोचना","Translation":"अनुवाद","Philosophy & translation":"दर्शन आ अनुवाद","Translation & anthology":"अनुवाद आ संकलन","Criticism & river writing":"समालोचना आ नदी-लेखन","Drama & translation":"नाटक आ अनुवाद","Fiction":"कथा-साहित्य","Novel":"उपन्यास","Adaptation":"रूपान्तर","Collected fiction":"संकलित कथा-साहित्य","Teaching & interpretation":"शिक्षण आ व्याख्या","Digital companion":"डिजिटल अध्ययन-सहचर","Media & learning":"मीडिया आ अध्ययन","Drama & learning":"नाटक आ अध्ययन","Criticism & archive":"समालोचना आ अभिलेख","Learning & archive":"अध्ययन आ अभिलेख","Research & archive":"शोध आ अभिलेख","Philosophy":"दर्शन","History":"इतिहास","Edited anthology":"सम्पादित संकलन","Translation anthology":"अनुवाद-संकलन","Novel & author translation":"उपन्यास आ लेखकक अनुवाद","Literature":"साहित्य","Collected fiction & translation":"संकलित कथा आ अनुवाद","Social & economic history":"सामाजिक-आर्थिक इतिहास","Literary history":"साहित्यिक इतिहास","Genealogy & research":"वंशावली आ शोध"};
function toMai(html,file){
 const leaf=file==='index.html'?'':file;
 const maiUrl=`${base}/criticism/${leaf}`,enUrl=`${base}/criticism/en/${leaf}`;
 html=html.replace('<html lang="en">','<html lang="mai">');
 for(const b of manifest){
  const t=maiById[b.id],src=sourceById[b.id];
  if(src?.title)html=html.replaceAll(e(b.titleEn),e(src.title));
  html=html.replaceAll(e(t.id===b.id?b.titleEn:''),e(src?.title||b.titleEn));
  const reading=fs.readFileSync('content/readings.txt','utf8');
 }
 // Replace source English criticism text with its paired Maithili text.
 const blocks=fs.readFileSync('content/readings.txt','utf8').trim().split(/\r?\n\s*\r?\n/);
 for(const block of blocks){const lines=block.split(/\r?\n/);const [id,titleEn,kind]=lines[0].split('|');const t=maiById[id],src=sourceById[id];if(!t)continue;
   html=html.replaceAll(e(titleEn),e(src?.title||titleEn));
   html=html.replaceAll(e(lines[1]),e(t.lensMai));
   html=html.replaceAll(e(lines[2]),e(t.paragraphsMai[0]));
   html=html.replaceAll(e(lines[3]),e(t.paragraphsMai[1]));
   html=html.replaceAll(e(lines[4]),e(t.questionMai));
   if(src?.title)html=html.replaceAll(`<p class="original" lang="mai">${e(src.title)}</p>`,`<p class="original" lang="en">${e(titleEn)}</p>`);
   if(kindMai[kind])html=html.replaceAll(e(kind),e(kindMai[kind]));
 }
 for(const [a,b] of replacements)html=html.replaceAll(a,b);
 html=html.replace(`<nav aria-label="मुख्य नेविगेशन">`,`<nav aria-label="मुख्य नेविगेशन"><a href="${enUrl}" lang="en">English criticism</a>`);
 html=html.replaceAll(`${base}/en/#criticism`,`${base}/#criticism`);
 html=alternates(html,maiUrl,enUrl);
 return html;
}
for(const file of pages){const p=path.join(dir,file);fs.writeFileSync(p,toMai(fs.readFileSync(p,'utf8'),file));}

// English manifest is canonical for machine-readable metadata; add explicit paired route fields.
const pairedManifest=manifest.map(x=>({...x,url:`${base}/criticism/${x.id}.html`,urlEn:`${base}/criticism/en/${x.id}.html`,languagePair:['mai','en']}));
fs.writeFileSync(`${dir}/manifest.json`,JSON.stringify(pairedManifest,null,2)+'\n');

// Extend the sitemap without duplicating entries; later build steps may append other guide routes.
const sitemap='public/sitemap.xml';
if(fs.existsSync(sitemap)){
 let xml=fs.readFileSync(sitemap,'utf8');
 const urls=[`${base}/criticism/en/`,...ids.map(id=>`${base}/criticism/en/${id}.html`)].map(p=>'https://videha-ejournal.github.io'+p);
 for(const url of urls)if(!xml.includes(`<loc>${url}</loc>`))xml=xml.replace('</urlset>',`  <url><loc>${url}</loc></url>\n</urlset>`);
 fs.writeFileSync(sitemap,xml);
}
console.log('Completed bilingual Reading Room: 59 Maithili + 59 English criticism pages with paired metadata.');
