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
const server=http.createServer((req,res)=>{try{const u=new URL(req.url||'/','http://127.0.0.1');let rel=decodeURIComponent(u.pathname).replace(/^\/+/,''),file=path.join(root,rel);if(file.endsWith(path.sep)||(fs.existsSync(file)&&fs.statSync(file).isDirectory()))file=path.join(file,'index.html');if(!fs.existsSync(file)){res.writeHead(404);res.end('Not found');return;}res.writeHead(200,{'content-type':mime[path.extname(file).toLowerCase()]||'application/octet-stream','cache-control':'no-store'});if(req.method==='HEAD'){res.end();return;}fs.createReadStream(file).pipe(res);}catch(err){res.writeHead(500);res.end(String(err));}});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin=`http://127.0.0.1:${server.address().port}`;
const routes=[{lang:'mai',url:`${origin}/gajendra-preeti/`,counterpart:'/gajendra-preeti/en/'},{lang:'en',url:`${origin}/gajendra-preeti/en/`,counterpart:'/gajendra-preeti/'}];
const viewports=[{name:'desktop',width:1440,height:900},{name:'mobile',width:390,height:844}];
const report={generatedAt:new Date().toISOString(),routes:[],axe:{},status:'running'};
let browser;

async function keyboardFocusStyle(page){
  await page.evaluate(()=>{if(document.activeElement instanceof HTMLElement)document.activeElement.blur();});
  for(let i=0;i<40;i++){
    await page.keyboard.press('Tab');
    const state=await page.evaluate(()=>{const n=document.activeElement;if(!(n instanceof HTMLElement))return null;return {match:n.matches('.masthead nav a'),tag:n.tagName,text:n.textContent?.trim(),outlineStyle:getComputedStyle(n).outlineStyle,outlineWidth:getComputedStyle(n).outlineWidth,outlineColor:getComputedStyle(n).outlineColor,outlineOffset:getComputedStyle(n).outlineOffset,boxShadow:getComputedStyle(n).boxShadow};});
    if(state?.match)return state;
  }
  return null;
}
async function closeDialog(host){if(await host.locator('#vt-dialog').evaluate(d=>d.open))await host.locator('#vt-close').click();}

