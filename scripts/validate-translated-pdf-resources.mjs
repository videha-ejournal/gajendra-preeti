import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const ROOT='dist/client/gajendra-preeti';
const report=JSON.parse(fs.readFileSync(path.join(ROOT,'bibliography/pdf-library-manifest.json'),'utf8'));
const data=JSON.parse(fs.readFileSync(path.join(ROOT,'bibliography/bibliography-data.json'),'utf8'));
const exportData=JSON.parse(fs.readFileSync(path.join(ROOT,'bibliography/translated-pdf-resources.json'),'utf8'));
const sha=/^[0-9a-f]{64}$/i;
const requested=[
 'ENGLISH_PARVAT_OOPAR_BHAMRA_JE_SOOTAL.pdf',
 'ENGLISH_PREETI_KARAN_SETU_BANHAL.pdf',
 'ENGLISH_SAHASRABADHANI.pdf',
 'ENGLISH_SAHASRASHIRSHA.pdf',
 'ENGLISH_SETUSHAM.pdf',
 'PREETI_KARAN_SETU_BANHAL.pdf',
 'SETUSHAM.pdf',
 'ENGLISH_MAITHILI_GRAMMAR_GHAZAL_HISTORY.pdf',
 'ENGLISH_MAITHILI_WEB_JOURNALISM.pdf',
 'ENGLISH_JPM_BIOGRAPHY.pdf',
 'ENGLISH_JPM_ECHOES_OF_EXISTENCE.pdf',
 'ENGLISH_JPM_JEEVAN_SANGHARSH.pdf',
 'ENGLISH_JPM_LAHSAN.pdf'
];
assert.equal(report.translatedPdfUniqueFileCount,13,'Thirteen exact translated/reception PDF files must be integrated.');
assert.equal(exportData.uniquePdfCount,13,'Translated PDF export unique count.');
const rows=report.translatedPdfResources||[];
const byPath=new Map(rows.map(x=>[x.pdf.path,x]));
for(const p of requested){const x=byPath.get(p);assert(x,`Translated/reception source mapping: ${p}`);assert(x.pdf.url.startsWith('https://videha-ejournal.github.io/videha-ejournal/'),`Stable source URL: ${p}`);assert(Number(x.pdf.bytes)>0,`Positive bytes: ${p}`);assert(sha.test(x.pdf.sha256||''),`SHA-256: ${p}`);}
for(const p of requested.filter(p=>p.startsWith('ENGLISH_')))assert.equal(byPath.get(p)?.translator,'Gajendra Thakur',`Translator credit: ${p}`);

const samagraTargets=[
 ['पर्वत ऊपर भमरा जे सूतल','ENGLISH_PARVAT_OOPAR_BHAMRA_JE_SOOTAL.pdf'],
 ['सहस्रबाढ़नि','ENGLISH_SAHASRABADHANI.pdf'],
 ['सहस्रशीर्षा','ENGLISH_SAHASRASHIRSHA.pdf'],
 ['मैथिलीक एकटा समानान्तर व्याकरण, रचना आ भाषा विज्ञान (ठेठी, अंगिका आ बज्जिकाकेँ संग लऽ कऽ)','ENGLISH_MAITHILI_GRAMMAR_GHAZAL_HISTORY.pdf']
];
const records=new Map(data.records.map(r=>[r.title,r]));
for(const [title,pdf] of samagraTargets){const r=records.get(title);assert(r,`Samagra target: ${title}`);assert(r.translatedPdfResources?.some(x=>x.pdf.path===pdf&&x.translator==='Gajendra Thakur'),`Exact translated source on ${title}`);for(const prefix of ['','en/']){const file=path.join(ROOT,prefix,'bibliography/works',r.slug,'index.html');const html=fs.readFileSync(file,'utf8');assert(html.includes('id="translated-pdf-resources"'),`Visible translation section: ${file}`);assert(html.includes(pdf),`Exact translation filename: ${file}`);assert(html.includes('Gajendra Thakur'),`Translator visible: ${file}`);assert(html.includes(byPath.get(pdf).pdf.sha256),`Translation fingerprint visible: ${file}`);}}

for(const id of ['preeti-karan','setusham']){const orig=id==='preeti-karan'?'PREETI_KARAN_SETU_BANHAL.pdf':'SETUSHAM.pdf';const trans=id==='preeti-karan'?'ENGLISH_PREETI_KARAN_SETU_BANHAL.pdf':'ENGLISH_SETUSHAM.pdf';for(const prefix of ['','en/']){const file=path.join(ROOT,'criticism/reception',prefix,`${id}.html`);const html=fs.readFileSync(file,'utf8');assert(html.includes('id="verified-repository-editions"'),`Reception provenance section: ${file}`);assert(html.includes(orig),`Reception Maithili source: ${file}`);assert(html.includes(trans),`Reception English translation: ${file}`);assert(html.includes('Gajendra Thakur'),`Reception translator credit: ${file}`);}}

