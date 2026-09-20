import fs from 'node:fs';
import path from 'node:path';

const root='dist/client/gajendra-preeti';
const base='https://videha-ejournal.github.io/gajendra-preeti';
const failures=[];
const need=(cond,msg)=>{if(!cond)failures.push(msg);};
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const exists=p=>fs.existsSync(path.join(root,p));
const alt=(html,lang)=>html.match(new RegExp(`<link\\s+rel=["']alternate["']\\s+hreflang=["']${lang}["']\\s+href=["']([^"']+)["']`,'i'))?.[1];

const enCrit=path.join(root,'criticism/en');
const files=fs.readdirSync(enCrit).filter(f=>f.endsWith('.html')).sort();
need(files.length===60,`Reading Room expected 60 English HTML pages; found ${files.length}`);
for(const file of files){
 const leaf=file==='index.html'?'':file;
 const maiUrl=`${base}/criticism/${leaf}`,enUrl=`${base}/criticism/en/${leaf}`;
 const mh=read(`criticism/${file}`),eh=read(`criticism/en/${file}`);
 need(alt(mh,'mai')===maiUrl,`${file}: Maithili hreflang=mai is not canonical Maithili URL`);
 need(alt(mh,'en')===enUrl,`${file}: Maithili hreflang=en does not target English counterpart`);
 need(alt(mh,'x-default')===maiUrl,`${file}: Maithili x-default is not Maithili canonical`);
 need(alt(eh,'mai')===maiUrl,`${file}: English hreflang=mai does not target Maithili counterpart`);
 need(alt(eh,'en')===enUrl,`${file}: English hreflang=en is not English canonical`);
}

for(const route of ['isbn/index.html','en/isbn/index.html'])need(exists(route),`Missing bilingual ISBN route ${route}`);
if(exists('isbn/index.html')&&exists('en/isbn/index.html')){
 const mai=read('isbn/index.html'),en=read('en/isbn/index.html');
 need(/<html lang="mai">/.test(mai),'Maithili ISBN page must declare lang=mai');
 need(/<html lang="en">/.test(en),'English ISBN page must declare lang=en');
 for(const html of [mai,en]){
  need(alt(html,'mai')===`${base}/isbn/`,'ISBN hreflang=mai incorrect');
  need(alt(html,'en')===`${base}/en/isbn/`,'ISBN hreflang=en incorrect');
  need(html.includes('978-93-5943-857-3'),'ISBN page missing आत्मतत्त्वविवेक ISBN');
  need(!html.includes('Publisher</th>')&&!html.includes('Name of Publishing Agency'),'ISBN page exposes discarded publishing-agency column');
 }
}
const authority=JSON.parse(read('isbn/isbn-authority-293.json'));
need(authority.records?.length===293,`ISBN JSON expected 293 records; found ${authority.records?.length}`);
for(const r of authority.records||[])need(!('publisher' in r)&&!('_discardedPublishingAgencyPublisher' in r),`ISBN record leaks discarded field: ${r.isbn}`);
const atma=authority.records?.find(r=>r.isbn==='978-93-5943-857-3');
need(atma?.title==='आत्मतत्त्वविवेक','ISBN JSON lost canonical आत्मतत्त्वविवेक editor override');

for(const p of ['bibliography/export.bib','bibliography/export.ris','bibliography/export.json','bibliography/index.html']){
 need(exists(p),`Missing bibliography output ${p}`);
 if(exists(p))need(read(p).includes('978-93-5943-857-3'),`${p} does not carry authoritative आत्मतत्त्वविवेक ISBN`);
}
const maiBib=read('bibliography/index.html'),enBib=read('en/bibliography/index.html');
need(maiBib.includes('/gajendra-preeti/isbn/'),'Maithili bibliography lacks ISBN registry route');
need(enBib.includes('/gajendra-preeti/en/isbn/'),'English bibliography lacks ISBN registry route');

const sitemap=read('sitemap.xml');
for(const u of [`${base}/changelog/`,`${base}/isbn/`,`${base}/en/isbn/`])need(sitemap.includes(`<loc>${u}</loc>`),`Sitemap missing ${u}`);

const maiHome=read('index.html'),enHome=read('en/index.html');
need(maiHome.includes('/gajendra-preeti/isbn/'),'Maithili home lacks ISBN route');
need(enHome.includes('/gajendra-preeti/en/isbn/'),'English home lacks ISBN route');
const banned=['THE WRITERS',"A READER'S COMPASS",'02 / SELECTED WORKS','THE WORK OF PRESERVATION','03 / A LITERARY CHRONOLOGY','04 / BEYOND THIS PAGE','EDITORIAL NOTES','A VIDEHA LITERARY ATLAS · MAITHILI'];
for(const text of banned)need(!maiHome.includes(text),`Maithili interface still contains English scaffold: ${text}`);

const meta=JSON.parse(fs.readFileSync('content/site-meta.json','utf8'));
const parts=Object.fromEntries(new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Kolkata',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date()).filter(p=>p.type!=='literal').map(p=>[p.type,p.value]));
const buildDate=`${parts.year}-${parts.month}-${parts.day}`;
for(const [html,label] of [[maiHome,'Maithili'],[enHome,'English']]){
 need(html.includes(`dateTime="${buildDate}"`)||html.includes(`datetime="${buildDate}"`),`${label} home does not expose current build date ${buildDate}`);
 need(html.includes(meta.updated),`${label} home does not preserve scholarly source-check date ${meta.updated}`);
}

const css=fs.readFileSync('app/improvements.css','utf8');
need(css.includes('bilingual-consolidation-mobile-nav'),'Mobile navigation consolidation marker missing');
need(css.includes('scroll-snap-type:x proximity'),'Mobile navigation does not use start-safe horizontal snap');

if(failures.length){console.error(`Bilingual consolidation FAIL (${failures.length})\n- ${failures.join('\n- ')}`);process.exit(1);}
console.log(`Bilingual consolidation PASS: ${files.length} reciprocal Reading Room pairs; bilingual ISBN authority; bibliography ISBN propagation; sitemap/freshness; Maithili UI; mobile navigation.`);
