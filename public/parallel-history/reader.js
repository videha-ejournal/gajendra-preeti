
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let manifest, chapters=[], lang='mai';
const base=document.body.dataset.base||'';

function chapterLabel(c){return lang==='en'?`Book ${c.book} · Chapter ${c.n}`:`पोथी ${c.book} · अध्याय ${c.n}`;}
function secTitle(sec){return lang==='en'?sec.en:sec.mai;}
function bookName(id){const b=manifest.books.find(x=>x.id===id);return lang==='en'?b.en:b.mai;}

function renderHero(){
  $('#count').textContent=manifest.chapterCount;
  $('#method-text').textContent=lang==='en'?manifest.methodEn:manifest.methodMai;
  $('#status-prefix').textContent=lang==='en'?'Complete sequence':'सम्पूर्ण क्रम';
}

function renderBookCards(){
  $('#book-cards').innerHTML=manifest.books.map(b=>`<article class="book-card">
    <span>${lang==='en'?`BOOK ${b.id}`:`पोथी ${b.id}`}</span>
    <h3>${esc(lang==='en'?b.en:b.mai)}</h3>
    <p>${esc(lang==='en'?b.detailEn:b.detailMai)}</p>
    <strong>${b.count} ${lang==='en'?'chapters':'अध्याय'}</strong>
    <button type="button" data-book="${b.id}">${lang==='en'?'Explore this book →':'एहि पोथीकेँ देखू →'}</button>
  </article>`).join('');
}

function renderSectionCards(){
  $('#section-grid').innerHTML=manifest.sections.map(sec=>`<article class="section-card">
    <p>${lang==='en'?`BOOK ${sec.book}`:`पोथी ${sec.book}`} · ${sec.start}–${sec.end}</p>
    <h3>${esc(secTitle(sec))}</h3>
    <span>${sec.count} ${lang==='en'?'chapters':'अध्याय'}</span>
    <button type="button" data-section="${sec.id}">${lang==='en'?'Open section →':'खण्ड खोलू →'}</button>
  </article>`).join('');
  const sf=$('#section-filter');
  const current=sf.value;
  sf.innerHTML=`<option value="all">${lang==='en'?'All source sections':'सभ स्रोत-खण्ड'}</option>`+
    manifest.sections.map(sec=>`<option value="${sec.id}">${esc(secTitle(sec))}</option>`).join('');
  if([...sf.options].some(o=>o.value===current))sf.value=current;
}

function languageButtons(){
  $$('.lang-toggle button').forEach(b=>b.classList.toggle('active',b.dataset.lang===lang));
  document.documentElement.lang=lang==='en'?'en':'mai';
  $('#search').placeholder=lang==='en'?'Search title, summary or source outline…':'शीर्षक, सार वा स्रोत-रूपरेखा खोजू…';
  $('#book-filter').options[0].text=lang==='en'?'Both books':'दूनू पोथी';
  $('#book-filter').options[1].text=lang==='en'?'Book 1 · 28 chapters':'पोथी 1 · 28 अध्याय';
  $('#book-filter').options[2].text=lang==='en'?'Book 2 · 150 chapters':'पोथी 2 · 150 अध्याय';
  $('#reset').textContent=lang==='en'?'Reset':'फेर आरम्भ';
}

function card(c){
  const title=lang==='en'?c.en.title:c.mai.title;
  const summary=lang==='en'?c.en.summary:c.mai.summary;
  const bilingual=lang==='bi';
  const sec=manifest.sections.find(s=>s.id===c.section);
  const outline=(c.outline||[]).length?`<details><summary>${lang==='en'?'Source chapter outline':'मूल अध्यायक रूपरेखा'}</summary><ol>${c.outline.map(x=>`<li lang="en">${esc(x)}</li>`).join('')}</ol></details>`:'';
  return `<article class="chapter-card" id="book-${c.book}-chapter-${c.n}">
    <header><span>${bilingual?`Book ${c.book} · Chapter ${c.n}`:esc(chapterLabel(c))}</span><small>${esc(bilingual?sec.en:secTitle(sec))}</small></header>
    ${bilingual?`<div class="bilingual">
      <section lang="mai"><h3>${esc(c.mai.title)}</h3><p>${esc(c.mai.summary)}</p></section>
      <section lang="en"><h3>${esc(c.en.title)}</h3><p>${esc(c.en.summary)}</p></section>
    </div>`:`<h3>${esc(title)}</h3><p>${esc(summary)}</p>`}
    ${outline}
  </article>`;
}

