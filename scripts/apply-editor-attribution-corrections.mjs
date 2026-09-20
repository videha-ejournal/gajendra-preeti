import fs from 'node:fs';
import path from 'node:path';

const CFG='content/translated-pdf-resources.json';
const SNAP='content/videha-pdf-catalog.snapshot.json';
const REPORT='public/bibliography/pdf-library-manifest.json';
const REPORT_EN='public/en/bibliography/pdf-library-manifest.json';
const RECON='content/pdf-library-reconciliation.json';
const ROOT='https://videha-ejournal.github.io/gajendra-preeti';
const BASE='/gajendra-preeti';
const PDF_BASE='https://videha-ejournal.github.io/videha-ejournal/';
const cfg=JSON.parse(fs.readFileSync(CFG,'utf8'));
const catalog=JSON.parse(fs.readFileSync(SNAP,'utf8'));
const report=JSON.parse(fs.readFileSync(REPORT,'utf8'));
const byPath=new Map(catalog.items.map(x=>[x.path,x]));
const byId=new Map((cfg.standalone||[]).map(x=>[x.id,x]));
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const mib=n=>`${(Number(n)/1048576).toFixed(2)} MiB`;
const person=name=>({'@type':'Person',name});
function exact(p){const x=byPath.get(p);if(!x)throw new Error(`Missing catalogue PDF: ${p}`);return {...x,url:x.url||`${PDF_BASE}${x.path}`};}
function media(p){return {'@type':'MediaObject',name:p.title||p.name,contentUrl:p.url,encodingFormat:p.mediaType||'application/pdf',contentSize:String(p.bytes),identifier:{'@type':'PropertyValue',propertyID:'SHA-256',value:p.sha256}};}
function sourceNode(spec){const node={'@type':'CreativeWork',inLanguage:'mai'};if(spec.originalTitle)node.name=spec.originalTitle;if(spec.sourceAuthor)node.author=person(spec.sourceAuthor);return node;}
function translationPage(spec,pdf,en){
  const title=en?spec.titleEn:spec.titleMai;
  const category=en?spec.categoryEn:spec.categoryMai;
  const canonical=`${ROOT}/${en?'en/':''}bibliography/resources/${spec.id}/`;
  const ld={'@context':'https://schema.org','@type':'Book',name:spec.titleEn,inLanguage:'en',url:canonical,author:person(spec.author||spec.sourceAuthor),translator:person(spec.translator),translationOfWork:sourceNode(spec),encoding:media(pdf)};
  const original=spec.originalTitle?`<p><strong>${en?'Maithili original':'मैथिली मूल'}:</strong> ${esc(spec.originalTitle)}</p>`:'';
  return `<!doctype html><html lang="${en?'en':'mai'}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)} | Videha Literary Atlas</title><meta name="description" content="${esc(category)}"><meta name="author" content="${esc(spec.author||spec.sourceAuthor)}"><meta name="translator" content="${esc(spec.translator)}"><link rel="canonical" href="${canonical}"><link rel="alternate" hreflang="mai" href="${ROOT}/bibliography/resources/${spec.id}/"><link rel="alternate" hreflang="en" href="${ROOT}/en/bibliography/resources/${spec.id}/"><link rel="alternate" hreflang="x-default" href="${ROOT}/bibliography/resources/${spec.id}/"><link rel="stylesheet" href="${BASE}/reading-tools.css"><script type="application/ld+json">${JSON.stringify(ld).replaceAll('<','\\u003c')}</script></head><body><main><p><a href="${BASE}/${en?'en/':''}bibliography/">← ${en?'Bibliography':'ग्रन्थसूची'}</a></p><p>${esc(category)}</p><h1>${esc(title)}</h1><section id="scholarly-relation"><h2>${en?'Authorship and translation relationship':'लेखन आ अनुवाद-सम्बन्ध'}</h2><p><strong>${en?'Original Maithili author':'मूल मैथिली लेखक'}:</strong> ${esc(spec.sourceAuthor)}</p>${original}<p><strong>${en?'English translator':'अंग्रेजी अनुवादक'}:</strong> Gajendra Thakur / गजेन्द्र ठाकुर</p><p>${esc(en?spec.sourceNoteEn:spec.sourceNoteMai)}</p></section><section id="pdf-library"><h2>${en?'Exact English repository PDF':'ठीक अंग्रेजी रिपॉजिटरी PDF'}</h2><p><a href="${esc(pdf.url)}">${esc(pdf.name)} ↗</a> · ${mib(pdf.bytes)}</p><p><strong>SHA-256:</strong> <code>${esc(pdf.sha256)}</code></p></section></main></body></html>`;
}

