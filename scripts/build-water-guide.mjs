import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {gunzipSync} from 'node:zlib';

const sourceDir='content/water-guide';
const destination='public/water-burial-among-the-crocodiles';
const parts=fs.readdirSync(sourceDir).filter(name=>/^part-\d+\.txt$/.test(name)).sort();
if(!parts.length) throw new Error('No Water-Burial guide bundle parts found.');
const encoded=parts.map(name=>fs.readFileSync(path.join(sourceDir,name),'utf8').trim()).join('');
const bundle=JSON.parse(gunzipSync(Buffer.from(encoded,'base64')).toString('utf8'));

// Publication integrity: every numbered chapter must exist exactly once and carry a real summary.
const manifest=JSON.parse(bundle['manifest.json']);
assert.equal(manifest.chapterCount,301,'Water-Burial manifest must declare 301 numbered chapters.');
const numbers=[];
for(const [name,content] of Object.entries(bundle).filter(([name])=>/^arcs\/.+\.json$/.test(name))){
  const payload=JSON.parse(content);
  for(const chapter of payload.chapters||[]){
    assert(Number.isInteger(chapter.n),`${name}: chapter number must be an integer`);
    assert(String(chapter.t||'').trim(),`${name}: Chapter ${chapter.n} must have a title`);
    assert(String(chapter.s||'').trim(),`${name}: Chapter ${chapter.n} must have a summary`);
    numbers.push(chapter.n);
  }
}
numbers.sort((a,b)=>a-b);
assert.deepEqual(numbers,Array.from({length:301},(_,i)=>i-100),'Water-Burial guide must contain every chapter exactly once from -100 through 200.');

fs.rmSync(destination,{recursive:true,force:true});
for(const [relative,content] of Object.entries(bundle)){
  const target=path.join(destination,relative);
  fs.mkdirSync(path.dirname(target),{recursive:true});
  fs.writeFileSync(target,content,'utf8');
}

