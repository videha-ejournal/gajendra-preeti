import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const base='/gajendra-preeti/criticism/reception/';
const canonical='https://videha-ejournal.github.io';
const dir='public/criticism/reception';
const files=['index.html','preeti-karan.html','setusham.html'];
const tail=file=>file==='index.html'?'':file;
for(const file of files){
 const maiPath=base+tail(file),enPath=base+'en/'+tail(file);
 const p=path.join(dir,file);let s=fs.readFileSync(p,'utf8');
 // The earlier bilingualizer starts from the preserved English copy. Restore the default page to its Maithili canonical and same-language internal links.
 s=s.replaceAll(canonical+enPath,canonical+maiPath);
 s=s.replaceAll('href="'+base+'en/','href="'+base);
 // Keep the explicit edition switch pointing to the English counterpart.
 s=s.replace(`href="${maiPath}" lang="en">English gists`,`href="${enPath}" lang="en">English gists`);
 // Remove duplicate alternates and install one authoritative pair.
 s=s.replace(/<link rel="alternate" hreflang="(?:mai|en|x-default)"[^>]*>/g,'');
 const alternates=`<link rel="alternate" hreflang="mai" href="${canonical+maiPath}"><link rel="alternate" hreflang="en" href="${canonical+enPath}"><link rel="alternate" hreflang="x-default" href="${canonical+maiPath}">`;
 s=s.replace('<meta name="theme-color"',alternates+'<meta name="theme-color"');
 assert(s.includes(`<link rel="canonical" href="${canonical+maiPath}"`),`${file}: Maithili canonical not repaired`);
 assert(s.includes(`href="${enPath}" lang="en">English gists`),`${file}: English switch missing`);
 fs.writeFileSync(p,s);

 const ep=path.join(dir,'en',file);let e=fs.readFileSync(ep,'utf8');
 e=e.replace(/<link rel="alternate" hreflang="(?:mai|en|x-default)"[^>]*>/g,'');
 e=e.replace('<meta name="theme-color"',alternates+'<meta name="theme-color"');
 assert(e.includes(`<link rel="canonical" href="${canonical+enPath}"`),`${file}: English canonical missing`);
 fs.writeFileSync(ep,e);
}
console.log('Repaired Reception canonicals, hreflang pairs and same-language navigation for all 3 Maithili/English route pairs.');
