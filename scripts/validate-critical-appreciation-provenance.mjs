import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const source=JSON.parse(fs.readFileSync('content/reception-gists.json','utf8'));
const authority=JSON.parse(fs.readFileSync('content/translated-pdf-resources.json','utf8'));
const expected={
  'preeti-karan':'Preeti Karan Setu Banhal',
  'setusham':'Setusham: Vibrant Maithili'
};

function scripts(html){
  return [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m=>JSON.parse(m[1]));
}
function books(node,out=[]){
  if(!node||typeof node!=='object')return out;
  if(Array.isArray(node)){for(const x of node)books(x,out);return out;}
  const types=Array.isArray(node['@type'])?node['@type']:[node['@type']];
  if(types.includes('Book'))out.push(node);
  for(const v of Object.values(node))books(v,out);
  return out;
}

let chapterCount=0;
for(const [id,title] of Object.entries(expected)){
  const src=(source.books||[]).find(x=>x.id===id);
  const verified=authority.reception?.[id];
  assert(src&&verified,`${id}: source + authority records required`);
  assert.equal(src.translator,'Gajendra Thakur',`${id}: normalized reception source must credit Gajendra Thakur as translator`);
  assert.equal(src.editor,'Ashish Anchinhar',`${id}: normalized reception source must credit Ashish Anchinhar as editor`);
  assert(!/No English translator credit/i.test(src.editionNote||''),`${id}: stale translator-null note must be absent after normalization`);
  assert.equal(verified.translator,'Gajendra Thakur',`${id}: authoritative translated-resource record changed unexpectedly`);
  const landing=`public/criticism/reception/en/${id}.html`;
  const landingHtml=fs.readFileSync(landing,'utf8');
  assert(landingHtml.includes('data-provenance="verified-english-translator"'),`${id}: English landing must expose visible translator provenance`);
  const allLandingBooks=scripts(landingHtml).flatMap(x=>books(x));
  const parent=allLandingBooks.find(x=>x.name===title);
  assert(parent,`${id}: English landing missing Book JSON-LD`);
  assert.equal(parent.translator?.name,'Gajendra Thakur',`${id}: English landing Book JSON-LD missing translator`);
  assert.equal(parent.editor?.name,'Ashish Anchinhar',`${id}: English landing Book JSON-LD missing editor`);

  const dir=`public/criticism/reception/en/${id}`;
  for(const file of fs.readdirSync(dir).filter(x=>x.endsWith('.html'))){
    const html=fs.readFileSync(path.join(dir,file),'utf8');
    const parentBook=scripts(html).flatMap(x=>books(x)).find(x=>x.name===title);
    assert(parentBook,`${id}/${file}: chapter missing parent Book JSON-LD`);
    assert.equal(parentBook.translator?.name,'Gajendra Thakur',`${id}/${file}: parent Book translator must be Gajendra Thakur`);
    assert.equal(parentBook.editor?.name,'Ashish Anchinhar',`${id}/${file}: parent Book editor must be Ashish Anchinhar`);
    chapterCount++;
  }
}
console.log(`Critical-appreciation provenance validation PASS: 2 paired books + ${chapterCount} English chapter pages use one verified editor/translator authority.`);
