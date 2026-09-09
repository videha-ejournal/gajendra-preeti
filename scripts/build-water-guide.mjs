import fs from 'node:fs';
import path from 'node:path';
import {gunzipSync} from 'node:zlib';

const sourceDir='content/water-guide';
const destination='public/water-burial-among-the-crocodiles';
const parts=fs.readdirSync(sourceDir).filter(name=>/^part-\d+\.txt$/.test(name)).sort();
if(!parts.length) throw new Error('No Water-Burial guide bundle parts found.');
const encoded=parts.map(name=>fs.readFileSync(path.join(sourceDir,name),'utf8').trim()).join('');
const bundle=JSON.parse(gunzipSync(Buffer.from(encoded,'base64')).toString('utf8'));
fs.rmSync(destination,{recursive:true,force:true});
for(const [relative,content] of Object.entries(bundle)){
  const target=path.join(destination,relative);
  fs.mkdirSync(path.dirname(target),{recursive:true});
  fs.writeFileSync(target,content,'utf8');
}
const sitemap='public/sitemap.xml';
const canonical='https://videha-ejournal.github.io/gajendra-preeti/water-burial-among-the-crocodiles/';
if(fs.existsSync(sitemap)){
  let xml=fs.readFileSync(sitemap,'utf8');
  if(!xml.includes(canonical)) xml=xml.replace('</urlset>',`  <url><loc>${canonical}</loc></url>\n</urlset>`);
  fs.writeFileSync(sitemap,xml,'utf8');
}
console.log(`Built Water-Burial guide from ${parts.length} bundle parts with ${Object.keys(bundle).length} files.`);