const correctedIds=['maithili-grammar-ghazal-history-english','maithili-web-journalism-english','maulail-gachhak-phool-english'];
for(const id of correctedIds){
  const spec=byId.get(id);if(!spec)throw new Error(`Missing corrected standalone config: ${id}`);
  const pdf=exact(spec.path);
  for(const en of [false,true]){
    const dir=`public/${en?'en/':''}bibliography/resources/${id}`;fs.mkdirSync(dir,{recursive:true});
    fs.writeFileSync(path.join(dir,'index.html'),translationPage(spec,pdf,en));
  }
}

function patchJsonLdEditor(html,editor){return html.replace(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/,(all,json)=>{try{const ld=JSON.parse(json);const target=ld['@graph']?ld['@graph'].find(x=>['Book','CreativeWork','Article'].includes(x['@type'])):ld; if(!target)return all;const src=(target.isBasedOn&&typeof target.isBasedOn==='object')?target.isBasedOn:{'@type':'CreativeWork',inLanguage:'mai'};src.editor=person(editor);target.isBasedOn=src;return `<script type="application/ld+json">${JSON.stringify(ld).replaceAll('<','\\u003c')}</script>`;}catch{return all;}});}
for(const [id,info] of Object.entries(cfg.reception||{})){
  if(!info.sourceEditor)continue;
  for(const en of [false,true]){
    const file=`public/criticism/reception/${en?'en/':''}${id}.html`;if(!fs.existsSync(file))throw new Error(`Missing reception page: ${file}`);
    let html=fs.readFileSync(file,'utf8');
    html=patchJsonLdEditor(html,info.sourceEditor);
    if(!html.includes('data-source-editor=')){
      const label=en?'Original Maithili editor':'मूल मैथिली सम्पादक';
      html=html.replace(/(<section id="verified-repository-editions"><h2>[^<]+<\/h2>)/,`$1<p data-source-editor="${esc(info.sourceEditor)}"><strong>${label}:</strong> ${esc(info.sourceEditor)}</p>`);
    }
    if(!html.includes('<meta name="editor"'))html=html.replace('</head>',`<meta name="editor" content="${esc(info.sourceEditor)}"></head>`);
    fs.writeFileSync(file,html);
  }
}

