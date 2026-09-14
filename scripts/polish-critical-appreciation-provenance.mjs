import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const ROOT='public/criticism/reception/en';
const authority=JSON.parse(fs.readFileSync('content/translated-pdf-resources.json','utf8'));
const cfg={
  'preeti-karan':{title:'Preeti Karan Setu Banhal'},
  'setusham':{title:'Setusham: Vibrant Maithili'}
};
const person=name=>({'@type':'Person',name});

function patchJsonLd(html,id){
  const verified=authority.reception?.[id];
  assert(verified,`Missing authoritative reception metadata for ${id}`);
  assert.equal(verified.translator,'Gajendra Thakur');
  let touched=false;
  const out=html.replace(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g,(all,json)=>{
    try{
      const data=JSON.parse(json);
      const visit=node=>{
        if(!node||typeof node!=='object')return;
        if(Array.isArray(node)){node.forEach(visit);return;}
        const types=Array.isArray(node['@type'])?node['@type']:[node['@type']];
        if(types.includes('Book')&&node.name===cfg[id].title){
          node.editor=person(verified.sourceEditor);
          node.translator=person(verified.translator);
          touched=true;
        }
        for(const value of Object.values(node))visit(value);
      };
      visit(data);
      return `<script type="application/ld+json">${JSON.stringify(data).replaceAll('<','\\u003c')}</script>`;
    }catch{return all;}
  });
  return {html:out,touched};
}

let pages=0;
for(const id of Object.keys(cfg)){
  const verified=authority.reception[id];
  const files=[path.join(ROOT,`${id}.html`)];
  const chapterDir=path.join(ROOT,id);
  if(fs.existsSync(chapterDir))for(const f of fs.readdirSync(chapterDir).filter(x=>x.endsWith('.html')))files.push(path.join(chapterDir,f));
  for(const file of files){
    assert(fs.existsSync(file),`Missing generated English critical-appreciation page: ${file}`);
    let html=fs.readFileSync(file,'utf8');
    const patched=patchJsonLd(html,id);html=patched.html;
    assert(patched.touched,`No matching Book JSON-LD node found in ${file}`);
    if(file===path.join(ROOT,`${id}.html`)&&!html.includes('data-provenance="verified-english-translator"')){
      const note=`<p class="version-note" data-provenance="verified-english-translator"><strong>Translation provenance.</strong> The Maithili original was edited by ${verified.sourceEditor}; the English translation is by ${verified.translator}.</p>`;
      html=html.replace('</main>',`${note}</main>`);
    }
    fs.writeFileSync(file,html);
    pages++;
  }
}
console.log(`Critical-appreciation provenance polished on ${pages} English landing/chapter page(s): verified editor + translator propagated into Book JSON-LD.`);
