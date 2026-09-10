import fs from 'node:fs';
import path from 'node:path';
import {gunzipSync,inflateSync,brotliDecompressSync} from 'node:zlib';
const dir='content/classical-philosophy';
const names=['chunk-01.bin','chunk-02.bin','chunk-03.bin'];
const chunks=names.map(n=>fs.readFileSync(path.join(dir,n)));
console.log('CLASSICAL-DIAG sizes',chunks.map(b=>b.length).join(','),'magic',chunks.map(b=>b.subarray(0,8).toString('hex')).join(','));
const perms=[[0,1,2],[0,2,1],[1,0,2],[1,2,0],[2,0,1],[2,1,0]];
let found=false;
for(const p of perms){
 const buf=Buffer.concat(p.map(i=>chunks[i]));
 for(const [kind,fn] of [['gunzip',gunzipSync],['inflate',inflateSync],['brotli',brotliDecompressSync]]){
  try{
   const out=fn(buf);
   console.log('CLASSICAL-DIAG SUCCESS',p.join(''),kind,'bytes',out.length,'head',out.subarray(0,120).toString('utf8').replace(/\s+/g,' '));
   try{const obj=JSON.parse(out.toString('utf8'));console.log('CLASSICAL-DIAG JSON keys',Object.keys(obj).join(','));if(obj&&typeof obj==='object')console.log('CLASSICAL-DIAG bundle files',Object.keys(obj).length);found=true;}catch{}
  }catch{}
 }
}
if(!found) console.log('CLASSICAL-DIAG no complete compressed stream found in the three stored chunks.');
