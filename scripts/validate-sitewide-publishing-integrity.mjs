import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const root=path.resolve('dist/client/gajendra-preeti');
const walk=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(d,e.name)):[path.join(d,e.name)]);
const files=walk(root).filter(f=>f.endsWith('.html'));
assert(files.length>500,`Expected full bilingual build; found ${files.length} HTML files.`);
const decode=s=>String(s||'').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'");
const strip=s=>decode(String(s||'').replace(/<[^>]*>/g,' ')).replace(/\s+/g,' ').trim();
const canonical=html=>decode(html.match(/<link\s+[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/i)?.[1]||'');
const lang=html=>(html.match(/<html\b[^>]*lang=["']([^"']+)["']/i)?.[1]||'').toLowerCase();
const alternates=html=>{const o={};for(const m of html.matchAll(/<link\s+[^>]*rel=["']alternate["'][^>]*hreflang=["']([^"']+)["'][^>]*href=["']([^"']+)["'][^>]*>/gi))o[m[1].toLowerCase()]=decode(m[2]);return o;};
const pages=[];const byCanonical=new Map();
for(const file of files){const html=fs.readFileSync(file,'utf8'),rel=path.relative(root,file).split(path.sep).join('/'),c=canonical(html);pages.push({file,rel,html,c,lang:lang(html),alts:alternates(html)});if(c)byCanonical.set(c,{file,rel,html});}
const errors=[];let paired=0,isbnPages=0;const titles=new Map();
for(const p of pages){
 const title=strip(p.html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]||'');const ts=titles.get(title)||[];ts.push(p.rel);titles.set(title,ts);
 if(!p.html.includes('data-videha-research-identity="true"'))errors.push(`${p.rel}: missing visible Videha research identity`);
 for(const [name,value] of [['citation_journal_title','Videha'],['citation_issn','2229-547X'],['videha_official_url','https://www.videha.co.in/'],['videha_github_mirror','https://videha-ejournal.github.io/videha/'],['videha_digital_research_archives','https://github.com/videha-ejournal']])if(!p.html.includes(`name="${name}" content="${value}"`))errors.push(`${p.rel}: missing ${name}`);
 if(!p.html.includes('https://www.videha.co.in/')||!p.html.includes('https://videha-ejournal.github.io/videha/')||!p.html.includes('https://github.com/videha-ejournal'))errors.push(`${p.rel}: incomplete Videha official/mirror/archive links`);
 if(/name=["']citation_isbn["']/i.test(p.html))isbnPages++;
 if(p.alts.mai||p.alts.en){paired++;for(const k of ['mai','en','x-default'])if(!p.alts[k])errors.push(`${p.rel}: missing hreflang ${k}`);if(p.lang==='mai'&&p.alts.mai!==p.c)errors.push(`${p.rel}: self hreflang mai != canonical`);if(p.lang==='en'&&p.alts.en!==p.c)errors.push(`${p.rel}: self hreflang en != canonical`);if(p.alts['x-default']!==p.alts.mai)errors.push(`${p.rel}: x-default must resolve to Maithili/default edition`);for(const k of ['mai','en']){const target=byCanonical.get(p.alts[k]);if(target){const back=alternates(target.html);if(k==='mai'&&back.en!==p.alts.en)errors.push(`${p.rel}: Maithili counterpart does not reciprocate English target`);if(k==='en'&&back.mai!==p.alts.mai)errors.push(`${p.rel}: English counterpart does not reciprocate Maithili target`);}}}
 const ids=new Set([...p.html.matchAll(/\sid=["']([^"']+)["']/gi)].map(m=>decode(m[1])));for(const m of p.html.matchAll(/<a\b[^>]*href=["']#([^"']+)["'][^>]*>/gi)){const id=decode(m[1]);if(id&&!ids.has(id))errors.push(`${p.rel}: broken same-page fragment #${id}`);}
}
for(const [title,rels] of titles)if(title&&rels.length>1)errors.push(`Duplicate <title> ${JSON.stringify(title)} on ${rels.join(', ')}`);
assert(paired>=480,`Expected broad bilingual coverage; found only ${paired} pages with alternates.`);assert(isbnPages>=20,`Expected authoritative ISBN propagation to substantial work-related pages; found ${isbnPages}.`);
const dreams=pages.find(p=>p.rel==='when-dreams-merge/en/index.html');assert(dreams?.html.includes('name="citation_isbn" content="978-93-345-0331-9"'),'When Dreams Merge authoritative ISBN missing');
const atma=pages.find(p=>p.html.includes('978-93-5943-857-3')&&/atmatattvaviveka|आत्मतत्त्वविवेक/i.test(p.html));assert(atma,'Ātmatattvaviveka authoritative ISBN not propagated to any scholarly/work page');
const auth=JSON.parse(fs.readFileSync(path.join(root,'isbn','isbn-authority-293.json'),'utf8'));assert.equal(auth.records.length,293);assert(auth.records.every(r=>!Object.keys(r).some(k=>/publisher/i.test(k))),'Publisher field leaked into ISBN authority records');
for(const f of ['bibliography/export.bib','bibliography/export.ris','bibliography/export.json']){const t=fs.readFileSync(path.join(root,f),'utf8');assert(t.includes('2229-547X')&&t.includes('https://www.videha.co.in/')&&t.includes('https://videha-ejournal.github.io/videha/')&&t.includes('https://github.com/videha-ejournal'),`${f}: Videha citation identity incomplete`);assert(t.includes('978-93-5943-857-3'),`${f}: Ātmatattvaviveka ISBN missing`);}
const tools=fs.readFileSync(path.join(root,'reading-tools.js'),'utf8');assert(tools.includes('ISSN 2229-547X')&&tools.includes('Digital Research Archives at GitHub')&&tools.includes('citation_isbn'),'Shared citation tool identity/ISBN support missing');
if(errors.length)throw new Error(`Sitewide integrity validation failed with ${errors.length} error(s):\n${errors.slice(0,80).join('\n')}${errors.length>80?'\n…':''}`);
console.log(`Sitewide integrity PASS: ${files.length} HTML pages; ${paired} bilingual alternate pages reciprocal/self-complete; 0 duplicate titles; 0 broken same-page fragments; ${isbnPages} pages with authoritative ISBN metadata; Videha ISSN/mirror/archive identity present on every page and bibliography export.`);
