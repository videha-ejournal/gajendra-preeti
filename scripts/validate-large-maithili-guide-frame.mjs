import fs from 'node:fs';
import assert from 'node:assert/strict';

const dreams=JSON.parse(fs.readFileSync('content/when-dreams-merge-mai/expanded-readings.json','utf8'));
assert.equal(dreams.language,'mai');
assert.equal(dreams.discussions.length,11,'Dreams must have 11 Maithili expanded readings.');
assert.equal(new Set(dreams.discussions.map(x=>x.id)).size,11,'Dreams expanded-reading ids must be unique.');
assert.deepEqual(dreams.discussions.map(x=>x.id),Array.from({length:11},(_,i)=>`extended-${i+1}`));
for(const d of dreams.discussions){
  assert(/^wdm-\d{3}$/.test(d.section),`${d.id}: valid source section anchor required`);
  assert(Array.isArray(d.sourceRecords)&&d.sourceRecords.length>0,`${d.id}: source records required`);
  assert(String(d.title||'').trim().length>8,`${d.id}: substantive Maithili title required`);
  assert(Array.isArray(d.paragraphs)&&d.paragraphs.length>=2,`${d.id}: at least two paragraphs required`);
  assert(d.paragraphs.every(p=>String(p).trim().length>=120),`${d.id}: substantive Maithili paragraphs required`);
  assert(String(d.question||'').trim().length>=30,`${d.id}: carry-forward question required`);
}
assert.equal(dreams.discussions.at(-2).section,'wdm-397','Mahabharata/त्वञ्चाहञ्च reading must anchor at wdm-397.');
assert.equal(dreams.discussions.at(-1).section,'wdm-416','असञ्जाति मन reading must anchor at wdm-416.');

const water=JSON.parse(fs.readFileSync('content/water-burial-mai/guide-frame.json','utf8'));
assert.equal(water.language,'mai');
assert.equal(water.parts.length,3,'Water guide must retain three principal parts.');
assert.deepEqual(water.parts.map(p=>p.count),[100,101,100]);
assert.equal(water.arcs.length,19,'Water guide must retain the 19 reader-facing narrative arcs in the current manifest.');
assert.equal(water.motifs.length,18,'Water guide must have 18 localized motif filters.');
assert.equal(water.additional.length,5,'Water guide must have five post-chapter guide records.');
const nums=[];
for(const a of water.arcs){
  assert(Number.isInteger(a.start)&&Number.isInteger(a.end)&&a.start<=a.end,`${a.id}: valid arc range required`);
  assert(String(a.title||'').trim().length>6,`${a.id}: Maithili arc title required`);
  assert(String(a.summary||'').trim().length>=100,`${a.id}: substantive Maithili arc summary required`);
  for(let n=a.start;n<=a.end;n++) nums.push(n);
}
nums.sort((a,b)=>a-b);
assert.deepEqual(nums,Array.from({length:301},(_,i)=>i-100),'Water arc frame must cover every chapter exactly once from -100 through 200.');
assert.equal(new Set(water.motifs.map(m=>m.id)).size,18,'Water motif ids must be unique.');
assert(water.motifs.every(m=>String(m.label||'').trim().length>=4),'Every Water motif needs a Maithili label.');
assert(water.additional.every(a=>String(a.summary||'').trim().length>=90),'Every Water additional record needs a substantive Maithili summary.');

console.log('Large-guide Maithili guide-frame parity verified: Dreams 11 expanded readings; Water 3 parts / 19 arcs / 18 motifs / 5 additional records.');
