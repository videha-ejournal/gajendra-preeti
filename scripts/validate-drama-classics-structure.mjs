import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const root='dist/client/gajendra-preeti/drama-classics';
const data=JSON.parse(fs.readFileSync(path.join(root,'data.json'),'utf8'));
const audit=JSON.parse(fs.readFileSync('content/drama-classics/source-audit.json','utf8'));
const records=data.records||[];
const byId=new Map(records.map(r=>[r.id,r]));

assert.equal(records.length,22,'Built Drama & Sanskrit Classics reader must contain 22 works.');
assert.equal(new Set(records.map(r=>r.id)).size,22,'Built Drama & Sanskrit Classics ids must be unique.');

for(const collection of audit.collections||[]){
  for(const expected of collection.works||[]){
    const actual=byId.get(expected.id);
    assert(actual,`Missing audited work: ${expected.id}`);
    let topCount=0;
    if(Array.isArray(expected.unitsMai)) topCount=expected.unitsMai.length;
    else if(Array.isArray(expected.subworks)) topCount=expected.subworks.length;
    else if(Array.isArray(expected.waves)) topCount=expected.waves.length;
    assert.equal(actual.units.length,topCount,`${expected.id}: built top-level structure differs from source audit.`);

    if(Array.isArray(expected.subworks)){
      expected.subworks.forEach((subwork,i)=>{
        const built=actual.units[i];
        if(Array.isArray(subwork.unitsMai)) assert.equal((built.subunits||[]).length,subwork.unitsMai.length,`${expected.id}: subwork ${i+1} nested division count mismatch.`);
        if(typeof subwork.structure==='string'&&/100-verse/.test(subwork.structure)) assert.equal(Number(built.unitCount),100,`${expected.id}: Bhallata century must retain all 100 source verses.`);
      });
    }
    if(Array.isArray(expected.waves)){
      expected.waves.forEach((wave,i)=>assert.equal((actual.units[i].subunits||[]).length,(wave.actsMai||[]).length,`${expected.id}: wave ${i+1} act count mismatch.`));
    }
  }
}

for(const r of records){
  for(const key of ['titleMai','titleEn','summaryMai','summaryEn','authorMai','authorEn','kindMai','kindEn','relationMai','relationEn']){
    assert(String(r[key]||'').trim(),`${r.id}: displayed content exists in only one language or is missing: ${key}`);
  }
  assert.equal(Boolean(r.subtitleMai),Boolean(r.subtitleEn),`${r.id}: subtitle exists in only one language.`);
  for(const u of r.units||[]){
    for(const key of ['mai','en','gistMai','gistEn']) assert(String(u[key]||'').trim(),`${r.id}: source unit lacks paired ${key}`);
    for(const x of u.subunits||[]){
      assert(x&&typeof x==='object'&&!Array.isArray(x),`${r.id}: raw one-language nested heading remains: ${String(x)}`);
      assert(String(x.mai||'').trim(),`${r.id}: nested heading lacks Maithili counterpart.`);
      assert(String(x.en||'').trim(),`${r.id}: nested heading lacks English counterpart.`);
    }
  }
}

const mrc=byId.get('mrcchakatikam');
assert.equal(mrc.units.length,12,'Mrcchakatikam must expose setting + ten acts + Bharata-vakya.');
assert.equal(mrc.units[0].mai,'दृश्य: उज्जयिनी आ आसपास');
assert.match(mrc.units[0].en,/Ujjayini/);

const bh=byId.get('bhallata-kshemendra-nilakantha');
assert.equal(bh.units[1].subunits.length,10,'Kalavilasa must expose ten cantos.');
assert.equal(bh.units[2].subunits.length,14,'Kali satire must expose thirteen sections and epilogue.');
for(const x of [...bh.units[1].subunits,...bh.units[2].subunits]){assert(String(x.mai||'').trim(),'Bhallata composite nested title missing Maithili.');assert(String(x.en||'').trim(),'Bhallata composite nested title missing English.');}

const sank=byId.get('sankarshan');
assert.deepEqual(sank.units.map(u=>u.subunits.length),[3,4,5,3,3],'Sankarshan five waves must preserve 3+4+5+3+3 acts.');
assert.equal(sank.units.reduce((sum,u)=>sum+u.subunits.length,0),18,'Sankarshan must expose all 18 acts.');
for(const u of sank.units) for(const x of u.subunits){assert(String(x.mai||'').trim(),'Sankarshan act missing Maithili title.');assert(String(x.en||'').trim(),'Sankarshan act missing English title.');}

assert(String(data.manifest.sourcePolicyMai||'').trim(),'Manifest source policy lacks Maithili version.');
assert(String(data.manifest.sourcePolicyEn||'').trim(),'Manifest source policy lacks English version.');
assert(String(data.manifest.generatedFromMai||'').trim(),'Manifest provenance lacks Maithili version.');
assert(String(data.manifest.generatedFromEn||'').trim(),'Manifest provenance lacks English version.');
assert.equal(data.manifest.languageCoverage?.status,'paired','Manifest must declare paired language coverage.');

const reader=fs.readFileSync(path.join(root,'reader.js'),'utf8');
assert(reader.includes("nested(u,'mai')")&&reader.includes("nested(u,'en')"),'Reader must render nested structures in the selected language.');
assert(reader.includes("[x.mai,x.en]"),'Reader search must index both languages of nested structures.');
assert(reader.includes("r.kindEn:r.kindMai"),'Reader must localise the genre/kind badge.');
assert(reader.includes("r.authorEn:r.authorMai"),'Reader must localise author display.');
assert(reader.includes("r.relationEn:r.relationMai"),'Reader must localise source/translation relation display.');

console.log('Drama & Sanskrit Classics bilingual structural QA passed: all 22 works and every displayed title, summary, author, genre, source relation, unit, gist and nested division have paired Maithili + English text; source-defined structures remain complete.');
