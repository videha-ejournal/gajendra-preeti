import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const ROOT='dist/client/gajendra-preeti';
const report=JSON.parse(fs.readFileSync(path.join(ROOT,'bibliography/pdf-library-manifest.json'),'utf8'));
const data=JSON.parse(fs.readFileSync(path.join(ROOT,'bibliography/bibliography-data.json'),'utf8'));
const rows=report.translatedPdfResources||[];
const byPath=new Map(rows.map(x=>[x.pdf?.path,x]));

assert.equal(report.translatedPdfUniqueFileCount,17,'Seventeen exact translated/reception PDFs after three Maithili source PDFs are verified.');
assert.equal(report.criticismPdfResourceCount,1,'One separately classified multi-author criticism PDF.');
assert.equal(report.supplementalPdfResourceCount,5,'Only five eLearning PDFs remain supplemental.');
assert.equal(report.unclassifiedCatalogCount,0,'No PDF remains unclassified.');
assert.deepEqual(report.unmatchedCatalogPaths,[],'No unmatched catalogue paths.');

for(const p of ['ENGLISH_MAITHILI_GRAMMAR_GHAZAL_HISTORY.pdf','ENGLISH_MAITHILI_WEB_JOURNALISM.pdf']){
  const row=byPath.get(p);assert(row,`${p}: translated row`);assert.equal(row.sourceAuthor,'Ashish Anchinhar',`${p}: original Maithili author`);assert.equal(row.author,'Ashish Anchinhar',`${p}: English manifestation author`);assert.equal(row.translator,'Gajendra Thakur',`${p}: English translator`);
}
const maulail=byPath.get('ENGLISH_MAULAIL_GACHHAK_PHOOL.pdf');
assert(maulail,'Maulail translated row');
assert.equal(maulail.sourceAuthor,'Jagdish Prasad Mandal','Maulail source author');
assert.equal(maulail.author,'Jagdish Prasad Mandal','Maulail English manifestation author');
assert.equal(maulail.translator,'Gajendra Thakur','Maulail translator');

const sourceChecks=[
 ['MAITHILI_GAZALAK_VYAKARAN_O_ITIHAAS.pdf','ENGLISH_MAITHILI_GRAMMAR_GHAZAL_HISTORY.pdf','Ashish Anchinhar'],
 ['MAITHILI_WEB_JOURNALISM.pdf','ENGLISH_MAITHILI_WEB_JOURNALISM.pdf','Ashish Anchinhar'],
 ['MAULAIL_GACHHAK_PHOOL.pdf','ENGLISH_MAULAIL_GACHHAK_PHOOL.pdf','Jagdish Prasad Mandal']
];
for(const [source,translation,author] of sourceChecks){const row=byPath.get(source);assert(row,`${source}: verified source row`);assert.equal(row.author,author,`${source}: source author`);assert.equal(row.translatedAs,translation,`${source}: translatedAs`);assert(/^[0-9a-f]{64}$/i.test(row.pdf.sha256||''),`${source}: source SHA-256`);}

const ownGrammar=data.records.find(r=>r.title==='मैथिलीक एकटा समानान्तर व्याकरण, रचना आ भाषा विज्ञान (ठेठी, अंगिका आ बज्जिकाकेँ संग लऽ कऽ)');
assert(ownGrammar,'Gajendra Thakur Samagra grammar record must still exist.');
assert(!(ownGrammar.translatedPdfResources||[]).some(x=>x.pdf?.path==='ENGLISH_MAITHILI_GRAMMAR_GHAZAL_HISTORY.pdf'),'Ashish Anchinhar translation must not be attached to Gajendra Thakur Samagra grammar record.');

