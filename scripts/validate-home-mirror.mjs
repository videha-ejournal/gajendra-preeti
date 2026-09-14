import fs from 'node:fs';
import assert from 'node:assert/strict';

const root='dist/client/gajendra-preeti';
const mai=fs.readFileSync(`${root}/index.html`,'utf8');
const en=fs.readFileSync(`${root}/en/index.html`,'utf8');

const sectionSignature=html=>[...html.matchAll(/<section(?:\s+id="([^"]+)")?\s+class="([^"]+)"|<section\s+class="([^"]+)"(?:\s+id="([^"]+)")?/g)].map(m=>({id:m[1]||m[4]||'',className:m[2]||m[3]||''}));
const ids=(html,re)=>[...html.matchAll(re)].map(m=>m[1]);
const count=(html,re)=>(html.match(re)||[]).length;

assert.deepEqual(sectionSignature(en),sectionSignature(mai),'English and Maithili home editions must have identical section order, ids and classes.');
assert.equal(count(en,/<header class="masthead">/g),count(mai,/<header class="masthead">/g),'Both editions need the same masthead count.');
assert.equal(count(en,/<footer>/g),count(mai,/<footer>/g),'Both editions need the same footer count.');
assert.equal(count(en,/class="work-card /g),count(mai,/class="work-card /g),'Both editions must expose the same number of work cards.');
assert.equal(count(en,/class="path-card/g),count(mai,/class="path-card/g),'Both editions must expose the same number of reading-path cards.');
assert.equal(count(en,/class="timeline-year"/g),count(mai,/class="timeline-year"/g),'Both editions must expose the same number of timeline stops.');
assert.deepEqual(ids(en,/id="work-([^"]+)"/g),ids(mai,/id="work-([^"]+)"/g),'Work cards must occur in the same order in both editions.');
assert.deepEqual(ids(en,/id="timeline-([^"]+)"/g),ids(mai,/id="timeline-([^"]+)"/g),'Timeline entries must occur in the same order in both editions.');
assert.equal(count(en,/class="writer-series-provenance"/g),count(mai,/class="writer-series-provenance"/g),'Writer provenance blocks must mirror.');
assert.equal(count(en,/class="work-actions"/g),count(mai,/class="work-actions"/g),'Per-work action rows must mirror.');
assert.equal(count(en,/class="catalogue-refine"/g),count(mai,/class="catalogue-refine"/g),'Catalogue controls must mirror.');
assert.equal(count(en,/class="research-gateway"/g),count(mai,/class="research-gateway"/g),'Research gateway must mirror.');
assert.equal(count(en,/class="criticism-teaser"/g),count(mai,/class="criticism-teaser"/g),'Criticism teaser must mirror.');
assert(!en.includes('class="english-edition"'),'English home must not use an edition-only visual wrapper; both editions share the same design system.');
assert(!en.includes('class="edition-breadcrumb"'),'English home must not insert a one-sided breadcrumb absent from Maithili.');
assert(en.includes('id="site-title"')&&mai.includes('id="site-title"'),'Both hero headings must use the same accessible id.');
assert(en.includes('aria-labelledby="site-title"')&&mai.includes('aria-labelledby="site-title"'),'Both hero sections must share the same labelling structure.');
assert(en.includes('id="preservation-title"')&&mai.includes('id="preservation-title"'),'Both preservation headings must use the same accessible id.');
assert(en.includes('aria-labelledby="preservation-title"')&&mai.includes('aria-labelledby="preservation-title"'),'Both preservation sections must share the same labelling structure.');

console.log('Home mirror validation PASS: Maithili and English have identical visible structure, controls, cards and section order.');
