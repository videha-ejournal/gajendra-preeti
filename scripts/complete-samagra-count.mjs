import fs from 'node:fs';
const s=fs.readFileSync('C:/Users/DELL/Documents/GitHub/videha/gajendra-thakur-samagra.htm','utf8');
const b=s.match(/const gajendraPdfCorpus=\[(.*?)\];/s)?.[1]??'';
const es=[...b.matchAll(/\{title:'([^']+)',author:'([^']+)',file:'([^']+)',group:'([^']+)'\}/g)].map(([,title,author,file,group])=>({title,author,file,group}));
const f='app/works.json',w=JSON.parse(fs.readFileSync(f,'utf8')), urls=new Set(w.map(x=>x.url)); let n=w.filter(x=>x.author==='gajendra').length;
for(const e of es){const url=`https://videha-ejournal.github.io/videha-ejournal/${encodeURIComponent(e.file)}`;if(urls.has(url))continue;n++;w.push({id:`gs${String(n).padStart(2,'0')}`,author:'gajendra',name:'गजेन्द्र ठाकुर',title:e.title,year:null,kind:e.group.replace(/^\d+\s*/,''),url,source:'https://videha-ejournal.github.io/videha/gajendra-thakur-samagra.htm#gt-pdf-corpus',keywords:`gajendra thakur samagra ${e.title}`,note:`${e.author} · Samagra PDF corpus`,titleEn:e.title,kindEn:'Samagra book, volume or research edition',nameEn:'Gajendra Thakur',noteEn:`Repository PDF · ${e.group}`});urls.add(url)}
fs.writeFileSync(f,JSON.stringify(w,null,2)+'\n');console.log('gajendra',n);
