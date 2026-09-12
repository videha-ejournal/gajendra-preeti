import fs from 'node:fs';
import assert from 'node:assert/strict';
const units=JSON.parse(fs.readFileSync('content/six-books-unit-index.json','utf8'));
let count=0;
for(const [id,key] of Object.entries({'nav-pankhi':'nav','kut-naam':'kut','saatam-sakshi':'saatam'})){
 const entries=JSON.parse(fs.readFileSync(`content/six-books-${key}-readings.json`,'utf8'));
 assert.deepEqual(entries.map(r=>r.id),units[id].map(r=>r.id),`${id}: every source division must have one discussion`);
 for(const lang of ['mai','en']){
  const html=fs.readFileSync(`public/six-books/${id}/${lang==='en'?'en/':''}index.html`,'utf8');
  assert(html.includes(`<html lang="${lang}">`));
  assert.equal([...html.matchAll(/class="chapter-reading" id="reading-/g)].length,entries.length);
  for(const r of entries){
   assert(r[lang].length===2,`${id}/${r.id}: summary and interpretation`);
   assert(r.en.join(' ').split(/\s+/).length>=65,`${id}/${r.id}: no short placeholder`);
   const u=units[id].find(u=>u.id===r.id);
   assert(html.includes(`id="reading-${r.id}"`));
   assert(html.includes(`${u.start}–${u.end}`),`${id}/${r.id}: source range missing`);
   assert(html.includes(`${lang==='en'?'':'en/'}#reading-${r.id}" lang="${lang==='en'?'mai':'en'}"`));
  }
 }
 count+=entries.length;
}
console.log(`Six-book readings PASS: ${count} distinct discussions, paired languages, complete coverage of Nav Pankhi, Kut Naam and Saatam Sakshi, source ranges and stable cross-language anchors.`);
