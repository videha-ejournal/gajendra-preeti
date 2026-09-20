import fs from 'node:fs';
import path from 'node:path';

const CATALOG_RAW='https://raw.githubusercontent.com/videha-ejournal/videha-ejournal/main/data/videha-pdf-catalog.json';
const PDF_BASE='https://videha-ejournal.github.io/videha-ejournal/';
const PDF_REPO='https://github.com/videha-ejournal/videha-ejournal';
const ATLAS_BASE='/gajendra-preeti';
const PDF_MANIFEST_URL=`${ATLAS_BASE}/bibliography/pdf-library-manifest.json`;
const DATA='public/bibliography/bibliography-data.json';
const ALIASES='content/samagra-pdf-aliases.json';
const SNAPSHOT='content/videha-pdf-catalog.snapshot.json';
const RECON='content/pdf-library-reconciliation.json';
const OUT='public/bibliography/pdf-library-manifest.json';
const OUT_EN='public/en/bibliography/pdf-library-manifest.json';

const unique=a=>[...new Set(a.filter(Boolean))];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const mb=n=>n?`${(n/1048576).toFixed(2)} MiB`:null;
function localPath(url){
  if(!String(url||'').startsWith(PDF_BASE))return null;
  try{return decodeURIComponent(String(url).slice(PDF_BASE.length));}catch{return String(url).slice(PDF_BASE.length);}
}
async function loadCatalog(){
  const ctl=new AbortController(),timer=setTimeout(()=>ctl.abort(),20000);
  try{
    const r=await fetch(CATALOG_RAW,{signal:ctl.signal,headers:{'user-agent':'Videha-Scholarly-PDF-Integrator'}});
    if(!r.ok)throw Error(`HTTP ${r.status}`);
    const data=await r.json();
    if(!Array.isArray(data.items))throw Error('catalogue has no items array');
    fs.writeFileSync(SNAPSHOT,JSON.stringify(data,null,2)+'\n');
    return data;
  }catch(err){
    if(fs.existsSync(SNAPSHOT))return JSON.parse(fs.readFileSync(SNAPSHOT,'utf8'));
    throw new Error(`Unable to load Videha PDF catalogue and no snapshot exists: ${err.message}`);
  }finally{clearTimeout(timer);}
}
function copyMeta(item){return {path:item.path,name:item.name,title:item.title,url:item.url,rawUrl:item.rawUrl||null,repositoryUrl:item.repositoryUrl||`${PDF_REPO}/blob/main/${encodeURI(item.path)}`,mediaType:item.mediaType||'application/pdf',bytes:item.bytes??null,sha256:item.sha256||null,largeFileWarning:Boolean(item.largeFileWarning)};}
function mediaObject(p){return {'@type':'MediaObject',name:p.title||p.name,contentUrl:p.url,encodingFormat:p.mediaType||'application/pdf',...(p.bytes?{contentSize:String(p.bytes)}:{}),identifier:[{'@type':'PropertyValue',propertyID:'repository-path',value:p.path},...(p.sha256?[{'@type':'PropertyValue',propertyID:'SHA-256',value:p.sha256}]:[])]};}
function patchJsonLd(html,pdfs){
  return html.replace(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/,(all,json)=>{
    try{
      const data=JSON.parse(json),graph=data['@graph']||[],work=graph.find(x=>x['@type']==='Book'||x['@type']==='CreativeWork');
      if(work)work.encoding=pdfs.map(mediaObject);
      return `<script type="application/ld+json">${JSON.stringify(data).replaceAll('<','\\u003c')}</script>`;
    }catch{return all;}
  });
}
function patchWorkPage(file,record,en){
  if(!fs.existsSync(file)||!record.pdfLibrary?.length)return;
  let html=fs.readFileSync(file,'utf8');
  html=html.replace(/<meta name="citation_pdf_url" content="[^"]*">/g,'');
  html=html.replace('</head>',`<meta name="citation_pdf_url" content="${esc(record.pdfLibrary[0].url)}"></head>`);
  html=patchJsonLd(html,record.pdfLibrary);
  const rows=record.pdfLibrary.map(p=>`<li><strong>${esc(p.name)}</strong> · <a href="${esc(p.url)}">${en?'Open verified PDF':'सत्यापित PDF खोलू'} ↗</a>${p.bytes?` · ${esc(mb(p.bytes))}`:''}${p.sha256?`<br><small>SHA-256: <code>${esc(p.sha256)}</code></small>`:''}</li>`).join('');
  const section=`<section id="pdf-library"><h2>${en?'Verified Videha PDF repository copies':'सत्यापित विदेह PDF रिपॉजिटरी प्रति'}</h2><p>${en?'These files are matched against the synchronized Samagra record and fingerprinted by the Videha PDF catalogue. The permanent scholarly record remains the preferred citation URL; the PDF URL identifies the consulted manifestation.':'ई फाइल सभ समकालित समग्र अभिलेखसँ मिलान कएल गेल अछि आ विदेह PDF सूचीमे फिंगरप्रिन्ट कएल गेल अछि। स्थायी शोध-अभिलेख उद्धरण लेल मुख्य URL अछि; PDF URL देखल गेल संस्करणक पहचान करैत अछि।'}</p><ul class="manifest">${rows}</ul><p><a href="${PDF_MANIFEST_URL}">${en?'PDF provenance manifest':'PDF स्रोत-प्रमाण सूची'} →</a></p></section>`;
  if(!html.includes('id="pdf-library"'))html=html.replace('<section id="cite">',section+'<section id="cite">');
  fs.writeFileSync(file,html);
}
function patchCitationFiles(record,en){
  const dir=`public/${en?'en/':''}bibliography/works/${record.slug}`;
  const ris=path.join(dir,'citation.ris');
  if(fs.existsSync(ris)&&record.pdfLibrary?.length){
    let s=fs.readFileSync(ris,'utf8');
    if(!s.includes(record.pdfLibrary[0].url))s=s.replace('ER  - ',record.pdfLibrary.map(p=>`L1  - ${p.url}`).join('\n')+'\nER  - ');
    fs.writeFileSync(ris,s);
  }
  const json=path.join(dir,'citation.json');
  if(fs.existsSync(json)&&record.pdfLibrary?.length){
    const c=JSON.parse(fs.readFileSync(json,'utf8'));
    const prov=record.pdfLibrary.map(p=>`Verified PDF: ${p.url}${p.sha256?` (SHA-256 ${p.sha256})`:''}`).join('; ');
    c.note=[c.note,prov].filter(Boolean).join('; ');
    fs.writeFileSync(json,JSON.stringify(c,null,2)+'\n');
  }
}
function patchIndex(file,en,report){
  if(!fs.existsSync(file))return;
  let html=fs.readFileSync(file,'utf8');
  const section=`<section id="pdf-library"><h2>${en?'Verified PDF library':'सत्यापित PDF ग्रन्थागार'}</h2><p>${en?`${report.matchedRecordCount} of ${report.samagraRecordCount} synchronized Samagra records currently have ${report.matchedPdfCount} verified PDF repository manifestations. The repository catalogue currently contains ${report.catalogCount} PDFs; unmatched files remain available without being forced into a bibliographic record.`:`समकालित समग्रक ${report.samagraRecordCount} अभिलेखमे सँ ${report.matchedRecordCount} अभिलेखक ${report.matchedPdfCount} सत्यापित PDF रिपॉजिटरी रूप एखन उपलब्ध अछि। रिपॉजिटरी सूचीमे कुल ${report.catalogCount} PDF अछि; नहि-मिलल फाइलकेँ जबरदस्ती कोनो ग्रन्थ-अभिलेखमे नहि जोड़ल गेल अछि।`}</p><div class="downloads"><a href="${PDF_MANIFEST_URL}">${en?'PDF provenance manifest':'PDF स्रोत-प्रमाण सूची'}</a><a href="${PDF_REPO}">${en?'PDF repository':'PDF रिपॉजिटरी'} ↗</a></div></section>`;
  if(!html.includes('id="pdf-library"'))html=html.replace('</main>',section+'</main>');
  fs.writeFileSync(file,html);
}

