import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {spawnSync,execFileSync} from 'node:child_process';

const destination=path.resolve('dist/client/gajendra-preeti');
function archiveRows(source){
 const marker='const main=[';
 const start=source.indexOf(marker)+marker.length-1;
 assert(start>=marker.length-1,'Archive main catalogue was not found');
 let depth=0,quote='',escaped=false,end=-1;
 for(let index=start;index<source.length;index++){
  const char=source[index];
  if(quote){if(escaped)escaped=false;else if(char==='\\')escaped=true;else if(char===quote)quote='';continue;}
  if(char==='"'||char==="'"||char==='`'){quote=char;continue;}
  if(char==='[')depth++;
  else if(char===']'&&--depth===0){end=index+1;break;}
 }
 assert(end>start,'Archive main catalogue did not terminate');
 const item=(title,url,author='गजेन्द्र ठाकुर',label='PDF / Open')=>({title,author,links:[[label,url]]});
 const multi=(title,links,author='गजेन्द्र ठाकुर')=>({title,author,links});
 return vm.runInNewContext(`(${source.slice(start,end)})`,{A:'https://archive.org/download/',D:'https://drive.google.com/file/d/',V:'https://videha-ejournal.github.io/videha-ejournal/',item,multi},{timeout:2000});
}
assert(fs.existsSync(path.join(destination,'index.html')),'Committed home-page artifact is missing');
for(const script of ['scripts/build-isbn-authority.mjs','scripts/build-isbn-bilingual.mjs']){
 const result=spawnSync(process.execPath,[script,...(script.includes('authority')?['--registry-only']:[])],{stdio:'inherit'});
 assert.equal(result.status,0,`${script} failed`);
}
for(const route of ['isbn','en/isbn']){
 fs.mkdirSync(path.join(destination,route),{recursive:true});
 for(const name of ['index.html','isbn-authority-293.json'])fs.copyFileSync(path.join('public',route,name),path.join(destination,route,name));
}

// The home toolbar is shared unchanged except for an explicit page-pair option.
const editionMarker='// Explicit page pairs keep static ISBN navigation on the same catalogue.';
for(const directory of ['public',destination]){
 const file=path.join(directory,'reading-tools.js');
 let js=fs.readFileSync(file,'utf8');
 if(!js.includes(editionMarker)){
  const marker='  host.innerHTML=';
  assert(js.includes(marker),'Reading-tools mount point was not found');
  js=js.replace(marker,`  ${editionMarker}\n  englishURL=host.dataset.englishUrl||englishURL;maiURL=host.dataset.maithiliUrl||maiURL;\n${marker}`);
  fs.writeFileSync(file,js);
 }
}
for(const file of ['reading-tools.css','reading-tools-resilience.js']){
 if(!fs.existsSync(path.join(destination,file)))fs.copyFileSync(path.join('public',file),path.join(destination,file));
}

