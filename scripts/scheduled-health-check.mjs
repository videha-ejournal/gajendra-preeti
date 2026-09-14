import fs from 'node:fs';
import path from 'node:path';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';

const execFileAsync=promisify(execFile);
const SITE='https://videha-ejournal.github.io/gajendra-preeti/';
const PDF_CATALOG='https://raw.githubusercontent.com/videha-ejournal/videha-ejournal/main/data/videha-pdf-catalog.json';
const MIRROR_REGISTRY_PATH='content/maintenance-resource-mirrors.json';
const ROOT='dist/client/gajendra-preeti';
const OUT='artifacts/maintenance-health.json';
const USER_AGENT='Videha-Atlas-Maintenance-Audit/1.0';
const VERIFIED_MIRROR_LABEL='verified GitHub mirror available';
fs.mkdirSync(path.dirname(OUT),{recursive:true});
const report={generatedAt:new Date().toISOString(),site:SITE,live:[],external:[],provenance:{},verifiedMirrors:[],warnings:[],failures:[],indeterminate:[]};

function isOkStatus(status){return Number.isInteger(status)&&status>=200&&status<300;}
function normalizeResourceUrl(value){
  const u=new URL(value);
  u.hash='';
  return u.href;
}
function rawRepositoryUrl(entry){
  const branch=entry.branch||'main';
  const encodedPath=entry.repositoryPath.split('/').map(encodeURIComponent).join('/');
  return `https://raw.githubusercontent.com/${entry.repository}/${encodeURIComponent(branch)}/${encodedPath}`;
}

const mirrorRegistry=JSON.parse(fs.readFileSync(MIRROR_REGISTRY_PATH,'utf8'));
if(mirrorRegistry.schemaVersion!==1)throw new Error(`Unsupported maintenance mirror registry schemaVersion ${mirrorRegistry.schemaVersion}`);
if(mirrorRegistry.statusLabel!==VERIFIED_MIRROR_LABEL)throw new Error(`Maintenance mirror registry statusLabel must be exactly: ${VERIFIED_MIRROR_LABEL}`);
if(!Array.isArray(mirrorRegistry.resources))throw new Error('Maintenance mirror registry resources must be an array');
const mirrorByPrimary=new Map();
for(const entry of mirrorRegistry.resources){
  if(!entry?.primary||!entry?.mirror||!entry?.repository||!entry?.repositoryPath)throw new Error('Each maintenance mirror registry entry requires primary, mirror, repository and repositoryPath');
  const key=normalizeResourceUrl(entry.primary);
  if(mirrorByPrimary.has(key))throw new Error(`Duplicate maintenance mirror primary mapping: ${key}`);
  mirrorByPrimary.set(key,{...entry,primary:key});
}
const mirrorVerificationCache=new Map();
const verifiedMirrorKeys=new Set();

async function curlAttempt(url,method){
  const args=['-4','--silent','--show-error','--location','--connect-timeout','10','--max-time',method==='HEAD'?'15':'20','--user-agent',USER_AGENT,'--output','/dev/null','--write-out','%{http_code}\t%{url_effective}'];
  if(method==='HEAD')args.push('--head');
  else args.push('--range','0-4095');
  args.push(url);
  try{
    const {stdout}=await execFileAsync('curl',args,{maxBuffer:65536});
    const [code,...rest]=stdout.trim().split('\t');
    const status=Number.parseInt(code,10);
    return {status:Number.isFinite(status)?status:null,finalUrl:rest.join('\t')||url};
  }catch(err){
    const detail=String(err?.stderr||err?.message||err).trim().replace(/\s+/g,' ');
    return {status:null,finalUrl:url,error:detail};
  }
}

async function probeUrl(url){
  const errors=[];
  let lastHttp=null;
  const nodeAttempt=async method=>{
    const init={method,redirect:'follow',signal:AbortSignal.timeout(method==='GET'?20000:15000),headers:{'user-agent':USER_AGENT}};
    if(method==='GET')init.headers.range='bytes=0-4095';
    return fetch(url,init);
  };

  for(const method of ['HEAD','GET']){
    try{
      const r=await nodeAttempt(method);
      const row={url,status:r.status,ok:r.ok||r.status===206,finalUrl:r.url,transport:`node-${method.toLowerCase()}`};
      lastHttp=row;
      if(row.ok)return {...row,attemptErrors:errors};
      errors.push(`${method} HTTP ${r.status}`);
    }catch(err){
      errors.push(`${method} ${err.message}`);
    }
  }

  for(const method of ['HEAD','GET']){
    const c=await curlAttempt(url,method);
    if(c.status!==null){
      const row={url,status:c.status,ok:isOkStatus(c.status)||c.status===206,finalUrl:c.finalUrl,transport:`curl-ipv4-${method.toLowerCase()}`};
      lastHttp=row;
      if(row.ok)return {...row,attemptErrors:errors};
      errors.push(`curl ${method} HTTP ${c.status}`);
    }else{
      errors.push(`curl ${method} ${c.error||'request failed'}`);
    }
  }

  const detail=errors.join('; ')||'request failed';
  if(lastHttp)return {...lastHttp,attemptErrors:errors,error:detail};
  return {url,status:null,ok:false,transportFailure:true,error:detail,attemptErrors:errors};
}

