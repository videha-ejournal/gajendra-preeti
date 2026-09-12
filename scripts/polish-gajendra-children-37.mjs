import fs from 'node:fs';
import assert from 'node:assert/strict';

function patch(file,before,after,label){
  let s=fs.readFileSync(file,'utf8');
  if(s.includes(after)||s.includes('data-provenance="gajendra-children-37"')) return;
  assert(s.includes(before),`${file}: patch point changed (${label})`);
  s=s.replace(before,after);
  fs.writeFileSync(file,s,'utf8');
}

const enBefore='<p>His work spans short fiction, novels, poetry, drama and criticism, alongside language, scripts and literary history. As Videha’s editor, he also works in digital publishing and archives.</p><dl>';
const enAfter='<p>His work spans short fiction, novels, poetry, drama and criticism, alongside language, scripts and literary history. As Videha’s editor, he also works in digital publishing and archives.</p><aside className="writer-series-provenance" data-provenance="gajendra-children-37"><strong>37 Maithili children’s novels / graphic novels</strong><span>Original Maithili author: Gajendra Thakur · English translator: Gajendra Thakur.</span></aside><dl>';
patch('app/(english)/en/page.tsx',enBefore,enAfter,'English Gajendra children-series provenance');

const maiBefore='<p>कथा, उपन्यास, कविता, नाटक आ समालोचनाक संग भाषा, लिपि आ साहित्यक इतिहासपर काज। विदेहक सम्पादकक रूपमे हुनक डिजिटल प्रकाशन आ अभिलेखक यात्रा सेहो जारी अछि।</p><dl>';
const maiAfter='<p>कथा, उपन्यास, कविता, नाटक आ समालोचनाक संग भाषा, लिपि आ साहित्यक इतिहासपर काज। विदेहक सम्पादकक रूपमे हुनक डिजिटल प्रकाशन आ अभिलेखक यात्रा सेहो जारी अछि।</p><aside className="writer-series-provenance" data-provenance="gajendra-children-37"><strong>३७ मैथिली बाल-उपन्यास / ग्राफिक उपन्यास</strong><span>मूल मैथिली रचनाकार: गजेन्द्र ठाकुर · English अनुवादक: गजेन्द्र ठाकुर।</span></aside><dl>';
patch('app/(maithili)/page.tsx',maiBefore,maiAfter,'Maithili Gajendra children-series provenance');

console.log('Added verified 37-book children-series provenance: original Maithili by Gajendra Thakur → English translation by Gajendra Thakur.');
