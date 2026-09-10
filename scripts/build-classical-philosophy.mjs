import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const sourceDir='content/classical-philosophy';
const destination='public/classical-philosophy';
const specs=[
  ['atmatattvaviveka.json','atmatattvaviveka',4],
  ['bhamati.json','bhamati',4],
  ['nyayakusumanjali.json','nyayakusumanjali',12],
  ['tattvacintamani.json','tattvacintamani',12]
];
const books=specs.map(([file,id,count])=>{
  const payload=JSON.parse(fs.readFileSync(path.join(sourceDir,file),'utf8'));
  assert.equal(payload.book?.id,id,`${file}: book id mismatch`);
  assert.equal(payload.book?.unitCount,count,`${file}: declared unit count mismatch`);
  assert.equal(payload.records?.length,count,`${file}: record count mismatch`);
  assert.deepEqual(payload.records.map(r=>r.order),Array.from({length:count},(_,i)=>i+1),`${file}: unit order must be complete`);
  assert.equal(new Set(payload.records.map(r=>r.id)).size,count,`${file}: duplicate record id`);
  for(const r of payload.records){
    assert(String(r.titleMai||'').trim(),`${r.id}: missing Maithili title`);
    assert(String(r.titleEn||'').trim(),`${r.id}: missing English title`);
    assert(String(r.summaryMai||'').trim(),`${r.id}: missing Maithili summary`);
    assert(String(r.summaryEn||'').trim(),`${r.id}: missing English summary`);
  }
  return payload;
});
const records=books.flatMap(b=>b.records.map(r=>({...r,bookId:b.book.id,bookTitleMai:b.book.titleMai,bookTitleEn:b.book.titleEn,author:b.book.author})));
assert.equal(records.length,32,'Classical Philosophy must contain exactly 32 source units.');
const expected={atmatattvaviveka:4,bhamati:4,nyayakusumanjali:12,tattvacintamani:12};
for(const [id,count] of Object.entries(expected)) assert.equal(records.filter(r=>r.bookId===id).length,count,`${id}: expected ${count} units`);
assert.equal(records.filter(r=>r.translationAnnexure===true).length,8,'Classical Philosophy must contain exactly eight translation annexures.');

const manifest={
  title:'शास्त्रीय दर्शन / Classical Philosophy',
  unitCount:32,
  bookCount:4,
  translationAnnexureCount:8,
  bookCounts:expected,
  books:books.map(b=>({id:b.book.id,titleMai:b.book.titleMai,titleEn:b.book.titleEn,author:b.book.author,unitCount:b.records.length,translationAnnexures:b.records.filter(r=>r.translationAnnexure).length}))
};
const data={manifest,books:books.map(b=>b.book),records};

