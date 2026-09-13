import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const BASE='/gajendra-preeti';
const ORIGIN='https://videha-ejournal.github.io';
const ROOT='public/criticism/reception';
const source=JSON.parse(fs.readFileSync('content/reception-gists.json','utf8'));
const translations=[
 ...JSON.parse(fs.readFileSync('content/reception-gists-mai-preeti-karan-1.json','utf8')),
 ...JSON.parse(fs.readFileSync('content/reception-gists-mai-preeti-karan-2.json','utf8')),
 ...JSON.parse(fs.readFileSync('content/reception-gists-mai-setusham.json','utf8'))
];
const gt=[
 ...JSON.parse(fs.readFileSync('content/criticism-mai-preeti.json','utf8')),
 ...JSON.parse(fs.readFileSync('content/criticism-mai-g01-g20.json','utf8')),
 ...JSON.parse(fs.readFileSync('content/criticism-mai-g21-g42.json','utf8'))
];
const catalogue=JSON.parse(fs.readFileSync('content/videha-pdf-catalog.snapshot.json','utf8'));
const workCatalogue=JSON.parse(fs.readFileSync('content/catalogue-snapshot.json','utf8'));
const pdfByPath=new Map(catalogue.items.map(x=>[x.path,x]));
const workById=new Map(workCatalogue.map(x=>[x.id,x]));
const tByKey=new Map(translations.map(x=>[`${x.book}:${x.id}`,x]));
const e=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const exact=p=>{const x=pdfByPath.get(p);assert(x,`Missing repository PDF ${p}`);assert(/^[0-9a-f]{64}$/i.test(x.sha256||''),`Missing SHA-256 ${p}`);return x;};
const person=name=>({'@type':'Person',name});
const media=x=>({'@type':'MediaObject',name:x.title||x.name,contentUrl:x.url,encodingFormat:'application/pdf',contentSize:String(x.bytes),identifier:{'@type':'PropertyValue',propertyID:'SHA-256',value:x.sha256}});
const bookCfg={
 'preeti-karan':{
  titleMai:'प्रीति कारण सेतु बान्हल',titleEn:'Preeti Karan Setu Banhal',editor:'Ashish Anchinhar',
  maiPdf:'PREETI_KARAN_SETU_BANHAL.pdf',enPdf:'ENGLISH_PREETI_KARAN_SETU_BANHAL.pdf',
  deckMai:'प्रीति ठाकुर आ गजेन्द्र ठाकुरक काजपर योगदानकर्ता-आधारित समालोचना, संस्मरण, साक्षात्कार आ सम्पादकीय बहस।',
  deckEn:'Contributor-based criticism, memoir, interview and editorial debate on the work of Preeti Thakur and Gajendra Thakur.'
 },
 'setusham':{
  titleMai:'सेतुशम: जीवन्त मैथिली',titleEn:'Setusham: Vibrant Maithili',editor:'Ashish Anchinhar',
  maiPdf:'SETUSHAM.pdf',enPdf:'ENGLISH_SETUSHAM.pdf',
  deckMai:'प्रीति ठाकुर आ गजेन्द्र ठाकुरक साहित्यिक, डिजिटल, अभिलेखीय आ भाषिक काजपर आलोचनात्मक लेखसभक दोसर खण्ड।',
  deckEn:'A second volume of critical essays on the literary, digital, archival and linguistic work of Preeti Thakur and Gajendra Thakur.'
 }
};
for(const b of Object.values(bookCfg)){exact(b.maiPdf);exact(b.enPdf);}
const gtPdf=exact('GT_PT_Criticism.pdf');
assert.equal(source.articles.length,translations.length,'Reception bilingual record parity');
assert.deepEqual(new Set(source.articles.map(x=>`${x.book}:${x.id}`)),new Set(translations.map(x=>`${x.book}:${x.id}`)),'Reception bilingual keys');
assert.equal(new Set(gt.map(x=>x.id)).size,gt.length,'GT/PT chapter IDs must be unique');
for(const x of gt){assert(workById.has(x.id),`Missing work metadata for GT/PT chapter ${x.id}`);assert(Array.isArray(x.paragraphsMai)&&x.paragraphsMai.length>=2,`${x.id} needs two analytical paragraphs`);assert(x.paragraphsMai.every(p=>p.trim().length>120),`${x.id} analytical paragraph too short`);assert(x.lensMai?.trim().length>15,`${x.id} missing critical lens`);assert(x.questionMai?.trim().length>15,`${x.id} missing research question`);}

