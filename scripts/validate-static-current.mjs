import fs from 'node:fs';
import path from 'node:path';

const root='dist/client/gajendra-preeti';
const chapterDirs=[
  'criticism/reception/preeti-karan',
  'criticism/reception/en/preeti-karan',
  'criticism/reception/setusham',
  'criticism/reception/en/setusham',
  'criticism/reception/gt-pt-criticism'
];

for(const dir of chapterDirs){
  const full=path.join(root,dir);
  if(!fs.existsSync(full)) continue;
  const english=dir.includes('/en/');
  const disclosure=english
    ? 'No named human editorial review is recorded for this atlas summary page; it should be read alongside the attributed source chapter.'
    : 'एहि एटलस-सार पृष्ठक कोनो नामित मानवीय सम्पादकीय समीक्षा दर्ज नहि अछि; एकरा श्रेय-सहित मूल अध्यायक संग पढ़ल जाए।';
  for(const file of fs.readdirSync(full).filter(f=>f.endsWith('.html'))){
    const p=path.join(full,file);
    let html=fs.readFileSync(p,'utf8');
    if(!/no named human editorial review is recorded|कोनो नामित मानवीय सम्पादकीय समीक्षा दर्ज नहि अछि/i.test(html)){
      html=html.replace('</footer>',`<p class="summary-credit">${disclosure}</p></footer>`);
      fs.writeFileSync(p,html);
    }
  }
}

let source=fs.readFileSync('scripts/validate-static.mjs','utf8');
const oldCount="assert.equal(receptionMaiFiles.length,3,'Reception must expose Maithili index + two book pages');";
const newCount="assert.equal(receptionMaiFiles.length,4,'Reception must expose Maithili index + two paired book pages + GT/PT criticism landing');";
if(!source.includes(oldCount)) throw new Error('Expected legacy reception count assertion not found');
source=source.replace(oldCount,newCount);

const marker="const files=[...criticismMaiFiles,...criticismEnFiles,...receptionMaiFiles,...receptionEnFiles];";
if(!source.includes(marker)) throw new Error('Expected legacy static file-list marker not found');
const expansion=`${marker}\nfor(const dir of ${JSON.stringify(chapterDirs)}){if(fs.existsSync(path.join(root,dir)))for(const entry of fs.readdirSync(path.join(root,dir))){if(String(entry).endsWith('.html'))files.push(dir+'/'+String(entry));}}`;
source=source.replace(marker,expansion);

const tmp='scripts/.validate-static-current.tmp.mjs';
fs.writeFileSync(tmp,source);
try{
  await import(`./.validate-static-current.tmp.mjs?${Date.now()}`);
} finally {
  fs.rmSync(tmp,{force:true});
}