const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const html=lang=>{
  const en=lang==='en';
  const prefix=en?'../':'';
  const canonical=`https://videha-ejournal.github.io/gajendra-preeti/classical-philosophy/${en?'en/':''}`;
  const alternate=`https://videha-ejournal.github.io/gajendra-preeti/classical-philosophy/${en?'':'en/'}`;
  const title=en?'Classical Philosophy — Four Sanskrit Works in Maithili Translation':'शास्त्रीय दर्शन — चारि संस्कृत दर्शन-ग्रन्थक मैथिली अनुवाद';
  const description=en?'A bilingual research explorer for Ātmatattvaviveka, Bhāmatī, Nyāyakusumāñjali and Tattvacintāmaṇi: 32 source-grounded units and eight translation annexures.':'आत्मतत्त्वविवेक, भामती, न्यायकुसुमाञ्जलि आ तत्त्वचिन्तामणिक 32 स्रोत-आधारित इकाइ आ आठ अनुवाद-अनुलग्नक सहित द्विभाषी शोध-अन्वेषक।';
  return `<!doctype html>
<html lang="${en?'en':'mai'}">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${canonical}"><link rel="alternate" hreflang="${en?'mai':'en'}" href="${alternate}">
<meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}"><meta property="og:type" content="website"><meta property="og:url" content="${canonical}">
<meta name="twitter:card" content="summary"><meta name="twitter:title" content="${esc(title)}"><meta name="twitter:description" content="${esc(description)}">
<link rel="stylesheet" href="${prefix}style.css">
<script type="application/ld+json">${JSON.stringify({'@context':'https://schema.org','@type':'CollectionPage',name:title,url:canonical,description,about:books.map(b=>({'@type':'Book',name:en?b.book.titleEn:b.book.titleMai,author:{'@type':'Person',name:b.book.author}}))})}</script>
</head>
<body data-lang="${lang}" data-source="${prefix}data.json">
<a class="skip" href="#explorer">${en?'Skip to the explorer':'अन्वेषक पर जाउ'}</a>
<header class="hero">
  <nav class="topnav" aria-label="${en?'Edition navigation':'संस्करण नेविगेशन'}"><a href="/gajendra-preeti/">${en?'Maithili home':'मुख्य पृष्ठ'}</a><a href="/gajendra-preeti/en/">English home</a><a href="${en?'../':'en/'}" hreflang="${en?'mai':'en'}">${en?'मैथिली संस्करण':'English edition'}</a></nav>
  <p class="kicker">VIDEHA · ISSN 2229-547X · RESEARCH READER</p>
  <h1>${en?'Classical Philosophy':'शास्त्रीय दर्शन'}</h1>
  <p class="dek">${en?'Four foundational Sanskrit works, studied through source-grounded bilingual research and Gajendra Thakur’s Maithili translation programme.':'चारि मूल संस्कृत दर्शन-ग्रन्थ—स्रोत-आधारित द्विभाषी अनुसन्धान आ गजेन्द्र ठाकुरक मैथिली अनुवाद-परियोजनाक संग।'}</p>
  <div class="stats" aria-label="${en?'Collection statistics':'संग्रह-सांख्यिकी'}"><span><strong>32</strong>${en?'source units':'स्रोत इकाइ'}</span><span><strong>4</strong>${en?'works':'ग्रन्थ'}</span><span><strong>8</strong>${en?'translation annexures':'अनुवाद-अनुलग्नक'}</span></div>
</header>
<section class="books" aria-label="${en?'Works in this reader':'एहि रीडरक ग्रन्थ'}">${books.map(b=>`<article><p>${esc(b.book.author)}</p><h2>${esc(en?b.book.titleEn:b.book.titleMai)}</h2><small>${b.records.length} ${en?'units':'इकाइ'} · ${b.records.filter(r=>r.translationAnnexure).length} ${en?'translation annexure'+(b.records.filter(r=>r.translationAnnexure).length===1?'':'s'):'अनुवाद-अनुलग्नक'}</small></article>`).join('')}</section>
<section class="method"><h2>${en?'How to read this edition':'ई संस्करण कोना पढ़ी'}</h2><p>${en?'The reader separates interpretive research units from translation annexures. Summaries follow the supplied research and translation sources; the interface does not silently repair disagreements or replace the source framing with a different philosophical position. Use the filters to move by work, concept, argument or translation sequence.':'रीडर व्याख्यात्मक अनुसन्धान-इकाइ आ अनुवाद-अनुलग्नककेँ अलग राखैत अछि। सार उपलब्ध अनुसन्धान आ अनुवाद-स्रोतक क्रम आ पारिभाषिकीपर आधारित अछि; स्रोतक मतभेदकेँ चुपचाप बदलल वा दोसर दार्शनिक स्थितिसँ प्रतिस्थापित नहि कएल गेल अछि। ग्रन्थ, अवधारणा, तर्क वा अनुवाद-क्रम अनुसार खोज करू।'}</p></section>
<main id="explorer" tabindex="-1">
  <div class="controls" role="search">
    <label>${en?'Search concepts, arguments and examples':'अवधारणा, तर्क आ दृष्टान्त खोजू'}<input id="q" type="search" autocomplete="off" placeholder="${en?'e.g. vyāpti, memory, adhyāsa':'जेना व्याप्ति, स्मृति, अध्यास'}"></label>
    <label>${en?'Work':'ग्रन्थ'}<select id="book"><option value="">${en?'All four works':'सभ चारि ग्रन्थ'}</option>${books.map(b=>`<option value="${b.book.id}">${esc(en?b.book.titleEn:b.book.titleMai)}</option>`).join('')}</select></label>
    <label>${en?'Unit type':'इकाइक प्रकार'}<select id="kind"><option value="">${en?'Research + translation':'अनुसन्धान + अनुवाद'}</option><option value="chapter">${en?'Research units':'अनुसन्धान इकाइ'}</option><option value="translation-annexure">${en?'Translation annexures':'अनुवाद-अनुलग्नक'}</option></select></label>
  </div>
  <p id="result-count" class="result-count" aria-live="polite"></p>
  <div id="records" class="records"></div>
</main>
<footer><p>© Gajendra Thakur, Editor Videha — First Maithili Fortnightly eJournal ISSN 2229-547X</p><p>${en?'Source-grounded research reader · Maithili and English':'स्रोत-आधारित शोध-रीडर · मैथिली आ English'}</p></footer>
<script src="${prefix}reader.js" defer></script>
</body></html>`;
};

