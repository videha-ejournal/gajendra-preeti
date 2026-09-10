import fs from 'node:fs';
import assert from 'node:assert/strict';

function patch(file,before,after,label){
  let s=fs.readFileSync(file,'utf8');
  if(s.includes(after)) return;
  assert(s.includes(before),`${file}: patch point changed (${label})`);
  s=s.replace(before,after);
  fs.writeFileSync(file,s,'utf8');
}

const enPreetiBefore='<p>Maithili picture stories and translated children’s books form a major strand of her work. Videha also credits her with compiling, scanning and cataloguing palm-leaf Panji records.</p><dl>';
const enPreetiAfter='<p>Maithili picture stories and translated children’s books form a major strand of her work. Videha also credits her with compiling, scanning and cataloguing palm-leaf Panji records.</p><aside className="writer-series-provenance" data-provenance="preeti-children-16"><strong>16 children’s works</strong><span>4 original Maithili works — author: Preeti Thakur · 12 picture-book translations: English → Maithili — translator: Preeti Thakur.</span></aside><dl>';
patch('app/(english)/en/page.tsx',enPreetiBefore,enPreetiAfter,'English Preeti children corpus');

const maiPreetiBefore='<p>मैथिली चित्रकथा आ बाल-पोथीक अनुवाद हुनक रचना संसारक प्रमुख धारा अछि। विदेहक सूचीमे पञ्जी ताड़पत्रक संकलन, स्कैनिंग आ सूचीकरण सेहो हुनक नामसँ दर्ज अछि।</p><dl>';
const maiPreetiAfter='<p>मैथिली चित्रकथा आ बाल-पोथीक अनुवाद हुनक रचना संसारक प्रमुख धारा अछि। विदेहक सूचीमे पञ्जी ताड़पत्रक संकलन, स्कैनिंग आ सूचीकरण सेहो हुनक नामसँ दर्ज अछि।</p><aside className="writer-series-provenance" data-provenance="preeti-children-16"><strong>१६ बाल-कृति</strong><span>४ मूल मैथिली कृति — लेखिका: प्रीति ठाकुर · १२ बाल-चित्रपोथीक अनुवाद: English → मैथिली — अनुवादिका: प्रीति ठाकुर।</span></aside><dl>';
patch('app/(maithili)/page.tsx',maiPreetiBefore,maiPreetiAfter,'Maithili Preeti children corpus');

const enGajendraBefore='<aside className="writer-series-provenance" data-provenance="gajendra-children-37"><strong>37 Maithili children’s novels / graphic novels</strong><span>Original Maithili author: Gajendra Thakur · English translator: Gajendra Thakur.</span></aside><dl>';
const enGajendraAfter='<aside className="writer-series-provenance" data-provenance="gajendra-children-37"><strong>37 Maithili children’s novels / graphic novels</strong><span>Original Maithili author: Gajendra Thakur · English translator: Gajendra Thakur.</span></aside><aside className="writer-series-provenance" data-provenance="gajendra-maithili-translations-45"><strong>45 Maithili translation entries</strong><span>Items 1–3: various Indian-language originals → English intermediary → Maithili by Gajendra Thakur · Items 4–45: English → Maithili by Gajendra Thakur.</span></aside><dl>';
patch('app/(english)/en/page.tsx',enGajendraBefore,enGajendraAfter,'English Gajendra translation corpus');

const maiGajendraBefore='<aside className="writer-series-provenance" data-provenance="gajendra-children-37"><strong>३७ मैथिली बाल-उपन्यास / ग्राफिक उपन्यास</strong><span>मूल मैथिली रचनाकार: गजेन्द्र ठाकुर · English अनुवादक: गजेन्द्र ठाकुर।</span></aside><dl>';
const maiGajendraAfter='<aside className="writer-series-provenance" data-provenance="gajendra-children-37"><strong>३७ मैथिली बाल-उपन्यास / ग्राफिक उपन्यास</strong><span>मूल मैथिली रचनाकार: गजेन्द्र ठाकुर · English अनुवादक: गजेन्द्र ठाकुर।</span></aside><aside className="writer-series-provenance" data-provenance="gajendra-maithili-translations-45"><strong>४५ मैथिली अनुवाद-प्रविष्टि</strong><span>१–३: विभिन्न भारतीय भाषाक मूलसँ English माध्यमेँ मैथिली — अनुवादक गजेन्द्र ठाकुर · ४–४५: English सँ सीधे मैथिली — अनुवादक गजेन्द्र ठाकुर।</span></aside><dl>';
patch('app/(maithili)/page.tsx',maiGajendraBefore,maiGajendraAfter,'Maithili Gajendra translation corpus');

console.log('Added visible provenance for Preeti Thakur 4 original + 12 translated children works and Gajendra Thakur 45 Maithili translations.');
