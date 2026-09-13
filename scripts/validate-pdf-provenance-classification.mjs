import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const ROOT='dist/client/gajendra-preeti';
const report=JSON.parse(fs.readFileSync(path.join(ROOT,'bibliography/pdf-library-manifest.json'),'utf8'));
assert.equal(report.catalogCount,61,'Current verified PDF catalogue count.');
assert.equal(report.matchedPdfCount,54,'Samagra-attached PDF manifestations.');
assert.equal(report.equivalentRepositoryCopyCount,2,'Byte-identical repository copy count.');
assert.equal(report.supplementalPdfResourceCount,5,'Supplemental eLearning PDF count.');
assert.equal(report.unclassifiedCatalogCount,0,'Every catalogued PDF must be accounted for.');
assert.deepEqual(report.unmatchedCatalogPaths,[],'No catalogued PDF should remain unclassified.');

const duplicates=new Map((report.equivalentRepositoryCopies||[]).map(x=>[x.path,x]));
assert.equal(duplicates.get('GAJENDRA_THAKUR_SAMAGRA_Sanskrit_Sahitya_13_Books.pdf')?.equivalentToPath,'Sanskrit_Sahitya_13_Books_merged.pdf','Sanskrit 13-books duplicate equivalence.');
assert.equal(duplicates.get('VIDEHA_001_440_QUIZ.pdf')?.equivalentToPath,'VIDEHA_Quiz_Master_Gajendra_Thakur_SINGLE_VOLUME_LARGE_FONT.pdf','Videha Quiz duplicate equivalence.');
for(const x of duplicates.values())assert.equal(x.relation,'byte-identical-sha256','Duplicate relation must be SHA-256 verified.');

const supplementalPaths=[
  'Videha-Quiz-tirhuta.pdf',
  'Videha-UPSC-Mains-GS-Paper-I.pdf',
  'Videha-UPSC-Mains-GS-Paper-II.pdf',
  'Videha-UPSC-Mains-GS-Paper-III.pdf',
  'Videha-UPSC-Mains-GS-Paper-IV.pdf'
];
const supplements=new Map((report.supplementalPdfResources||[]).map(x=>[x.path,x]));
for(const p of supplementalPaths){
  const row=supplements.get(p);
  assert(row,`Supplemental resource classification: ${p}`);
  assert(row.category?.startsWith('Videha eLearning'),'Supplemental resource category.');
  assert(row.url?.startsWith('https://videha-ejournal.github.io/videha-ejournal/'),'Stable supplemental PDF URL.');
  assert(/^[0-9a-f]{64}$/i.test(row.sha256||''),'Supplemental resource SHA-256.');
}
for(const prefix of ['','en/']){
  const file=path.join(ROOT,prefix,'bibliography/index.html');
  const html=fs.readFileSync(file,'utf8');
  assert(html.includes('id="pdf-repository-classification"'),`Visible repository PDF classification: ${file}`);
  for(const p of supplementalPaths)assert(html.includes(p.replace('.pdf','').replaceAll('_',' '))||html.includes(supplements.get(p).title),`Visible supplemental resource: ${p}`);
  assert(html.includes('GAJENDRA_THAKUR_SAMAGRA_Sanskrit_Sahitya_13_Books.pdf'),`Visible equivalent repository copy: ${file}`);
  assert(html.includes('VIDEHA_001_440_QUIZ.pdf'),`Visible equivalent quiz copy: ${file}`);
}
console.log('PDF provenance classification validation PASS: all 61 PDFs accounted for as Samagra manifestations, SHA-256-equivalent copies, or explicit supplemental eLearning resources.');