function chapterRoute(book,id,en=false){return `${BASE}/criticism/reception/${en?'en/':''}${book}/${id}.html`;}
function bookRoute(book,en=false){return `${BASE}/criticism/reception/${en?'en/':''}${book}.html`;}
function shell({lang,title,description,canonical,alternate,body,schema}){
 const alt=alternate?`<link rel="alternate" hreflang="${lang==='en'?'mai':'en'}" href="${ORIGIN}${alternate}">`:'';
 return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${e(title)} | Videha Literary Atlas</title><meta name="description" content="${e(description)}"><link rel="canonical" href="${ORIGIN}${canonical}">${alt}<link rel="alternate" hreflang="x-default" href="${ORIGIN}${canonical}"><link rel="icon" href="${BASE}/icon.svg"><link rel="stylesheet" href="${BASE}/criticism/style.css"><link rel="stylesheet" href="${BASE}/criticism/reception/reception.css"><link rel="stylesheet" href="${BASE}/reading-tools.css"><script defer src="${BASE}/reading-tools.js"></script><script type="application/ld+json">${JSON.stringify(schema).replaceAll('<','\\u003c')}</script></head><body><a class="skip" href="#main">${lang==='en'?'Skip to main content':'मुख्य सामग्रीपर जाउ'}</a><header class="mast"><a class="brand" href="${BASE}/${lang==='en'?'en/':''}">PREETI <span>×</span> GAJENDRA<small>THE VIDEHA LITERARY ATLAS</small></a><nav aria-label="${lang==='en'?'Main navigation':'मुख्य नेविगेशन'}"><a href="${BASE}/${lang==='en'?'en/':''}">${lang==='en'?'Home':'मुखपृष्ठ'}</a><a href="${BASE}/criticism/reception/">${lang==='en'?'Critical-appreciation books':'समालोचना-पोथी'}</a></nav></header><main id="main">${body}</main><div id="videha-reading-tools"></div><footer><p>${lang==='en'?'Critical appreciation with source provenance.':'स्रोत-प्रमाण सहित समालोचनात्मक पाठ।'}</p><small>Videha · ISSN 2229-547X · www.videha.co.in</small></footer></body></html>`;
}
function nav(prev,next,book,en){
 const items=[];
 if(prev)items.push(`<a href="${chapterRoute(book,prev.id,en)}">← ${en?'Previous chapter':'पछिला अध्याय'}</a>`);
 items.push(`<a href="${bookRoute(book,en)}">${en?'Book contents':'पोथीक विषय-सूची'}</a>`);
 if(next)items.push(`<a href="${chapterRoute(book,next.id,en)}">${en?'Next chapter':'अगिला अध्याय'} →</a>`);
 return `<nav class="chapter-nav" aria-label="${en?'Chapter navigation':'अध्याय नेविगेशन'}">${items.join(' · ')}</nav>`;
}
function receptionContext(a,en){
 const focus=a.group==='preeti'?(en?'Preeti Thakur and her creative/archival work':'प्रीति ठाकुर आ हुनक सर्जनात्मक/अभिलेखीय काज'):a.group==='gajendra'?(en?'Gajendra Thakur, Videha and the wider literary-digital project':'गजेन्द्र ठाकुर, विदेह आ व्यापक साहित्यिक-डिजिटल परियोजना'):(en?'editorial framing and contextual material':'सम्पादकीय रूपरेखा आ प्रसंग-सामग्री');
 const kind=a.kind==='contribution'?(en?'signed contribution':'हस्ताक्षरित योगदान'):a.kind==='editorial'?(en?'editorial framing':'सम्पादकीय रूपरेखा'):(en?'supporting material':'सहायक सामग्री');
 return en?`This is a ${kind} in the volume’s ${focus} strand. The page preserves the contributor’s attribution, the normalized chapter identity, the English-edition locator, and the paired Maithili/English repository manifestations so that the critical argument can be read in its book context rather than as an isolated quotation.`:`ई पोथीक ${focus} धाराक ${kind} अछि। एहि पृष्ठपर योगदानकर्ताक श्रेय, सामान्यीकृत अध्याय-पहिचान, अंग्रेजी संस्करणक पृष्ठ-संकेत आ मैथिली/अंग्रेजी दुनू रिपॉजिटरी संस्करण सुरक्षित अछि, जाहिसँ आलोचनात्मक तर्ककेँ अलग उद्धरण नहि, पोथीक प्रसंगमे पढ़ल जा सकय।`;
}
function receptionChapter(a,index,rows,en){
 const cfg=bookCfg[a.book], t=tByKey.get(`${a.book}:${a.id}`);assert(t,`Missing Maithili row ${a.book}:${a.id}`);
 const pdf=exact(en?cfg.enPdf:cfg.maiPdf), otherPdf=exact(en?cfg.maiPdf:cfg.enPdf);
 const title=en?a.title:t.titleMai, gist=en?a.gist:t.gistMai, note=en?a.note:t.noteMai;
 const bookTitle=en?cfg.titleEn:cfg.titleMai;
 const canonical=chapterRoute(a.book,a.id,en), alternate=chapterRoute(a.book,a.id,!en);
 const description=gist.replace(/\s+/g,' ').slice(0,260);
 const schema={'@context':'https://schema.org','@type':'ScholarlyArticle',name:title,headline:title,inLanguage:en?'en':'mai',author:person(a.author),isPartOf:{'@type':'Book',name:bookTitle,editor:person(cfg.editor),encoding:media(pdf),url:ORIGIN+bookRoute(a.book,en)},about:[person('Gajendra Thakur'),person('Preeti Thakur')],url:ORIGIN+canonical};
 if(en){schema.pagination=`${a.start}-${a.end}`;schema.translationOfWork={'@type':'ScholarlyArticle',name:t.titleMai,inLanguage:'mai',isPartOf:{'@type':'Book',name:cfg.titleMai,encoding:media(otherPdf)}};}
 const locator=en?`<p><strong>Repository locator:</strong> <a href="${e(pdf.url)}#page=${a.start}">${e(pdf.name)} · PDF pp. ${a.start}–${a.end} ↗</a></p>`:`<p><strong>रिपॉजिटरी स्रोत:</strong> <a href="${e(pdf.url)}">${e(pdf.name)} ↗</a></p><p class="version-note">मैथिली PDF क पृष्ठ-संख्या एतय अनुमानसँ नहि देल गेल अछि। अध्याय-पहिचान युग्मित अंग्रेजी संस्करणक सत्यापित लेख-अभिलेखसँ मिलाओल अछि; अंग्रेजी संस्करणमे एहि लेखक locator pp. ${a.start}–${a.end} अछि।</p>`;
 const body=`<nav class="breadcrumb"><a href="${bookRoute(a.book,en)}">${e(bookTitle)}</a><span>/</span><span>${e(a.id.toUpperCase())}</span></nav><article class="full-gist chapter-page"><p class="eyebrow">${en?'CRITICAL-APPRECIATION CHAPTER':'समालोचना-अध्याय'} · ${e(a.id.toUpperCase())}</p><h1>${e(title)}</h1><p class="contributor">${e(a.author)}</p><section><h2>${en?'Detailed description':'विस्तृत विवरण'}</h2><p class="gist-prose">${e(gist)}</p><p>${e(receptionContext(a,en))}</p>${note?`<p class="version-note"><strong>${en?'Source note':'स्रोत-टिप्पणी'}.</strong> ${e(note)}</p>`:''}</section><section id="source"><h2>${en?'Source edition and provenance':'स्रोत-संस्करण आ प्रमाण'}</h2>${locator}<p><strong>SHA-256:</strong> <code>${e(pdf.sha256)}</code></p><p>${en?'Paired Maithili edition':'युग्मित अंग्रेजी संस्करण'}: <a href="${e(otherPdf.url)}">${e(otherPdf.name)} ↗</a></p></section>${nav(rows[index-1],rows[index+1],a.book,en)}</article>`;
 return shell({lang:en?'en':'mai',title,description,canonical,alternate,body,schema});
}

for(const book of Object.keys(bookCfg)){
 const rows=source.articles.filter(x=>x.book===book);
 for(const en of [false,true]){
  const outDir=path.join(ROOT,en?'en':'',book);fs.mkdirSync(outDir,{recursive:true});
  rows.forEach((a,i)=>fs.writeFileSync(path.join(outDir,`${a.id}.html`),receptionChapter(a,i,rows,en)));
  const landing=path.join(ROOT,en?'en':'',`${book}.html`);assert(fs.existsSync(landing),`Missing reception landing ${landing}`);
  let html=fs.readFileSync(landing,'utf8');
  for(const a of rows){
   const target=chapterRoute(book,a.id,en);
   html=html.replaceAll(`href="#${a.id}"`,`href="${target}"`);
   html=html.replaceAll(`${book}.html#${a.id}`,`${book}/${a.id}.html`);
  }
  const section=`<section id="permanent-chapter-pages" class="volume-jump-index"><h2>${en?'Permanent chapter pages':'स्थायी अध्याय-पृष्ठ'}</h2><p>${en?'Every editorial, signed contribution and supporting item has an independent, citable page with a substantive description and repository provenance.':'सभ सम्पादकीय, हस्ताक्षरित योगदान आ सहायक सामग्रीक स्वतंत्र, उद्धरण-योग्य पृष्ठ अछि, जाहिमे विस्तृत विवरण आ रिपॉजिटरी प्रमाण देल अछि।'}</p><ol>${rows.map(a=>{const t=tByKey.get(`${book}:${a.id}`);return `<li><a href="${chapterRoute(book,a.id,en)}">${e(en?a.title:t.titleMai)}</a><small>${e(a.author)}</small></li>`;}).join('')}</ol></section>`;
  if(!html.includes('id="permanent-chapter-pages"'))html=html.replace('</main>',section+'</main>');
  fs.writeFileSync(landing,html);
 }
}