const criticismPdf=exact('GT_PT_Criticism.pdf');
const criticismId='gajendra-preeti-criticism-collection';
function criticismPage(en){
  const title=en?'Criticism on Gajendra Thakur & Preeti Thakur — collection by different writers':'गजेन्द्र ठाकुर आ प्रीति ठाकुर पर समालोचना — विभिन्न लेखकक संग्रह';
  const canonical=`${ROOT}/${en?'en/':''}bibliography/resources/${criticismId}/`;
  const ld={'@context':'https://schema.org','@type':'CreativeWork',name:'Collection of criticism on Gajendra Thakur and Preeti Thakur',inLanguage:['mai','en'],url:canonical,about:[person('Gajendra Thakur'),person('Preeti Thakur')],additionalProperty:{'@type':'PropertyValue',name:'Authorship',value:'Collection of criticism by different writers'},encoding:media(criticismPdf)};
  return `<!doctype html><html lang="${en?'en':'mai'}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)} | Videha Literary Atlas</title><meta name="description" content="${en?'A collection of criticism on Gajendra Thakur and Preeti Thakur by different writers.':'गजेन्द्र ठाकुर आ प्रीति ठाकुर पर विभिन्न लेखक द्वारा लिखल समालोचनाक संग्रह।'}"><link rel="canonical" href="${canonical}"><link rel="alternate" hreflang="mai" href="${ROOT}/bibliography/resources/${criticismId}/"><link rel="alternate" hreflang="en" href="${ROOT}/en/bibliography/resources/${criticismId}/"><link rel="alternate" hreflang="x-default" href="${ROOT}/bibliography/resources/${criticismId}/"><link rel="stylesheet" href="${BASE}/reading-tools.css"><script type="application/ld+json">${JSON.stringify(ld).replaceAll('<','\\u003c')}</script></head><body><main><p><a href="${BASE}/${en?'en/':''}bibliography/">← ${en?'Bibliography':'ग्रन्थसूची'}</a></p><h1>${esc(title)}</h1><section id="scholarly-relation"><h2>${en?'Collection attribution':'संग्रहक श्रेय'}</h2><p>${en?'This PDF is a collection of criticism on Gajendra Thakur and Preeti Thakur written by different writers. It is not attributed to a single author.':'ई PDF गजेन्द्र ठाकुर आ प्रीति ठाकुर पर विभिन्न लेखक द्वारा लिखल समालोचनाक संग्रह अछि। एकरा कोनो एकल लेखकक नामेँ नहि जोड़ल गेल अछि।'}</p></section><section id="pdf-library"><h2>${en?'Exact repository PDF':'ठीक रिपॉजिटरी PDF'}</h2><p><a href="${esc(criticismPdf.url)}">${esc(criticismPdf.name)} ↗</a> · ${mib(criticismPdf.bytes)}</p><p><strong>SHA-256:</strong> <code>${esc(criticismPdf.sha256)}</code></p></section></main></body></html>`;
}
for(const en of [false,true]){const dir=`public/${en?'en/':''}bibliography/resources/${criticismId}`;fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(path.join(dir,'index.html'),criticismPage(en));}

report.criticismPdfResources=[{path:criticismPdf.path,name:criticismPdf.name,title:criticismPdf.title,url:criticismPdf.url,rawUrl:criticismPdf.rawUrl||null,repositoryUrl:criticismPdf.repositoryUrl||null,mediaType:criticismPdf.mediaType||'application/pdf',bytes:criticismPdf.bytes,sha256:criticismPdf.sha256,category:'Criticism collection by different writers',about:['Gajendra Thakur','Preeti Thakur']}];
report.criticismPdfResourceCount=1;
report.unmatchedCatalogPaths=(report.unmatchedCatalogPaths||[]).filter(x=>x!=='GT_PT_Criticism.pdf');
report.unclassifiedCatalogCount=report.unmatchedCatalogPaths.length;
report.editorAttributionCorrections={
  sourceAuthors:{'ENGLISH_MAITHILI_GRAMMAR_GHAZAL_HISTORY.pdf':'Ashish Anchinhar','ENGLISH_MAITHILI_WEB_JOURNALISM.pdf':'Ashish Anchinhar','ENGLISH_MAULAIL_GACHHAK_PHOOL.pdf':'Jagdish Prasad Mandal'},
  sourceEditors:{'PREETI_KARAN_SETU_BANHAL.pdf':'Ashish Anchinhar','SETUSHAM.pdf':'Ashish Anchinhar'},
  criticism:{'GT_PT_Criticism.pdf':'Collection of criticism on Gajendra Thakur and Preeti Thakur by different writers'}
};
for(const file of [REPORT,REPORT_EN,RECON])fs.writeFileSync(file,JSON.stringify(report,null,2)+'\n');