const css=`:root{--paper:#f4efe3;--ink:#17211d;--muted:#5d665f;--line:#c8bfae;--deep:#163e35;--wash:#e7dfce;--card:#fffdf7;--accent:#7b2f24}*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:var(--paper);color:var(--ink);font-family:Georgia,'Noto Serif Devanagari','Noto Serif',serif;line-height:1.65}.skip{position:absolute;left:-9999px}.skip:focus{left:1rem;top:1rem;z-index:10;background:#fff;padding:.7rem 1rem}.hero{padding:1.2rem max(5vw,1rem) 3.5rem;background:linear-gradient(135deg,#102f29,#1b493d);color:#f7f1e4}.topnav{display:flex;gap:1rem;flex-wrap:wrap;font:600 .82rem system-ui}.topnav a{color:#fff}.kicker{letter-spacing:.13em;font:700 .72rem system-ui;margin:3.5rem 0 .7rem}.hero h1{font-size:clamp(2.8rem,7vw,6.7rem);line-height:.95;margin:0;max-width:12ch}.dek{font-size:clamp(1.05rem,2vw,1.45rem);max-width:54rem}.stats{display:flex;gap:.8rem;flex-wrap:wrap;margin-top:2rem}.stats span{border:1px solid #ffffff55;padding:.65rem .9rem;font:600 .84rem system-ui}.stats strong{font-size:1.5rem;margin-right:.45rem}.books{display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:var(--line);border-bottom:1px solid var(--line)}.books article{background:var(--card);padding:1.2rem}.books p,.books small{font:600 .72rem system-ui;color:var(--muted)}.books h2{font-size:1.15rem;margin:.25rem 0}.method,main{max-width:1180px;margin:auto;padding:2rem max(3vw,1rem)}.method{border-bottom:1px solid var(--line)}.method h2{margin-bottom:.2rem}.controls{position:sticky;top:0;z-index:5;background:color-mix(in srgb,var(--paper) 94%,transparent);backdrop-filter:blur(8px);display:grid;grid-template-columns:2fr 1fr 1fr;gap:.8rem;padding:1rem 0;border-bottom:1px solid var(--line)}label{font:700 .75rem system-ui;letter-spacing:.02em}input,select{display:block;width:100%;margin-top:.35rem;padding:.72rem;border:1px solid var(--line);background:#fff;color:var(--ink);font:inherit;border-radius:0}.result-count{font:700 .8rem system-ui;color:var(--muted)}.records{display:grid;gap:1rem}.record{background:var(--card);border:1px solid var(--line);padding:clamp(1rem,3vw,2rem)}.record[data-annexure=true]{border-left:5px solid var(--accent)}.meta{display:flex;gap:.55rem;flex-wrap:wrap;font:700 .72rem system-ui;color:var(--deep);text-transform:uppercase;letter-spacing:.04em}.badge{border:1px solid currentColor;padding:.15rem .45rem}.record h2{font-size:clamp(1.35rem,2.7vw,2.05rem);line-height:1.2;margin:.65rem 0}.summary p{margin:.75rem 0}.terms{display:flex;gap:.4rem;flex-wrap:wrap;padding:0;list-style:none}.terms li{background:var(--wash);padding:.23rem .48rem;font:600 .72rem system-ui}.record details{border-top:1px solid var(--line);margin-top:1rem;padding-top:.7rem}.record summary{cursor:pointer;font:700 .82rem system-ui}.map{columns:2;column-gap:2rem}.map li{break-inside:avoid;margin:.25rem 0}footer{border-top:1px solid var(--line);padding:2rem max(5vw,1rem);font:600 .76rem system-ui;color:var(--muted)}:focus-visible{outline:3px solid #c66b45;outline-offset:3px}@media(max-width:800px){.books{grid-template-columns:1fr 1fr}.controls{grid-template-columns:1fr;position:static}.map{columns:1}}@media(max-width:480px){.books{grid-template-columns:1fr}}@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}}@media print{.topnav,.controls,.skip{display:none}.hero{background:#fff;color:#000;padding-bottom:1rem}.books{grid-template-columns:1fr 1fr}.record{break-inside:avoid;background:#fff}body{background:#fff}}`;

