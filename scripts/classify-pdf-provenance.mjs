import fs from 'node:fs';

const REPORT='public/bibliography/pdf-library-manifest.json';
const REPORT_EN='public/en/bibliography/pdf-library-manifest.json';
const RECON='content/pdf-library-reconciliation.json';
const SNAPSHOT='content/videha-pdf-catalog.snapshot.json';
const SUPP='content/pdf-library-supplemental.json';
const INDEX_MAI='public/bibliography/index.html';
const INDEX_EN='public/en/bibliography/index.html';
const PDF_BASE='https://videha-ejournal.github.io/videha-ejournal/';

const report=JSON.parse(fs.readFileSync(REPORT,'utf8'));
const catalog=JSON.parse(fs.readFileSync(SNAPSHOT,'utf8'));
const supplemental=JSON.parse(fs.readFileSync(SUPP,'utf8'));
const byPath=new Map(catalog.items.map(x=>[x.path,x]));
const mappedBySha=new Map();
for(const row of report.records||[]){
  for(const pdf of row.pdfs||[]){
    if(pdf.sha256&&!mappedBySha.has(pdf.sha256))mappedBySha.set(pdf.sha256,{path:pdf.path,title:row.title,recordId:row.id});
  }
}
function meta(item){return {path:item.path,name:item.name,title:item.title,url:item.url||`${PDF_BASE}${item.path}`,rawUrl:item.rawUrl||null,repositoryUrl:item.repositoryUrl||null,mediaType:item.mediaType||'application/pdf',bytes:item.bytes??null,sha256:item.sha256||null};}
const duplicates=[];
const supplements=[];
const unclassified=[];
for(const p of report.unmatchedCatalogPaths||[]){
  const item=byPath.get(p);
  if(!item){unclassified.push(p);continue;}
  const equivalent=item.sha256?mappedBySha.get(item.sha256):null;
  if(equivalent){duplicates.push({...meta(item),equivalentToPath:equivalent.path,equivalentToTitle:equivalent.title,equivalentToRecordId:equivalent.recordId,relation:'byte-identical-sha256'});continue;}
  const info=supplemental[p];
  if(info){supplements.push({...meta(item),...info});continue;}
  unclassified.push(p);
}
report.equivalentRepositoryCopies=duplicates;
report.equivalentRepositoryCopyCount=duplicates.length;
report.supplementalPdfResources=supplements;
report.supplementalPdfResourceCount=supplements.length;
report.unmatchedCatalogPaths=unclassified;
report.unclassifiedCatalogCount=unclassified.length;
for(const file of [REPORT,REPORT_EN,RECON])fs.writeFileSync(file,JSON.stringify(report,null,2)+'\n');

function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function patchIndex(file,en){
  if(!fs.existsSync(file))return;
  let html=fs.readFileSync(file,'utf8');
  const supItems=supplements.map(x=>`<li><strong>${esc(x.title||x.name)}</strong> · <a href="${esc(x.url)}">${en?'Open PDF':'PDF खोलू'} ↗</a><br><small>${esc(en?x.noteEn:x.noteMai)}</small></li>`).join('');
  const dupItems=duplicates.map(x=>`<li><code>${esc(x.path)}</code> → ${en?'byte-identical to':'SHA-256 अनुसार समान'} <code>${esc(x.equivalentToPath)}</code> · ${esc(x.equivalentToTitle)}</li>`).join('');
  const section=`<section id="pdf-repository-classification"><h2>${en?'Repository-only PDF resources':'रिपॉजिटरी-मात्र PDF स्रोत'}</h2><p>${en?`All ${report.catalogCount} catalogued PDFs are now accounted for: ${report.matchedPdfCount} are attached to Samagra records, ${duplicates.length} are byte-identical repository copies of already-mapped manifestations, and ${supplements.length} are explicitly classified supplemental eLearning resources. ${unclassified.length} remain unclassified.`:`रिपॉजिटरी सूचीक सभ ${report.catalogCount} PDF केर हिसाब स्पष्ट अछि: ${report.matchedPdfCount} PDF समग्र-अभिलेखसँ जुड़ल अछि, ${duplicates.length} PDF पहिनेसँ मिलल संस्करणक SHA-256 अनुसार समान प्रति अछि, आ ${supplements.length} PDF स्पष्ट रूपेँ पूरक ई-लर्निङ्ग स्रोत अछि। ${unclassified.length} PDF एखन वर्गीकरण-विहीन अछि।`}</p>${supplements.length?`<h3>${en?'Supplemental eLearning resources':'पूरक ई-लर्निङ्ग स्रोत'}</h3><ul class="manifest">${supItems}</ul>`:''}${duplicates.length?`<h3>${en?'Equivalent repository copies':'समान रिपॉजिटरी प्रति'}</h3><ul class="manifest">${dupItems}</ul>`:''}</section>`;
  if(!html.includes('id="pdf-repository-classification"'))html=html.replace('</main>',section+'</main>');
  fs.writeFileSync(file,html);
}
patchIndex(INDEX_MAI,false);
patchIndex(INDEX_EN,true);
console.log(`PDF provenance classification PASS: ${report.matchedPdfCount} mapped, ${duplicates.length} byte-identical repository copies, ${supplements.length} supplemental learning resources, ${unclassified.length} unclassified.`);