function accountingSection(en){
  const supplements=report.supplementalPdfResources||[],duplicates=report.equivalentRepositoryCopies||[];
  const sup=supplements.map(x=>`<li><strong>${esc(x.title||x.name)}</strong> · <a href="${esc(x.url)}">${en?'Open PDF':'PDF खोलू'} ↗</a><br><small>${esc(en?x.noteEn:x.noteMai)}</small></li>`).join('');
  const dup=duplicates.map(x=>`<li><code>${esc(x.path)}</code> → ${en?'byte-identical to':'SHA-256 अनुसार समान'} <code>${esc(x.equivalentToPath)}</code> · ${esc(x.equivalentToTitle)}</li>`).join('');
  return `<section id="pdf-repository-classification"><h2>${en?'Repository PDF accounting':'रिपॉजिटरी PDF हिसाब'}</h2><p>${en?`All ${report.catalogCount} catalogued PDFs are accounted for: ${report.matchedPdfCount} are Samagra manifestations, ${report.translatedPdfUniqueFileCount} are explicit translated/reception resources, ${report.criticismPdfResourceCount} is a separately classified multi-author criticism collection, ${duplicates.length} are byte-identical repository copies, and ${supplements.length} are supplemental resources. ${report.unclassifiedCatalogCount} remain unclassified.`:`रिपॉजिटरी सूचीक सभ ${report.catalogCount} PDF केर हिसाब स्पष्ट अछि: ${report.matchedPdfCount} समग्र-संस्करण अछि, ${report.translatedPdfUniqueFileCount} स्पष्ट अनूदित/रिसेप्शन स्रोत अछि, ${report.criticismPdfResourceCount} विभिन्न लेखकक समालोचना-संग्रह रूपेँ अलग वर्गीकृत अछि, ${duplicates.length} SHA-256 अनुसार समान प्रति अछि, आ ${supplements.length} पूरक स्रोत अछि। ${report.unclassifiedCatalogCount} PDF वर्गीकरण-विहीन अछि।`}</p><h3>${en?'Multi-author criticism collection':'विभिन्न लेखकक समालोचना-संग्रह'}</h3><ul class="manifest"><li><strong>${esc(criticismPdf.title||criticismPdf.name)}</strong> · <a href="${BASE}/${en?'en/':''}bibliography/resources/${criticismId}/">${en?'Scholarly record':'शोध-अभिलेख'}</a> · <a href="${esc(criticismPdf.url)}">PDF ↗</a></li></ul>${supplements.length?`<h3>${en?'Supplemental resources':'पूरक स्रोत'}</h3><ul class="manifest">${sup}</ul>`:''}${duplicates.length?`<h3>${en?'Equivalent repository copies':'समान रिपॉजिटरी प्रति'}</h3><ul class="manifest">${dup}</ul>`:''}</section>`;
}
function patchIndex(file,en){if(!fs.existsSync(file))return;let html=fs.readFileSync(file,'utf8');html=html.replace(/<section id="pdf-repository-classification">[\s\S]*?<\/section>/,accountingSection(en));const block=`<section id="criticism-collection-resource"><h2>${en?'Multi-author criticism resource':'विभिन्न लेखकक समालोचना-स्रोत'}</h2><p><a href="${BASE}/${en?'en/':''}bibliography/resources/${criticismId}/">${en?'Criticism on Gajendra Thakur & Preeti Thakur →':'गजेन्द्र ठाकुर आ प्रीति ठाकुर पर समालोचना →'}</a></p></section>`;if(!html.includes('id="criticism-collection-resource"'))html=html.replace('</main>',block+'</main>');fs.writeFileSync(file,html);}
for(const en of [false,true]){patchIndex(`public/${en?'en/':''}bibliography/index.html`,en);patchIndex(`public/${en?'en/':''}researcher/index.html`,en);}

const sitemap='public/sitemap.xml';
if(fs.existsSync(sitemap)){let xml=fs.readFileSync(sitemap,'utf8');const ids=[...correctedIds,criticismId];const urls=[];for(const en of [false,true])for(const id of ids)urls.push(`${ROOT}/${en?'en/':''}bibliography/resources/${id}/`);const entries=urls.filter(u=>!xml.includes(`<loc>${u}</loc>`)).map(u=>`<url><loc>${u}</loc></url>`).join('');if(entries)xml=xml.replace('</urlset>',entries+'</urlset>');fs.writeFileSync(sitemap,xml);}
console.log('Editor attribution corrections PASS: Ashish Anchinhar source authorship/editor roles, Jagdish Prasad Mandal Maulail authorship, and multi-author GT/PT criticism classification applied.');
