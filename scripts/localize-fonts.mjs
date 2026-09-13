import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const endpoint=new URL('https://fonts.googleapis.com/css2');
for(const family of [
 'Noto Sans Devanagari:wght@400;500;600;700',
 'Noto Serif Devanagari:wght@400;500;600;700',
 'Space Grotesk:wght@400;500;600;700'
])endpoint.searchParams.append('family',family);
endpoint.searchParams.set('display','swap');
const response=await fetch(endpoint,{headers:{'user-agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/152 Safari/537.36'}});
if(!response.ok)throw new Error(`Google Fonts CSS request failed: ${response.status}`);
let css=await response.text();
const urls=[...new Set([...css.matchAll(/https:\/\/fonts\.gstatic\.com\/[^)'"\s]+\.woff2/g)].map(m=>m[0]))];
if(urls.length<3)throw new Error(`Expected localizable WOFF2 resources, found ${urls.length}`);
const dir=path.join('public','fonts');
fs.mkdirSync(dir,{recursive:true});
for(const old of fs.readdirSync(dir))if(/^atlas-[a-f0-9]{12}\.woff2$/.test(old))fs.rmSync(path.join(dir,old));
for(const url of urls){
 const name=`atlas-${crypto.createHash('sha1').update(url).digest('hex').slice(0,12)}.woff2`;
 const target=path.join(dir,name);
 const fontResponse=await fetch(url);
 if(!fontResponse.ok)throw new Error(`Font download failed: ${fontResponse.status} ${url}`);
 fs.writeFileSync(target,Buffer.from(await fontResponse.arrayBuffer()));
 css=css.split(url).join(`/gajendra-preeti/fonts/${name}`);
}
const notice=`/* Self-hosted build copies of Google Fonts resources.\n   Noto families: SIL Open Font License 1.1, https://github.com/notofonts/devanagari\n   Space Grotesk: SIL Open Font License 1.1, https://github.com/floriankarsten/space-grotesk\n   Generated from the Google Fonts CSS API during prebuild. */\n`;
fs.writeFileSync('app/local-fonts.css',notice+css+'\n');
const globalsPath='app/globals.css';
let globals=fs.readFileSync(globalsPath,'utf8');
globals=globals.replace(/^@import url\(['"]https:\/\/fonts\.googleapis\.com[^\n]+\n?/m,'');
fs.writeFileSync(globalsPath,globals);
console.log(`Localized ${urls.length} WOFF2 font resources.`);
