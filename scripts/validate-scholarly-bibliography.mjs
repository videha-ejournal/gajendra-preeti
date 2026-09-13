import fs from 'node:fs';
import assert from 'node:assert/strict';

const root='public';
const data=JSON.parse(fs.readFileSync(`${root}/bibliography/bibliography-data.json`,'utf8'));
assert(data.sourcePage==='https://videha-ejournal.github.io/videha/gajendra-thakur-samagra.htm','Bibliography must identify the authoritative Samagra source.');
assert(data.sourceSection.includes('00 मुख्य समग्र'),'Bibliography must identify 00 मुख्य समग्र as the synchronized source section.');
assert(data.recordCount===data.records.length,'Bibliography count must match generated records.');
assert(data.recordCount>=10,'Authoritative 00 source unexpectedly produced too few records.');
assert(/^[a-f0-9]{64}$/.test(data.sourceSha256),'Bibliography must store a SHA-256 fingerprint of the authoritative source.');
for(const file of ['bibliography/index.html','en/bibliography/index.html','author/gajendra-thakur/index.html','en/author/gajendra-thakur/index.html','bibliography/export.bib','bibliography/export.ris','bibliography/export.json','bibliography/crossref-ready.json'])assert(fs.existsSync(`${root}/${file}`),`Missing generated scholarly resource: ${file}`);
const mai=fs.readFileSync(`${root}/bibliography/index.html`,'utf8'),en=fs.readFileSync(`${root}/en/bibliography/index.html`,'utf8');
assert(mai.includes('पूर्ण शोधार्थी ग्रन्थ-सूची')&&en.includes('Complete Scholarly Bibliography'),'Both bibliography editions must render.');
assert(mai.includes('00 मुख्य समग्र')&&en.includes('00 Mukhya Samagra'),'Both editions must disclose the authoritative source.');
assert(mai.includes('DOI')&&en.includes('DOI'),'DOI status must be explicit without fabrication.');
const sitemap=fs.readFileSync(`${root}/sitemap.xml`,'utf8');
assert(sitemap.includes('https://videha-ejournal.github.io/gajendra-preeti/bibliography/'),'Sitemap must contain Maithili bibliography.');
assert(sitemap.includes('https://videha-ejournal.github.io/gajendra-preeti/en/bibliography/'),'Sitemap must contain English bibliography.');
for(const r of data.records){
 assert(r.id&&r.slug&&r.title&&r.titleRoman,'Each Samagra record needs stable id, slug, canonical title and Roman transliteration.');
 assert(Array.isArray(r.links)&&r.links.length>0,'Every synchronized Samagra record must retain at least one access route.');
 for(const prefix of ['','en/']){
  const dir=`${root}/${prefix}bibliography/works/${r.slug}`;
  const html=fs.readFileSync(`${dir}/index.html`,'utf8');
  assert(html.includes('citation_title'),'Every scholarly work page must expose citation_title metadata.');
  assert(html.includes('citation_author'),'Every scholarly work page must expose citation_author metadata.');
  assert(html.includes(r.id),'Every work page must expose its stable scholarly record id.');
  assert(html.includes('BibTeX')&&html.includes('RIS')&&html.includes('CSL-JSON'),'Every work page must provide citation export routes.');
  for(const f of ['citation.bib','citation.ris','citation.json'])assert(fs.existsSync(`${dir}/${f}`),`Missing ${prefix}${r.slug}/${f}`);
  assert(sitemap.includes(`https://videha-ejournal.github.io/gajendra-preeti/${prefix}bibliography/works/${r.slug}/`),`Sitemap missing ${prefix}${r.slug}`);
 }
}
const crossref=JSON.parse(fs.readFileSync(`${root}/bibliography/crossref-ready.json`,'utf8'));
assert(crossref.records.every(r=>r.doi===null),'Build must never fabricate DOI values.');
const authority=fs.readFileSync(`${root}/author/gajendra-thakur/index.html`,'utf8');
assert(authority.includes('गजेन्द्र ठाकुर')&&authority.includes('ISSN 2229-547X'),'Authority page must bind the author to the Videha editorial identity.');
assert(!/orcid\.org\/\d/i.test(authority),'No unverified ORCID may be asserted.');
console.log(`Scholarly bibliography validation PASS: ${data.recordCount} synchronized 00 records, bilingual permanent pages, authority records and citation exports.`);
