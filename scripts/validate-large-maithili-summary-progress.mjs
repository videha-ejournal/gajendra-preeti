import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {gunzipSync} from 'node:zlib';

function sourceIndex(){
  const dir='content/large-maithili-guides';
  const names=fs.readdirSync(dir).filter(n=>/^part-\d+\.txt$/.test(n)).sort();
  const chunks=names.map(n=>fs.readFileSync(path.join(dir,n),'utf8').trim());
  chunks[0]=chunks[0].slice(0,4000);
  return JSON.parse(gunzipSync(Buffer.from(chunks.join(''),'base64')).toString('utf8'));
}
function jsonRecords(dir){
  return fs.readdirSync(dir).filter(n=>n.endsWith('.json')).sort().flatMap(n=>{
    const payload=JSON.parse(fs.readFileSync(path.join(dir,n),'utf8'));
    assert.equal(payload.language,'mai',`${n}: language must be mai`);
    assert(String(payload.basis||'').includes('Maithili'),`${n}: source basis must identify the Maithili master`);
    return payload.records||[];
  });
}
const source=sourceIndex();

const dreams=jsonRecords('content/when-dreams-merge-mai').sort((a,b)=>Number(a.id.slice(4))-Number(b.id.slice(4)));
assert(dreams.length>0,'No Maithili Dreams summaries found');
assert.deepEqual(dreams.map(x=>x.id),Array.from({length:dreams.length},(_,i)=>`wdm-${String(i+1).padStart(3,'0')}`),'Dreams progress must remain contiguous from wdm-001');
const dreamSource=new Map(source.dreams.entries.map(x=>[x.id,x]));
for(const x of dreams){
  const s=dreamSource.get(x.id); assert(s,`${x.id}: source record missing`);
  assert.equal(x.title,s.title,`${x.id}: title drift`); assert.equal(x.page,s.page,`${x.id}: page drift`); assert.equal(x.kind,s.kind,`${x.id}: kind drift`);
  if(s.sourceHash) assert.equal(x.sourceHash,s.sourceHash,`${x.id}: source fingerprint drift`);
  assert(String(x.summary||'').trim().length>=80,`${x.id}: substantive Maithili summary required`);
}

const water=jsonRecords('content/water-burial-mai').sort((a,b)=>a.n-b.n);
assert(water.length>0,'No Maithili Water-Burial summaries found');
assert.deepEqual(water.map(x=>x.n),Array.from({length:water.length},(_,i)=>i-100),'Water-Burial progress must remain contiguous from Chapter -100');
const waterSource=new Map(source.water.chapters.map(x=>[x.n,x]));
for(const x of water){
  const s=waterSource.get(x.n); assert(s,`Chapter ${x.n}: source record missing`);
  assert.equal(x.title,s.title,`Chapter ${x.n}: title drift`); assert.equal(x.part,s.part,`Chapter ${x.n}: part drift`); assert.equal(x.sourceHash,s.sourceHash,`Chapter ${x.n}: source fingerprint drift`);
  assert(String(x.summary||'').trim().length>=80,`Chapter ${x.n}: substantive Maithili summary required`);
}
console.log(`Maithili summary progress verified: When Dreams Merge ${dreams.length}/447; Water-Burial ${water.length}/301.`);
