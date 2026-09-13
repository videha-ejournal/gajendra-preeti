import fs from 'node:fs';
import path from 'node:path';

const ROOT='public/criticism/reception';
const ORIGIN='https://videha-ejournal.github.io';
const IMAGE='https://videha-ejournal.github.io/gajendra-preeti/images/gajendra-thakur.jpg';
const targets=[
  path.join(ROOT,'gt-pt-criticism.html'),
  ...['preeti-karan','setusham','gt-pt-criticism'].flatMap(dir=>{
    const p=path.join(ROOT,dir);
    return fs.existsSync(p)?fs.readdirSync(p).filter(f=>f.endsWith('.html')).map(f=>path.join(p,f)):[];
  }),
  ...['preeti-karan','setusham'].flatMap(dir=>{
    const p=path.join(ROOT,'en',dir);
    return fs.existsSync(p)?fs.readdirSync(p).filter(f=>f.endsWith('.html')).map(f=>path.join(p,f)):[];
  })
];

const attr=(html,re)=>html.match(re)?.[1]?.trim()||'';
let changed=0;
for(const file of targets){
  let html=fs.readFileSync(file,'utf8');
  const title=attr(html,/<title>([^<]+)<\/title>/i).replace(/\s*\|\s*Videha Literary Atlas\s*$/i,'');
  const description=attr(html,/<meta name="description" content="([^"]*)"/i);
  const canonical=attr(html,/<link rel="canonical" href="([^"]+)"/i)||`${ORIGIN}/gajendra-preeti/${file.replace(/^public\//,'')}`;
  const tags=[
    `<meta name="theme-color" content="#141c26">`,
    `<meta property="og:title" content="${title.replaceAll('&','&amp;').replaceAll('"','&quot;')}">`,
    `<meta property="og:description" content="${description.replaceAll('&','&amp;').replaceAll('"','&quot;')}">`,
    `<meta property="og:type" content="website">`,
    `<meta property="og:url" content="${canonical}">`,
    `<meta property="og:image" content="${IMAGE}">`,
    `<meta name="twitter:card" content="summary">`,
    `<meta name="twitter:title" content="${title.replaceAll('&','&amp;').replaceAll('"','&quot;')}">`,
    `<meta name="twitter:description" content="${description.replaceAll('&','&amp;').replaceAll('"','&quot;')}">`,
    `<meta name="twitter:image" content="${IMAGE}">`
  ].join('');
  if(!html.includes('property="og:title"')){
    html=html.replace('</head>',tags+'</head>');
    fs.writeFileSync(file,html);
    changed++;
  }
}
console.log(`Polished social metadata for ${changed} critical-appreciation page(s).`);
