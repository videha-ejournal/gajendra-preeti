import fs from 'node:fs';
import path from 'node:path';

const CFG='content/translated-pdf-resources.json';
const SNAP='content/videha-pdf-catalog.snapshot.json';
const ROOT='https://videha-ejournal.github.io/gajendra-preeti';
const BASE='/gajendra-preeti';
const COLLECTION='jagdish-prasad-mandal-translations';
const cfg=JSON.parse(fs.readFileSync(CFG,'utf8'));
const catalog=JSON.parse(fs.readFileSync(SNAP,'utf8'));
const byPath=new Map(catalog.items.map(x=>[x.path,x]));
const items=(cfg.standalone||[]).filter(x=>x.collection===COLLECTION);
if(items.length!==4)throw new Error(`Expected four Jagdish Prasad Mandal corpus records, got ${items.length}`);

const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const mib=n=>`${(Number(n)/1048576).toFixed(2)} MiB`;
const person=name=>({'@type':'Person',name});
function pdfFor(spec){const p=byPath.get(spec.path);if(!p)throw new Error(`Missing JPM PDF in catalogue: ${spec.path}`);return {...p,url:p.url||`https://videha-ejournal.github.io/videha-ejournal/${p.path}`};}
function sourceNode(spec){
  const node={'@type':spec.sourceCorpus?'CreativeWork':'Book',name:spec.originalTitle,inLanguage:'mai'};
  if(spec.sourceAuthor)node.author=person(spec.sourceAuthor);
  return node;
}
function ldFor(spec,pdf,canonical){
  const ld={'@context':'https://schema.org','@type':'Book',name:spec.titleEn,inLanguage:'en',url:canonical,translator:person(spec.translator),encoding:{'@type':'MediaObject',name:pdf.title||pdf.name,contentUrl:pdf.url,encodingFormat:pdf.mediaType||'application/pdf',contentSize:String(pdf.bytes),identifier:{'@type':'PropertyValue',propertyID:'SHA-256',value:pdf.sha256}}};
  if(spec.author)ld.author=person(spec.author);
  if(spec.about)ld.about=person(spec.about);
  if(spec.isbn)ld.isbn=spec.isbn;
  if(spec.sourceCorpus)ld.isBasedOn=sourceNode(spec);else ld.translationOfWork=sourceNode(spec);
  if(spec.selfTranslation)ld.additionalProperty={'@type':'PropertyValue',name:'Translation relationship',value:'Self-translation from the author’s Maithili original'};
  return ld;
}
function details(spec,en){
  const rows=[];
  rows.push(`<p><strong>${en?'Author':'लेखक'}:</strong> ${esc(en?spec.author:(spec.authorMai||spec.author))}</p>`);
  if(spec.originalTitle)rows.push(`<p><strong>${en?(spec.sourceCorpus?'Source corpus':'Maithili original'):(spec.sourceCorpus?'मूल मैथिली कथा-संग्रह':'मैथिली मूल')}:</strong> ${esc(spec.originalTitle)}</p>`);
  rows.push(`<p><strong>${en?'Translation direction':'अनुवाद दिशा'}:</strong> Maithili → English</p>`);
  rows.push(`<p><strong>${en?'English translator':'अंग्रेजी अनुवादक'}:</strong> Gajendra Thakur / गजेन्द्र ठाकुर</p>`);
  if(spec.selfTranslation)rows.push(`<p><strong>${en?'Relationship':'सम्बन्ध'}:</strong> ${en?'Author’s self-translation of his own Maithili biography.':'लेखक द्वारा अपन मैथिली जीवनीक स्व-अनुवाद।'}</p>`);
  if(spec.about)rows.push(`<p><strong>${en?'Biographical subject':'जीवनीक विषय'}:</strong> Jagdish Prasad Mandal / जगदीश प्रसाद मण्डल</p>`);
  if(spec.isbn)rows.push(`<p><strong>ISBN:</strong> ${esc(spec.isbn)}</p>`);
  return rows.join('');
}
function page(spec,pdf,en){
  const title=en?spec.titleEn:spec.titleMai;
  const category=en?spec.categoryEn:spec.categoryMai;
  const canonical=`${ROOT}/${en?'en/':''}bibliography/resources/${spec.id}/`;
  const other=`${ROOT}/${en?'':'en/'}bibliography/resources/${spec.id}/`;
  const collectionHref=`${BASE}/${en?'en/':''}bibliography/resources/${COLLECTION}/`;
  const note=en?spec.sourceNoteEn:spec.sourceNoteMai;
  const ld=ldFor(spec,pdf,canonical);
  return `<!doctype html><html lang="${en?'en':'mai'}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)} | Videha Literary Atlas</title><meta name="description" content="${esc(category)}"><meta name="author" content="${esc(spec.author||spec.sourceAuthor||'')}"><meta name="translator" content="Gajendra Thakur"><link rel="canonical" href="${canonical}"><link rel="alternate" hreflang="mai" href="${ROOT}/bibliography/resources/${spec.id}/"><link rel="alternate" hreflang="en" href="${ROOT}/en/bibliography/resources/${spec.id}/"><link rel="alternate" hreflang="x-default" href="${ROOT}/bibliography/resources/${spec.id}/"><link rel="stylesheet" href="${BASE}/reading-tools.css"><script type="application/ld+json">${JSON.stringify(ld).replaceAll('<','\\u003c')}</script></head><body><main><nav aria-label="${en?'Breadcrumb':'पथ'}"><a href="${BASE}/${en?'en/':''}bibliography/">${en?'Bibliography':'ग्रन्थसूची'}</a> · <a href="${collectionHref}">${en?'Jagdish Prasad Mandal translation corpus':'जगदीश प्रसाद मण्डल अनुवाद-संग्रह'}</a> · <a href="${other}" hreflang="${en?'mai':'en'}">${en?'मैथिली':'English'}</a></nav><p>${esc(category)}</p><h1>${esc(title)}</h1><section id="scholarly-relation"><h2>${en?'Work and translation relationship':'कृति आ अनुवाद-सम्बन्ध'}</h2>${details(spec,en)}<p>${esc(note)}</p></section><section id="pdf-library"><h2>${en?'Exact English repository PDF':'ठीक अंग्रेजी रिपॉजिटरी PDF'}</h2><p><a href="${esc(pdf.url)}">${esc(pdf.name)} ↗</a> · ${mib(pdf.bytes)}</p><p><strong>SHA-256:</strong> <code>${esc(pdf.sha256)}</code></p><p>${en?'The English manifestation is fingerprinted here; an exact Maithili source PDF is not asserted in this repository record.':'अंग्रेजी संस्करणक फिंगरप्रिन्ट एतय सुरक्षित अछि; एहि रिपॉजिटरी-अभिलेखमे ठीक मैथिली स्रोत-PDF घोषित नहि कएल गेल अछि।'}</p></section></main></body></html>`;
}

