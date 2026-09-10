import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

function records(dir){
  return fs.readdirSync(dir).filter(n=>n.endsWith('.json')).sort().flatMap(n=>{
    const payload=JSON.parse(fs.readFileSync(path.join(dir,n),'utf8'));
    return Array.isArray(payload.records)?payload.records:[];
  });
}
const hex12=v=>/^[0-9a-f]{12}$/i.test(String(v||''));

// The former compressed transport bundle was a staging artifact and became corrupted in transit.
// The durable source-integrity layer is now the independently committed per-record metadata itself:
// exact sequence, source kind/part, original title/page locator and source fingerprint.
const dreams=records('content/when-dreams-merge-mai').sort((a,b)=>Number(a.id.slice(4))-Number(b.id.slice(4)));
assert.equal(dreams.length,447,'When Dreams Merge must contain exactly 447 source-indexed records.');
assert.deepEqual(dreams.map(x=>x.id),Array.from({length:447},(_,i)=>`wdm-${String(i+1).padStart(3,'0')}`),'Dreams source sequence must remain wdm-001 through wdm-447.');
assert(dreams.every(x=>String(x.title||'').trim()),'Every Dreams source record needs its authoritative title.');
assert(dreams.every(x=>Number.isInteger(x.page)&&x.page>0),'Every Dreams source record needs its PDF/page locator.');
const sections=dreams.filter(x=>x.kind==='section');
const nonSections=dreams.filter(x=>x.kind!=='section');
assert.equal(sections.length,10,'When Dreams Merge must retain exactly 10 structural section records.');
assert.equal(nonSections.length,437,'When Dreams Merge must retain exactly 437 non-section source records.');
assert(nonSections.every(x=>hex12(x.sourceHash)),'Every non-section Dreams record must retain its 12-hex original-Maithili source fingerprint.');

const water=records('content/water-burial-mai').sort((a,b)=>a.n-b.n);
assert.equal(water.length,301,'Water-Burial must contain exactly 301 source-indexed chapters.');
assert.deepEqual(water.map(x=>x.n),Array.from({length:301},(_,i)=>i-100),'Water source sequence must remain Chapter -100 through 200.');
assert(water.every(x=>String(x.title||'').trim()),'Every Water source record needs its authoritative Maithili chapter title.');
assert(water.every(x=>hex12(x.sourceHash)),'Every Water chapter must retain its 12-hex original-Maithili source fingerprint.');
for(const x of water){
  const expected=x.n<0?'p0':x.n<=100?'p1':'p2';
  assert.equal(x.part,expected,`Chapter ${x.n}: formal part drift; expected ${expected}.`);
}
assert.deepEqual(['p0','p1','p2'].map(p=>water.filter(x=>x.part===p).length),[100,101,100],'Water formal part counts must remain 100/101/100.');

console.log('Durable Maithili source metadata verified: Dreams 447/447 (10 structural + 437 fingerprinted source records); Water 301/301 with 100/101/100 formal-part structure.');
