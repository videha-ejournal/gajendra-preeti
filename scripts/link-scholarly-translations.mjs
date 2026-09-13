import fs from 'node:fs';
import path from 'node:path';

const ROOT='https://videha-ejournal.github.io/gajendra-preeti';
const DATA='public/bibliography/bibliography-data.json';
const REL='content/samagra-work-relations.json';
const CROSS='public/bibliography/crossref-ready.json';
const data=JSON.parse(fs.readFileSync(DATA,'utf8'));
const relations=JSON.parse(fs.readFileSync(REL,'utf8'));
const byTitle=new Map(data.records.map(r=>[r.title,r]));

function pageUrl(r,en=false){return `${ROOT}/${en?'en/':''}bibliography/works/${r.slug}/`;}
function patchJsonLd(html,r,target,en){
  return html.replace(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/,(all,json)=>{
    try{
      const ld=JSON.parse(json),graph=ld['@graph']||[],work=graph.find(x=>x['@type']==='Book'||x['@type']==='CreativeWork');
      if(!work)return all;
      const rel=r.translationRelation;
      work.inLanguage=r.languages;
      work[rel.relationType]={'@type':'Book',name:target.title,url:pageUrl(target,en)};
      if(rel.translator)work.translator={'@type':'Person',name:rel.translator,alternateName:'गजेन्द्र ठाकुर'};
      return `<script type="application/ld+json">${JSON.stringify(ld).replaceAll('<','\\u003c')}</script>`;
    }catch{return all;}
  });
}
function patchPage(r,target,en){
  const file=`public/${en?'en/':''}bibliography/works/${r.slug}/index.html`;
  if(!fs.existsSync(file))return;
  let html=fs.readFileSync(file,'utf8');
  html=patchJsonLd(html,r,target,en);
  const rel=r.translationRelation;
  const note=en?rel.noteEn:rel.noteMai;
  const heading=en?(rel.relationType==='translationOfWork'?'Translation relationship':'English translation'):(rel.relationType==='translationOfWork'?'अनुवाद-सम्बन्ध':'अंग्रेजी अनुवाद');
  const block=`<section id="translation-relation"><h2>${heading}</h2><p>${note}</p><p><a href="${pageUrl(target,en)}">${target.title} →</a></p>${rel.translationDirection?`<p><strong>${en?'Translation direction':'अनुवाद दिशा'}:</strong> ${rel.translationDirection}</p>`:''}</section>`;
  if(!html.includes('id="translation-relation"'))html=html.replace('<section id="pdf-library">',block+'<section id="pdf-library">');
  if(!html.includes('id="translation-relation"'))html=html.replace('<section id="cite">',block+'<section id="cite">');
  fs.writeFileSync(file,html);
}
function patchCitation(r,target,en){
  const dir=`public/${en?'en/':''}bibliography/works/${r.slug}`;
  const json=path.join(dir,'citation.json');
  if(fs.existsSync(json)){
    const c=JSON.parse(fs.readFileSync(json,'utf8'));
    const rel=r.translationRelation;
    c.language=r.languages.join(', ');
    if(rel.relationType==='translationOfWork')c['original-title']=target.title;
    c.note=[c.note,rel.noteEn,`Related scholarly record: ${pageUrl(target,en)}`].filter(Boolean).join('; ');
    fs.writeFileSync(json,JSON.stringify(c,null,2)+'\n');
  }
  const ris=path.join(dir,'citation.ris');
  if(fs.existsSync(ris)){
    let s=fs.readFileSync(ris,'utf8');
    const marker=`N1  - ${r.translationRelation.noteEn}`;
    if(!s.includes(marker))s=s.replace('ER  - ',`${marker}\nN1  - Related scholarly record: ${pageUrl(target,en)}\nER  - `);
    fs.writeFileSync(ris,s);
  }
}

for(const [title,rel] of Object.entries(relations)){
  const r=byTitle.get(title),target=byTitle.get(rel.relatedTitle);
  if(!r||!target)throw new Error(`Missing scholarly relation record: ${title} -> ${rel.relatedTitle}`);
  r.languages=[rel.language||r.languages?.[0]||'mai'];
  r.translationRelation={...rel,relatedId:target.id,relatedSlug:target.slug,relatedUrl:pageUrl(target,false),relatedUrlEn:pageUrl(target,true)};
  for(const en of [false,true]){patchPage(r,target,en);patchCitation(r,target,en);}
}
fs.writeFileSync(DATA,JSON.stringify(data,null,2)+'\n');
if(fs.existsSync(CROSS)){
  const cross=JSON.parse(fs.readFileSync(CROSS,'utf8')),records=new Map(data.records.map(r=>[r.id,r]));
  for(const row of cross.records||[]){const full=records.get(row.id);if(full?.translationRelation){row.language=full.languages;row.translationRelation=full.translationRelation;}}
  fs.writeFileSync(CROSS,JSON.stringify(cross,null,2)+'\n');
}
console.log(`Linked ${Object.keys(relations).length} scholarly original/translation records.`);
