import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const root='public/criticism';
const base='https://videha-ejournal.github.io/gajendra-preeti';

// Reading Room item pages are editorial/critical records about works. Do not
// flatten the featured work creator into the author of the critical record,
// and do not treat a source-check date as a publication date. Likewise, do
// not label these project pages as journal articles merely because Videha is
// the parent publication. Add only metadata supported by the page itself.
const citationNames=[
  'citation_title',
  'citation_author',
  'citation_publication_date',
  'citation_journal_title',
  'citation_issn',
  'citation_public_url',
  'citation_language',
  'citation_pdf_url'
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

function explicitMeta(html,name){
  const rx=new RegExp(`<meta\\s+name=["']${name}["']\\s+content=["']([^"']+)["']\\s*/?>`,'i');
  return html.match(rx)?.[1]?.trim()||null;
}

function pdfUrl(html){
  const links=[...html.matchAll(/href=["']([^"']+\.pdf(?:#[^"']*)?)["']/gi)].map(m=>m[1]);
  const url=links.find(Boolean)||null;
  return url ? url.replace(/#.*$/,'') : null;
}

function enrich(file,language){
  let html=fs.readFileSync(file,'utf8');
  const h1=html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1];
  const canonical=html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i)?.[1];
  assert(h1,`${file}: h1 required for citation_title`);
  assert(canonical,`${file}: canonical required for citation_public_url`);
  assert(canonical.startsWith(`${base}/criticism/`),`${file}: unexpected canonical ${canonical}`);

  const title=text(h1);
  // Only propagate an author/date/journal identity when the source page has an
  // explicit, dedicated metadata field for the critical record itself.
  const author=explicitMeta(html,'author');
  const publicationDate=explicitMeta(html,'date');
  const journalTitle=explicitMeta(html,'journal-title');
  const issn=explicitMeta(html,'issn');
  const pdf=pdfUrl(html);

  html=removeCitationTags(html);
  const supported=[
    ['citation_title',title],
    ['citation_public_url',canonical],
    ['citation_language',language],
    ...(author ? [['citation_author',author]] : []),
    ...(publicationDate ? [['citation_publication_date',publicationDate]] : []),
    ...(journalTitle ? [['citation_journal_title',journalTitle]] : []),
    ...(journalTitle && issn ? [['citation_issn',issn]] : []),
    ...(pdf ? [['citation_pdf_url',pdf]] : [])
  ];
  const tags=supported.map(([name,value])=>`<meta name="${name}" content="${escapeAttr(value)}">`).join('');
  html=html.replace('</head>',`${tags}</head>`);
  fs.writeFileSync(file,html,'utf8');

  for(const name of ['citation_title','citation_public_url','citation_language']){
    assert(new RegExp(`<meta\\s+name=["']${name}["']`,'i').test(html),`${file}: ${name} missing after enrichment`);
  }
  assert(html.includes(`name="citation_public_url" content="${escapeAttr(canonical)}"`),`${file}: citation_public_url must match canonical`);
  if(pdf) assert(html.includes(`name="citation_pdf_url" content="${escapeAttr(pdf)}"`),`${file}: citation_pdf_url must name a real linked PDF`);
  if(!author) assert(!/name=["']citation_author["']/i.test(html),`${file}: citation_author must not be inferred from the featured work creator`);
  if(!publicationDate) assert(!/name=["']citation_publication_date["']/i.test(html),`${file}: source-check date must not be relabelled as publication date`);
  if(!journalTitle){
    assert(!/name=["']citation_journal_title["']/i.test(html),`${file}: non-journal Reading Room page must not be labelled as a journal article`);
    assert(!/name=["']citation_issn["']/i.test(html),`${file}: ISSN requires an explicit journal identity`);
  }
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

console.log(`Scholar metadata enrichment PASS: ${english.length*2} bilingual Reading Room item pages; attribution-safe fields only.`);
