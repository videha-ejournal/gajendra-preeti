import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const sourceDir='content/drama-classics';
const out='public/drama-classics';
const readJson=file=>JSON.parse(fs.readFileSync(path.join(sourceDir,file),'utf8'));
const audit=readJson('source-audit.json');
const rang=readJson('rang-sangam.json');
const sanskrit=['sanskrit-classics-01-05.json','sanskrit-classics-06-09.json','sanskrit-classics-10-13.json'].flatMap(file=>readJson(file).records||[]).sort((a,b)=>a.order-b.order);

assert.equal(sanskrit.length,13,'Sanskrit Classics must contain exactly 13 works.');
assert.deepEqual(sanskrit.map(r=>r.order),Array.from({length:13},(_,i)=>i+1),'Sanskrit work order must be 1..13.');
assert.equal(new Set(sanskrit.map(r=>r.id)).size,13,'Duplicate Sanskrit work id.');
assert.equal(rang.collection?.workCount,9,'Rang-Sangam must declare nine plays.');
assert.equal(rang.records?.length,9,'Rang-Sangam must contain exactly nine plays.');
assert.deepEqual(rang.records.map(r=>r.order),Array.from({length:9},(_,i)=>i+1),'Rang-Sangam order must be 1..9.');
assert.equal(new Set(rang.records.map(r=>r.id)).size,9,'Duplicate Rang-Sangam work id.');

const auditSanskrit=audit.collections?.find(c=>c.id==='sanskrit-classics');
const auditRang=audit.collections?.find(c=>c.id==='rang-sangam');
assert(auditSanskrit&&auditRang,'Source audit must contain both collections.');
assert.deepEqual(sanskrit.map(r=>r.id),auditSanskrit.works.map(w=>w.id),'Sanskrit records must match source audit.');
assert.deepEqual(rang.records.map(r=>r.id),auditRang.works.map(w=>w.id),'Rang-Sangam records must match source audit.');

const normalizedUnits=r=>{
  if(Array.isArray(r.units)&&r.units.length) return r.units;
  let source=[];
  if(Array.isArray(r.subworks)&&r.subworks.length) source=r.subworks;
  else if(Array.isArray(r.parts)&&r.parts.length) source=r.parts;
  else if(Array.isArray(r.waves)&&r.waves.length) source=r.waves;
  return source.map(s=>({
    n:s.n,
    mai:s.mai,
    en:s.en,
    gistMai:s.gistMai,
    gistEn:s.gistEn,
    unitCount:s.unitCount||null,
    subunits:Array.isArray(s.units)?s.units:Array.isArray(s.acts)?s.acts:[]
  }));
};
const inspect=(r,label)=>{
  for(const key of ['id','titleMai','titleEn','summaryMai','summaryEn']) assert(String(r[key]||'').trim(),`${label}/${r.id}: missing ${key}`);
  const units=normalizedUnits(r);
  assert(units.length>0,`${label}/${r.id}: missing source-defined units/parts/subworks/waves`);
  for(const u of units){
    assert(String(u.mai||'').trim(),`${r.id}: unit missing Maithili title`);
    assert(String(u.en||'').trim(),`${r.id}: unit missing English title`);
    assert(String(u.gistMai||'').trim(),`${r.id}: unit missing Maithili gist`);
    assert(String(u.gistEn||'').trim(),`${r.id}: unit missing English gist`);
  }
};
sanskrit.forEach(r=>inspect(r,'sanskrit-classics'));
rang.records.forEach(r=>inspect(r,'rang-sangam'));

const records=[
  ...sanskrit.map(r=>({...r,units:normalizedUnits(r),collectionId:'sanskrit-classics',collectionMai:'संस्कृत साहित्य-संग्रह — १३ पुस्तक',collectionEn:'Sanskrit Literature Collection — 13 Books'})),
  ...rang.records.map(r=>({...r,units:normalizedUnits(r),collectionId:'rang-sangam',collectionMai:rang.collection.titleMai,collectionEn:rang.collection.titleEn}))
];
assert.equal(records.length,22,'Reader must contain exactly 22 works.');

