import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {gunzipSync} from 'node:zlib';

const sourceDir='content/parallel-guide';
const destination='public/parallel-philosophy';
const parts=fs.readdirSync(sourceDir).filter(name=>/^part-\d+\.txt$/.test(name)).sort();
if(!parts.length) throw new Error('No Parallel Philosophy guide bundle parts found.');
const encoded=parts.map(name=>fs.readFileSync(path.join(sourceDir,name),'utf8').trim()).join('');
const bundle=JSON.parse(gunzipSync(Buffer.from(encoded,'base64')).toString('utf8'));
const manifest=JSON.parse(bundle['manifest.json']);

assert.equal(manifest.chapterCount,172,'Parallel Philosophy guide must declare all 172 chapters.');
assert.deepEqual(manifest.volumeCounts,{'1':72,'2':100},'Volume chapter counts must be 72 and 100.');
assert.equal(manifest.partCount,23,'Parallel Philosophy guide must declare all 23 thematic parts.');
const chapters=[];
for(const file of manifest.files){
  assert(bundle[file],`Missing bundle file ${file}`);
  const payload=JSON.parse(bundle[file]);
  for(const chapter of payload.chapters||[]){
    assert([1,2].includes(chapter.volume),`${file}: invalid volume`);
    assert(Number.isInteger(chapter.n),`${file}: chapter number must be integer`);
    for(const lang of ['mai','en']){
      assert(String(chapter[lang]?.title||'').trim(),`${file}: V${chapter.volume} Ch ${chapter.n} missing ${lang} title`);
      assert(String(chapter[lang]?.summary||'').trim(),`${file}: V${chapter.volume} Ch ${chapter.n} missing ${lang} summary`);
    }
    chapters.push(chapter);
  }
}
chapters.sort((a,b)=>a.volume-b.volume||a.n-b.n);
assert.equal(chapters.length,172,'Exactly 172 chapter records are required.');
for(const [volume,count] of [[1,72],[2,100]]){
  const nums=chapters.filter(c=>c.volume===volume).map(c=>c.n);
  assert.deepEqual(nums,Array.from({length:count},(_,i)=>i+1),`Volume ${volume} must contain every chapter exactly once.`);
}

fs.rmSync(destination,{recursive:true,force:true});
for(const [relative,content] of Object.entries(bundle)){
  const target=path.join(destination,relative);
  fs.mkdirSync(path.dirname(target),{recursive:true});
  fs.writeFileSync(target,content,'utf8');
}

const sitemap='public/sitemap.xml';
const canonicals=[
  'https://videha-ejournal.github.io/gajendra-preeti/parallel-philosophy/',
  'https://videha-ejournal.github.io/gajendra-preeti/parallel-philosophy/en/'
];
if(fs.existsSync(sitemap)){
  let xml=fs.readFileSync(sitemap,'utf8');
  for(const canonical of canonicals){
    if(!xml.includes(canonical)) xml=xml.replace('</urlset>',`  <url><loc>${canonical}</loc></url>\n</urlset>`);
  }
  fs.writeFileSync(sitemap,xml,'utf8');
}

console.log(`Built bilingual Parallel Philosophy guide: ${chapters.length} chapters, ${manifest.partCount} parts, ${parts.length} bundle parts.`);