const corrected=[
 ['maithili-grammar-ghazal-history-english','ENGLISH_MAITHILI_GRAMMAR_GHAZAL_HISTORY.pdf','MAITHILI_GAZALAK_VYAKARAN_O_ITIHAAS.pdf','Ashish Anchinhar'],
 ['maithili-web-journalism-english','ENGLISH_MAITHILI_WEB_JOURNALISM.pdf','MAITHILI_WEB_JOURNALISM.pdf','Ashish Anchinhar'],
 ['maulail-gachhak-phool-english','ENGLISH_MAULAIL_GACHHAK_PHOOL.pdf','MAULAIL_GACHHAK_PHOOL.pdf','Jagdish Prasad Mandal']
];
for(const [id,pdf,sourcePdf,author] of corrected)for(const prefix of ['','en/']){
  const file=path.join(ROOT,prefix,'bibliography/resources',id,'index.html');assert(fs.existsSync(file),`Corrected resource page: ${file}`);const html=fs.readFileSync(file,'utf8');assert(html.includes(pdf),`${pdf} visible`);assert(html.includes(sourcePdf),`${sourcePdf} visible`);assert(html.includes(author),`${author} visible`);assert(html.includes('Gajendra Thakur'),`Gajendra Thakur translator visible: ${file}`);assert(html.includes('id="scholarly-relation"'),`Scholarly relation section: ${file}`);assert(html.includes('application/ld+json'),`JSON-LD: ${file}`);assert(html.includes(byPath.get(sourcePdf).pdf.sha256),`Source fingerprint visible: ${file}`);assert(html.includes(byPath.get(pdf).pdf.sha256),`Translation fingerprint visible: ${file}`);
}

for(const id of ['preeti-karan','setusham'])for(const prefix of ['','en/']){
  const file=path.join(ROOT,'criticism/reception',prefix,`${id}.html`);const html=fs.readFileSync(file,'utf8');assert(html.includes('data-source-editor="Ashish Anchinhar"'),`Ashish Anchinhar source editor visible: ${file}`);assert(html.includes('<meta name="editor" content="Ashish Anchinhar">'),`Editor metadata: ${file}`);assert(html.includes('Ashish Anchinhar'),`Editor name: ${file}`);
}

assert.equal(report.criticismPdfResources?.[0]?.path,'GT_PT_Criticism.pdf','Exact criticism PDF classification.');
assert.deepEqual(report.criticismPdfResources?.[0]?.about,['Gajendra Thakur','Preeti Thakur'],'Criticism subjects.');
for(const prefix of ['','en/']){
  const file=path.join(ROOT,prefix,'bibliography/resources/gajendra-preeti-criticism-collection/index.html');assert(fs.existsSync(file),`Criticism collection page: ${file}`);const html=fs.readFileSync(file,'utf8');assert(html.includes('GT_PT_Criticism.pdf'),'Exact criticism PDF visible');assert(html.includes('Gajendra Thakur')&&html.includes('Preeti Thakur'),'Both criticism subjects visible');assert(html.includes('different writers')||html.includes('विभिन्न लेखक'),'Multi-author attribution visible');
}

const supplements=new Map((report.supplementalPdfResources||[]).map(x=>[x.path,x]));
for(const [source] of sourceChecks)assert(!supplements.has(source),`${source} must not remain supplemental.`);
assert(!supplements.has('ENGLISH_MAULAIL_GACHHAK_PHOOL.pdf'),'Maulail must not remain supplemental.');
assert(!supplements.has('GT_PT_Criticism.pdf'),'GT/PT criticism must not remain supplemental.');
assert.equal(report.editorAttributionCorrections.sourceAuthors['ENGLISH_MAITHILI_WEB_JOURNALISM.pdf'],'Ashish Anchinhar');
assert.equal(report.editorAttributionCorrections.sourceEditors['SETUSHAM.pdf'],'Ashish Anchinhar');

console.log('Editor attribution validation PASS: exact Maithili source PDFs, Ashish Anchinhar author/editor roles, Jagdish Prasad Mandal Maulail authorship, Gajendra Thakur translation credit, and multi-author GT/PT criticism are all preserved.');