const enriched=[];
for(const spec of items){
  const pdf=pdfFor(spec);
  enriched.push({...spec,pdf});
  for(const en of [false,true]){
    const dir=`public/${en?'en/':''}bibliography/resources/${spec.id}`;
    fs.mkdirSync(dir,{recursive:true});
    fs.writeFileSync(path.join(dir,'index.html'),page(spec,pdf,en));
  }
}

function collectionPage(en){
  const title=en?'Jagdish Prasad Mandal — English translations by Gajendra Thakur':'जगदीश प्रसाद मण्डल — गजेन्द्र ठाकुरक अंग्रेजी अनुवाद';
  const canonical=`${ROOT}/${en?'en/':''}bibliography/resources/${COLLECTION}/`;
  const cards=enriched.map(x=>`<article><h2><a href="${BASE}/${en?'en/':''}bibliography/resources/${x.id}/">${esc(en?x.titleEn:x.titleMai)}</a></h2><p>${esc(en?x.categoryEn:x.categoryMai)}</p><p><strong>${en?'Author':'लेखक'}:</strong> ${esc(en?x.author:(x.authorMai||x.author))} · <strong>${en?'Translator':'अनुवादक'}:</strong> Gajendra Thakur</p>${x.originalTitle?`<p><strong>${en?(x.sourceCorpus?'Source corpus':'Maithili original'):(x.sourceCorpus?'मूल मैथिली कथा-संग्रह':'मैथिली मूल')}:</strong> ${esc(x.originalTitle)}</p>`:''}<p><a href="${esc(x.pdf.url)}">${en?'Exact English PDF':'ठीक अंग्रेजी PDF'} ↗</a> · ${mib(x.pdf.bytes)}</p></article>`).join('');
  const ld={'@context':'https://schema.org','@type':'CollectionPage',name:title,url:canonical,about:person('Jagdish Prasad Mandal'),hasPart:enriched.map(x=>({'@type':'Book',name:x.titleEn,author:person(x.author),translator:person('Gajendra Thakur'),url:`${ROOT}/${en?'en/':''}bibliography/resources/${x.id}/`}))};
  return `<!doctype html><html lang="${en?'en':'mai'}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)} | Videha Literary Atlas</title><meta name="description" content="${en?'Four verified English translation resources connected with Jagdish Prasad Mandal, with authorship and translation roles kept distinct.':'जगदीश प्रसाद मण्डलसँ सम्बद्ध चारि सत्यापित अंग्रेजी अनुवाद-स्रोत, जाहिमे लेखन आ अनुवादक भूमिका अलग-अलग स्पष्ट अछि।'}"><link rel="canonical" href="${canonical}"><link rel="alternate" hreflang="mai" href="${ROOT}/bibliography/resources/${COLLECTION}/"><link rel="alternate" hreflang="en" href="${ROOT}/en/bibliography/resources/${COLLECTION}/"><link rel="alternate" hreflang="x-default" href="${ROOT}/bibliography/resources/${COLLECTION}/"><link rel="stylesheet" href="${BASE}/reading-tools.css"><script type="application/ld+json">${JSON.stringify(ld).replaceAll('<','\\u003c')}</script></head><body><main><p><a href="${BASE}/${en?'en/':''}bibliography/">← ${en?'Bibliography':'ग्रन्थसूची'}</a></p><h1>${esc(title)}</h1><p>${en?'This corpus records four English PDFs translated from Maithili by Gajendra Thakur. The biography is Gajendra Thakur’s own Maithili work and his self-translation; the other three preserve Jagdish Prasad Mandal as the source author.':'एहि संग्रहमे गजेन्द्र ठाकुर द्वारा मैथिलीसँ अंग्रेजी अनूदित चारि PDF दर्ज अछि। जीवनी गजेन्द्र ठाकुरक अपन मैथिली कृति आ हुनकर स्व-अनुवाद अछि; शेष तीनूमे मूल लेखक जगदीश प्रसाद मण्डल स्पष्ट रूपेँ सुरक्षित छथि।'}</p>${cards}</main></body></html>`;
}
for(const en of [false,true]){
  const dir=`public/${en?'en/':''}bibliography/resources/${COLLECTION}`;
  fs.mkdirSync(dir,{recursive:true});
  fs.writeFileSync(path.join(dir,'index.html'),collectionPage(en));
}