try{
  browser=await chromium.launch({headless:true});
  const structures={};
  for(const viewport of viewports){
    for(const route of routes){
      const context=await browser.newContext({viewport:{width:viewport.width,height:viewport.height},reducedMotion:'reduce'});
      const page=await context.newPage();report.routes.push({lang:route.lang,viewport:viewport.name,url:route.url});
      await page.goto(route.url,{waitUntil:'networkidle'});await page.waitForTimeout(1400);
      assert.equal(await page.locator('html').getAttribute('lang'),route.lang,`${route.lang}: html language`);
      assert(await page.locator('#main').isVisible(),`${route.lang}: main content must be visible`);
      const host=page.locator('#videha-reading-tools');
      assert.equal(await host.count(),1,`${route.lang}: reading-tools mount host must exist`);
      assert(await host.locator('.vt-bar').isVisible(),`${route.lang}/${viewport.name}: visible toolbar must remain after hydration`);
      assert.equal(await host.locator('.vt-bar button').count(),4,`${route.lang}: toolbar must expose Listen, Translate, Reading controls and Cite`);
      const counterpart=route.lang==='mai'?host.locator('.vt-editions a').filter({hasText:'English'}):host.locator('.vt-editions a').filter({hasText:'मैथिली'});
      assert.equal(new URL(await counterpart.getAttribute('href'),origin).pathname,route.counterpart,`${route.lang}: language switch must target mirror home`);

      await host.locator('[data-open="translate"]').click();
      assert(await host.locator('#vt-dialog').evaluate(d=>d.open),`${route.lang}: Translate dialog must open`);
      assert.equal(await host.locator('#vt-language option').count(),41,`${route.lang}: Translate must expose exactly 41 languages`);
      assert((await host.locator('#vt-translate').getAttribute('href'))?.includes('translate.google.com'),`${route.lang}: translation action URL`);
      assert(await host.locator('#vt-dialog').evaluate(d=>d.contains(document.activeElement)),`${route.lang}: dialog must contain keyboard focus`);await closeDialog(host);

      await host.locator('[data-open="listen"]').click();for(const id of ['#vt-start','#vt-pause','#vt-stop'])assert(await host.locator(id).isVisible(),`${route.lang}: ${id} must be visible`);await closeDialog(host);
      await host.locator('[data-open="access"]').click();assert.equal(await host.locator('[data-pref]').count(),7,`${route.lang}: seven assistive toggles`);assert.equal(await host.locator('#vt-scale').getAttribute('max'),'180',`${route.lang}: text scale max`);await host.locator('[data-pref="targets"]').check();assert(await page.locator('body').evaluate(b=>b.classList.contains('vt-targets')),`${route.lang}: larger-target preference must apply`);await host.locator('#vt-reset').click();await closeDialog(host);
      await host.locator('[data-open="cite"]').click();assert((await host.locator('#vt-citation').inputValue()).includes('Videha Literary Atlas'),`${route.lang}: citation generator`);await closeDialog(host);

      assert.equal(await page.locator('a.skip').first().getAttribute('href'),'#main',`${route.lang}: skip link`);
      const focus=await keyboardFocusStyle(page);assert(focus,`${route.lang}: keyboard Tab sequence must reach masthead navigation`);assert(!(focus.outlineStyle==='none'&&['0px','0'].includes(focus.outlineWidth)&&focus.boxShadow==='none'),`${route.lang}: keyboard-focused masthead link needs a visible focus indicator`);assert(parseFloat(focus.outlineWidth)>=2||focus.boxShadow!=='none',`${route.lang}: focus indicator must be visibly substantial`);
      assert(await page.evaluate(()=>matchMedia('(prefers-reduced-motion: reduce)').matches),`${route.lang}: reduced-motion media query`);
      const sectionIds=await page.locator('main > section').evaluateAll(ns=>ns.map(n=>n.id||`class:${[...n.classList].sort().join('.')}`));
      const workIds=await page.locator('.work-card').evaluateAll(ns=>ns.map(n=>n.id));
      const timelineYears=await page.locator('.timeline-year').allTextContents();structures[`${viewport.name}:${route.lang}`]={sectionIds,workIds,timelineYears};

      if(viewport.name==='mobile'){
        const o=await page.evaluate(()=>({s:document.documentElement.scrollWidth,c:document.documentElement.clientWidth}));assert(o.s<=o.c+2,`${route.lang}: mobile reflow without horizontal overflow`);
        const boxes=await host.locator('.vt-bar button,.vt-editions a').evaluateAll(ns=>ns.map(n=>{const r=n.getBoundingClientRect();return {w:r.width,h:r.height,text:n.textContent?.trim()};}));for(const b of boxes)assert(b.w>=24&&b.h>=24,`${route.lang}: target ${b.text} must be >=24x24 CSS px`);
      }

      await page.addScriptTag({content:axeSource});const axe=await page.evaluate(async()=>await window.axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']}}));const blocking=axe.violations.filter(v=>['serious','critical'].includes(v.impact));report.axe[`${viewport.name}:${route.lang}`]={violations:axe.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.length,help:v.help})),blocking:blocking.length};assert.equal(blocking.length,0,`${route.lang}/${viewport.name}: serious/critical axe violations: ${blocking.map(v=>v.id).join(', ')}`);
      await context.close();
    }
    assert.deepEqual(structures[`${viewport.name}:mai`].sectionIds,structures[`${viewport.name}:en`].sectionIds,`${viewport.name}: mirrored sections`);assert.deepEqual(structures[`${viewport.name}:mai`].workIds,structures[`${viewport.name}:en`].workIds,`${viewport.name}: mirrored work cards`);assert.deepEqual(structures[`${viewport.name}:mai`].timelineYears,structures[`${viewport.name}:en`].timelineYears,`${viewport.name}: mirrored timeline`);
  }
  report.status='pass';fs.writeFileSync(path.join(artifactDir,'browser-hardening-report.json'),JSON.stringify(report,null,2)+'\n');console.log('Browser hardening PASS: hydration persistence, 41-language translation, Listen/Stop, assistive controls, Cite, true keyboard focus-visible, bilingual mirror, mobile reflow/targets and axe WCAG checks passed.');
}catch(err){report.status='fail';report.error=String(err?.stack||err);fs.writeFileSync(path.join(artifactDir,'browser-hardening-report.json'),JSON.stringify(report,null,2)+'\n');throw err;}finally{await browser?.close().catch(()=>{});await new Promise(resolve=>server.close(resolve));}
