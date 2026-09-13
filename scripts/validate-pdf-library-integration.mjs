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
assert(report.catalogSchemaVersion>=2,'PDF catalogue must provide provenance schema v2 or newer.');
assert(report.catalogCount>=54,`Expected at least the 54 PDFs already catalogued; saw ${report.catalogCount}.`);
assert.equal(report.samagraRecordCount,data.records.length,'Reconciliation must cover every synchronized Samagra record.');
assert(report.matchedRecordCount>=30,`Expected substantial Samagra PDF coverage; saw only ${report.matchedRecordCount} records.`);
assert(report.matchedPdfCount>=report.matchedRecordCount,'Matched PDF count cannot be lower than matched record count.');
assert(report.matchedPdfCount<=report.catalogCount,'Matched PDF count cannot exceed the repository catalogue.');
assert.deepEqual(report.pendingAliasPaths,[],'Every explicit scholarly PDF alias must resolve to a real catalogued PDF.');
assert(Array.isArray(report.missingReferencedPaths),'Missing direct Samagra PDF paths must be reported rather than hidden.');
assert(Array.isArray(report.unmatchedCatalogPaths),'Unmatched repository PDFs must remain explicitly visible.');

const sha=/^[0-9a-f]{64}$/i;
const base='https://videha-ejournal.github.io/videha-ejournal/';
const byId=new Map(data.records.map(r=>[r.id,r]));
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
  ['HISTORY OF MITHILA, VAJJI & ANGA in India & Nepal: From Prehistory to the Contemporary Period VOLUME I',1],
  ['HISTORY OF MITHILA, VAJJI & ANGA: SOCIO-CULTURAL-ECONOMIC HISTORY OF MITHILA, VAJJI & ANGA IN INDIA & NEPAL FROM PREHISTORY TO THE CONTEMPORARY PERIOD [A PARALLEL HISTORY OF MITHILA & MAITHILI LITERATURE] VOLUME II',1],
  ["GAJENDRA THAKUR'S PARALLEL PHILOSOPHY VOLUME II",1],
  ['A Parallel History of Mithila & Maithili Literature',1],
  ['स्वप्नमे मिज्झर होइत · WHEN DREAMS MERGE',2],
  ['विदेह शोध-लेख (अंक १ सँ ४४७ धरि)',1],
  ['३७ टा मैथिली बाल उपन्यास — गजेन्द्र ठाकुर',1]
];
for(const [title,min] of requirements){
  const row=report.records.find(r=>r.title===title);
  assert(row,`Required scholarly PDF mapping: ${title}`);
  assert(row.pdfs.length>=min,`Expected at least ${min} PDF manifestation(s): ${title}`);
}

for(const file of ['bibliography/index.html','en/bibliography/index.html','author/gajendra-thakur/index.html','en/author/gajendra-thakur/index.html']){
  const html=fs.readFileSync(path.join(ROOT,file),'utf8');
  assert(html.includes('/gajendra-preeti/bibliography/pdf-library-manifest.json'),`PDF provenance doorway: ${file}`);
}
const cross=JSON.parse(fs.readFileSync(path.join(ROOT,'bibliography/crossref-ready.json'),'utf8'));
assert.equal(cross.pdfRepository,'https://github.com/videha-ejournal/videha-ejournal');
assert.equal(cross.pdfProvenanceManifest,'https://videha-ejournal.github.io/gajendra-preeti/bibliography/pdf-library-manifest.json');
assert(cross.records.some(r=>Array.isArray(r.pdfRepository)&&r.pdfRepository.some(p=>sha.test(String(p.sha256||'')))),'DOI-ready export must carry verifiable PDF provenance.');

console.log(`PDF-library integration PASS: ${report.matchedRecordCount}/${report.samagraRecordCount} Samagra records linked to ${report.matchedPdfCount}/${report.catalogCount} catalogued PDFs; ${report.missingReferencedPaths.length} direct Samagra PDF path(s) still pending upload; ${report.unmatchedCatalogPaths.length} supplemental PDF(s) intentionally unmatched.`);
