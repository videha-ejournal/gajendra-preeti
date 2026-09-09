import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {gunzipSync} from 'node:zlib';

const sourceDir='content/parallel-history';
const destination='public/parallel-history';
const parts=fs.readdirSync(sourceDir).filter(name=>/^part-\d+\.txt$/.test(name)).sort();
if(!parts.length) throw new Error('No Parallel History guide bundle parts found.');
const encoded=parts.map(name=>fs.readFileSync(path.join(sourceDir,name),'utf8').trim()).join('');
const bundle=JSON.parse(gunzipSync(Buffer.from(encoded,'base64')).toString('utf8'));
const manifest=JSON.parse(bundle['manifest.json']);

assert.equal(manifest.chapterCount,178,'Parallel History guide must declare all 178 chapters.');
assert.deepEqual(manifest.bookCounts,{'1':28,'2':150},'Book chapter counts must be 28 and 150.');
assert.equal(manifest.sectionCount,20,'Parallel History guide must declare all 20 source sections.');
assert.equal(manifest.sections?.length,20,'Parallel History manifest must contain 20 source sections.');

const chapters=[];
for(const file of manifest.files){
  assert(bundle[file],`Missing bundle file ${file}`);
  const payload=JSON.parse(bundle[file]);
  for(const chapter of payload.chapters||[]){
    assert([1,2].includes(chapter.book),`${file}: invalid book`);
    assert(Number.isInteger(chapter.n),`${file}: chapter number must be integer`);
    assert(manifest.sections.some(section=>section.id===chapter.section&&section.book===chapter.book),`${file}: invalid section for Book ${chapter.book} Chapter ${chapter.n}`);
    for(const lang of ['mai','en']){
      assert(String(chapter[lang]?.title||'').trim(),`${file}: Book ${chapter.book} Chapter ${chapter.n} missing ${lang} title`);
      assert(String(chapter[lang]?.summary||'').trim(),`${file}: Book ${chapter.book} Chapter ${chapter.n} missing ${lang} summary`);
    }
    chapters.push(chapter);
  }
}
chapters.sort((a,b)=>a.book-b.book||a.n-b.n);
assert.equal(chapters.length,178,'Exactly 178 chapter records are required.');
for(const [book,count] of [[1,28],[2,150]]){
  const nums=chapters.filter(c=>c.book===book).map(c=>c.n);
  assert.deepEqual(nums,Array.from({length:count},(_,i)=>i+1),`Book ${book} must contain every chapter exactly once.`);
}
for(const section of manifest.sections){
  const group=chapters.filter(c=>c.section===section.id);
  assert.equal(group.length,section.count,`${section.id}: section count mismatch`);
  assert.deepEqual(group.map(c=>c.n),Array.from({length:section.end-section.start+1},(_,i)=>section.start+i),`${section.id}: chapter range mismatch`);
}

fs.rmSync(destination,{recursive:true,force:true});
for(const [relative,content] of Object.entries(bundle)){
  const target=path.join(destination,relative);
  fs.mkdirSync(path.dirname(target),{recursive:true});
  fs.writeFileSync(target,content,'utf8');
}

const sitemap='public/sitemap.xml';
const canonicals=[
  'https://videha-ejournal.github.io/gajendra-preeti/parallel-history/',
  'https://videha-ejournal.github.io/gajendra-preeti/parallel-history/en/'
];
if(fs.existsSync(sitemap)){
  let xml=fs.readFileSync(sitemap,'utf8');
  for(const canonical of canonicals){
    if(!xml.includes(canonical)) xml=xml.replace('</urlset>',`  <url><loc>${canonical}</loc></url>\n</urlset>`);
  }
  fs.writeFileSync(sitemap,xml,'utf8');
}

console.log(`Built bilingual Parallel History guide: ${chapters.length} chapters, ${manifest.sectionCount} source sections, ${parts.length} bundle parts.`);
