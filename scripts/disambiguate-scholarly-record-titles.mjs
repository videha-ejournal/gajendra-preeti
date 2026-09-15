import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const root=path.resolve('dist/client/gajendra-preeti');
const dirs=[path.join(root,'bibliography','works'),path.join(root,'en','bibliography','works')].filter(fs.existsSync);
const files=dirs.flatMap(dir=>fs.readdirSync(dir,{withFileTypes:true}).filter(e=>e.isDirectory()).map(e=>path.join(dir,e.name,'index.html')).filter(fs.existsSync));

const titleOf=html=>String(html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]||'').replace(/\s+/g,' ').trim();
const groups=new Map();
for(const file of files){
  const html=fs.readFileSync(file,'utf8');
  const title=titleOf(html);
  if(!title)continue;
  const list=groups.get(title)||[];
  list.push(file);
  groups.set(title,list);
}

let changed=0;
for(const [title,dupes] of groups){
  if(dupes.length<2)continue;
  for(const file of dupes){
    let html=fs.readFileSync(file,'utf8');
    const pos=html.match(/(?:SCHOLARLY WORK RECORD|शोधार्थी कृति-अभिलेख)[^<]*·\s*(\d+)/i)?.[1];
    assert(pos,`Cannot disambiguate duplicate title without 00 source position: ${path.relative(root,file)}`);
    const suffix=title.includes(' | Scholarly record |')?' | Scholarly record |':title.includes(' | शोध-अभिलेख |')?' | शोध-अभिलेख |':null;
    assert(suffix,`Unexpected scholarly title shape: ${title}`);
    const replacement=title.replace(suffix,` · 00.${String(pos).padStart(2,'0')}${suffix}`);
    html=html.replace(/<title>[\s\S]*?<\/title>/i,`<title>${replacement}</title>`);
    fs.writeFileSync(file,html);
    changed++;
  }
}

const after=new Map();
for(const file of files){
  const title=titleOf(fs.readFileSync(file,'utf8'));
  const list=after.get(title)||[];
  list.push(path.relative(root,file).split(path.sep).join('/'));
  after.set(title,list);
}
const remaining=[...after].filter(([title,rels])=>title&&rels.length>1);
assert.equal(remaining.length,0,`Duplicate scholarly work titles remain: ${JSON.stringify(remaining)}`);
console.log(`Scholarly work title disambiguation PASS: ${changed} duplicate page title(s) received stable 00 source-position qualifiers.`);
