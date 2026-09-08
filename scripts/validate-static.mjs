import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const root='dist/client/gajendra-preeti';
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const manifest=JSON.parse(fs.readFileSync('dist/server/vinext-prerender.json','utf8'));
assert.equal(manifest.routes.find(r=>r.route==='/')?.status,'rendered','Home route must be statically rendered');
assert.match(html,/<html lang="mai"/);
assert.match(html,/<title>प्रीति ठाकुर आ गजेन्द्र ठाकुर<\/title>/);
const ids=new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]));
const local=[...html.matchAll(/(?:href|src)="([^"]+)"/g)].map(m=>m[1]);
for(const url of local){
  if(url.startsWith('#'))assert(ids.has(url.slice(1)),`Missing anchor ${url}`);
  if(url.startsWith('/gajendra-preeti/'))assert(fs.existsSync(path.join(root,url.slice('/gajendra-preeti/'.length))),`Missing asset ${url}`);
}
const works=JSON.parse(fs.readFileSync('app/works.json','utf8'));
assert.equal(new Set(works.map(w=>w.id)).size,works.length);
for(const w of works){assert(w.title&&w.name);assert.equal(new URL(w.url).protocol,'https:');assert.equal(new URL(w.source).protocol,'https:')}
for(const id of ['p0','p1','p13','g0','g2','g4','p16','g6','j0'])assert(works.some(w=>w.id===id));
for(const id of ['writers','paths','archive','journey','videha','sources'])assert(ids.has(id));
assert(fs.existsSync(path.join(root,'.nojekyll')));
assert(!html.includes('Untitled site'));
console.log(`Static validation passed: ${works.length} sourced records; all local assets and section links exist.`);
