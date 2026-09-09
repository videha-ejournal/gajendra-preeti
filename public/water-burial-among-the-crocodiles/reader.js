const $=s=>document.querySelector(s);
let manifest,chapters=[],labels={};
const basisLabels={f:'full-text synthesis',a:'author-supplied synopsis + chapter close',c:'full-text opening/closing condensation'};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const numLabel=n=>`Chapter ${n}`;

function buildNav(){
  $('#part-cards').innerHTML=manifest.parts.map((p,i)=>`<article class="part-card"><span>0${i}</span><h3>${esc(p.title)}</h3><strong>${esc(p.range)} · ${p.count} chapters</strong><p>${esc(p.summary)}</p><button type="button" data-part="${p.id}">Explore this Part →</button></article>`).join('');
  $('#arc-grid').innerHTML=manifest.arcs.map(a=>`<article class="arc-card"><span class="range">${esc(a.part.toUpperCase())} · ${a.start===a.end?`Chapter ${a.start}`:`Chapters ${a.start} to ${a.end}`} · ${a.count}</span><h3>${esc(a.title)}</h3><p>${esc(a.summary)}</p><button type="button" data-arc="${a.id}">Open this arc →</button></article>`).join('');
  manifest.arcs.forEach(a=>$('#arc-filter').insertAdjacentHTML('beforeend',`<option value="${a.id}">${esc(a.title)}</option>`));
  manifest.motifs.forEach(m=>$('#theme-filter').insertAdjacentHTML('beforeend',`<option value="${m.id}">${esc(m.label)}</option>`));
  $('#additional-grid').innerHTML=manifest.additional.map(a=>`<article class="additional-card"><span>${esc(a.kind)}</span><h3>${esc(a.title)}</h3><p>${esc(a.summary)}</p></article>`).join('');
}

function card(c){
  const sig=c.g?`<details><summary>Why this chapter matters</summary><p>${esc(c.g)}</p></details>`:'';
  const motifs=(c.m||[]).map(m=>`<span class="chip">${esc(labels[m]||m)}</span>`).join('');
  return `<article class="chapter-card" id="ch-${c.n<0?'m'+Math.abs(c.n):c.n}">
    <div class="chapter-no">${esc(numLabel(c.n))}</div>
    <div class="chapter-main"><h3>${esc(c.t)}</h3><p>${esc(c.s)}</p>${sig}<small class="source-basis">Summary basis · ${esc(basisLabels[c.b]||basisLabels.c)}</small></div>
    <aside class="chapter-side">${motifs?`<h4>Motifs</h4><div class="chips">${motifs}</div>`:''}${c.pe?.length?`<p class="people"><b>Recurring people:</b> ${esc(c.pe.join(' · '))}</p>`:''}${c.tu?`<p class="song">♪ ${esc(c.tu)}</p>`:''}</aside>
  </article>`;
}

function filtersActive(){return !!($('#search').value.trim()||$('#part-filter').value!=='all'||$('#arc-filter').value!=='all'||$('#theme-filter').value!=='all')}

function groupedCards(arr){
  const available=new Set(arr.map(c=>c.n));
  return manifest.arcs.map(a=>{
    const group=chapters.filter(c=>c.a===a.id&&available.has(c.n));
    if(!group.length)return '';
    const range=a.start===a.end?`Chapter ${a.start}`:`Chapters ${a.start} to ${a.end}`;
    return `<section class="result-arc" aria-labelledby="result-${esc(a.id)}">
      <header class="result-arc-heading"><p>${esc(a.part.toUpperCase())} · ${esc(range)}</p><h3 id="result-${esc(a.id)}">${esc(a.title)}</h3><span>${group.length} chapter${group.length===1?'':'s'}</span></header>
      ${group.map(card).join('')}
    </section>`;
  }).join('');
}

function render(){
  const q=$('#search').value.trim().toLowerCase();
  const part=$('#part-filter').value,arc=$('#arc-filter').value,theme=$('#theme-filter').value;
  const arr=chapters.filter(c=>(part==='all'||c.p===part)&&(arc==='all'||c.a===arc)&&(theme==='all'||(c.m||[]).includes(theme))&&(!q||[c.t,c.s,c.g||'',(c.pe||[]).join(' '),(c.m||[]).map(x=>labels[x]||x).join(' ')].join(' ').toLowerCase().includes(q)));
  const active=filtersActive();
  $('#status').textContent=active?`${arr.length} chapter${arr.length===1?'':'s'} matched · results remain in chapter order`:`${arr.length} chapters shown · complete sequence from Chapter -100 through Chapter 200`;
  $('#chapter-results').innerHTML=groupedCards(arr)||'<p>No matching chapters. Try another term or reset the filters.</p>';
}

function bind(){
  ['search','part-filter','arc-filter','theme-filter'].forEach(id=>$('#'+id).addEventListener(id==='search'?'input':'change',render));
  $('#filters').addEventListener('reset',()=>setTimeout(render,0));
  document.addEventListener('click',e=>{
    const pb=e.target.closest('[data-part]');
    if(pb){$('#part-filter').value=pb.dataset.part;$('#arc-filter').value='all';location.hash='explore';render()}
    const ab=e.target.closest('[data-arc]');
    if(ab){$('#arc-filter').value=ab.dataset.arc;$('#part-filter').value='all';location.hash='explore';render()}
  });
  let pending=false;
  const prog=()=>{const max=document.documentElement.scrollHeight-innerHeight;$('.reading-progress').style.transform=`scaleX(${max>0?scrollY/max:0})`;pending=false};
  addEventListener('scroll',()=>{if(!pending){pending=true;requestAnimationFrame(prog)}},{passive:true});
  prog();
}

async function init(){
  try{
    manifest=await fetch('manifest.json').then(r=>r.json());
    labels=Object.fromEntries(manifest.motifs.map(m=>[m.id,m.label]));
    buildNav();
    const files=manifest.arcs.flatMap(a=>a.files);
    const payloads=await Promise.all(files.map(f=>fetch(f).then(r=>r.json())));
    chapters=payloads.flatMap(p=>p.chapters).sort((a,b)=>a.n-b.n);
    const expected=Array.from({length:301},(_,i)=>i-100);
    const actual=chapters.map(c=>c.n);
    if(actual.length!==expected.length||actual.some((n,i)=>n!==expected[i])) throw new Error('The chapter guide must contain every chapter exactly once from -100 through 200.');
    if(chapters.some(c=>!String(c.t||'').trim()||!String(c.s||'').trim())) throw new Error('Every chapter must have a title and summary.');
    bind();render();
  }catch(err){console.error(err);$('#status').textContent='The chapter guide could not be loaded. Please refresh the page.'}
}
init();
