import fs from 'node:fs';
import path from 'node:path';

const ROOT='public/criticism/reception';
let files=0, links=0;
function walk(dir){
  for(const name of fs.readdirSync(dir)){
    const p=path.join(dir,name), st=fs.statSync(p);
    if(st.isDirectory()) walk(p);
    else if(name.endsWith('.html')){
      let html=fs.readFileSync(p,'utf8');
      const before=html;
      html=html.replace(/href="([^"]+\.html)#full-essay-[^"]+"/g,(_,url)=>{links++;return `href="${url}"`;});
      if(html!==before){fs.writeFileSync(p,html);files++;}
    }
  }
}
walk(ROOT);
console.log(`Repaired ${links} legacy full-essay fragment link(s) across ${files} reception page(s).`);
