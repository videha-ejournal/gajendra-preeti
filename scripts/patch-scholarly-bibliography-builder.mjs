import fs from 'node:fs';
const file='scripts/build-scholarly-bibliography.mjs';
let s=fs.readFileSync(file,'utf8');
s=s.replace("const verifiedDisplay=meta.updatedDisplay||'13 September 2026';","const verifiedDisplay=meta.updatedDisplayEn||'13 September 2026';");
s=s.replace("const expr=source.slice(start+'const main='.length,end+1);","const expr=source.slice(start+'const main='.length,end+2).replace(/;\\s*$/,'');");
fs.writeFileSync(file,s,'utf8');
console.log('Scholarly bibliography builder parser hardened for authoritative Samagra array syntax.');
