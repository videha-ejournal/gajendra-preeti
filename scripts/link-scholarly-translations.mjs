import fs from 'node:fs';
import path from 'node:path';

const ROOT='https://videha-ejournal.github.io/gajendra-preeti';
const DATA='public/bibliography/bibliography-data.json';
const REL='content/samagra-work-relations.json';
const CROSS='public/bibliography/crossref-ready.json';
const data=JSON.parse(fs.readFileSync(DATA,'utf8'));
const relationSpecs=JSON.parse(fs.readFileSync(REL,'utf8'));
const byTitle=new Map(data.records.map(r=>[r.title,r]));

function pageUrl(r,en=false){return `${ROOT}/${en?'en/':''}bibliography/works/${r.slug}/`;}
function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function normalizeSpec(spec){
  if(Array.isArray(spec))return {relations:spec};
  if(Array.isArray(spec?.relations))return spec;
  const {language,...rel}=spec||{};
  return {language,relations:[rel]};
}
function addSchemaRelation(work,property,entity){
  if(!work[property]){work[property]=entity;return;}
  const current=Array.isArray(work[property])?work[property]:[work[property]];
  if(!current.some(x=>x?.url===entity.url))current.push(entity);
  work[property]=current;
}
function patchJsonLd(html,r,en){
  return html.replace(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/,(all,json)=>{
    try{
      const ld=JSON.parse(json),graph=ld['@graph']||[],work=graph.find(x=>x['@type']==='Book'||x['@type']==='CreativeWork');
      if(!work)return all;
      if(Array.isArray(r.languages)&&r.languages.length)work.inLanguage=r.languages;
      for(const rel of r.scholarlyRelations||[]){
        const target=byTitle.get(rel.relatedTitle);
        if(!target)continue;
        addSchemaRelation(work,rel.relationType,{'@type':'Book',name:target.title,url:pageUrl(target,en)});
        if(rel.translator)work.translator={'@type':'Person',name:rel.translator,alternateName:'गजेन्द्र ठाकुर'};
      }
      return `<script type="application/ld+json">${JSON.stringify(ld).replaceAll('<','\\u003c')}</script>`;
    }catch{return all;}
  });
}
function patchPage(r,en){
  const file=`public/${en?'en/':''}bibliography/works/${r.slug}/index.html`;
  if(!fs.existsSync(file)||!r.scholarlyRelations?.length)return;
  let html=fs.readFileSync(file,'utf8');
  html=patchJsonLd(html,r,en);
  const items=r.scholarlyRelations.map(rel=>{
    const target=byTitle.get(rel.relatedTitle);
    const label=en?(rel.relationLabelEn||'Related work'):(rel.relationLabelMai||'सम्बद्ध कृति');
    const note=en?rel.noteEn:rel.noteMai;
    return `<li><strong>${esc(label)}</strong>${note?`: ${esc(note)}`:''}<br><a href="${pageUrl(target,en)}">${esc(target.title)} →</a>${rel.translationDirection?`<br><small><strong>${en?'Translation direction':'अनुवाद दिशा'}:</strong> ${esc(rel.translationDirection)}</small>`:''}</li>`;
  }).join('');
  const legacyAnchor=r.translationRelation?'<span id="translation-relation" hidden></span>':'';
  const block=`<section id="scholarly-relations">${legacyAnchor}<h2>${en?'Scholarly relationships':'शोध-सम्बन्ध'}</h2><ul class="manifest">${items}</ul></section>`;
  if(!html.includes('id="scholarly-relations"'))html=html.replace('<section id="pdf-library">',block+'<section id="pdf-library">');
  if(!html.includes('id="scholarly-relations"'))html=html.replace('<section id="cite">',block+'<section id="cite">');
  fs.writeFileSync(file,html);
}
function patchCitation(r,en){
  const dir=`public/${en?'en/':''}bibliography/works/${r.slug}`;
  const json=path.join(dir,'citation.json');
  if(fs.existsSync(json)){
    const c=JSON.parse(fs.readFileSync(json,'utf8'));
    if(Array.isArray(r.languages)&&r.languages.length)c.language=r.languages.join(', ');
    c['related-records']=(r.scholarlyRelations||[]).map(rel=>({relation:rel.relationType,title:rel.relatedTitle,url:pageUrl(byTitle.get(rel.relatedTitle),en),translationDirection:rel.translationDirection||undefined,translator:rel.translator||undefined}));
    const originalRel=(r.scholarlyRelations||[]).find(rel=>rel.relationType==='translationOfWork');
    if(originalRel)c['original-title']=originalRel.relatedTitle;
    const notes=(r.scholarlyRelations||[]).map(rel=>rel.noteEn).filter(Boolean);
    c.note=[c.note,...notes,...(r.scholarlyRelations||[]).map(rel=>`Related scholarly record: ${pageUrl(byTitle.get(rel.relatedTitle),en)}`)].filter(Boolean).join('; ');
    fs.writeFileSync(json,JSON.stringify(c,null,2)+'\n');
  }
  const ris=path.join(dir,'citation.ris');
  if(fs.existsSync(ris)){
    let s=fs.readFileSync(ris,'utf8');
    const lines=[];
    for(const rel of r.scholarlyRelations||[]){
      const marker=`N1  - ${rel.noteEn||rel.relationLabelEn||rel.relationType}`;
      if(!s.includes(marker))lines.push(marker);
      const related=`N1  - Related scholarly record: ${pageUrl(byTitle.get(rel.relatedTitle),en)}`;
      if(!s.includes(related))lines.push(related);
    }
    if(lines.length)s=s.replace('ER  - ',lines.join('\n')+'\nER  - ');
    fs.writeFileSync(ris,s);
  }
}

let relationshipCount=0;
for(const [title,rawSpec] of Object.entries(relationSpecs)){
  const r=byTitle.get(title);
  if(!r)throw new Error(`Missing scholarly relation source record: ${title}`);
  const spec=normalizeSpec(rawSpec);
  if(spec.language)r.languages=[spec.language];
  const mapped=[];
  for(const rel of spec.relations||[]){
    const target=byTitle.get(rel.relatedTitle);
    if(!target)throw new Error(`Missing scholarly relation record: ${title} -> ${rel.relatedTitle}`);
    mapped.push({...rel,relatedId:target.id,relatedSlug:target.slug,relatedUrl:pageUrl(target,false),relatedUrlEn:pageUrl(target,true)});
    relationshipCount++;
  }
  r.scholarlyRelations=mapped;
  const translation=mapped.find(rel=>rel.relationType==='translationOfWork'||rel.relationType==='workTranslation');
  if(translation)r.translationRelation=translation;
  for(const en of [false,true]){patchPage(r,en);patchCitation(r,en);}
}
fs.writeFileSync(DATA,JSON.stringify(data,null,2)+'\n');
if(fs.existsSync(CROSS)){
  const cross=JSON.parse(fs.readFileSync(CROSS,'utf8')),records=new Map(data.records.map(r=>[r.id,r]));
  for(const row of cross.records||[]){
    const full=records.get(row.id);
    if(!full?.scholarlyRelations?.length)continue;
    if(Array.isArray(full.languages)&&full.languages.length)row.language=full.languages;
    row.scholarlyRelations=full.scholarlyRelations;
    if(full.translationRelation)row.translationRelation=full.translationRelation;
  }
  fs.writeFileSync(CROSS,JSON.stringify(cross,null,2)+'\n');
}
console.log(`Linked ${relationshipCount} scholarly relationships across ${Object.keys(relationSpecs).length} records.`);
