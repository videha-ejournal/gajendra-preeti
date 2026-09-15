import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const ROOT='dist/client/gajendra-preeti';
const manifestPath=path.join(ROOT,'bibliography/pdf-library-manifest.json');
const dataPath=path.join(ROOT,'bibliography/bibliography-data.json');
assert(fs.existsSync(manifestPath),'PDF provenance manifest must be exported.');
assert(fs.existsSync(dataPath),'Scholarly bibliography data must be exported.');
const report=JSON.parse(fs.readFileSync(manifestPath,'utf8'));
const data=JSON.parse(fs.readFileSync(dataPath,'utf8'));

assert.equal(report.schemaVersion,1,'PDF reconciliation schema version');
assert(report.catalogSchemaVersion>=3,'PDF catalogue must provide provenance schema v3 or newer.');
assert(report.catalogCount>=61,`Expected at least the 61 PDFs already catalogued; saw ${report.catalogCount}.`);
assert.equal(report.samagraRecordCount,data.records.length,'Reconciliation must cover every synchronized Samagra record.');
assert(report.matchedRecordCount>=44,`Expected substantial Samagra PDF coverage; saw only ${report.matchedRecordCount} records.`);
assert(report.matchedPdfCount>=report.matchedRecordCount,'Matched PDF count cannot be lower than matched record count.');
assert(report.matchedPdfCount<=report.catalogCount,'Matched PDF count cannot exceed the repository catalogue.');
assert.deepEqual(report.pendingAliasPaths,[],'Every explicit scholarly PDF alias must resolve to a real catalogued PDF.');
assert(Array.isArray(report.missingReferencedPaths),'Missing direct Samagra PDF paths must be reported rather than hidden.');
assert(Array.isArray(report.unmatchedCatalogPaths),'Unmatched repository PDFs must remain explicitly visible.');

const sha=/^[0-9a-f]{64}$/i;
const base='https://videha-ejournal.github.io/videha-ejournal/';
const byId=new Map(data.records.map(r=>[r.id,r]));
const byTitle=new Map(data.records.map(r=>[r.title,r]));
let counted=0;
for(const mapped of report.records){
  const record=byId.get(mapped.id);
  assert(record,`Mapped PDF record must exist in bibliography-data: ${mapped.id}`);
  assert(Array.isArray(mapped.pdfs)&&mapped.pdfs.length>0,`Mapped record needs PDF entries: ${mapped.title}`);
  assert.equal(record.pdfLibraryCount,mapped.pdfs.length,`PDF count mismatch: ${mapped.title}`);
  for(const pdf of mapped.pdfs){
    counted++;
    assert(String(pdf.path||'').toLowerCase().endsWith('.pdf'),`PDF path: ${mapped.title}`);
    assert(String(pdf.url||'').startsWith(base),`Stable Pages PDF URL: ${mapped.title}`);
    assert(Number(pdf.bytes)>0,`Positive byte size: ${pdf.path}`);
    assert(sha.test(String(pdf.sha256||'')),`SHA-256 fingerprint: ${pdf.path}`);
    assert.equal(pdf.mediaType,'application/pdf',`PDF media type: ${pdf.path}`);
    const link=record.links.find(x=>x.url===pdf.url);
    assert(link?.verifiedPdfRepository===true,`Bibliographic manifestation must mark verified repository PDF: ${pdf.path}`);
    assert.equal(link.sha256,pdf.sha256,`Manifestation fingerprint: ${pdf.path}`);
  }
  for(const langPrefix of ['', 'en/']){
    const file=path.join(ROOT,langPrefix,'bibliography/works',mapped.slug,'index.html');
    assert(fs.existsSync(file),`Bilingual scholarly work page: ${mapped.slug}`);
    const html=fs.readFileSync(file,'utf8');
    assert(html.includes('id="pdf-library"'),`Visible PDF provenance section: ${file}`);
    assert(html.includes(`name="citation_pdf_url" content="${mapped.pdfs[0].url}"`),`Preferred citation PDF metadata: ${file}`);
    assert(html.includes(mapped.pdfs[0].sha256),`Visible PDF fingerprint: ${file}`);
    const ld=html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
    assert(ld,`JSON-LD: ${file}`);
    const graph=JSON.parse(ld[1])['@graph']||[];
    const work=graph.find(x=>x['@type']==='Book'||x['@type']==='CreativeWork');
    assert(Array.isArray(work?.encoding)&&work.encoding.length===mapped.pdfs.length,`Schema MediaObject encodings: ${file}`);
  }
}
assert.equal(counted,report.records.reduce((n,r)=>n+r.pdfs.length,0),'Manifest PDF count self-consistency.');
assert.equal(new Set(report.records.flatMap(r=>r.pdfs.map(p=>p.path))).size,report.matchedPdfCount,'Matched PDF paths must be unique at collection level.');