function patchDoor(file,en){
  if(!fs.existsSync(file))return;
  let html=fs.readFileSync(file,'utf8');
  const href=`${BASE}/${en?'en/':''}bibliography/resources/${COLLECTION}/`;
  const block=`<section id="jpm-translation-corpus"><h2>${en?'Jagdish Prasad Mandal translation corpus':'जगदीश प्रसाद मण्डल अनुवाद-संग्रह'}</h2><p>${en?'Four verified English PDFs: one biography written in Maithili and self-translated by Gajendra Thakur, plus three Jagdish Prasad Mandal works translated from Maithili into English by Gajendra Thakur.':'चारि सत्यापित अंग्रेजी PDF: गजेन्द्र ठाकुर द्वारा मैथिलीमे लिखल आ हुनकेँ द्वारा अंग्रेजीमे स्व-अनूदित एक जीवनी, आ जगदीश प्रसाद मण्डलक तीन कृति जकर मैथिलीसँ अंग्रेजी अनुवाद गजेन्द्र ठाकुर कएने छथि।'}</p><p><a href="${href}">${en?'Open the corpus →':'संग्रह खोलू →'}</a></p></section>`;
  if(!html.includes('id="jpm-translation-corpus"'))html=html.replace('</main>',block+'</main>');
  fs.writeFileSync(file,html);
}
for(const en of [false,true]){
  patchDoor(`public/${en?'en/':''}bibliography/index.html`,en);
  patchDoor(`public/${en?'en/':''}researcher/index.html`,en);
}

const sitemap='public/sitemap.xml';
if(fs.existsSync(sitemap)){
  let xml=fs.readFileSync(sitemap,'utf8');
  const urls=[];
  for(const en of [false,true]){
    urls.push(`${ROOT}/${en?'en/':''}bibliography/resources/${COLLECTION}/`);
    for(const x of items)urls.push(`${ROOT}/${en?'en/':''}bibliography/resources/${x.id}/`);
  }
  const entries=urls.filter(u=>!xml.includes(`<loc>${u}</loc>`)).map(u=>`<url><loc>${u}</loc></url>`).join('');
  if(entries)xml=xml.replace('</urlset>',entries+'</urlset>');
  fs.writeFileSync(sitemap,xml);
}
console.log('Jagdish Prasad Mandal corpus PASS: 4 exact English PDFs; biography authorship/self-translation separated from Mandal-authored translations; no unverified Maithili source PDF asserted.');