const gtDir=path.join(ROOT,'gt-pt-criticism');fs.mkdirSync(gtDir,{recursive:true});
function gtTitle(x){const m=workById.get(x.id);return m?.title||x.id.toUpperCase();}
function gtChapter(x,index){
 const title=gtTitle(x), canonical=`${BASE}/criticism/reception/gt-pt-criticism/${x.id}.html`;
 const schema={'@context':'https://schema.org','@type':'Chapter',name:title,inLanguage:'mai',isPartOf:{'@type':'Book',name:'GT_PT Criticism — Gajendra Thakur & Preeti Thakur',inLanguage:'mai',encoding:media(gtPdf),url:ORIGIN+`${BASE}/criticism/reception/gt-pt-criticism.html`},about:x.id.startsWith('p')?person('Preeti Thakur'):person('Gajendra Thakur'),url:ORIGIN+canonical};
 const body=`<nav class="breadcrumb"><a href="${BASE}/criticism/reception/gt-pt-criticism.html">GT_PT Criticism</a><span>/</span><span>${e(x.id.toUpperCase())}</span></nav><article class="full-gist chapter-page"><p class="eyebrow">GT_PT CRITICISM · ${e(x.id.toUpperCase())}</p><h1>${e(title)}</h1><p class="intro">${e(x.lensMai)}</p><section><h2>विस्तृत समालोचनात्मक विवरण</h2>${x.paragraphsMai.map(p=>`<p class="gist-prose">${e(p)}</p>`).join('')}</section><section><h2>शोध-प्रश्न</h2><p>${e(x.questionMai)}</p></section><section id="source"><h2>स्रोत-पोथी आ प्रमाण</h2><p><a href="${e(gtPdf.url)}">${e(gtPdf.name)} ↗</a></p><p><strong>SHA-256:</strong> <code>${e(gtPdf.sha256)}</code></p><p>ई पृष्ठ संग्रहक अध्याय-पहिचान, विस्तृत आलोचनात्मक पाठ आ मूल रिपॉजिटरी PDF केँ एकठाम जोड़ैत अछि। PDF पृष्ठ-संख्या अनुमानसँ नहि देल गेल अछि।</p></section>${nav(gt[index-1],gt[index+1],'gt-pt-criticism',false)}</article>`;
 return shell({lang:'mai',title,description:`${x.lensMai} ${x.paragraphsMai[0]}`.slice(0,260),canonical,body,schema});
}
gt.forEach((x,i)=>fs.writeFileSync(path.join(gtDir,`${x.id}.html`),gtChapter(x,i)));
const preeti=gt.filter(x=>x.id.startsWith('p')), gajendra=gt.filter(x=>x.id.startsWith('g'));
const gtLanding=`<section class="reception-hero volume-hero"><p class="eyebrow">MAITHILI CRITICAL-APPRECIATION COLLECTION</p><h1>GT_PT Criticism</h1><p class="intro">गजेन्द्र ठाकुर आ प्रीति ठाकुरक काजपर विस्तृत मैथिली समालोचनात्मक पाठक संग्रह। प्रत्येक अध्याय स्वतंत्र स्थायी पृष्ठक रूपमे उपलब्ध अछि।</p><p><a href="${e(gtPdf.url)}">मूल रिपॉजिटरी PDF खोलू ↗</a> · <strong>SHA-256:</strong> <code>${e(gtPdf.sha256)}</code></p></section><section class="volume-jump-index"><h2>प्रीति ठाकुर — ${preeti.length} अध्याय</h2><ol>${preeti.map(x=>`<li><a href="${BASE}/criticism/reception/gt-pt-criticism/${x.id}.html">${e(gtTitle(x))}</a><small>${e(x.lensMai)}</small></li>`).join('')}</ol><h2>गजेन्द्र ठाकुर — ${gajendra.length} अध्याय</h2><ol>${gajendra.map(x=>`<li><a href="${BASE}/criticism/reception/gt-pt-criticism/${x.id}.html">${e(gtTitle(x))}</a><small>${e(x.lensMai)}</small></li>`).join('')}</ol></section>`;
fs.writeFileSync(path.join(ROOT,'gt-pt-criticism.html'),shell({lang:'mai',title:'GT_PT Criticism — गजेन्द्र ठाकुर आ प्रीति ठाकुर',description:'गजेन्द्र ठाकुर आ प्रीति ठाकुरक काजपर विस्तृत मैथिली समालोचना-संग्रह; सभ अध्याय स्वतंत्र स्थायी पृष्ठक रूपमे।',canonical:`${BASE}/criticism/reception/gt-pt-criticism.html`,body:gtLanding,schema:{'@context':'https://schema.org','@type':'Book',name:'GT_PT Criticism — Gajendra Thakur & Preeti Thakur',inLanguage:'mai',about:[person('Gajendra Thakur'),person('Preeti Thakur')],encoding:media(gtPdf),hasPart:gt.map(x=>({'@type':'Chapter',name:gtTitle(x),url:ORIGIN+`${BASE}/criticism/reception/gt-pt-criticism/${x.id}.html`}))}}));

