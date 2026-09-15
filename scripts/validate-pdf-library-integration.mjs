import fs from 'node:fs';
import assert from 'node:assert/strict';
const report=JSON.parse(fs.readFileSync('reports/pdf-library-integration.json','utf8'));
const byTitle=new Map(report.records.map(r=>[r.title,r]));

assert(report.recordCount>0,'PDF integration report must contain records.');
assert(report.matchedPdfCount>0,'PDF integration report must map PDFs.');
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
}

requireExactPdf('Decoding the Panji of Mithila','DECODING_PANJI_1.pdf');
requireExactPdf('Decoding the Panji of Mithila','DECODING_PANJI_6.pdf');
requireExactPdf('HISTORY OF MITHILA, VAJJI & ANGA IN INDIA & NEPAL: FROM PREHISTORY TO THE CONTEMPORARY PERIOD [A PARALLEL HISTORY OF MITHILA & MAITHILI LITERATURE] VOLUME I','HISTORY_MITHILA_ANGA_VAJJI.pdf');
requireExactPdf('HISTORY OF MITHILA, VAJJI & ANGA: SOCIO-CULTURAL-ECONOMIC HISTORY OF MITHILA, VAJJI & ANGA IN INDIA & NEPAL FROM PREHISTORY TO THE CONTEMPORARY PERIOD [A PARALLEL HISTORY OF MITHILA & MAITHILI LITERATURE] VOLUME II','History_Mithila_Vajji_Anga_Volume_II_merge.pdf');
requireExactPdf('स्वप्नमे मिज्झर होइत','Swapn_me_mijjhar_Hoit.pdf');
requireExactPdf('WHEN DREAMS MERGE','WHEN_DREAMS_MERGE.pdf');
requireExactPdf('WATER-BURIAL AMONG THE CROCODILES [ENGLISH TRANSLATION BY THE AUTHOR GAJENDRA THAKUR HIMSELF]','Water_Burial_Among_the_Crocodiles.pdf');

if(byTitle.has('स्वप्नमे मिज्झर होइत')&&byTitle.has('WHEN DREAMS MERGE')){
  relation('WHEN DREAMS MERGE','translationOf','स्वप्नमे मिज्झर होइत');
}

console.log(`PDF library integration PASS: ${report.recordCount} scholarly records; ${report.matchedPdfCount} exact PDF manifestation(s) mapped; strict flagship mappings verified.`);
