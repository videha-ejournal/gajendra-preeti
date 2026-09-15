import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const root='public/criticism';
const base='https://videha-ejournal.github.io/gajendra-preeti';
const publication='Videha — First Maithili Fortnightly eJournal';
const creator='Gajendra Thakur';
const publicationDate='2026/09/13';
const citationNames=[
  'citation_title',
  'citation_author',
  'citation_publication_date',
  'citation_journal_title',
  'citation_issn',
  'citation_public_url',
  'citation_language'
];

const escapeAttr=value=>String(value).replace(/[&<>"']/g,c=>({
  '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
}[c]));
const text=value=>String(value)
  .replace(/<[^>]+>/g,' ')
  .replace(/&amp;/g,'&')
  .replace(/&quot;/g,'"')
  .replace(/&#39;/g,"'")
  .replace(/&lt;/g,'<')
  .replace(/&gt;/g,'>')
  .replace(/\s+/g,' ')
  .trim();

function removeCitationTags(html){
  for(const name of citationNames){
    const rx=new RegExp(`<meta\\s+name=["']${name}["']\\s+content=["'][^"']*["']\\s*/?>\\s*`,'gi');
    html=html.replace(rx,'');
  }
  return html;
}

function enrich(file,language){
  let html=fs.readFileSync(file,'utf8');
  const h1=html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1];
  const canonical=html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i)?.[1];
  assert(h1,`${file}: h1 required for citation_title`);
  assert(canonical,`${file}: canonical required for citation_public_url`);
  assert(canonical.startsWith(`${base}/criticism/`),`${file}: unexpected canonical ${canonical}`);

  const title=text(h1);
  html=removeCitationTags(html);
  const tags=[
    ['citation_title',title],
    ['citation_author',creator],
    ['citation_publication_date',publicationDate],
    ['citation_journal_title',publication],
    ['citation_issn','2229-547X'],
    ['citation_public_url',canonical],
    ['citation_language',language]
  ].map(([name,value])=>`<meta name="${name}" content="${escapeAttr(value)}">`).join('');
  html=html.replace('</head>',`${tags}</head>`);
  fs.writeFileSync(file,html,'utf8');

  for(const name of citationNames){
    assert(new RegExp(`<meta\\s+name=["']${name}["']`,'i').test(html),`${file}: ${name} missing after enrichment`);
  }
  assert(html.includes(`name="citation_public_url" content="${escapeAttr(canonical)}"`),`${file}: citation_public_url must match canonical`);
}

const enDir=path.join(root,'en');
assert(fs.existsSync(root)&&fs.existsSync(enDir),'Reading Room bilingual directories are required');
const english=fs.readdirSync(enDir).filter(name=>/^[gp]\d+\.html$/i.test(name)).sort();
assert.equal(english.length,59,`Expected 59 English criticism item pages, found ${english.length}`);

for(const name of english){
  const mai=path.join(root,name);
  const en=path.join(enDir,name);
  assert(fs.existsSync(mai),`Missing Maithili counterpart for ${name}`);
  enrich(mai,'mai');
  enrich(en,'en');
}

console.log(`Scholar metadata enrichment PASS: ${english.length*2} bilingual Reading Room item pages.`);
