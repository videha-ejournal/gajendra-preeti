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
    ? 'no named human editorial review is recorded for this atlas summary page; it should be read alongside the attributed source chapter.'
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

const gtLanding=path.join(root,'criticism/reception/gt-pt-criticism.html');
if(fs.existsSync(gtLanding)){
  let html=fs.readFileSync(gtLanding,'utf8');
  const disclosure='एहि एटलस-सार पृष्ठक कोनो नामित मानवीय सम्पादकीय समीक्षा दर्ज नहि अछि; एकरा श्रेय-सहित मूल आलोचना-संग्रहक संग पढ़ल जाए।';
  if(!/कोनो नामित मानवीय सम्पादकीय समीक्षा दर्ज नहि अछि/i.test(html)){
    html=html.replace('</footer>',`<p class="summary-credit">${disclosure}</p></footer>`);
    fs.writeFileSync(gtLanding,html);
  }
}

let source=fs.readFileSync('scripts/validate-static.mjs','utf8');
const oldCount="assert.equal(receptionMaiFiles.length,3,'Reception must expose Maithili index + two book pages');";
const newCount="assert.equal(receptionMaiFiles.length,4,'Reception must expose Maithili index + two paired book pages + GT/PT criticism landing');";
if(!source.includes(oldCount)) throw new Error('Expected legacy reception count assertion not found');
source=source.replace(oldCount,newCount);

const oldEnglishWrapper='assert.match(english,/lang="en" class="english-edition"/);';
const newEnglishWrapper='assert.doesNotMatch(english,/class="english-edition"/);';
if(!source.includes(oldEnglishWrapper)) throw new Error('Expected legacy English-edition wrapper assertion not found');
source=source.replace(oldEnglishWrapper,newEnglishWrapper);

const marker="const files=[...criticismMaiFiles,...criticismEnFiles,...receptionMaiFiles,...receptionEnFiles];";
if(!source.includes(marker)) throw new Error('Expected legacy static file-list marker not found');
const expansion=`${marker}\nfor(const dir of ${JSON.stringify(chapterDirs)}){if(fs.existsSync(path.join(root,dir)))for(const entry of fs.readdirSync(path.join(root,dir))){if(String(entry).endsWith('.html'))files.push(dir+'/'+String(entry));}}`;
source=source.replace(marker,expansion);

const oldSitemapCount="assert.equal(sitemapUrls.length,idSets.size+standalone.length+pairedExtra.length,'Every indexed page and standalone guide belongs in sitemap');";
if(!source.includes(oldSitemapCount)) throw new Error('Expected legacy sitemap count assertion not found');
const newSitemapCount=`const extraAuthorityRoutes=[\n ['isbn/index.html',BASE+'isbn/','VIDEHA 293 ISBN सूची'],\n ['en/isbn/index.html',BASE+'en/isbn/','VIDEHA 293 ISBN LIST'],\n ['changelog/index.html',BASE+'changelog/',null]\n];\nfor(const [file,url,heading] of extraAuthorityRoutes){\n assert(fs.existsSync(path.join(root,file)),\`Missing consolidation route: \${file}\`);\n assert(sitemapUrls.includes(url),\`Missing sitemap consolidation route: \${url}\`);\n if(heading)assert(read(file).includes(heading),\`ISBN authority heading missing: \${file}\`);\n}\nfor(const file of ['isbn/index.html','en/isbn/index.html']){\n const isbnAuthorityHtml=read(file);\n assert(isbnAuthorityHtml.includes('978-93-341-0402-8')&&isbnAuthorityHtml.includes('978-93-5890-150-4')&&isbnAuthorityHtml.includes('978-93-5943-857-3'),'Editor ISBN identities missing');\n assert(!/Publishing Agency|Publisher<\\/th>|Name of Publishing Agency/i.test(isbnAuthorityHtml),'Publisher column must not be rendered');\n}\nfor(const file of ['isbn/isbn-authority-293.json','en/isbn/isbn-authority-293.json']){\n const isbnAuthorityJson=JSON.parse(read(file));\n assert.equal(isbnAuthorityJson.records.length,293,'ISBN authority must contain exactly 293 records');\n assert(isbnAuthorityJson.records.every(r=>!('publisher' in r)&&!('_discardedPublishingAgencyPublisher' in r)),'Publisher data must not appear in machine-readable ISBN authority');\n}\nassert.equal(sitemapUrls.length,idSets.size+standalone.length+pairedExtra.length+extraAuthorityRoutes.length,'Every indexed page, standalone guide, changelog and bilingual ISBN authority route belongs in sitemap');`;
source=source.replace(oldSitemapCount,newSitemapCount);

const tmp='scripts/.validate-static-current.tmp.mjs';
fs.writeFileSync(tmp,source);
try{
  await import(`./.validate-static-current.tmp.mjs?${Date.now()}`);
} finally {
  fs.rmSync(tmp,{force:true});
}
