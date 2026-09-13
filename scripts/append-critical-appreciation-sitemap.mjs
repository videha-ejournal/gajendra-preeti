import fs from 'node:fs';

const BASE='https://videha-ejournal.github.io/gajendra-preeti';
const source=JSON.parse(fs.readFileSync('content/reception-gists.json','utf8'));
const gt=[
 ...JSON.parse(fs.readFileSync('content/criticism-mai-preeti.json','utf8')),
 ...JSON.parse(fs.readFileSync('content/criticism-mai-g01-g20.json','utf8')),
 ...JSON.parse(fs.readFileSync('content/criticism-mai-g21-g42.json','utf8'))
];
const routes=new Set();
routes.add('/criticism/reception/gt-pt-criticism.html');
for(const a of source.articles){
 routes.add(`/criticism/reception/${a.book}/${a.id}.html`);
 routes.add(`/criticism/reception/en/${a.book}/${a.id}.html`);
}
for(const x of gt)routes.add(`/criticism/reception/gt-pt-criticism/${x.id}.html`);
const file='public/sitemap.xml';
let xml=fs.readFileSync(file,'utf8');
for(const route of routes){
 const loc=`${BASE}${route}`;
 if(!xml.includes(`<loc>${loc}</loc>`))xml=xml.replace('</urlset>',`  <url><loc>${loc}</loc></url>\n</urlset>`);
}
fs.writeFileSync(file,xml.endsWith('\n')?xml:xml+'\n');
console.log(`Added ${routes.size} critical-appreciation routes to sitemap.`);