function grouped(arr){
  const ids=new Set(arr.map(c=>`${c.book}:${c.n}`));
  return manifest.sections.map(sec=>{
    const group=chapters.filter(c=>c.section===sec.id&&ids.has(`${c.book}:${c.n}`));
    if(!group.length)return '';
    return `<section class="result-section">
      <header class="result-heading"><p>${lang==='en'?`BOOK ${sec.book}`:`पोथी ${sec.book}`} · ${sec.start}–${sec.end}</p>
      <h2>${esc(lang==='bi'?`${sec.mai} / ${sec.en}`:secTitle(sec))}</h2><span>${group.length} ${lang==='en'?'chapters':'अध्याय'}</span></header>
      ${group.map(card).join('')}
    </section>`;
  }).join('');
}

function render(){
  const q=$('#search').value.trim().toLowerCase();
  const book=$('#book-filter').value, section=$('#section-filter').value;
  const arr=chapters.filter(c=>{
    if(book!=='all'&&String(c.book)!==book)return false;
    if(section!=='all'&&c.section!==section)return false;
    if(!q)return true;
    return [c.en.title,c.en.summary,c.mai.title,c.mai.summary,...(c.outline||[])].join(' ').toLowerCase().includes(q);
  });
  $('#status').textContent=`${arr.length} ${lang==='en'?'chapters shown':'अध्याय देखाओल गेल'} · ${lang==='en'?'all 178 are visible by default':'मूल रूपमे सभ 178 अध्याय देखाइत अछि'}`;
  $('#chapter-results').innerHTML=grouped(arr)||`<p class="empty">${lang==='en'?'No matching chapter.':'कोनो मेल खाइत अध्याय नहि भेटल।'}</p>`;
}

function setLang(next){
  lang=next;
  languageButtons();renderHero();renderBookCards();renderSectionCards();render();
}

async function init(){
  manifest=await fetch(base+'manifest.json').then(r=>{if(!r.ok)throw new Error('manifest');return r.json()});
  const payloads=await Promise.all(manifest.files.map(f=>fetch(base+f).then(r=>{if(!r.ok)throw new Error(f);return r.json()})));
  chapters=payloads.flatMap(p=>p.chapters).sort((a,b)=>a.book-b.book||a.n-b.n);
  const one=chapters.filter(c=>c.book===1).map(c=>c.n),two=chapters.filter(c=>c.book===2).map(c=>c.n);
  if(chapters.length!==178||one.some((n,i)=>n!==i+1)||two.some((n,i)=>n!==i+1)||one.length!==28||two.length!==150)throw new Error('chapter integrity');
  lang=document.body.dataset.defaultLang||'mai';
  $('.lang-toggle').addEventListener('click',e=>{const b=e.target.closest('button[data-lang]');if(b)setLang(b.dataset.lang)});
  ['search','book-filter','section-filter'].forEach(id=>$('#'+id).addEventListener(id==='search'?'input':'change',render));
  $('#filters').addEventListener('reset',()=>setTimeout(render));
  document.addEventListener('click',e=>{
    const b=e.target.closest('[data-book]');if(b){$('#book-filter').value=b.dataset.book;$('#section-filter').value='all';location.hash='explore';render()}
    const s=e.target.closest('[data-section]');if(s){$('#section-filter').value=s.dataset.section;$('#book-filter').value='all';location.hash='explore';render()}
  });
  setLang(lang);
}
init().catch(err=>{console.error(err);$('#status').textContent='Guide data could not be loaded.'});