const js=`(()=>{const body=document.body;const en=body.dataset.lang==='en';const q=document.getElementById('q'),book=document.getElementById('book'),kind=document.getElementById('kind'),root=document.getElementById('records'),count=document.getElementById('result-count');const esc=s=>String(s??'').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));const paras=s=>String(s||'').split(/\\n\\n+/).map(p=>'<p>'+esc(p)+'</p>').join('');const list=(xs,cls='')=>xs?.length?'<ol class="'+cls+'">'+xs.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ol>':'';fetch(body.dataset.source).then(r=>{if(!r.ok)throw Error(r.status);return r.json()}).then(data=>{const all=data.records;function render(){const needle=q.value.trim().toLocaleLowerCase();const rows=all.filter(r=>{if(book.value&&r.bookId!==book.value)return false;if(kind.value&&r.type!==kind.value)return false;if(!needle)return true;const hay=[r.titleMai,r.titleEn,r.summaryMai,r.summaryEn,r.bookTitleMai,r.bookTitleEn,...(r.terms||[]),...(r.outlineMai||[]),...(r.outlineEn||[]),...(r.map||[])].join(' ').toLocaleLowerCase();return hay.includes(needle)});count.textContent=en?rows.length+' of '+all.length+' units shown':all.length+' मे सँ '+rows.length+' इकाइ देखाओल गेल';root.innerHTML=rows.map(r=>{const title=en?r.titleEn:r.titleMai,summary=en?r.summaryEn:r.summaryMai,outline=en?r.outlineEn:r.outlineMai;return '<article class="record" id="'+esc(r.id)+'" data-annexure="'+(r.translationAnnexure?'true':'false')+'"><div class="meta"><span>'+esc(en?r.bookTitleEn:r.bookTitleMai)+'</span><span class="badge">'+(r.translationAnnexure?(en?'translation annexure':'अनुवाद-अनुलग्नक'):(en?'research unit':'अनुसन्धान इकाइ'))+'</span></div><h2>'+esc(title)+'</h2><div class="summary">'+paras(summary)+'</div>'+(r.terms?.length?'<ul class="terms">'+r.terms.map(t=>'<li>'+esc(t)+'</li>').join('')+'</ul>':'')+(outline?.length?'<details><summary>'+(en?'Argument outline':'तर्क-रूपरेखा')+'</summary>'+list(outline,'map')+'</details>':'')+(r.map?.length?'<details><summary>'+(en?'Translation / source map':'अनुवाद / स्रोत मानचित्र')+'</summary>'+list(r.map,'map')+'</details>':'')+'</article>'}).join('')||'<p>'+(en?'No unit matches these filters.':'एहि छनौटमे कोनो इकाइ नहि भेटल।')+'</p>'}for(const el of [q,book,kind])el.addEventListener(el===q?'input':'change',render);render()}).catch(err=>{root.innerHTML='<p role="alert">'+(en?'The research data could not be loaded.':'अनुसन्धान-दत्तांश लोड नहि भऽ सकल।')+'</p>';console.error(err)})})();`;

fs.rmSync(destination,{recursive:true,force:true});
fs.mkdirSync(path.join(destination,'en'),{recursive:true});
fs.writeFileSync(path.join(destination,'data.json'),JSON.stringify(data),'utf8');
fs.writeFileSync(path.join(destination,'manifest.json'),JSON.stringify(manifest,null,2),'utf8');
fs.writeFileSync(path.join(destination,'index.html'),html('mai'),'utf8');
fs.writeFileSync(path.join(destination,'en/index.html'),html('en'),'utf8');
fs.writeFileSync(path.join(destination,'style.css'),css,'utf8');
fs.writeFileSync(path.join(destination,'reader.js'),js,'utf8');

const sitemap='public/sitemap.xml';
const canonicals=['https://videha-ejournal.github.io/gajendra-preeti/classical-philosophy/','https://videha-ejournal.github.io/gajendra-preeti/classical-philosophy/en/'];
if(fs.existsSync(sitemap)){
  let xml=fs.readFileSync(sitemap,'utf8');
  for(const canonical of canonicals) if(!xml.includes(canonical)) xml=xml.replace('</urlset>',`  <url><loc>${canonical}</loc></url>\n</urlset>`);
  fs.writeFileSync(sitemap,xml,'utf8');
}
console.log(`Built Classical Philosophy reader: ${records.length} units across ${books.length} works with ${records.filter(r=>r.translationAnnexure).length} translation annexures.`);