for(const prefix of ['','en/']){const file=path.join(ROOT,prefix,'bibliography/resources/maithili-web-journalism-english/index.html');assert(fs.existsSync(file),`Permanent web-journalism resource page: ${file}`);const html=fs.readFileSync(file,'utf8');assert(html.includes('ENGLISH_MAITHILI_WEB_JOURNALISM.pdf'),`Exact web-journalism PDF: ${file}`);assert(html.includes('Gajendra Thakur'),`Web-journalism translator credit: ${file}`);assert(html.includes(byPath.get('ENGLISH_MAITHILI_WEB_JOURNALISM.pdf').pdf.sha256),`Web-journalism fingerprint: ${file}`);}

const jpm=[
 ['jagdish-prasad-mandal-biography-english','ENGLISH_JPM_BIOGRAPHY.pdf'],
 ['jagdish-prasad-mandal-echoes-of-existence','ENGLISH_JPM_ECHOES_OF_EXISTENCE.pdf'],
 ['jagdish-prasad-mandal-struggles-of-life','ENGLISH_JPM_JEEVAN_SANGHARSH.pdf'],
 ['jagdish-prasad-mandal-lahsan-english','ENGLISH_JPM_LAHSAN.pdf']
];
const bio=byPath.get('ENGLISH_JPM_BIOGRAPHY.pdf');
assert.equal(bio.author,'Gajendra Thakur','Biography author must remain Gajendra Thakur.');
assert.equal(bio.sourceAuthor,'Gajendra Thakur','Biography Maithili source author must remain Gajendra Thakur.');
assert.equal(bio.selfTranslation,true,'Biography must be marked as Gajendra Thakur self-translation.');
assert.equal(bio.originalTitle,'जगदीश प्रसाद मण्डल- एकटा बायोग्राफी','Biography exact Maithili original title.');
assert.equal(bio.isbn,'9789359430430','Biography ISBN.');
for(const p of ['ENGLISH_JPM_ECHOES_OF_EXISTENCE.pdf','ENGLISH_JPM_JEEVAN_SANGHARSH.pdf','ENGLISH_JPM_LAHSAN.pdf']){const x=byPath.get(p);assert.equal(x.author,'Jagdish Prasad Mandal',`${p}: original author must be Jagdish Prasad Mandal`);assert.equal(x.sourceAuthor,'Jagdish Prasad Mandal',`${p}: source author`);assert.equal(x.translator,'Gajendra Thakur',`${p}: English translator`);}
assert.equal(byPath.get('ENGLISH_JPM_ECHOES_OF_EXISTENCE.pdf').sourceCorpus,true,'Echoes must be a selected-story source corpus, not a fabricated single source work.');
assert.equal(byPath.get('ENGLISH_JPM_ECHOES_OF_EXISTENCE.pdf').isbn,'9789334454826','Echoes ISBN.');
assert.equal(byPath.get('ENGLISH_JPM_JEEVAN_SANGHARSH.pdf').originalTitle,'Jeevan-Sangharsh','Struggles source title.');
assert.equal(byPath.get('ENGLISH_JPM_JEEVAN_SANGHARSH.pdf').isbn,'9789357176651','Struggles ISBN.');
for(const [id,pdf] of jpm){for(const prefix of ['','en/']){const file=path.join(ROOT,prefix,'bibliography/resources',id,'index.html');assert(fs.existsSync(file),`JPM permanent page: ${file}`);const html=fs.readFileSync(file,'utf8');assert(html.includes('id="scholarly-relation"'),`JPM scholarly relation visible: ${file}`);assert(html.includes(pdf),`JPM exact PDF visible: ${file}`);assert(html.includes(byPath.get(pdf).pdf.sha256),`JPM SHA-256 visible: ${file}`);assert(html.includes('Gajendra Thakur'),`JPM translator visible: ${file}`);assert(html.includes('application/ld+json'),`JPM JSON-LD: ${file}`);assert(html.includes('source PDF')||html.includes('स्रोत-PDF'),`JPM missing-source-PDF disclosure: ${file}`);}}
for(const prefix of ['','en/']){const file=path.join(ROOT,prefix,'bibliography/resources/jagdish-prasad-mandal-translations/index.html');assert(fs.existsSync(file),`JPM collection page: ${file}`);const html=fs.readFileSync(file,'utf8');for(const [id] of jpm)assert(html.includes(`/bibliography/resources/${id}/`),`JPM collection link ${id}: ${file}`);assert(html.includes('Gajendra Thakur'),`JPM collection translator: ${file}`);assert(html.includes('Jagdish Prasad Mandal')||html.includes('जगदीश प्रसाद मण्डल'),`JPM collection author/subject: ${file}`);}

for(const p of requested)assert(!(report.unmatchedCatalogPaths||[]).includes(p),`Requested PDF must not remain unclassified: ${p}`);
console.log('Translated PDF integration PASS: 13 exact PDFs, including four Jagdish Prasad Mandal corpus resources with biography self-authorship/self-translation and three Mandal-authored Maithili-to-English translations correctly separated.');
