import fs from 'node:fs';
const meta=JSON.parse(fs.readFileSync('content/site-meta.json','utf8'));
const file='public/sitemap.xml';
let xml=fs.readFileSync(file,'utf8');
xml=xml.replace(/<url>([\s\S]*?)<\/url>/g,(whole,inner)=>{
 const body=inner.replace(/\s*<lastmod>[^<]*<\/lastmod>\s*/g,'');
 return `<url>${body}<lastmod>${meta.updated}</lastmod></url>`;
});
fs.writeFileSync(file,xml.endsWith('\n')?xml:xml+'\n');
console.log(`Sitemap lastmod synchronized to ${meta.updated}.`);