const requirements=[
  ['Decoding the Panji of Mithila',6],
  ['HISTORY OF MITHILA, VAJJI & ANGA IN INDIA & NEPAL: FROM PREHISTORY TO THE CONTEMPORARY PERIOD [A PARALLEL HISTORY OF MITHILA & MAITHILI LITERATURE] VOLUME I',1],
  ['HISTORY OF MITHILA, VAJJI & ANGA: SOCIO-CULTURAL-ECONOMIC HISTORY OF MITHILA, VAJJI & ANGA IN INDIA & NEPAL FROM PREHISTORY TO THE CONTEMPORARY PERIOD [A PARALLEL HISTORY OF MITHILA & MAITHILI LITERATURE] VOLUME II',1],
  ["GAJENDRA THAKUR'S PARALLEL PHILOSOPHY VOLUME II",1],
  ['A Parallel History of Mithila & Maithili Literature',1],
  ['स्वप्नमे मिज्झर होइत',1],
  ['WHEN DREAMS MERGE',1],
  ['विदेह शोध-लेख (अंक १ सँ ४४७ धरि)',1],
  ['३७ टा मैथिली बाल उपन्यास — गजेन्द्र ठाकुर',1],
  ['37 MAITHILI CHILDREN NOVELS IN ENGLISH TRANSLATION',1],
  ['GADYA PADYA BHARTI 1 — विभिन्न भाषासँ अनूदित गद्य आ पद्य रचना (खण्ड-१)',1],
  ['GADYA PADYA BHARTI 2 — विभिन्न भाषासँ अनूदित गद्य आ पद्य रचना (खण्ड-२)',1],
  ['गोहि सभक बीच जलसमाधि (मैथिलीक आइ धरिक सभसँ पैघ उपन्यास)',1],
  ['गोहि सभक बीच जलसमाधि (मैथिलीक आइ धरिक सभसँ पैघ उपन्यास) [किशोर संस्करण]',1],
  ['गोहि सभक बीच जलसमाधि (मैथिलीक आइ धरिक सभसँ पैघ उपन्यास) [बाल संस्करण]',1],
  ['WATER-BURIAL AMONG THE CROCODILES [ENGLISH TRANSLATION BY THE AUTHOR GAJENDRA THAKUR HIMSELF]',1],
  ['Water-Burial Among the Crocodiles [English Teaching Companion]',1],
  ['Gohi Sabhak Beech Jalsamadhi Teaching Course PDF',1]
];
for(const [title,min] of requirements){
  const row=report.records.find(r=>r.title===title);
  assert(row,`Required scholarly PDF mapping: ${title}`);
  assert(row.pdfs.length>=min,`Expected at least ${min} PDF manifestation(s): ${title}`);
}
function requireExactPdf(title,pdfPath){
  const row=report.records.find(r=>r.title===title);
  assert(row?.pdfs.some(p=>p.path===pdfPath),`Expected ${pdfPath} on ${title}`);
}
function relation(recordTitle,relationType,targetTitle){
  const record=byTitle.get(recordTitle);
  assert(record,`Relation source record: ${recordTitle}`);
  const rel=(record.scholarlyRelations||[]).find(x=>x.relationType===relationType&&x.relatedTitle===targetTitle);
  assert(rel,`Expected ${relationType}: ${recordTitle} -> ${targetTitle}`);
  assert.equal(rel.relatedId,byTitle.get(targetTitle)?.id,`Relation target id: ${recordTitle} -> ${targetTitle}`);
  return rel;
}
function schemaHasTarget(work,property,targetUrl){
  const values=Array.isArray(work?.[property])?work[property]:work?.[property]?[work[property]]:[];
  return values.some(x=>x?.url===targetUrl);
}

