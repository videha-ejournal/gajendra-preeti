import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

function jsonRecords(dir){
  return fs.readdirSync(dir).filter(n=>n.endsWith('.json')).sort().flatMap(n=>{
    const payload=JSON.parse(fs.readFileSync(path.join(dir,n),'utf8'));
    if(!Array.isArray(payload.records)) return [];
    assert.equal(payload.language,'mai',`${n}: language must be mai`);
    assert(String(payload.basis||'').includes('Maithili'),`${n}: source basis must identify the Maithili master`);
    return payload.records;
  });
}

const dreams=jsonRecords('content/when-dreams-merge-mai').sort((a,b)=>Number(a.id.slice(4))-Number(b.id.slice(4)));
assert.equal(dreams.length,447,'Dreams Maithili primary layer must contain all 447 records.');
assert.deepEqual(dreams.map(x=>x.id),Array.from({length:447},(_,i)=>`wdm-${String(i+1).padStart(3,'0')}`),'Dreams records must remain contiguous from wdm-001 through wdm-447');
for(const x of dreams){
  assert(String(x.title||'').trim(),`${x.id}: authoritative title required`);
  assert(Number.isInteger(x.page)&&x.page>0,`${x.id}: page locator required`);
  assert(String(x.kind||'').trim(),`${x.id}: record kind required`);
  if(x.kind!=='section') assert(/^[0-9a-f]{12}$/i.test(String(x.sourceHash||'')),`${x.id}: original-Maithili source fingerprint required`);
  assert(String(x.summary||'').trim().length>=80,`${x.id}: substantive Maithili summary required`);
}

const water=jsonRecords('content/water-burial-mai').sort((a,b)=>a.n-b.n);
assert.equal(water.length,301,'Water-Burial Maithili primary layer must contain all 301 chapters.');
assert.deepEqual(water.map(x=>x.n),Array.from({length:301},(_,i)=>i-100),'Water-Burial records must remain contiguous from Chapter -100 through 200');
for(const x of water){
  assert(String(x.title||'').trim(),`Chapter ${x.n}: authoritative title required`);
  assert(['p0','p1','p2'].includes(x.part),`Chapter ${x.n}: formal part required`);
  assert(/^[0-9a-f]{12}$/i.test(String(x.sourceHash||'')),`Chapter ${x.n}: original-Maithili source fingerprint required`);
  assert(String(x.summary||'').trim().length>=80,`Chapter ${x.n}: substantive Maithili summary required`);
}
console.log('Complete substantive Maithili primary layers verified: When Dreams Merge 447/447; Water-Burial 301/301.');