const manifest={
  titleMai:'नाटक आ संस्कृत साहित्य · द्विभाषी शोध-रीडर',
  titleEn:'Drama & Sanskrit Classics · Bilingual Research Reader',
  workCount:22,
  collectionCounts:{'sanskrit-classics':13,'rang-sangam':9},
  sourceFiles:[auditSanskrit.sourceFile,auditRang.sourceFile],
  sourcePolicy:audit.sourcePolicy,
  routes:audit.intendedRoutes,
  generatedFrom:'source-audited bilingual study records'
};
fs.rmSync(out,{recursive:true,force:true});
fs.mkdirSync(path.join(out,'en'),{recursive:true});
fs.writeFileSync(path.join(out,'manifest.json'),JSON.stringify(manifest,null,2));
fs.writeFileSync(path.join(out,'data.json'),JSON.stringify({manifest,records}));

const esc=s=>String(s??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const page=lang=>{
  const en=lang==='en',prefix=en?'../':'';
  const canonical=`https://videha-ejournal.github.io/gajendra-preeti/drama-classics/${en?'en/':''}`;
  const alternate=`https://videha-ejournal.github.io/gajendra-preeti/drama-classics/${en?'':'en/'}`;
  const title=en?'Drama & Sanskrit Classics — Bilingual Research Reader':'नाटक आ संस्कृत साहित्य — द्विभाषी शोध-रीडर';
  const desc=en?'A source-grounded bilingual research reader for 13 Sanskrit classics and nine Rang-Sangam Maithili plays, preserving supplied acts, scenes, parts, waves, interludes and continuous-text structures.':'१३ संस्कृत साहित्य-कृति आ रंग-संगमक नओटा मैथिली नाटकक स्रोत-आधारित द्विभाषी शोध-रीडर—मूल अंक, दृश्य, भाग, कल्लोल, प्रवेशक आ निरन्तर पाठ-संरचना सुरक्षित।';
  return `<!doctype html><html lang="${en?'en':'mai'}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title><meta name="description" content="${esc(desc)}"><link rel="canonical" href="${canonical}"><link rel="alternate" hreflang="${en?'mai':'en'}" href="${alternate}"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:type" content="website"><meta property="og:url" content="${canonical}"><meta name="twitter:card" content="summary"><link rel="stylesheet" href="${prefix}style.css"><script type="application/ld+json">${JSON.stringify({'@context':'https://schema.org','@type':'CollectionPage',name:title,url:canonical,description:desc,numberOfItems:22,about:[{'@type':'CreativeWorkSeries',name:'Sanskrit Literature Collection — 13 Books'},{'@type':'CreativeWorkSeries',name:'Rang-Sangam — Nine Maithili Plays'}]})}</script></head><body data-lang="${lang}" data-source="${prefix}data.json"><a class="skip" href="#explorer">${en?'Skip to research explorer':'शोध-अन्वेषक पर जाउ'}</a><header class="hero"><nav><a href="/gajendra-preeti/">${en?'Maithili home':'मुख्य पृष्ठ'}</a><a href="/gajendra-preeti/en/">English home</a><a href="${en?'../':'en/'}" hreflang="${en?'mai':'en'}">${en?'मैथिली संस्करण':'English edition'}</a></nav><p class="kicker">VIDEHA · ISSN 2229-547X · SOURCE-GROUNDED RESEARCH READER</p><h1>${en?'Drama & Sanskrit Classics':'नाटक आ संस्कृत साहित्य'}</h1><p class="dek">${en?'Twenty-two complete study entries: thirteen Sanskrit classics in Gajendra Thakur’s Maithili translation programme and nine Rang-Sangam Maithili plays with English stage counterparts.':'बाइस पूर्ण अध्ययन-प्रविष्टि: गजेन्द्र ठाकुरक मैथिली अनुवाद-परियोजनाक तेरह संस्कृत कृति आ English रंगमंचीय रूपान्तर सहित रंग-संगमक नओटा मैथिली नाटक।'}</p><div class="stats"><span><strong>22</strong>${en?'works':'कृति'}</span><span><strong>13</strong>${en?'Sanskrit classics':'संस्कृत कृति'}</span><span><strong>9</strong>${en?'Rang-Sangam plays':'रंग-संगम नाटक'}</span></div></header><section class="method"><h2>${en?'Editorial method':'सम्पादकीय पद्धति'}</h2><p>${en?'Every study entry is grounded in the supplied bilingual source editions. Acts, scenes, parts, waves, prologues, interludes and continuous texts follow those sources; no missing divisions have been silently invented. Composite works retain their source subworks and nested divisions.':'सभ अध्ययन-प्रविष्टि उपलब्ध द्विभाषी स्रोत-संस्करणपर आधारित अछि। अंक, दृश्य, भाग, कल्लोल, प्रस्तावना, प्रवेशक आ निरन्तर पाठ स्रोतक अनुसार राखल गेल अछि; अनुपस्थित विभाजन चुपचाप गढ़ल नहि गेल अछि। संयुक्त कृतिमे स्रोतक उपकृति आ भीतरी विभाजन सेहो सुरक्षित अछि।'}</p></section><main id="explorer" tabindex="-1"><div class="controls" role="search"><label>${en?'Search work, character, theme or unit':'कृति, पात्र, विषय वा इकाइ खोजू'}<input id="q" type="search" autocomplete="off" placeholder="${en?'e.g. Sita, signet, ecology, prahasana':'जेना सीता, मुद्रिका, पर्यावरण, प्रहसन'}"></label><label>${en?'Collection':'संग्रह'}<select id="collection"><option value="">${en?'Both collections':'दुनू संग्रह'}</option><option value="sanskrit-classics">${en?'Sanskrit Classics — 13':'संस्कृत साहित्य — १३'}</option><option value="rang-sangam">${en?'Rang-Sangam — 9':'रंग-संगम — ९'}</option></select></label><label>${en?'Work':'कृति'}<select id="work"><option value="">${en?'All 22 works':'सभ २२ कृति'}</option></select></label><label>${en?'Reading language':'पढ़बाक भाषा'}<select id="language"><option value="mai">मैथिली</option><option value="en">English</option><option value="both">${en?'Bilingual':'द्विभाषी'}</option></select></label></div><p id="result-count" class="result-count" aria-live="polite"></p><div id="records" class="records"></div></main><footer><p>© Gajendra Thakur, Editor Videha — First Maithili Fortnightly eJournal ISSN 2229-547X</p><p>${en?'Source-defined divisions preserved · Maithili + English':'स्रोत-निर्धारित विभाजन सुरक्षित · मैथिली + English'}</p></footer><script src="${prefix}reader.js" defer></script></body></html>`;
};
fs.writeFileSync(path.join(out,'index.html'),page('mai'));
fs.writeFileSync(path.join(out,'en','index.html'),page('en'));

const css=`:root{--paper:#f3efe5;--ink:#1b211e;--muted:#60665f;--line:#c9c0ae;--card:#fffdf7;--deep:#173b33;--deep2:#235348;--wash:#e9e1d1;--accent:#7a3027}*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:var(--paper);color:var(--ink);font-family:Georgia,'Noto Serif Devanagari','Noto Serif',serif;line-height:1.67}.skip{position:absolute;left:-9999px}.skip:focus{left:1rem;top:1rem;z-index:20;background:#fff;padding:.7rem 1rem}.hero{padding:1.2rem max(5vw,1rem) 3.5rem;background:linear-gradient(135deg,var(--deep),var(--deep2));color:#f8f2e5}.hero nav{display:flex;gap:1rem;flex-wrap:wrap;font:700 .8rem system-ui}.hero nav a{color:#fff}.kicker{margin:3.5rem 0 .75rem;letter-spacing:.12em;font:700 .72rem system-ui}.hero h1{font-size:clamp(2.8rem,7vw,6.6rem);max-width:12ch;line-height:.96;margin:0}.dek{max-width:62rem;font-size:clamp(1.05rem,2vw,1.4rem)}.stats{display:flex;gap:.8rem;flex-wrap:wrap;margin-top:1.8rem}.stats span{border:1px solid #ffffff55;padding:.65rem .9rem;font:600 .84rem system-ui}.stats strong{font-size:1.55rem;margin-right:.4rem}.method,main{max-width:1240px;margin:auto;padding:2rem max(3vw,1rem)}.method{border-bottom:1px solid var(--line)}.controls{position:sticky;top:0;z-index:8;background:color-mix(in srgb,var(--paper) 95%,transparent);backdrop-filter:blur(10px);display:grid;grid-template-columns:2fr 1fr 1.4fr 1fr;gap:.75rem;padding:1rem 0;border-bottom:1px solid var(--line)}label{font:700 .73rem system-ui}input,select{display:block;width:100%;margin-top:.35rem;padding:.72rem;border:1px solid var(--line);background:#fff;color:var(--ink);font:inherit}.result-count{font:700 .8rem system-ui;color:var(--muted)}.records{display:grid;gap:1rem}.record{background:var(--card);border:1px solid var(--line);padding:clamp(1rem,3vw,2rem)}.record.rang{border-left:5px solid var(--accent)}.meta{display:flex;gap:.45rem;flex-wrap:wrap;font:700 .72rem system-ui;color:var(--deep);text-transform:uppercase}.badge{border:1px solid currentColor;padding:.16rem .43rem}.record h2{font-size:clamp(1.4rem,3vw,2.25rem);line-height:1.18;margin:.65rem 0 .25rem}.subtitle{font-style:italic;color:var(--muted)}.bilingual{display:grid;grid-template-columns:1fr 1fr;gap:1.4rem}.langtag{font:800 .7rem system-ui;letter-spacing:.12em;color:var(--accent);text-transform:uppercase}.units{border-top:1px solid var(--line);margin-top:1rem;padding-top:.8rem}.units>summary{cursor:pointer;font:800 .82rem system-ui}.unitlist{display:grid;gap:.55rem;margin-top:.8rem}.unit{background:var(--wash);padding:.75rem .85rem}.unit strong{display:block}.unit p{margin:.3rem 0 0;font-size:.94rem}.subunits{margin:.45rem 0 0;padding-left:1.25rem;font-size:.88rem}.only-mai .en,.only-en .mai{display:none}.only-mai .bilingual,.only-en .bilingual{display:block}footer{background:#132f29;color:#eee5d5;padding:2rem max(5vw,1rem);font-size:.9rem;margin-top:3rem}@media(max-width:850px){.controls{position:static;grid-template-columns:1fr 1fr}.bilingual{grid-template-columns:1fr}}@media(max-width:560px){.controls{grid-template-columns:1fr}.record{padding:1rem}}@media print{.hero nav,.controls,.skip{display:none}.record{break-inside:avoid}.hero{background:none;color:#000;padding:0}}`;
fs.writeFileSync(path.join(out,'style.css'),css);

const js=`(()=>{const body=document.body,lang0=body.dataset.lang||'mai',source=body.dataset.source||'data.json';const q=document.querySelector('#q'),collection=document.querySelector('#collection'),work=document.querySelector('#work'),language=document.querySelector('#language'),box=document.querySelector('#records'),count=document.querySelector('#result-count');const esc=s=>String(s??'').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));let data=[];const norm=s=>String(s??'').toLocaleLowerCase();function populate(){work.innerHTML='<option value="">'+(lang0==='en'?'All 22 works':'सभ २२ कृति')+'</option>'+data.map(r=>'<option value="'+esc(r.id)+'">'+esc(lang0==='en'?r.titleEn:r.titleMai)+'</option>').join('')}function nested(u){const xs=Array.isArray(u.subunits)?u.subunits:[],ct=u.unitCount?(lang0==='en'?u.unitCount+' source verses':u.unitCount+' स्रोत पद्य'):'';return(ct?'<small>'+esc(ct)+'</small>':'')+(xs.length?'<ul class="subunits">'+xs.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul>':'')}function unitHtml(u,mode){const mai='<div class="mai"><strong>'+esc(u.mai)+'</strong><p>'+esc(u.gistMai)+'</p>'+nested(u)+'</div>',en='<div class="en"><strong>'+esc(u.en)+'</strong><p>'+esc(u.gistEn)+'</p>'+nested(u)+'</div>';return '<div class="unit '+(mode==='both'?'bilingual':'')+'">'+(mode==='en'?en:mode==='mai'?mai:mai+en)+'</div>'}function card(r,mode){const mai='<div class="langcol mai"><div class="langtag">मैथिली</div><h2>'+esc(r.titleMai)+'</h2>'+(r.subtitleMai?'<p class="subtitle">'+esc(r.subtitleMai)+'</p>':'')+'<p>'+esc(r.summaryMai)+'</p></div>',en='<div class="langcol en"><div class="langtag">English</div><h2>'+esc(r.titleEn)+'</h2>'+(r.subtitleEn?'<p class="subtitle">'+esc(r.subtitleEn)+'</p>':'')+'<p>'+esc(r.summaryEn)+'</p></div>';return '<article class="record '+(r.collectionId==='rang-sangam'?'rang':'')+'"><div class="meta"><span class="badge">'+esc(r.collectionId==='rang-sangam'?(lang0==='en'?'Rang-Sangam':'रंग-संगम'):(lang0==='en'?'Sanskrit Classics':'संस्कृत साहित्य'))+'</span><span>#'+r.order+'</span><span>'+esc(r.kind||'work')+'</span></div><div class="'+(mode==='both'?'bilingual':'')+'">'+(mode==='en'?en:mode==='mai'?mai:mai+en)+'</div><details class="units"><summary>'+(lang0==='en'?'Source-defined structure':'स्रोत-निर्धारित संरचना')+' · '+r.units.length+'</summary><div class="unitlist">'+r.units.map(u=>unitHtml(u,mode)).join('')+'</div></details></article>'}function render(){const text=norm(q.value),c=collection.value,w=work.value,mode=language.value;const rows=data.filter(r=>{if(c&&r.collectionId!==c)return false;if(w&&r.id!==w)return false;if(!text)return true;return norm([r.titleMai,r.titleEn,r.subtitleMai,r.subtitleEn,r.summaryMai,r.summaryEn,r.authorMai,r.authorEn,r.kind,...r.units.flatMap(u=>[u.mai,u.en,u.gistMai,u.gistEn,...(u.subunits||[])])].join(' ')).includes(text)});count.textContent=lang0==='en'?rows.length+' of 22 works shown':'२२ मे '+rows.length+' कृति देखाओल गेल';box.innerHTML=rows.map(r=>card(r,mode)).join('')||'<p>'+(lang0==='en'?'No matching work.':'कोनो मेल खाइत कृति नहि भेटल।')+'</p>'}fetch(source).then(r=>{if(!r.ok)throw new Error('data');return r.json()}).then(x=>{data=x.records||[];populate();language.value=lang0==='en'?'en':'mai';[q,collection,work,language].forEach(el=>el.addEventListener(el===q?'input':'change',render));render()}).catch(()=>{count.textContent=lang0==='en'?'The research data could not be loaded.':'शोध-सामग्री लोड नहि भऽ सकल।'})})();`;
fs.writeFileSync(path.join(out,'reader.js'),js);

const sitemapPath='public/sitemap.xml';
if(fs.existsSync(sitemapPath)){
  let sitemap=fs.readFileSync(sitemapPath,'utf8');
  for(const url of ['https://videha-ejournal.github.io/gajendra-preeti/drama-classics/','https://videha-ejournal.github.io/gajendra-preeti/drama-classics/en/']) if(!sitemap.includes(`<loc>${url}</loc>`)) sitemap=sitemap.replace('</urlset>',`  <url><loc>${url}</loc></url>\n</urlset>`);
  fs.writeFileSync(sitemapPath,sitemap);
}
console.log('Built Drama & Sanskrit Classics bilingual reader: 22 works (13 Sanskrit Classics + 9 Rang-Sangam), preserving units, parts, subworks and waves.');
