import fs from 'node:fs';
const file='scripts/build-scholarly-bibliography.mjs';
let s=fs.readFileSync(file,'utf8');
s=s.replace("const verifiedDisplay=meta.updatedDisplay||'13 September 2026';","const verifiedDisplay=meta.updatedDisplayEn||'13 September 2026';");
const replacement=`function parseMain(source){
 const marker='const main=';
 const at=source.indexOf(marker);
 if(at<0)throw Error('Could not locate const main= 00 मुख्य समग्र block in authoritative source.');
 const start=source.indexOf('[',at+marker.length);
 if(start<0)throw Error('Could not locate opening array bracket for 00 मुख्य समग्र.');
 let depth=0,quote=null,escaped=false,end=-1;
 for(let i=start;i<source.length;i++){
  const ch=source[i];
  if(quote){
   if(escaped){escaped=false;continue;}
   if(ch==='\\\\'){escaped=true;continue;}
   if(ch===quote)quote=null;
   continue;
  }
  if(ch==="'"||ch==='"'||ch.charCodeAt(0)===96){quote=ch;continue;}
  if(ch==='['){depth++;continue;}
  if(ch===']'){
   depth--;
   if(depth===0){end=i;break;}
  }
 }
 if(end<0)throw Error('Unterminated 00 मुख्य समग्र array in authoritative source.');
 const expr=source.slice(start,end+1);
 const A='https://archive.org/download/',D='https://drive.google.com/file/d/',V='https://videha-ejournal.github.io/videha-ejournal/';
 const item=(title,url,author='गजेन्द्र ठाकुर',label='PDF / Open')=>({title,author,links:[[label,url]]});
 const multi=(title,links,author='गजेन्द्र ठाकुर')=>({title,author,links});
 const rows=vm.runInNewContext('('+expr+')',{A,D,V,item,multi},{timeout:2000});
 if(!Array.isArray(rows)||rows.length<10)throw Error('Authoritative 00 मुख्य समग्र parse returned only '+(rows?.length||0)+' records.');
 return rows;
}`;
const pattern=/function parseMain\(source\)\{[\s\S]*?\n\}\nfunction chapterRoute/;
if(!pattern.test(s))throw Error('Could not locate parseMain function for hardening.');
s=s.replace(pattern,replacement+'\nfunction chapterRoute');
fs.writeFileSync(file,s,'utf8');
console.log('Scholarly bibliography builder now uses balanced-array extraction for authoritative Samagra data.');
