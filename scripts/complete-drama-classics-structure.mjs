import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const out='public/drama-classics';
const completion=JSON.parse(fs.readFileSync('content/drama-classics/structure-completions.json','utf8'));
const dataPath=path.join(out,'data.json');
const readerPath=path.join(out,'reader.js');
const data=JSON.parse(fs.readFileSync(dataPath,'utf8'));
const records=data.records||[];
const byId=new Map(records.map(r=>[r.id,r]));

const mrc=byId.get('mrcchakatikam');
assert(mrc,'Missing Mrcchakatikam record.');
for(const unit of completion.mrcchakatikam.prependUnits||[]){
  if(!mrc.units.some(u=>u.mai===unit.mai)) mrc.units.unshift(unit);
}

function applyOverrides(id,spec){
  const record=byId.get(id);
  assert(record,`Missing ${id} record.`);
  for(const [nRaw,override] of Object.entries(spec.unitOverrides||{})){
    const n=Number(nRaw);
    const unit=record.units.find(u=>Number(u.n)===n);
    assert(unit,`${id}: missing unit ${n}`);
    if(override.en) unit.en=override.en;
    if(override.mai) unit.mai=override.mai;
    if(Array.isArray(override.subunits)) unit.subunits=override.subunits;
  }
}
applyOverrides('bhallata-kshemendra-nilakantha',completion['bhallata-kshemendra-nilakantha']);
applyOverrides('sankarshan',completion.sankarshan);

assert.equal(records.length,22,'Drama reader must still contain 22 works.');
assert.equal(mrc.units.length,12,'Mrcchakatikam must expose setting + 10 acts + Bharata-vakya.');
assert.equal(mrc.units[0].mai,'दृश्य: उज्जयिनी आ आसपास');

const bh=byId.get('bhallata-kshemendra-nilakantha');
const bh2=bh.units.find(u=>Number(u.n)===2),bh3=bh.units.find(u=>Number(u.n)===3);
assert.equal(bh2.subunits.length,10,'Kalavilasa must expose all 10 cantos.');
assert.equal(bh3.subunits.length,14,'Kali satire must expose 13 sections + epilogue.');
for(const x of [...bh2.subunits,...bh3.subunits]){assert(String(x.mai||'').trim());assert(String(x.en||'').trim());}

const sank=byId.get('sankarshan');
assert.deepEqual(sank.units.map(u=>u.subunits.length),[3,4,5,3,3],'Sankarshan must expose all 18 acts across five waves.');
assert.equal(sank.units.reduce((n,u)=>n+u.subunits.length,0),18);
for(const u of sank.units) for(const x of u.subunits){assert(String(x.mai||'').trim());assert(String(x.en||'').trim());}

fs.writeFileSync(dataPath,JSON.stringify(data));

let js=fs.readFileSync(readerPath,'utf8');
const structurePattern=/function nested\(u\)\{[\s\S]*?\}function card\(r,mode\)\{/;
assert(structurePattern.test(js),'Reader structure functions changed; nested bilingual patch could not be applied safely.');
const structureReplacement=`function nested(u,which){const xs=Array.isArray(u.subunits)?u.subunits:[],ct=u.unitCount?(which==='en'?u.unitCount+' source verses':u.unitCount+' स्रोत पद्य'):'';const label=x=>typeof x==='string'?x:(which==='en'?(x.en||x.mai):(x.mai||x.en));return(ct?'<small>'+esc(ct)+'</small>':'')+(xs.length?'<ul class="subunits">'+xs.map(x=>'<li>'+esc(label(x))+'</li>').join('')+'</ul>':'')}function unitHtml(u,mode){const mai='<div class="mai"><strong>'+esc(u.mai)+'</strong><p>'+esc(u.gistMai)+'</p>'+nested(u,'mai')+'</div>',en='<div class="en"><strong>'+esc(u.en)+'</strong><p>'+esc(u.gistEn)+'</p>'+nested(u,'en')+'</div>';return '<div class="unit '+(mode==='both'?'bilingual':'')+'">'+(mode==='en'?en:mode==='mai'?mai:mai+en)+'</div>'}function card(r,mode){`;
js=js.replace(structurePattern,structureReplacement);
const oldSearch="r.units.flatMap(u=>[u.mai,u.en,u.gistMai,u.gistEn,...(u.subunits||[])])";
const newSearch="r.units.flatMap(u=>[u.mai,u.en,u.gistMai,u.gistEn,...(u.subunits||[]).flatMap(x=>typeof x==='string'?[x]:[x.mai,x.en])])";
assert(js.includes(oldSearch),'Reader search expression changed; bilingual nested search patch could not be applied safely.');
js=js.replace(oldSearch,newSearch);
assert(js.includes("nested(u,'mai')")&&js.includes("nested(u,'en')"),'Bilingual nested renderer not installed.');
fs.writeFileSync(readerPath,js);

console.log('Completed Drama & Sanskrit Classics source structure: Mrcchakatikam setting, 24 bilingual Bhallata nested divisions, and all 18 bilingual Sankarshan acts.');