const childrenMai='३७ टा मैथिली बाल उपन्यास — गजेन्द्र ठाकुर';
const childrenEn='37 MAITHILI CHILDREN NOVELS IN ENGLISH TRANSLATION';
requireExactPdf(childrenMai,'GAJENDRA_THAKUR_SAMAGRA_37_MAITHILI_CHILDREN_NOVELS.pdf');
requireExactPdf(childrenEn,'37_CHILDREN_NOVELS.pdf');
assert.deepEqual(byTitle.get(childrenMai)?.languages,['mai'],'Maithili children original must be tagged mai.');
assert.deepEqual(byTitle.get(childrenEn)?.languages,['en'],'English children translation must be tagged en.');
relation(childrenMai,'workTranslation',childrenEn);
const childrenTranslation=relation(childrenEn,'translationOfWork',childrenMai);
assert.equal(childrenTranslation.translationDirection,'Maithili → English','Children translation direction.');
assert.equal(childrenTranslation.translator,'Gajendra Thakur','Children translation credit.');

const gohi='गोहि सभक बीच जलसमाधि (मैथिलीक आइ धरिक सभसँ पैघ उपन्यास)';
const kishor=`${gohi} [किशोर संस्करण]`;
const bal=`${gohi} [बाल संस्करण]`;
const water='WATER-BURIAL AMONG THE CROCODILES [ENGLISH TRANSLATION BY THE AUTHOR GAJENDRA THAKUR HIMSELF]';
const waterTeaching='Water-Burial Among the Crocodiles [English Teaching Companion]';
const gohiTeaching='Gohi Sabhak Beech Jalsamadhi Teaching Course PDF';
requireExactPdf(gohi,'Gohi_Sabhak_Beech_Jalsamadhi.pdf');
requireExactPdf(kishor,'Gohi_Jalsamadhi_Kishor_Sanskaran.pdf');
requireExactPdf(bal,'Gohi_Jalsamadhi_Bal_Sanskaran.pdf');
requireExactPdf(water,'Water_Burial_Among_the_Crocodiles.pdf');
requireExactPdf(waterTeaching,'Videha_Teaching_Gohi_Jalsamadhi.pdf');
requireExactPdf(gohiTeaching,'Gohi_Jalsamadhi_Teaching_merge.pdf');
requireExactPdf('GADYA PADYA BHARTI 1 — विभिन्न भाषासँ अनूदित गद्य आ पद्य रचना (खण्ड-१)','GADYA_PADYA_BHARTI_1.pdf');
requireExactPdf('GADYA PADYA BHARTI 2 — विभिन्न भाषासँ अनूदित गद्य आ पद्य रचना (खण्ड-२)','GAJENDRA_THAKUR_SAMAGRA_ANUVAD_KHAND.pdf');
assert.deepEqual(byTitle.get(gohi)?.languages,['mai'],'Gohi parent novel must be tagged mai.');
assert.deepEqual(byTitle.get(kishor)?.languages,['mai'],'Kishor edition must be tagged mai.');
assert.deepEqual(byTitle.get(bal)?.languages,['mai'],'Bal edition must be tagged mai.');
assert.deepEqual(byTitle.get(water)?.languages,['en'],'Water-Burial translation must be tagged en.');
assert.deepEqual(byTitle.get(waterTeaching)?.languages,['en'],'English teaching companion must be tagged en.');
relation(gohi,'workExample',kishor);
relation(gohi,'workExample',bal);
const waterFromParent=relation(gohi,'workTranslation',water);
assert.equal(waterFromParent.translator,'Gajendra Thakur','Water-Burial translator credit from parent.');
relation(gohi,'subjectOf',waterTeaching);
relation(gohi,'subjectOf',gohiTeaching);
relation(kishor,'exampleOfWork',gohi);
relation(bal,'exampleOfWork',gohi);
const waterOriginal=relation(water,'translationOfWork',gohi);
assert.equal(waterOriginal.translationDirection,'Maithili → English','Water-Burial translation direction.');
assert.equal(waterOriginal.translator,'Gajendra Thakur','Water-Burial translator credit.');
relation(waterTeaching,'isBasedOn',water);
relation(gohiTeaching,'isBasedOn',gohi);

