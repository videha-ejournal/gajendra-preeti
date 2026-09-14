import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';

const {chromium}=await import('playwright');
const axeModule=await import('axe-core');
const axeSource=axeModule.default?.source||axeModule.source;
const root=path.resolve('dist/client');
const artifactDir=path.resolve('artifacts');
fs.mkdirSync(artifactDir,{recursive:true});

const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.woff2':'font/woff2','.xml':'application/xml; charset=utf-8','.pdf':'application/pdf'};
const server=http.createServer((req,res)=>{
  try{
    const u=new URL(req.url||'/', 'http://127.0.0.1');
    let rel=decodeURIComponent(u.pathname).replace(/^\/+/, '');
    let file=path.join(root,rel);
    if(file.endsWith(path.sep)||fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');
    if(!fs.existsSync(file)){res.writeHead(404,{'content-type':'text/plain'});res.end('Not found');return;}
    const ext=path.extname(file).toLowerCase();
    res.writeHead(200,{'content-type':mime[ext]||'application/octet-stream','cache-control':'no-store'});
    if(req.method==='HEAD'){res.end();return;}
    fs.createReadStream(file).pipe(res);
  }catch(err){res.writeHead(500,{'content-type':'text/plain'});res.end(String(err));}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const port=server.address().port;
const origin=`http://127.0.0.1:${port}`;
const routes=[
  {lang:'mai',url:`${origin}/gajendra-preeti/`,counterpart:'/gajendra-preeti/en/'},
  {lang:'en',url:`${origin}/gajendra-preeti/en/`,counterpart:'/gajendra-preeti/'}
];
const viewports=[{name:'desktop',width:1440,height:900},{name:'mobile',width:390,height:844}];
const report={generatedAt:new Date().toISOString(),routes:[],axe:{},status:'running'};
let browser;

async function visibleFocus(page,selector){
  const el=page.locator(selector).first();await el.focus();
  return el.evaluate(node=>{const s=getComputedStyle(node);return {outlineStyle:s.outlineStyle,outlineWidth:s.outlineWidth,boxShadow:s.boxShadow};});
}

try{
  browser=await chromium.launch({headless:true});
  const structures={};
  for(const viewport of viewports){
    for(const route of routes){
      const context=await browser.newContext({viewport:{width:viewport.width,height:viewport.height},reducedMotion:'reduce'});
      const page=await context.newPage();
      const item={lang:route.lang,viewport:viewport.name,url:route.url};report.routes.push(item);
      await page.goto(route.url,{waitUntil:'networkidle'});
      await page.waitForTimeout(1400); // explicitly cross the hydration window that previously erased the toolbar
      assert.equal(await page.locator('html').getAttribute('lang'),route.lang,`${route.lang}: html language`);
      assert(await page.locator('#main').isVisible(),`${route.lang}: main content must be visible`);
      const host=page.locator('#videha-reading-tools');
      assert(await host.isVisible(),`${route.lang}/${viewport.name}: reading-tools host must remain visible after hydration`);
      assert.equal(await host.locator('.vt-bar button').count(),4,`${route.lang}: toolbar must expose Listen, Translate, Reading controls and Cite`);
      const counterpart=route.lang==='mai'?host.locator('.vt-editions a').filter({hasText:'English'}):host.locator('.vt-editions a').filter({hasText:'मैथिली'});
      assert.equal(new URL(await counterpart.getAttribute('href'),origin).pathname,route.counterpart,`${route.lang}: language switch must target mirror home`);

      await host.locator('[data-open="translate"]').click();
      assert(await host.locator('#vt-dialog').evaluate(d=>d.open),`${route.lang}: Translate dialog must open`);
      assert.equal(await host.locator('#vt-language option').count(),41,`${route.lang}: Translate must expose exactly 41 languages`);
      assert((await host.locator('#vt-translate').getAttribute('href'))?.includes('translate.google.com'),`${route.lang}: translation action must use external translation service`);
      assert(await host.locator('#vt-dialog').evaluate(d=>d.contains(document.activeElement)),`${route.lang}: dialog must contain keyboard focus`);
      await host.locator('#vt-close').click();

      await host.locator('[data-open="listen"]').click();
      for(const id of ['#vt-start','#vt-pause','#vt-stop'])assert(await host.locator(id).isVisible(),`${route.lang}: ${id} listening control must be visible`);
      await host.locator('#vt-close').click();

      await host.locator('[data-open="access"]').click();
      assert.equal(await host.locator('[data-pref]').count(),7,`${route.lang}: seven assistive preference toggles must remain available`);
      assert.equal(await host.locator('#vt-scale').getAttribute('max'),'180',`${route.lang}: reading text-size control must support 180%`);
      const targets=host.locator('[data-pref="targets"]');await targets.check();
      assert(await page.locator('body').evaluate(b=>b.classList.contains('vt-targets')),`${route.lang}: larger-target preference must actually apply`);
      await host.locator('#vt-reset').click();await host.locator('#vt-close').click();

      await host.locator('[data-open="cite"]').click();
      const citation=await host.locator('#vt-citation').inputValue();
      assert(citation.includes('Videha Literary Atlas'),`${route.lang}: citation generator must populate a citation`);
      await host.locator('#vt-close').click();

      const skip=page.locator('a.skip').first();
      assert.equal(await skip.getAttribute('href'),'#main',`${route.lang}: skip link must target main`);
      const focus=await visibleFocus(page,'.masthead nav a');
      assert(!(focus.outlineStyle==='none'&&['0px','0'].includes(focus.outlineWidth)&&focus.boxShadow==='none'),`${route.lang}: focused navigation link needs a visible focus indicator`);
      assert(await page.evaluate(()=>matchMedia('(prefers-reduced-motion: reduce)').matches),`${route.lang}: reduced-motion preference must reach the browser page`);

      const sectionIds=await page.locator('main > section').evaluateAll(nodes=>nodes.map(n=>n.id||`class:${[...n.classList].sort().join('.')}`));
      const workIds=await page.locator('.work-card').evaluateAll(nodes=>nodes.map(n=>n.id));
      const timelineYears=await page.locator('.timeline-year').allTextContents();
      structures[`${viewport.name}:${route.lang}`]={sectionIds,workIds,timelineYears};

      if(viewport.name==='mobile'){
        const overflow=await page.evaluate(()=>({scrollWidth:document.documentElement.scrollWidth,clientWidth:document.documentElement.clientWidth}));
        assert(overflow.scrollWidth<=overflow.clientWidth+2,`${route.lang}: mobile home must reflow without horizontal page overflow`);
        const boxes=await host.locator('.vt-bar button,.vt-editions a').evaluateAll(nodes=>nodes.map(n=>{const r=n.getBoundingClientRect();return {w:r.width,h:r.height,text:n.textContent?.trim()};}));
        for(const b of boxes)assert(b.w>=24&&b.h>=24,`${route.lang}: touch target ${b.text} must be at least 24×24 CSS px`);
      }

      await page.addScriptTag({content:axeSource});
      const axe=await page.evaluate(async()=>await window.axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']}}));
      const blocking=axe.violations.filter(v=>['serious','critical'].includes(v.impact));
      report.axe[`${viewport.name}:${route.lang}`]={violations:axe.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.length,help:v.help})),blocking:blocking.length};
      assert.equal(blocking.length,0,`${route.lang}/${viewport.name}: axe found serious/critical WCAG violations: ${blocking.map(v=>v.id).join(', ')}`);
      await context.close();
    }
    assert.deepEqual(structures[`${viewport.name}:mai`].sectionIds,structures[`${viewport.name}:en`].sectionIds,`${viewport.name}: Maithili and English section structure must mirror`);
    assert.deepEqual(structures[`${viewport.name}:mai`].workIds,structures[`${viewport.name}:en`].workIds,`${viewport.name}: Maithili and English work-card order must mirror`);
    assert.deepEqual(structures[`${viewport.name}:mai`].timelineYears,structures[`${viewport.name}:en`].timelineYears,`${viewport.name}: Maithili and English timeline order must mirror`);
  }
  report.status='pass';
  fs.writeFileSync(path.join(artifactDir,'browser-hardening-report.json'),JSON.stringify(report,null,2)+'\n');
  console.log('Browser hardening PASS: hydration persistence, 41-language translation, Listen/Stop, assistive controls, Cite, bilingual mirror structure, keyboard/focus, mobile targets/reflow and axe WCAG checks passed.');
}catch(err){
  report.status='fail';report.error=String(err?.stack||err);
  fs.writeFileSync(path.join(artifactDir,'browser-hardening-report.json'),JSON.stringify(report,null,2)+'\n');
  throw err;
}finally{
  await browser?.close().catch(()=>{});
  await new Promise(resolve=>server.close(resolve));
}