function manifestationCards(en){
 const cards=[];
 for(const [book,cfg] of Object.entries(bookCfg)){
  const rows=source.articles.filter(x=>x.book===book);
  for(const lang of ['mai','en']){
   const pdf=exact(lang==='mai'?cfg.maiPdf:cfg.enPdf);
   const route=bookRoute(book,lang==='en');
   const label=lang==='mai'?(en?'Maithili edition':'मैथिली संस्करण'):(en?'English edition':'अंग्रेजी संस्करण');
   cards.push(`<article class="volume-card"><p class="eyebrow">${label} · ${rows.length} ${en?'chapter/article records':'अध्याय/लेख अभिलेख'}</p><h3><a href="${route}">${e(lang==='mai'?cfg.titleMai:cfg.titleEn)}</a></h3><p>${e(lang==='mai'?cfg.deckMai:cfg.deckEn)}</p><p><a href="${e(pdf.url)}">${e(pdf.name)} ↗</a></p></article>`);
  }
 }
 cards.push(`<article class="volume-card"><p class="eyebrow">${en?'Maithili edition':'मैथिली संस्करण'} · ${gt.length} ${en?'chapters':'अध्याय'}</p><h3><a href="${BASE}/criticism/reception/gt-pt-criticism.html">GT_PT Criticism</a></h3><p>${en?'Maithili critical-appreciation collection on the works of Gajendra Thakur and Preeti Thakur; every chapter has an independent permanent page.':'गजेन्द्र ठाकुर आ प्रीति ठाकुरक काजपर मैथिली समालोचना-संग्रह; सभ अध्याय स्वतंत्र स्थायी पृष्ठपर उपलब्ध।'}</p><p><a href="${e(gtPdf.url)}">${e(gtPdf.name)} ↗</a></p></article>`);
 return cards.join('');
}
for(const en of [false,true]){
 const index=path.join(ROOT,en?'en':'','index.html');assert(fs.existsSync(index),`Missing reception index ${index}`);let html=fs.readFileSync(index,'utf8');
 for(const a of source.articles){
  const old=`${BASE}/criticism/reception/${en?'en/':''}${a.book}.html#${a.id}`;
  html=html.replaceAll(old,chapterRoute(a.book,a.id,en));
 }
 const five=`<section id="five-critical-appreciation-books"><p class="eyebrow">${en?'VERIFIED REPOSITORY BOOKS':'सत्यापित रिपॉजिटरी पोथी'}</p><h2>${en?'Five critical-appreciation books / manifestations':'पाँच समालोचना-पोथी / संस्करण'}</h2><p>${en?'Setusham and Preeti Karan Setu Banhal are preserved in both Maithili and English; GT_PT Criticism is preserved in Maithili. All five are treated here as critical-appreciation sources on the work of Gajendra Thakur and Preeti Thakur, with chapter-level permanent pages rather than stubs.':'सेतुशम आ प्रीति कारण सेतु बान्हल मैथिली आ अंग्रेजी दुनू संस्करणमे सुरक्षित अछि; GT_PT Criticism मैथिलीमे सुरक्षित अछि। पाँचूकेँ गजेन्द्र ठाकुर आ प्रीति ठाकुरक काजपर समालोचना-स्रोत रूपमे एकठाम राखल गेल अछि, आ अध्यायसभकेँ stub नहि, विस्तृत स्थायी पृष्ठ देल गेल अछि।'}</p><div class="volume-grid">${manifestationCards(en)}</div></section>`;
 if(!html.includes('id="five-critical-appreciation-books"'))html=html.replace('</main>',five+'</main>');
 fs.writeFileSync(index,html);
}

console.log(`Built five-book critical-appreciation corpus: ${source.articles.length} normalized reception records × 2 languages plus ${gt.length} GT/PT Maithili chapters.`);