async function verifyGitHubMirror(entry){
  const key=entry.primary;
  if(mirrorVerificationCache.has(key))return mirrorVerificationCache.get(key);
  const promise=(async()=>{
    const mirror=await probeUrl(entry.mirror);
    const repositorySourceUrl=rawRepositoryUrl(entry);
    const repositorySource=await probeUrl(repositorySourceUrl);
    return {entry,mirror,repositorySourceUrl,repositorySource,verified:mirror.ok&&repositorySource.ok};
  })();
  mirrorVerificationCache.set(key,promise);
  return promise;
}

async function request(url,{hard=false}={}){
  const primary=await probeUrl(url);
  if(primary.ok)return primary;

  if(!primary.transportFailure){
    if([404,410].includes(primary.status)||(hard&&!primary.ok))report.failures.push(`${url} returned HTTP ${primary.status}`);
    else report.warnings.push(`${url} returned HTTP ${primary.status}`);
    return primary;
  }

  const normalized=normalizeResourceUrl(url);
  const mapping=mirrorByPrimary.get(normalized);
  if(mapping){
    const fallback=await verifyGitHubMirror(mapping);
    if(fallback.verified){
      if(!verifiedMirrorKeys.has(mapping.primary)){
        verifiedMirrorKeys.add(mapping.primary);
        report.verifiedMirrors.push({
          primary:mapping.primary,
          availability:VERIFIED_MIRROR_LABEL,
          mirror:mapping.mirror,
          mirrorStatus:fallback.mirror.status,
          mirrorTransport:fallback.mirror.transport,
          repository:mapping.repository,
          repositoryPath:mapping.repositoryPath,
          repositorySource:fallback.repositorySourceUrl,
          repositoryStatus:fallback.repositorySource.status,
          repositoryTransport:fallback.repositorySource.transport
        });
      }
      return {
        url,
        status:null,
        ok:true,
        availability:VERIFIED_MIRROR_LABEL,
        mirror:mapping.mirror,
        repository:mapping.repository,
        repositoryPath:mapping.repositoryPath,
        primaryTransportError:primary.error
      };
    }

    const mirrorHttp=fallback.mirror.status!==null;
    const repoHttp=fallback.repositorySource.status!==null;
    if(mirrorHttp||repoHttp){
      const details=[];
      if(!fallback.mirror.ok)details.push(`mirror ${fallback.mirror.status===null?'no HTTP response':`HTTP ${fallback.mirror.status}`}`);
      if(!fallback.repositorySource.ok)details.push(`repository source ${fallback.repositorySource.status===null?'no HTTP response':`HTTP ${fallback.repositorySource.status}`}`);
      report.failures.push(`Configured GitHub mirror verification failed for ${mapping.primary}: ${details.join('; ')}`);
      return {url,status:null,ok:false,mirrorVerificationFailed:true,mirror:mapping.mirror,repositorySource:fallback.repositorySourceUrl,error:details.join('; ')};
    }
  }

  const detail=primary.error||'request failed';
  const msg=`${url}: INDETERMINATE — no HTTP response received after Node HEAD/GET and IPv4 curl HEAD/GET; ${detail}`;
  report.indeterminate.push({url,hardRequested:hard,error:detail,mirrorConfigured:Boolean(mapping)});
  report.warnings.push(msg);
  return {url,status:null,ok:false,indeterminate:true,hardRequested:hard,error:detail};
}

try{
  const keyRoutes=['','en/','bibliography/','en/bibliography/','criticism/reception/','criticism/reception/gt-pt-criticism.html','criticism/reception/preeti-karan/p01.html','criticism/reception/en/preeti-karan/p01.html','criticism/reception/gt-pt-criticism/g01.html'];
  for(const rel of keyRoutes)report.live.push(await request(new URL(rel,SITE).href,{hard:true}));
  report.live.push(await request('https://www.videha.co.in/videha-rss.xml',{hard:true}));

  const localSitemap=fs.readFileSync(path.join(ROOT,'sitemap.xml'),'utf8');
  const localLocs=[...localSitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]).sort();
  const liveMapResp=await fetch(new URL('sitemap.xml',SITE),{signal:AbortSignal.timeout(15000),headers:{'user-agent':USER_AGENT}});
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
  const remoteResp=await fetch(PDF_CATALOG,{signal:AbortSignal.timeout(20000),headers:{'user-agent':USER_AGENT}});
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

report.status=report.failures.length?'fail':report.indeterminate.length?'pass-with-indeterminate':'pass';
fs.writeFileSync(OUT,JSON.stringify(report,null,2)+'\n');
console.log(`Scheduled health audit ${report.status.toUpperCase()}: ${report.live.length} key live routes, ${report.external.length} external links, ${report.verifiedMirrors.length} verified GitHub mirror resource(s), ${report.indeterminate.length} indeterminate transport result(s), ${report.warnings.length} warning(s), ${report.failures.length} failure(s).`);
for(const row of report.verifiedMirrors)console.log(`${VERIFIED_MIRROR_LABEL}: ${row.mirror} | repository source: ${row.repository}/${row.repositoryPath}`);
if(report.warnings.length)console.warn(report.warnings.join('\n'));
if(report.failures.length){console.error(report.failures.join('\n'));process.exitCode=1;}