// The complete chapter sequence is the default view. Filters narrow it; they never reveal otherwise-hidden chapters.
const readerSource="const $=s=>document.querySelector(s);\nlet manifest,chapters=[],labels={};\nconst basisLabels={f:'full-text synthesis',a:'author-supplied synopsis + chapter close',c:'full-text opening/closing condensation'};\nconst esc=s=>String(s??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',\"'\":'&#39;'}[c]));\nconst numLabel=n=>`Chapter ${n}`;\n\nfunction buildNav(){\n  $('#part-cards').innerHTML=manifest.parts.map((p,i)=>`<article class=\"part-card\"><span>0${i}</span><h3>${esc(p.title)}</h3><strong>${esc(p.range)} · ${p.count} chapters</strong><p>${esc(p.summary)}</p><button type=\"button\" data-part=\"${p.id}\">Explore this Part →</button></article>`).join('');\n  $('#arc-grid').innerHTML=manifest.arcs.map(a=>`<article class=\"arc-card\"><span class=\"range\">${esc(a.part.toUpperCase())} · ${a.start===a.end?`Chapter ${a.start}`:`Chapters ${a.start} to ${a.end}`} · ${a.count}</span><h3>${esc(a.title)}</h3><p>${esc(a.summary)}</p><button type=\"button\" data-arc=\"${a.id}\">Open this arc →</button></article>`).join('');\n  manifest.arcs.forEach(a=>$('#arc-filter').insertAdjacentHTML('beforeend',`<option value=\"${a.id}\">${esc(a.title)}</option>`));\n  manifest.motifs.forEach(m=>$('#theme-filter').insertAdjacentHTML('beforeend',`<option value=\"${m.id}\">${esc(m.label)}</option>`));\n  $('#additional-grid').innerHTML=manifest.additional.map(a=>`<article class=\"additional-card\"><span>${esc(a.kind)}</span><h3>${esc(a.title)}</h3><p>${esc(a.summary)}</p></article>`).join('');\n}\n\nfunction card(c){\n  const sig=c.g?`<details><summary>Why this chapter matters</summary><p>${esc(c.g)}</p></details>`:'';\n  const motifs=(c.m||[]).map(m=>`<span class=\"chip\">${esc(labels[m]||m)}</span>`).join('');\n  return `<article class=\"chapter-card\" id=\"ch-${c.n<0?'m'+Math.abs(c.n):c.n}\">\n    <div class=\"chapter-no\">${esc(numLabel(c.n))}</div>\n    <div class=\"chapter-main\"><h3>${esc(c.t)}</h3><p>${esc(c.s)}</p>${sig}<small class=\"source-basis\">Summary basis · ${esc(basisLabels[c.b]||basisLabels.c)}</small></div>\n    <aside class=\"chapter-side\">${motifs?`<h4>Motifs</h4><div class=\"chips\">${motifs}</div>`:''}${c.pe?.length?`<p class=\"people\"><b>Recurring people:</b> ${esc(c.pe.join(' · '))}</p>`:''}${c.tu?`<p class=\"song\">♪ ${esc(c.tu)}</p>`:''}</aside>\n  </article>`;\n}\n\nfunction filtersActive(){return !!($('#search').value.trim()||$('#part-filter').value!=='all'||$('#arc-filter').value!=='all'||$('#theme-filter').value!=='all')}\n\nfunction groupedCards(arr){\n  const available=new Set(arr.map(c=>c.n));\n  return manifest.arcs.map(a=>{\n    const group=chapters.filter(c=>c.a===a.id&&available.has(c.n));\n    if(!group.length)return '';\n    const range=a.start===a.end?`Chapter ${a.start}`:`Chapters ${a.start} to ${a.end}`;\n    return `<section class=\"result-arc\" aria-labelledby=\"result-${esc(a.id)}\">\n      <header class=\"result-arc-heading\"><p>${esc(a.part.toUpperCase())} · ${esc(range)}</p><h3 id=\"result-${esc(a.id)}\">${esc(a.title)}</h3><span>${group.length} chapter${group.length===1?'':'s'}</span></header>\n      ${group.map(card).join('')}\n    </section>`;\n  }).join('');\n}\n\nfunction render(){\n  const q=$('#search').value.trim().toLowerCase();\n  const part=$('#part-filter').value,arc=$('#arc-filter').value,theme=$('#theme-filter').value;\n  const arr=chapters.filter(c=>(part==='all'||c.p===part)&&(arc==='all'||c.a===arc)&&(theme==='all'||(c.m||[]).includes(theme))&&(!q||[c.t,c.s,c.g||'',(c.pe||[]).join(' '),(c.m||[]).map(x=>labels[x]||x).join(' ')].join(' ').toLowerCase().includes(q)));\n  const active=filtersActive();\n  $('#status').textContent=active?`${arr.length} chapter${arr.length===1?'':'s'} matched · results remain in chapter order`:`${arr.length} chapters shown · complete sequence from Chapter -100 through Chapter 200`;\n  $('#chapter-results').innerHTML=groupedCards(arr)||'<p>No matching chapters. Try another term or reset the filters.</p>';\n}\n\nfunction bind(){\n  ['search','part-filter','arc-filter','theme-filter'].forEach(id=>$('#'+id).addEventListener(id==='search'?'input':'change',render));\n  $('#filters').addEventListener('reset',()=>setTimeout(render,0));\n  document.addEventListener('click',e=>{\n    const pb=e.target.closest('[data-part]');\n    if(pb){$('#part-filter').value=pb.dataset.part;$('#arc-filter').value='all';location.hash='explore';render()}\n    const ab=e.target.closest('[data-arc]');\n    if(ab){$('#arc-filter').value=ab.dataset.arc;$('#part-filter').value='all';location.hash='explore';render()}\n  });\n  let pending=false;\n  const prog=()=>{const max=document.documentElement.scrollHeight-innerHeight;$('.reading-progress').style.transform=`scaleX(${max>0?scrollY/max:0})`;pending=false};\n  addEventListener('scroll',()=>{if(!pending){pending=true;requestAnimationFrame(prog)}},{passive:true});\n  prog();\n}\n\nasync function init(){\n  try{\n    manifest=await fetch('manifest.json').then(r=>r.json());\n    labels=Object.fromEntries(manifest.motifs.map(m=>[m.id,m.label]));\n    buildNav();\n    const files=manifest.arcs.flatMap(a=>a.files);\n    const payloads=await Promise.all(files.map(f=>fetch(f).then(r=>r.json())));\n    chapters=payloads.flatMap(p=>p.chapters).sort((a,b)=>a.n-b.n);\n    const expected=Array.from({length:301},(_,i)=>i-100);\n    const actual=chapters.map(c=>c.n);\n    if(actual.length!==expected.length||actual.some((n,i)=>n!==expected[i])) throw new Error('The chapter guide must contain every chapter exactly once from -100 through 200.');\n    if(chapters.some(c=>!String(c.t||'').trim()||!String(c.s||'').trim())) throw new Error('Every chapter must have a title and summary.');\n    bind();render();\n  }catch(err){console.error(err);$('#status').textContent='The chapter guide could not be loaded. Please refresh the page.'}\n}\ninit();\n";
fs.writeFileSync(path.join(destination,'reader.js'),readerSource,'utf8');
const indexFile=path.join(destination,'index.html');
let index=fs.readFileSync(indexFile,'utf8');
index=index.replace('<option value="p2">Part 2 · 101–200</option><option value="additional">Additional material</option>','<option value="p2">Part 2 · 101–200</option>');
const oldNote='<div class="featured-note" id="featured-note"><strong>First view:</strong> a small set of hinge chapters. Choose a Part, arc, theme or search term to open the complete sequence.</div>';
const newNote='<div class="featured-note" id="featured-note"><strong>Complete view:</strong> all 301 numbered chapters are shown below, in sequence from Chapter -100 through Chapter 200 and grouped by the book’s narrative arcs. Search and filters narrow this complete sequence; no chapter is hidden by default.</div>';
assert(index.includes(oldNote),'Expected old first-view note before Water-Burial UI upgrade.');
index=index.replace(oldNote,newNote);
fs.writeFileSync(indexFile,index,'utf8');
const styleFile=path.join(destination,'style.css');
fs.appendFileSync(styleFile,'\n.result-arc{margin:2.8rem 0 5rem}.result-arc:first-child{margin-top:1.5rem}.result-arc-heading{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:.4rem 1rem;align-items:end;border-top:3px solid var(--ink);border-bottom:1px solid var(--line);padding:1.1rem 0 1rem;margin-bottom:.35rem}.result-arc-heading p{grid-column:1/-1;margin:0;font:700 10px Arial,sans-serif;letter-spacing:.13em;text-transform:uppercase;color:var(--silt)}.result-arc-heading h3{margin:0;font-size:clamp(27px,3vw,40px);line-height:1.02;font-weight:400;letter-spacing:-.025em}.result-arc-heading span{font:700 10px Arial,sans-serif;letter-spacing:.1em;text-transform:uppercase;color:var(--river);white-space:nowrap}@media(max-width:700px){.result-arc-heading{grid-template-columns:1fr}.result-arc-heading span{white-space:normal}}@media print{.result-arc{break-before:auto}.result-arc-heading{break-after:avoid}}\n','utf8');

const sitemap='public/sitemap.xml';
const canonical='https://videha-ejournal.github.io/gajendra-preeti/water-burial-among-the-crocodiles/';
if(fs.existsSync(sitemap)){
  let xml=fs.readFileSync(sitemap,'utf8');
  if(!xml.includes(canonical)) xml=xml.replace('</urlset>',`  <url><loc>${canonical}</loc></url>\n</urlset>`);
  fs.writeFileSync(sitemap,xml,'utf8');
}
console.log(`Built Water-Burial guide from ${parts.length} bundle parts with ${Object.keys(bundle).length} files; validated and exposed all 301 numbered chapters.`);
