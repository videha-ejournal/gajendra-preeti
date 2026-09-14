import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
const {chromium}=await import('playwright');
const axeModule=await import('axe-core');
const axeSource=axeModule.default?.source||axeModule.source;
const root=path.resolve('dist/client');
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.woff2':'font/woff2','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml'};
const server=http.createServer((req,res)=>{const u=new URL(req.url||'/','http://127.0.0.1');let f=path.join(root,decodeURIComponent(u.pathname).replace(/^\/+/,''));if(f.endsWith(path.sep)||(fs.existsSync(f)&&fs.statSync(f).isDirectory()))f=path.join(f,'index.html');if(!fs.existsSync(f)){res.writeHead(404);return res.end();}res.writeHead(200,{'content-type':mime[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(res);});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
let browser;
try{
 browser=await chromium.launch({headless:true});
 const page=await browser.newPage({viewport:{width:1440,height:900}});
 await page.goto(`http://127.0.0.1:${server.address().port}/gajendra-preeti/en/`,{waitUntil:'networkidle'});
 await page.waitForTimeout(1400);
 await page.addScriptTag({content:axeSource});
 const result=await page.evaluate(async()=>await window.axe.run(document,{runOnly:{type:'rule',values:['target-size']}}));
 const diagnostic=result.violations.map(v=>({id:v.id,impact:v.impact,help:v.help,nodes:v.nodes.map(n=>({target:n.target,html:n.html,failureSummary:n.failureSummary,any:n.any,all:n.all,none:n.none}))}));
 fs.mkdirSync('artifacts',{recursive:true});fs.writeFileSync('artifacts/axe-target-size-diagnostics.json',JSON.stringify(diagnostic,null,2)+'\n');
 console.log(JSON.stringify(diagnostic,null,2));
}finally{await browser?.close().catch(()=>{});await new Promise(r=>server.close(r));}
