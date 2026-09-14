import fs from 'node:fs';
import path from 'node:path';

const SITE='https://videha-ejournal.github.io/gajendra-preeti/';
const PDF_CATALOG='https://raw.githubusercontent.com/videha-ejournal/videha-ejournal/main/data/videha-pdf-catalog.json';
const ROOT='dist/client/gajendra-preeti';
const OUT='artifacts/maintenance-health.json';
fs.mkdirSync(path.dirname(OUT),{recursive:true});
const report={generatedAt:new Date().toISOString(),site:SITE,live:[],external:[],provenance:{},warnings:[],failures:[]};

async function request(url,{hard=false}={}){
  const attempt=async method=>{
    const init={method,redirect:'follow',signal:AbortSignal.timeout(method==='GET'?20000:15000),headers:{'user-agent':'Videha-Atlas-Maintenance-Audit/1.0'}};
    if(method==='GET')init.headers.range='bytes=0-4095';
    return fetch(url,init);
  };
  const errors=[];
  let r=null;
  try{r=await attempt('HEAD');}catch(err){errors.push(`HEAD ${err.message}`);}
  if(!r||!(r.ok||r.status===206)){
    try{r=await attempt('GET');}catch(err){errors.push(`GET ${err.message}`);}
  }
  if(!r){
    const msg=`${url}: ${errors.join('; ')||'request failed'}`;
    (hard?report.failures:report.warnings).push(msg);
    return {url,status:null,ok:false,error:errors.join('; ')||'request failed'};
  }
  const row={url,status:r.status,ok:r.ok||r.status===206,finalUrl:r.url};
  if([404,410].includes(r.status)||(hard&&!row.ok))report.failures.push(`${url} returned HTTP ${r.status}`);
  else if(!row.ok)report.warnings.push(`${url} returned HTTP ${r.status}`);
  return row;
}

try{
  const keyRoutes=['','en/','bibliography/','en/bibliography/','criticism/reception/','criticism/reception/gt-pt-criticism.html','criticism/reception/preeti-karan/p01.html','criticism/reception/en/preeti-karan/p01.html','criticism/reception/gt-pt-criticism/g01.html'];
  for(const rel of keyRoutes)report.live.push(await request(new URL(rel,SITE).href,{hard:true}));
  report.live.push(await request('https://www.videha.co.in/videha-rss.xml',{hard:true}));

  const localSitemap=fs.readFileSync(path.join(ROOT,'sitemap.xml'),'utf8');
  const localLocs=[...localSitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]).sort();
  const liveMapResp=await fetch(new URL('sitemap.xml',SITE),{signal:AbortSignal.timeout(15000),headers:{'user-agent':'Videha-Atlas-Maintenance-Audit/1.0'}});
  if(!liveMapResp.ok)report.failures.push(`Live sitemap returned HTTP ${liveMapResp.status}`);
  else{
    const liveLocs=[...(await liveMapResp.text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]).sort();
    report.sitemap={localCount:localLocs.length,liveCount:liveLocs.length};
    if(JSON.stringify(localLocs)!==JSON.stringify(liveLocs))report.failures.push(`Live sitemap differs from current built sitemap (${liveLocs.length} vs ${localLocs.length} URLs)`);
  }

  const sourceFiles=['index.html','en/index.html','bibliography/index.html','en/bibliography/index.html','criticism/reception/index.html','criticism/reception/preeti-karan.html','criticism/reception/en/preeti-karan.html','criticism/reception/setusham.html','criticism/reception/en/setusham.html','criticism/reception/gt-pt-criticism.html'];
  const external=new Set();
  for(const rel of sourceFiles){
    const file=path.join(ROOT,rel);if(!fs.existsSync(file))continue;
    const html=fs.readFileSync(file,'utf8');
    for(const m of html.matchAll(/(?:href|src)="(https?:\/\/[^"#]+[^\"]*)"/g)){
      const raw=m[1].replaceAll('&amp;','&');
      try{const u=new URL(raw);if(!u.hostname.endsWith('videha-ejournal.github.io'))external.add(u.href);}catch{}
    }
  }
  const urls=[...external].filter(u=>!u.includes('translate.google.com')).sort();
  for(let i=0;i<urls.length;i+=6){
    const rows=await Promise.all(urls.slice(i,i+6).map(u=>request(u)));
    report.external.push(...rows);
  }

  const localCatalog=JSON.parse(fs.readFileSync('content/videha-pdf-catalog.snapshot.json','utf8'));
  const remoteResp=await fetch(PDF_CATALOG,{signal:AbortSignal.timeout(20000),headers:{'user-agent':'Videha-Atlas-Maintenance-Audit/1.0'}});
  if(!remoteResp.ok)throw new Error(`Remote PDF catalogue HTTP ${remoteResp.status}`);
  const remoteCatalog=await remoteResp.json();
  const localBy=new Map(localCatalog.items.map(x=>[x.path,x]));
  const remoteBy=new Map(remoteCatalog.items.map(x=>[x.path,x]));
  const changed=[];
  for(const [p,r] of remoteBy){const l=localBy.get(p);if(!l||l.sha256!==r.sha256||l.bytes!==r.bytes)changed.push(p);}
  for(const p of localBy.keys())if(!remoteBy.has(p))changed.push(p);
  if(changed.length)report.failures.push(`PDF catalogue snapshot differs from authoritative repository catalogue for ${changed.length} path(s)`);
  const manifest=JSON.parse(fs.readFileSync('public/bibliography/pdf-library-manifest.json','utf8'));
  const badManifest=[];
  for(const row of manifest.records||[])for(const pdf of row.pdfs||[]){const remote=remoteBy.get(pdf.path);if(!remote||remote.sha256!==pdf.sha256)badManifest.push(pdf.path);}
  if(badManifest.length)report.failures.push(`Generated PDF provenance manifest has ${badManifest.length} SHA/path mismatch(es)`);
  if((manifest.unclassifiedCatalogCount||0)!==0)report.failures.push(`PDF provenance manifest has ${manifest.unclassifiedCatalogCount} unclassified catalogue item(s)`);
  if((manifest.catalogCount||0)!==remoteCatalog.items.length)report.failures.push(`Manifest catalogue count ${manifest.catalogCount} differs from authoritative ${remoteCatalog.items.length}`);
  report.provenance={remoteCatalogCount:remoteCatalog.items.length,remoteSchemaVersion:remoteCatalog.schemaVersion,manifestCatalogCount:manifest.catalogCount,matchedPdfCount:manifest.matchedPdfCount,translatedPdfUniqueFileCount:manifest.translatedPdfUniqueFileCount,equivalentRepositoryCopyCount:manifest.equivalentRepositoryCopyCount,supplementalPdfResourceCount:manifest.supplementalPdfResourceCount,unclassifiedCatalogCount:manifest.unclassifiedCatalogCount,changedPaths:changed,badManifestPaths:badManifest};
}catch(err){report.failures.push(err.stack||String(err));}

report.status=report.failures.length?'fail':'pass';
fs.writeFileSync(OUT,JSON.stringify(report,null,2)+'\n');
console.log(`Scheduled health audit ${report.status.toUpperCase()}: ${report.live.length} key live routes, ${report.external.length} external links, ${report.warnings.length} warning(s), ${report.failures.length} failure(s).`);
if(report.warnings.length)console.warn(report.warnings.join('\n'));
if(report.failures.length){console.error(report.failures.join('\n'));process.exitCode=1;}