const catalog=await loadCatalog();
const aliases=JSON.parse(fs.readFileSync(ALIASES,'utf8'));
const data=JSON.parse(fs.readFileSync(DATA,'utf8'));
const byPath=new Map(catalog.items.map(x=>[x.path,x]));
const used=new Set(),missingReferenced=new Set(),pendingAlias=new Set();
for(const r of data.records){
  const direct=r.links.map(x=>localPath(x.url)).filter(x=>x&&/\.pdf$/i.test(x));
  const aliasPaths=aliases[r.title]||[];
  const paths=unique([...direct,...aliasPaths]);
  const copies=[];
  for(const p of paths){
    const item=byPath.get(p);
    if(item){copies.push(copyMeta(item));used.add(p);}else if(direct.includes(p))missingReferenced.add(p);else pendingAlias.add(p);
  }
  r.pdfLibrary=copies;
  r.pdfLibraryCount=copies.length;
  if(copies.length)r.pdfUrl=copies[0].url;
  for(const p of copies){
    const existing=r.links.find(x=>x.url===p.url);
    if(existing)Object.assign(existing,{repositoryPath:p.path,bytes:p.bytes,sha256:p.sha256,mediaType:p.mediaType,repositoryUrl:p.repositoryUrl,verifiedPdfRepository:true});
    else r.links.push({label:`Videha PDF repository · ${p.title||p.name}`,url:p.url,format:'PDF',repositoryPath:p.path,bytes:p.bytes,sha256:p.sha256,mediaType:p.mediaType,repositoryUrl:p.repositoryUrl,verifiedPdfRepository:true});
  }
}
const matched=data.records.filter(r=>r.pdfLibrary?.length);
const report={
  schemaVersion:1,
  verified:data.verified,
  samagraSource:data.sourcePage,
  pdfCatalogue:CATALOG_RAW,
  pdfRepository:PDF_REPO,
  catalogSchemaVersion:catalog.schemaVersion||1,
  catalogCount:catalog.count||catalog.items.length,
  catalogTotalBytes:catalog.totalBytes??null,
  samagraRecordCount:data.records.length,
  matchedRecordCount:matched.length,
  matchedPdfCount:used.size,
  missingReferencedPaths:[...missingReferenced].sort((a,b)=>a < b ? -1 : a > b ? 1 : 0),
  pendingAliasPaths:[...pendingAlias].sort((a,b)=>a < b ? -1 : a > b ? 1 : 0),
  unmatchedCatalogPaths:catalog.items.map(x=>x.path).filter(p=>!used.has(p)).sort((a,b)=>a < b ? -1 : a > b ? 1 : 0),
  records:matched.map(r=>({id:r.id,sourcePosition:r.sourcePosition,title:r.title,slug:r.slug,pdfs:r.pdfLibrary}))
};
fs.writeFileSync(DATA,JSON.stringify(data,null,2)+'\n');
fs.writeFileSync(RECON,JSON.stringify(report,null,2)+'\n');
fs.mkdirSync(path.dirname(OUT),{recursive:true});
fs.mkdirSync(path.dirname(OUT_EN),{recursive:true});
fs.writeFileSync(OUT,JSON.stringify(report,null,2)+'\n');
fs.writeFileSync(OUT_EN,JSON.stringify(report,null,2)+'\n');
const cross='public/bibliography/crossref-ready.json';
if(fs.existsSync(cross)){
  const c=JSON.parse(fs.readFileSync(cross,'utf8')),byId=new Map(data.records.map(r=>[r.id,r]));
  for(const r of c.records||[]){const full=byId.get(r.id);if(full?.pdfLibrary?.length){r.pdfUrl=full.pdfLibrary[0].url;r.pdfRepository=full.pdfLibrary.map(p=>({path:p.path,url:p.url,bytes:p.bytes,sha256:p.sha256}));}}
  c.pdfRepository=PDF_REPO;c.pdfProvenanceManifest='https://videha-ejournal.github.io/gajendra-preeti/bibliography/pdf-library-manifest.json';
  fs.writeFileSync(cross,JSON.stringify(c,null,2)+'\n');
}
for(const r of data.records){for(const en of [false,true]){patchWorkPage(`public/${en?'en/':''}bibliography/works/${r.slug}/index.html`,r,en);patchCitationFiles(r,en);}}
patchIndex('public/bibliography/index.html',false,report);
patchIndex('public/en/bibliography/index.html',true,report);
for(const [file,en] of [['public/author/gajendra-thakur/index.html',false],['public/en/author/gajendra-thakur/index.html',true]]){
  if(!fs.existsSync(file))continue;let html=fs.readFileSync(file,'utf8');
  if(!html.includes('pdf-library-manifest.json'))html=html.replace('</main>',`<section><h2>${en?'Verified PDF library':'सत्यापित PDF ग्रन्थागार'}</h2><p><a href="${PDF_MANIFEST_URL}">${en?'Open PDF provenance manifest':'PDF स्रोत-प्रमाण सूची खोलू'} →</a></p></section></main>`);
  fs.writeFileSync(file,html);
}
console.log(`Integrated Videha PDF library: ${report.matchedRecordCount}/${report.samagraRecordCount} Samagra records; ${report.matchedPdfCount}/${report.catalogCount} catalogue PDFs matched; ${report.missingReferencedPaths.length} Samagra PDF path(s) referenced but not yet present.`);
