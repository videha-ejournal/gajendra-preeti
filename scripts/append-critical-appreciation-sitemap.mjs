import fs from 'node:fs';

const BASE='https://videha-ejournal.github.io/gajendra-preeti';
const source=JSON.parse(fs.readFileSync('content/reception-gists.json','utf8'));
const gt=[
 ...JSON.parse(fs.readFileSync('content/criticism-mai-preeti.json','utf8')),
 ...JSON.parse(fs.readFileSync('content/criticism-mai-g01-g20.json','utf8')),
 ...JSON.parse(fs.readFileSync('content/criticism-mai-g21-g42.json','utf8'))
];

for(const [file,en] of [['public/criticism/reception/index.html',false],['public/criticism/reception/en/index.html',true]]){
 let html=fs.readFileSync(file,'utf8');
 if(en){
  html=html.replace('Many voices.<br><em>Two volumes.</em>','Five books.<br><em>Many voices.</em>');
  html=html.replace('Criticism, memories, interviews and editorial debate—each returned to its author and its place in the book.','Five verified repository manifestations: the Maithili and English editions of Preeti Karan Setu Banhal and Setusham, plus the Maithili GT_PT Criticism collection. Every normalized chapter is linked to a permanent detailed page.');
 }else{
  html=html.replace('अनेक स्वर।<br><em>दू खण्ड।</em>','पाँच पोथी।<br><em>अनेक स्वर।</em>');
  html=html.replace('समालोचना, संस्मरण, साक्षात्कार आ सम्पादकीय बहस—प्रत्येककेँ ओकर लेखक आ पोथीक ठामसँ जोड़ल गेल अछि।','पाँच सत्यापित रिपॉजिटरी संस्करण: प्रीति कारण सेतु बान्हल आ सेतुशमक मैथिली-अंग्रेजी संस्करण, संगहि मैथिली GT_PT Criticism संग्रह। सभ सामान्यीकृत अध्याय स्वतंत्र विस्तृत स्थायी पृष्ठसँ जोड़ल अछि।');
 }
 fs.writeFileSync(file,html);
}

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
console.log(`Polished five-book criticism doorway and added ${routes.size} critical-appreciation routes to sitemap.`);
