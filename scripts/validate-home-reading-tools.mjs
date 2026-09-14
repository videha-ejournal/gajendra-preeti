import fs from 'node:fs';
import assert from 'node:assert/strict';

const root='dist/client/gajendra-preeti';
const pages=[
  ['Maithili',fs.readFileSync(`${root}/index.html`,'utf8')],
  ['English',fs.readFileSync(`${root}/en/index.html`,'utf8')]
];
const js=fs.readFileSync('public/reading-tools.js','utf8');
const resilience=fs.readFileSync('public/reading-tools-resilience.js','utf8');
const component=fs.readFileSync('app/reading-tools.tsx','utf8');
const css=fs.readFileSync('public/reading-tools.css','utf8');

for(const [label,html] of pages){
  assert(html.includes('id="videha-reading-tools"'),`${label} home must render the reading-tools host.`);
  assert(html.includes('/gajendra-preeti/reading-tools.js'),`${label} home must server-emit the reading-tools script instead of relying only on hydration.`);
  assert(html.includes('/gajendra-preeti/reading-tools-resilience.js'),`${label} home must server-emit the hydration-resilience guard.`);
}

const languages=js.match(/const languages=\[(.*?)\];/s)?.[1]||'';
assert.equal((languages.match(/\['/g)||[]).length,41,'Reading tools must retain all 41 translation languages.');
for(const feature of ["data-open=\"listen\"","data-open=\"translate\"","data-open=\"access\"","data-open=\"cite\""]){
  assert(js.includes(feature),`Reading tools must retain ${feature}.`);
}
assert(js.includes('speechSynthesis')&&js.includes('Read aloud')&&js.includes('Stop'),'Listen/Stop speech controls must remain available.');
assert(js.includes("सहायक तकनीक")&&js.includes('Reading controls'),'Bilingual assistive-technology labels must remain available.');
assert(js.includes('Translate · 41 languages'),'41-language translation title must remain available.');
assert(css.includes('.vt-bar{position:fixed')&&css.includes('.vt-dialog'),'Reading-tools visual bar and dialog styling must remain available.');

assert(component.includes("'use client'"),'ReadingTools must run a post-hydration recovery effect.');
assert(component.includes("window.dispatchEvent(new Event('videha-tools-mount'))"),'ReadingTools must explicitly remount after hydration.');
assert(component.includes('suppressHydrationWarning'),'Toolbar host must tolerate pre-hydration enhancement without a hydration warning.');
assert(resilience.includes('MutationObserver'),'Reading-tools resilience guard must watch for hydration DOM replacement.');
assert(resilience.includes('delete host.dataset.mounted'),'Resilience guard must clear the stale mounted flag before remounting.');
assert(resilience.includes("window.dispatchEvent(new Event('videha-tools-mount'))"),'Resilience guard must remount the toolbar when React clears it.');

console.log('Home reading-tools validation PASS: Maithili + English retain 41-language translation, Listen/Stop, assistive controls and Cite, with post-hydration self-recovery.');
