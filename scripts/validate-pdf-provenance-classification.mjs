import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const ROOT='dist/client/gajendra-preeti';
const report=JSON.parse(fs.readFileSync(path.join(ROOT,'bibliography/pdf-library-manifest.json'),'utf8'));
assert.equal(report.catalogCount,76,'Current verified PDF catalogue count.');
assert.equal(report.matchedPdfCount,54,'Samagra-attached PDF manifestations.');
assert.equal(report.translatedPdfUniqueFileCount,9,'Explicit translated/reception exact PDF resources.');
assert.equal(report.equivalentRepositoryCopyCount,2,'Byte-identical repository copy count.');
assert.equal(report.supplementalPdfResourceCount,11,'Supplemental/repository-only PDF count.');
assert.equal(report.unclassifiedCatalogCount,0,'Every catalogued PDF must be accounted for.');
assert.deepEqual(report.unmatchedCatalogPaths,[],'No catalogued PDF should remain unclassified.');

const duplicates=new Map((report.equivalentRepositoryCopies||[]).map(x=>[x.path,x]));
assert.equal(duplicates.get('GAJENDRA_THAKUR_SAMAGRA_Sanskrit_Sahitya_13_Books.pdf')?.equivalentToPath,'Sanskrit_Sahitya_13_Books_merged.pdf','Sanskrit 13-books duplicate equivalence.');
assert.equal(duplicates.get('VIDEHA_001_440_QUIZ.pdf')?.equivalentToPath,'VIDEHA_Quiz_Master_Gajendra_Thakur_SINGLE_VOLUME_LARGE_FONT.pdf','Videha Quiz duplicate equivalence.');
for(const x of duplicates.values())assert.equal(x.relation,'byte-identical-sha256','Duplicate relation must be SHA-256 verified.');

const elearning=[
  'Videha-Quiz-tirhuta.pdf',
  'Videha-UPSC-Mains-GS-Paper-I.pdf',
  'Videha-UPSC-Mains-GS-Paper-II.pdf',
  'Videha-UPSC-Mains-GS-Paper-III.pdf',
  'Videha-UPSC-Mains-GS-Paper-IV.pdf'
];
const pending=[
  'ENGLISH_HOTH_BAJAL_SWAAD.pdf',
  'ENGLISH_MITHILAK_VINASH.pdf',
  'ENGLISH_MITHILA_DU_TUK.pdf',
  'ENGLISH_PANJI_KE_MAITRI_KARAN.pdf',
  'ENGLISH_PANJI_PADDHATI_ME_SUDHAR.pdf',
  'ENGLISH_SAMANTA.pdf'
];
const supplements=new Map((report.supplementalPdfResources||[]).map(x=>[x.path,x]));
for(const p of [...elearning,...pending]){
  const row=supplements.get(p);
  assert(row,`Repository-only resource classification: ${p}`);
  assert(row.url?.startsWith('https://videha-ejournal.github.io/videha-ejournal/'),'Stable repository PDF URL.');
  assert(/^[0-9a-f]{64}$/i.test(row.sha256||''),'Repository resource SHA-256.');
}
for(const p of elearning)assert(supplements.get(p).category?.startsWith('Videha eLearning'),`eLearning category: ${p}`);
for(const p of pending)assert(supplements.get(p).category?.includes('exact work relation pending'),`Pending exact-relation category: ${p}`);

for(const prefix of ['','en/']){
  const file=path.join(ROOT,prefix,'bibliography/index.html');
  const html=fs.readFileSync(file,'utf8');
  assert(html.includes('id="pdf-repository-classification"'),`Visible repository PDF classification: ${file}`);
  for(const p of [...elearning,...pending])assert(html.includes(supplements.get(p).title)||html.includes(p.replace('.pdf','').replaceAll('_',' ')),`Visible repository resource: ${p}`);
  assert(html.includes('GAJENDRA_THAKUR_SAMAGRA_Sanskrit_Sahitya_13_Books.pdf'),`Visible equivalent repository copy: ${file}`);
  assert(html.includes('VIDEHA_001_440_QUIZ.pdf'),`Visible equivalent quiz copy: ${file}`);
}
console.log('PDF provenance classification validation PASS: all 76 PDFs accounted for as Samagra manifestations, explicit translated/reception resources, SHA-256-equivalent copies, or classified repository-only resources.');
