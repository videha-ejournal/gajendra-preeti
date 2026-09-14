import fs from 'node:fs';
import path from 'node:path';

const base='https://videha-ejournal.github.io/gajendra-preeti';
const dir='public/criticism';
const enDir=path.join(dir,'en');
if(!fs.existsSync(enDir)) throw new Error('English criticism directory missing');
const files=fs.readdirSync(enDir).filter(f=>f.endsWith('.html')).sort();
if(files.length!==60) throw new Error(`Expected 60 English Reading Room HTML pages (index + 59 entries), found ${files.length}`);

function setAlternate(html,lang,href){
 const tag=`<link rel="alternate" hreflang="${lang}" href="${href}">`;
 const rx=new RegExp(`<link\\s+rel=["']alternate["']\\s+hreflang=["']${lang.replace('-','\\-')}["']\\s+href=["'][^"']*["']\\s*/?>`,'i');
 if(rx.test(html)) return html.replace(rx,tag);
 return html.replace('</head>',`${tag}\n</head>`);
}
function urls(file){
 const leaf=file==='index.html'?'':file;
 return {mai:`${base}/criticism/${leaf}`,en:`${base}/criticism/en/${leaf}`};
}
for(const file of files){
 const {mai,en}=urls(file);
 const maiFile=path.join(dir,file),enFile=path.join(enDir,file);
 if(!fs.existsSync(maiFile)) throw new Error(`Missing Maithili Reading Room counterpart: ${file}`);
 let mh=fs.readFileSync(maiFile,'utf8');
 mh=setAlternate(mh,'mai',mai);
 mh=setAlternate(mh,'en',en);
 mh=setAlternate(mh,'x-default',mai);
 fs.writeFileSync(maiFile,mh);
 let eh=fs.readFileSync(enFile,'utf8');
 eh=setAlternate(eh,'mai',mai);
 eh=setAlternate(eh,'en',en);
 eh=setAlternate(eh,'x-default',mai);
 fs.writeFileSync(enFile,eh);
}
console.log(`Reading Room hreflang repair PASS: ${files.length} Maithili/English page pairs normalized reciprocally.`);
