'use client';
import {useEffect,useState} from 'react';
import {Input} from '@/components/ui/input';
import {Button} from '@/components/ui/button';
import {NativeSelect,NativeSelectOption} from '@/components/ui/native-select';
import works from './works.json';
import preetiChildren from '../content/preeti-children-provenance.json';
import readings from '../public/criticism/manifest.json';
import reviewLinks from './review-links.json';
const reviews=reviewLinks as Record<string,string>;
const preetiOriginalIds=new Set(preetiChildren.originalMaithili.map(w=>w.id));
const preetiTranslationIds=new Set(preetiChildren.englishToMaithiliTranslations.map(w=>w.id));
const categories=[...new Set(works.map(w=>w.kindEn))];
const years=[...new Set(works.map(w=>w.year).filter(y=>y!==null))].sort((a,b)=>Number(a)-Number(b));
const normalize=(value:string)=>value.normalize('NFC').toLowerCase().replace(/[०-९]/g,d=>String('०१२३४५६७८९'.indexOf(d))).trim();
function destination(url:string){const host=new URL(url).hostname;return host.includes('drive.google')?'Google Drive':host.includes('archive.org')?'Archive.org · PDF':host.includes('store.pothi')?'Pothi · Print / purchase':host.includes('play.google')?'Google Play Books':host.includes('github.io')?'Videha · Digital edition':'External publication';}
function editionStatus(w:(typeof works)[number],english:boolean){
 const recorded=english?w.noteEn:w.note;
 if(english&&/^First edition\s/i.test(recorded||''))return recorded;
 if(!english&&/^प्रथम संस्करण\s/.test(recorded||''))return recorded;
 if(w.year)return english?`Recorded edition: ${w.year} · first/revised status not separately recorded`:`दर्ज संस्करण: ${w.year} · प्रथम/संशोधित स्थिति अलगसँ दर्ज नहि`;
 return english?'Edition year not recorded in the current source listing':'वर्तमान स्रोत-सूचीमे संस्करण-वर्ष दर्ज नहि';
}
function descriptiveNote(w:(typeof works)[number],english:boolean){
 const value=english?w.noteEn:w.note;
 if(!value)return english?'Videha book catalogue':'विदेह पुस्तक सूची';
 if(english&&/^First edition\s/i.test(value))return 'Videha book catalogue';
 if(!english&&/^प्रथम संस्करण\s/.test(value))return 'विदेह पुस्तक सूची';
 return value;
}
function preetiRole(w:(typeof works)[number],english:boolean){
 if(preetiOriginalIds.has(w.id))return english?'Original Maithili · Author: Preeti Thakur':'मूल मैथिली · लेखिका: प्रीति ठाकुर';
 if(preetiTranslationIds.has(w.id))return english?'English → Maithili · Translator: Preeti Thakur':'English → मैथिली · अनुवादिका: प्रीति ठाकुर';
 return null;
}
export default function CatalogueView({english=false}:{english?:boolean}){
 const[query,setQuery]=useState(''),[author,setAuthor]=useState('all'),[genre,setGenre]=useState('all'),[year,setYear]=useState('all');
 const clear=()=>{setQuery('');setAuthor('all');setGenre('all');setYear('all');};
 useEffect(()=>{const reveal=()=>{if(location.hash.startsWith('#work-')){clear();setTimeout(()=>document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView({block:'start'}),100);}};reveal();addEventListener('hashchange',reveal);return()=>removeEventListener('hashchange',reveal);},[]);
 const filtered=works.filter(w=>(author==='all'||w.author===author)&&(genre==='all'||w.kindEn===genre)&&(year==='all'||String(w.year)===year)&&normalize([w.title,w.name,w.titleEn,w.nameEn,w.kind,w.kindEn,w.year,w.keywords,w.note,w.noteEn].join(' ')).includes(normalize(query)));
 return <div className="catalogue"><p className="catalogue-note">{english?`${works.length} selected works; the companion Reading Room covers ${readings.length} catalogue entries, including collected editions and digital resources. These are different units, not a complete count of published books.`:`${works.length} चुनल रचना; समालोचना-कक्षमे ${readings.length} सूची-प्रविष्टि अछि, जाहिमे संकलित संस्करण आ डिजिटल संसाधनो अछि। ई अलग-अलग गणना अछि, प्रकाशित पोथीक पूर्ण संख्या नहि।`} <a href={english?'/gajendra-preeti/criticism/en/':'/gajendra-preeti/criticism/'} lang={english?'en':'mai'}>{english?'English criticism →':'मैथिली समालोचना →'}</a></p><p className="catalogue-verification">{english?'All entries below were checked against the source catalogues on 8 September 2026 unless an item says otherwise.':'नीचाँक सभ प्रविष्टि 8 सितम्बर 2026 केँ स्रोत-सूचीसँ जाँचल गेल; जतय स्थिति भिन्न अछि, ओहि ठाम अलग नोट देल अछि।'}</p><p id="search-guidance" className="search-guidance">{english?'Search Maithili titles, English names, or years in either numeral system (2009 / २००९).':'मैथिली शीर्षक, अंग्रेजी नाम वा दूनू अंक-पद्धतिमे वर्ष (2009 / २००९) सँ खोजू।'}</p><div className="catalogue-tools"><label htmlFor="work-search">{english?'Find a book':'पोथी ताकू'}<Input id="work-search" aria-describedby="search-guidance" type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder={english?'Title, author, year…':'शीर्षक, लेखक, वर्ष…'}/></label><div className="author-filters" role="group" aria-label={english?'Filter by writer':'रचनाकार चुनू'}>{[['all',english?'All':'सभ'],['preeti',english?'Preeti':'प्रीति'],['gajendra',english?'Gajendra':'गजेन्द्र'],['joint',english?'About both':'दुनूपर']].map(([value,label])=><Button key={value} variant="ghost" aria-pressed={author===value} onClick={()=>setAuthor(value)}>{label}</Button>)}</div></div>
 <div className="catalogue-refine"><label>{english?'Genre / role':'विधा / भूमिका'}<NativeSelect value={genre} onChange={e=>setGenre(e.target.value)}><NativeSelectOption value="all">{english?'All genres':'सभ विधा'}</NativeSelectOption>{categories.map(kind=><NativeSelectOption key={kind} value={kind}>{english?kind:works.find(w=>w.kindEn===kind)!.kind}</NativeSelectOption>)}</NativeSelect></label><label>{english?'Edition year':'संस्करण-वर्ष'}<NativeSelect value={year} onChange={e=>setYear(e.target.value)}><NativeSelectOption value="all">{english?'All years':'सभ वर्ष'}</NativeSelectOption>{years.map(y=><NativeSelectOption key={y} value={String(y)}>{y}</NativeSelectOption>)}<NativeSelectOption value="null">{english?'Year not recorded':'वर्ष नहि दर्ज'}</NativeSelectOption></NativeSelect></label><Button variant="outline" onClick={clear}>{english?'Reset filters':'फिल्टर हटाउ'}</Button></div>
 <div className="results-line"><span role="status" aria-live="polite">{filtered.length} / {works.length} {english?'works shown':'रचना देखाओल'}</span><span>{english?'All works visible by default':'सभ रचना आरम्भेसँ उपलब्ध'}</span></div><div className="work-grid">{filtered.map(w=>{const review=reviews[w.id];const extras=(w as typeof w&{alternates?:{label:string;url:string}[]}).alternates||[];const role=preetiRole(w,english);return <article id={'work-'+w.id} data-citation-title={english?w.titleEn:w.title} className={'work-card '+w.author} key={w.id}><div className="work-top"><span>{english?w.kindEn:w.kind}</span><span>{w.year||'—'}</span></div><div><p className="work-author">{english?w.nameEn:w.name}</p><h3><a href={english&&'urlEn' in w&&w.urlEn?w.urlEn:w.url}>{english?w.titleEn:w.title}<span className="work-arrow" aria-hidden="true">↗</span></a></h3><p className="destination-note" lang="en">{destination(w.url)} ↗</p><p className="edition-meta">{editionStatus(w,english)}</p>{role&&<p className="translation-meta">{role}</p>}</div><div className="work-bottom"><p>{descriptiveNote(w,english)}</p><a href={w.source}>{english?'Source':'स्रोत'} ↗</a></div><div className="work-reference-links"><a href={'#work-'+w.id} aria-label={(english?'Cite anchor for ':'उद्धरण-कड़ी: ')+(english?w.titleEn:w.title)}>{english?'Cite':'उद्धरण'} · #{w.id.toUpperCase()}</a>{review&&<a href={english?'/gajendra-preeti/criticism/en/'+review+'.html':'/gajendra-preeti/criticism/'+review+'.html'}>{english?'English criticism':'मैथिली समालोचना'} →</a>}{extras.map(a=><a href={a.url} key={a.url}>{a.label} ↗</a>)}</div></article>;})}</div>
 {!filtered.length&&<div className="no-results"><h3>{english?'No matching works.':'कोनो रचना नहि भेटल।'}</h3><Button onClick={clear}>{english?'Clear all filters':'सभ फिल्टर हटाउ'}</Button></div>}<p className="catalogue-note">{english?'This is a selected bibliography. Years describe editions, not necessarily first publication; all displayed years use 0–9. Preeti Thakur’s four children’s originals are original Maithili works authored by her; the twelve translated picture-books are English-to-Maithili translations by her. Select a work’s Cite anchor, then use the Cite control in Reading Tools for a ready-made citation.':'ई चुनल कृति-सूची अछि। वर्ष संस्करणक अछि, आवश्यक नहि जे प्रथम प्रकाशनक हो। प्रीति ठाकुरक चारि बाल-कृति मूल मैथिलीमे हुनक लिखल अछि; बारह बाल-चित्रपोथी English सँ मैथिलीमे हुनके अनूदित अछि। कृतिक “उद्धरण” कड़ी चुनि Reading Tools केर Cite नियंत्रणसँ तैयार उद्धरण लिअ।'} <a href="https://www.videha.co.in/pothi.htm">{english?'Full Videha catalogue':'पूर्ण विदेह पोथी-सूची'} ↗</a></p></div>;
}
