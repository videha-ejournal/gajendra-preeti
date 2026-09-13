import fs from 'node:fs';
import path from 'node:path';

const roots=['public/bibliography','public/en/bibliography','public/author','public/en/author'];
const BASE='/gajendra-preeti';
const SOCIAL='https://videha-ejournal.github.io/gajendra-preeti/images/preeti-gajendra-social-card.png';
function escAttr(s){return String(s||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
function filesUnder(dir){
 if(!fs.existsSync(dir))return[];
 const out=[];
 for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
  const p=path.join(dir,entry.name);
  if(entry.isDirectory())out.push(...filesUnder(p));
  else if(entry.isFile()&&entry.name.endsWith('.html'))out.push(p);
 }
 return out;
}
let count=0;
for(const file of roots.flatMap(filesUnder)){
 let html=fs.readFileSync(file,'utf8');
 const title=(html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]||'Videha Literary Atlas').replace(/<[^>]+>/g,'').trim();
 const desc=html.match(/<meta name="description" content="([^"]*)"/i)?.[1]||'Scholarly record in The Videha Literary Atlas.';
 const canonical=html.match(/<link rel="canonical" href="([^"]+)"/i)?.[1]||'';
 let tags='';
 if(!/property="og:title"/i.test(html))tags+=`<meta property="og:title" content="${escAttr(title)}">`;
 if(!/property="og:description"/i.test(html))tags+=`<meta property="og:description" content="${escAttr(desc)}">`;
 if(!/property="og:image"/i.test(html))tags+=`<meta property="og:image" content="${SOCIAL}">`;
 if(canonical&&!/property="og:url"/i.test(html))tags+=`<meta property="og:url" content="${escAttr(canonical)}">`;
 if(!/name="twitter:card"/i.test(html))tags+='<meta name="twitter:card" content="summary_large_image">';
 if(!/name="twitter:title"/i.test(html))tags+=`<meta name="twitter:title" content="${escAttr(title)}">`;
 if(!/name="twitter:description"/i.test(html))tags+=`<meta name="twitter:description" content="${escAttr(desc)}">`;
 if(!/name="twitter:image"/i.test(html))tags+=`<meta name="twitter:image" content="${SOCIAL}">`;
 if(!html.includes(`${BASE}/reading-tools.css`))tags+=`<link rel="stylesheet" href="${BASE}/reading-tools.css">`;
 if(!html.includes(`${BASE}/reading-tools.js`))tags+=`<script defer src="${BASE}/reading-tools.js"></script>`;
 if(tags)html=html.replace('</head>',tags+'</head>');
 if(!html.includes('id="videha-reading-tools"'))html=html.replace('</body>',`<div id="videha-reading-tools"></div></body>`);
 fs.writeFileSync(file,html,'utf8');count++;
}
console.log(`Polished ${count} scholarly bibliography/authority pages with reading controls and complete social metadata.`);