const relatedRecords=[childrenMai,childrenEn,gohi,kishor,bal,water,waterTeaching,gohiTeaching].map(t=>byTitle.get(t));
for(const record of relatedRecords){
  assert(record?.scholarlyRelations?.length,`Scholarly relationships: ${record?.title}`);
  for(const prefix of ['', 'en/']){
    const file=path.join(ROOT,prefix,'bibliography/works',record.slug,'index.html');
    const html=fs.readFileSync(file,'utf8');
    assert(html.includes('id="scholarly-relations"'),`Visible scholarly relationships: ${file}`);
    const ld=html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
    assert(ld,`JSON-LD relation block: ${file}`);
    const work=(JSON.parse(ld[1])['@graph']||[]).find(x=>x['@type']==='Book'||x['@type']==='CreativeWork');
    for(const rel of record.scholarlyRelations){
      const target=byTitle.get(rel.relatedTitle);
      const targetUrl=`https://videha-ejournal.github.io/gajendra-preeti/${prefix}bibliography/works/${target.slug}/`;
      assert(schemaHasTarget(work,rel.relationType,targetUrl),`Schema ${rel.relationType}: ${file} -> ${rel.relatedTitle}`);
    }
  }
}
const gohiEnPage=fs.readFileSync(path.join(ROOT,'en/bibliography/works',byTitle.get(gohi).slug,'index.html'),'utf8');
assert(gohiEnPage.includes('largest Maithili novel to date'),'English Gohi page must retain largest-Maithili-novel context.');

for(const file of ['bibliography/index.html','en/bibliography/index.html','author/gajendra-thakur/index.html','en/author/gajendra-thakur/index.html']){
  const html=fs.readFileSync(path.join(ROOT,file),'utf8');
  assert(html.includes('/gajendra-preeti/bibliography/pdf-library-manifest.json'),`PDF provenance doorway: ${file}`);
}
const cross=JSON.parse(fs.readFileSync(path.join(ROOT,'bibliography/crossref-ready.json'),'utf8'));
assert.equal(cross.pdfRepository,'https://github.com/videha-ejournal/videha-ejournal');
assert.equal(cross.pdfProvenanceManifest,'https://videha-ejournal.github.io/gajendra-preeti/bibliography/pdf-library-manifest.json');
assert(cross.records.some(r=>Array.isArray(r.pdfRepository)&&r.pdfRepository.some(p=>sha.test(String(p.sha256||'')))),'DOI-ready export must carry verifiable PDF provenance.');
assert(cross.records.some(r=>r.id===byTitle.get(childrenEn).id&&r.translationRelation?.relationType==='translationOfWork'),'DOI-ready export must preserve children translation relationship.');
assert(cross.records.some(r=>r.id===byTitle.get(gohi).id&&Array.isArray(r.scholarlyRelations)&&r.scholarlyRelations.length===5),'DOI-ready export must preserve complete Gohi relationship family.');

console.log(`PDF-library integration PASS: ${report.matchedRecordCount}/${report.samagraRecordCount} Samagra records linked to ${report.matchedPdfCount}/${report.catalogCount} catalogued PDFs; children translations and complete Gohi edition/translation/teaching relationships verified; ${report.missingReferencedPaths.length} direct Samagra PDF path(s) pending; ${report.unmatchedCatalogPaths.length} supplemental PDF(s) unmatched.`);
