import fs from 'node:fs';
import path from 'node:path';
import * as z from 'node:zlib';
const dir='content/classical-philosophy';
const names=['chunk-01.bin','chunk-02.bin','chunk-03.bin'];
const chunks=names.map(n=>fs.readFileSync(path.join(dir,n),'utf8').trim());
console.log('CLASSICAL-DIAG text sizes',chunks.map(s=>s.length).join(','),'heads',chunks.map(s=>s.slice(0,8)).join(','));
const perms=[[0,1,2],[0,2,1],[1,0,2],[1,2,0],[2,0,1],[2,1,0]];
const algs=[['gunzip',z.gunzipSync],['inflate',z.inflateSync],['inflateRaw',z.inflateRawSync],['unzip',z.unzipSync],['brotli',z.brotliDecompressSync]];
if (typeof z.zstdDecompressSync === 'function') algs.push(['zstd',z.zstdDecompressSync]);
let found=false;
for(const p of perms){
 const joined=p.map(i=>chunks[i]).join('');
 const buf=Buffer.from(joined,'base64');
 console.log('CLASSICAL-DIAG decoded',p.join(''),'bytes',buf.length,'magic',buf.subarray(0,16).toString('hex'));
 for(const [kind,fn] of algs){
  try{
   const out=fn(buf);
   console.log('CLASSICAL-DIAG SUCCESS',p.join(''),kind,'bytes',out.length,'head',out.subarray(0,200).toString('utf8').replace(/\s+/g,' '));
   try{
     const obj=JSON.parse(out.toString('utf8'));
     console.log('CLASSICAL-DIAG JSON keys',Object.keys(obj).join(','));
     console.log('CLASSICAL-DIAG bundle files',Object.keys(obj).length);
     for(const [k,v] of Object.entries(obj)) console.log('CLASSICAL-FILE',k,'chars',typeof v==='string'?v.length:JSON.stringify(v).length);
     found=true;
   }catch(e){ console.log('CLASSICAL-DIAG decompressed but not JSON',String(e)); }
  }catch{}
 }
}
if(!found) console.log('CLASSICAL-DIAG no complete decoded compressed stream found.');