// The existing representative-page check also requires the bibliography indexes.
// Restore these missing artifacts with the existing renderer and a fixed source
// revision, without running the legacy full-site pipeline or rewriting other routes.
if(!fs.existsSync(path.join(destination,'bibliography/bibliography-data.json'))){
 const source=fs.readFileSync('scripts/build-scholarly-bibliography.mjs','utf8');
 const boundary=source.indexOf('const source=await loadSource();');
 assert(boundary>0,'Bibliography renderer boundary was not found');
 const renderer=source.slice(0,boundary).replace(/^import .*;\r?\n/gm,'');
 const functions=vm.runInNewContext(renderer+'\n;({bibliographyPage,style,buildRecords,workPage,authorityPage,bibtex,ris,csl});',{fs,path,vm,crypto,console});
 let snapshot;
 if(fs.existsSync('content/samagra-main.snapshot.json'))snapshot=JSON.parse(fs.readFileSync('content/samagra-main.snapshot.json','utf8'));
 else{
  const sourceURL='https://raw.githubusercontent.com/videha-ejournal/videha/23072688cfc614c18876c7c229446fd1b1cbaf90/gajendra-thakur-samagra.htm';
  const response=await fetch(sourceURL,{signal:AbortSignal.timeout(30000)});
  assert(response.ok,`Bibliography source returned HTTP ${response.status}`);
  snapshot={records:functions.buildRecords(archiveRows(await response.text()))};
 }
 assert(snapshot.records?.length>0,'Bibliography source has no records');
 for(const [lang,route] of [['mai','bibliography'],['en','en/bibliography']]){
  if(fs.existsSync(path.join(destination,route,'index.html')))continue;
  let html=functions.bibliographyPage(snapshot.records,lang==='en');
  html=html.replace(/<link\b[^>]*rel="alternate"[^>]*>/g,'');
  const base='https://videha-ejournal.github.io/gajendra-preeti';
  html=html.replace('</head>',`<link rel="alternate" hreflang="mai" href="${base}/bibliography/"><link rel="alternate" hreflang="en" href="${base}/en/bibliography/"><link rel="alternate" hreflang="x-default" href="${base}/bibliography/"></head>`);
  html=html.replace('</body>','<aside data-videha-research-identity="true">Videha — First Maithili Fortnightly eJournal · ISSN 2229-547X · <a href="https://www.videha.co.in/">Official site</a> · <a href="https://videha-ejournal.github.io/videha/">GitHub mirror</a></aside></body>');
  fs.mkdirSync(path.join(destination,route),{recursive:true});
  fs.writeFileSync(path.join(destination,route,'index.html'),html);
 }
 fs.writeFileSync(path.join(destination,'bibliography/style.css'),functions.style());
 fs.writeFileSync(path.join(destination,'bibliography/bibliography-data.json'),JSON.stringify(snapshot,null,2)+'\n');
 fs.writeFileSync(path.join(destination,'bibliography/export.bib'),snapshot.records.map(functions.bibtex).join('\n'));
 fs.writeFileSync(path.join(destination,'bibliography/export.ris'),snapshot.records.map(functions.ris).join('\n'));
 fs.writeFileSync(path.join(destination,'bibliography/export.json'),JSON.stringify(snapshot.records.map(functions.csl),null,2)+'\n');
 for(const record of snapshot.records){
  for(const en of [false,true]){
   const directory=path.join(destination,en?'en/bibliography/works':'bibliography/works',record.slug);
   fs.mkdirSync(directory,{recursive:true});
   if(!fs.existsSync(path.join(directory,'index.html')))fs.writeFileSync(path.join(directory,'index.html'),functions.workPage(record,en));
   fs.writeFileSync(path.join(directory,'citation.bib'),functions.bibtex(record));
   fs.writeFileSync(path.join(directory,'citation.ris'),functions.ris(record));
   fs.writeFileSync(path.join(directory,'citation.json'),JSON.stringify(functions.csl(record),null,2)+'\n');
  }
 }
 for(const en of [false,true]){
  const directory=path.join(destination,en?'en/author/gajendra-thakur':'author/gajendra-thakur');
  fs.mkdirSync(directory,{recursive:true});
  if(!fs.existsSync(path.join(directory,'index.html')))fs.writeFileSync(path.join(directory,'index.html'),functions.authorityPage(snapshot.records,en));
 }
}

for(const route of ['isbn','en/isbn']){
 const html=fs.readFileSync(path.join(destination,route,'index.html'),'utf8');
 assert.equal((html.match(/<tbody>[\s\S]*?<\/tbody>/)?.[0].match(/<tr\b/g)||[]).length,311);
 assert.equal((html.match(/<th>/g)||[]).length,7);
 assert(html.includes('978-93-345-7849-2'));
 assert(html.includes('data-videha-isbn-footer="true"'));
 assert(html.includes('id="videha-reading-tools"'));
}
const committed=execFileSync('git',['ls-files','--','dist/client/gajendra-preeti'],{encoding:'utf8'}).trim().split(/\r?\n/).filter(file=>file.endsWith('.html'));
const htmlPages=directory=>fs.readdirSync(directory,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?htmlPages(path.join(directory,entry.name)):entry.name.endsWith('.html')?[path.join(directory,entry.name).split(path.sep).join('/')]:[]);
const required=[...new Set([...committed,...htmlPages('dist/client/gajendra-preeti')])];
assert(required.length>0&&required.every(file=>fs.existsSync(file)),'A committed or required publishing page is missing');
fs.mkdirSync('artifacts',{recursive:true});
fs.writeFileSync('artifacts/publishing-page-manifest.json',JSON.stringify({mode:'committed-artifact',pages:required},null,2)+'\n');
console.log('Publishing artifact prepared: 311-row bilingual ISBN pages, home reading tools, and missing bibliography indexes.');
