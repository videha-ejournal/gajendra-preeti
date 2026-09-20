'use client';
import {useEffect,useMemo,useState} from 'react';
import {Input} from '@/components/ui/input';
import {Button} from '@/components/ui/button';
import {NativeSelect,NativeSelectOption} from '@/components/ui/native-select';
import works from './works.json';
import preetiChildren from '../content/preeti-children-provenance.json';
import gajendraTranslations from '../content/gajendra-maithili-translations-provenance.json';
import readings from '../public/criticism/manifest.json';
import reviewLinks from './review-links.json';
const reviews=reviewLinks as Record<string,string>;
const preetiOriginalIds=new Set(preetiChildren.originalMaithili.map(w=>w.id));
const preetiTranslationIds=new Set(preetiChildren.englishToMaithiliTranslations.map(w=>w.id));
const genreGroups=[
 {id:'children',en:'Children and young readers',mai:'बाल / किशोर साहित्य',kinds:['Children’s literature','Poetry for young readers','Stories for young readers','Illustrated fiction']},
 {id:'fiction',en:'Fiction and novels',mai:'कथा / उपन्यास',kinds:['Fiction','Novel','Crime fiction','Fiction / archive-memory novel']},
 {id:'poetry',en:'Poetry and ghazals',mai:'पद्य / गजल',kinds:['Poetry','Ghazals','Ghazals with musical forms']},
 {id:'translation',en:'Translation',mai:'अनुवाद',kinds:['Translation']},
 {id:'research',en:'Research, criticism and scripts',mai:'शोध / समालोचना / लिपि',kinds:['Research','Criticism','Scripts']},
 {id:'archive',en:'Archive and preservation',mai:'अभिलेख',kinds:['Archive']},
 {id:'drama',en:'Drama',mai:'नाटक',kinds:['Drama']}
];
const destinationGroups=[
 {id:'videha',en:'Videha digital edition',mai:'विदेह डिजिटल संस्करण'},
 {id:'drive',en:'Google Drive',mai:'Google Drive'},
 {id:'archive',en:'Archive.org PDF',mai:'Archive.org PDF'},
 {id:'googleplay',en:'Google Play Books',mai:'Google Play Books'},
 {id:'pothi',en:'Pothi print listing',mai:'Pothi प्रिन्ट सूची'},
 {id:'external',en:'Other external publication',mai:'आन बाहरी प्रकाशन'}
];
const sortOptions=[
 {id:'curated',en:'Curated order',mai:'सम्पादकीय क्रम'},
 {id:'title',en:'Title A–Z',mai:'शीर्षक क्रम'},
 {id:'year-desc',en:'Year: newest first',mai:'वर्ष: नवसँ पुरान'},
 {id:'year-asc',en:'Year: oldest first',mai:'वर्ष: पुरानसँ नव'}
];
const years=[...new Set(works.map(w=>w.year).filter(y=>y!==null).map(y=>Number(y)))].sort((a,b)=>a-b);
const normalize=(value:string)=>value.normalize('NFC').toLowerCase().replace(/[०-९]/g,d=>String('०१२३४५६७८९'.indexOf(d))).trim();
const slug=(w:(typeof works)[number])=>(w.titleEn||w.title).toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/&/g,' and ').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||w.id;
const workPage=(w:(typeof works)[number],english:boolean)=>`/gajendra-preeti/${english?'en/works':'works'}/${slug(w)}/`;
const authorLabels={all:['All','सभ'],preeti:['Preeti','प्रीति'],gajendra:['Gajendra','गजेन्द्र'],joint:['About both','दुनूपर']} as const;
const destinationKey=(url:string)=>{const host=new URL(url).hostname;return host.includes('drive.google')?'drive':host.includes('archive.org')?'archive':host.includes('store.pothi')?'pothi':host.includes('play.google')?'googleplay':host.includes('github.io')?'videha':'external';};
function destination(url:string){const key=destinationKey(url);return key==='drive'?'Google Drive':key==='archive'?'Archive.org · PDF':key==='pothi'?'Pothi · Print / purchase':key==='googleplay'?'Google Play Books':key==='videha'?'Videha · Digital edition':'External publication';}
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
type FilterState={query:string;author:string;genre:string;year:string;destinationFilter:string;sortMode:string};
const defaults:FilterState={query:'',author:'all',genre:'all',year:'all',destinationFilter:'all',sortMode:'curated'};
export default function CatalogueView({english=false}:{english?:boolean}){
 const[query,setQuery]=useState(''),[author,setAuthor]=useState('all'),[genre,setGenre]=useState('all'),[year,setYear]=useState('all'),[destinationFilter,setDestinationFilter]=useState('all'),[sortMode,setSortMode]=useState('curated'),[urlReady,setUrlReady]=useState(false);
 const state={query,author,genre,year,destinationFilter,sortMode};
 const applyState=(next:FilterState)=>{setQuery(next.query);setAuthor(next.author);setGenre(next.genre);setYear(next.year);setDestinationFilter(next.destinationFilter);setSortMode(next.sortMode);};
 const readUrl=():FilterState=>{const p=new URLSearchParams(location.search);return {query:p.get('q')||'',author:p.get('writer')||'all',genre:p.get('genre')||'all',year:p.get('year')||'all',destinationFilter:p.get('destination')||'all',sortMode:p.get('sort')||'curated'};};
 const urlFor=(next:FilterState)=>{const p=new URLSearchParams();if(next.query)p.set('q',next.query);if(next.author!=='all')p.set('writer',next.author);if(next.genre!=='all')p.set('genre',next.genre);if(next.year!=='all')p.set('year',next.year);if(next.destinationFilter!=='all')p.set('destination',next.destinationFilter);if(next.sortMode!=='curated')p.set('sort',next.sortMode);return location.pathname+(p.toString()?`?${p}`:'')+location.hash;};
 const pushFilters=(change:Partial<FilterState>)=>{const next={...state,...change};history.pushState(null,'',urlFor(next));applyState(next);};
 const clear=()=>pushFilters(defaults);
 useEffect(()=>{const sync=()=>{applyState(readUrl());setUrlReady(true);};sync();addEventListener('popstate',sync);return()=>removeEventListener('popstate',sync);},[]);
 useEffect(()=>{if(!urlReady)return;history.replaceState(null,'',urlFor({query,author,genre,year,destinationFilter,sortMode}));},[query,author,genre,year,destinationFilter,sortMode,urlReady]);
 useEffect(()=>{const reveal=()=>{if(location.hash.startsWith('#work-')){applyState(defaults);setTimeout(()=>document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView({block:'start'}),100);}};reveal();addEventListener('hashchange',reveal);return()=>removeEventListener('hashchange',reveal);},[]);
 const selectedGenre=genreGroups.find(g=>g.id===genre);
 const curatedIndex=useMemo(()=>new Map(works.map((w,i)=>[w.id,i])),[]);
 const filtered=useMemo(()=>{
  const rows=works.filter(w=>(author==='all'||w.author===author)&&(genre==='all'||selectedGenre?.kinds.includes(w.kindEn))&&(year==='all'||String(w.year)===year)&&(destinationFilter==='all'||destinationKey(w.url)===destinationFilter)&&normalize([w.title,w.name,w.titleEn,w.nameEn,w.kind,w.kindEn,w.year,w.keywords,w.note,w.noteEn].join(' ')).includes(normalize(query)));
  return [...rows].sort((a,b)=>{
   if(sortMode==='title')return (english?a.titleEn:a.title).localeCompare(english?b.titleEn:b.title,english?'en':'mai');
   if(sortMode==='year-desc')return (b.year??-Infinity)-(a.year??-Infinity)||((curatedIndex.get(a.id)??0)-(curatedIndex.get(b.id)??0));
   if(sortMode==='year-asc')return (a.year??Infinity)-(b.year??Infinity)||((curatedIndex.get(a.id)??0)-(curatedIndex.get(b.id)??0));
   return (curatedIndex.get(a.id)??0)-(curatedIndex.get(b.id)??0);
  });
 },[author,genre,year,destinationFilter,query,sortMode,english,selectedGenre,curatedIndex]);
 const preetiCount=preetiChildren.originalMaithili.length+preetiChildren.englishToMaithiliTranslations.length;
 return <div className="catalogue"><p className="catalogue-note">{english?`${works.length} selected works; the companion Reading Room covers ${readings.length} catalogue entries, including collected editions and digital resources. These are different units, not a complete count of published books.`:`${works.length} चुनल रचना; समालोचना-कक्षमे ${readings.length} सूची-प्रविष्टि अछि, जाहिमे संकलित संस्करण आ डिजिटल संसाधनो अछि। ई अलग-अलग गणना अछि, प्रकाशित पोथीक पूर्ण संख्या नहि।`} <a href={english?'/gajendra-preeti/criticism/en/':'/gajendra-preeti/criticism/'} lang={english?'en':'mai'}>{english?'English criticism →':'मैथिली समालोचना →'}</a></p><p className="catalogue-verification">{english?'All entries below were checked against the source catalogues on 13 September 2026 unless an item says otherwise.':'नीचाँक सभ प्रविष्टि 13 सितम्बर 2026 केँ स्रोत-सूचीसँ जाँचल गेल; जतय स्थिति भिन्न अछि, ओहि ठाम अलग नोट देल अछि।'}</p><div className="count-panel"><strong>{english?'What is counted?':'की गनल गेल अछि?'}</strong><span>{english?`${works.length} atlas selections · ${readings.length} Reading Room catalogue entries · ${preetiCount} Preeti children’s works · 37 Gajendra children’s/graphic novels · ${gajendraTranslations.items.length} Gajendra translation entries`:`${works.length} अटलस चयन · ${readings.length} पाठ-कक्ष सूची-प्रविष्टि · ${preetiCount} प्रीति बाल-कृति · 37 गजेन्द्र बाल/ग्राफिक उपन्यास · ${gajendraTranslations.items.length} गजेन्द्र अनुवाद-प्रविष्टि`}</span><small>{english?'These categories overlap and are not a total-books count.':'ई श्रेणीसभ आपसमे ओवरलैप करैत अछि; ई प्रकाशित पोथीक कुल गणना नहि।'}</small></div><p id="search-guidance" className="search-guidance">{english?'Search Maithili titles, English names, or years in either numeral system (2009 / २००९). Filters and sorting are reflected in the URL, so this view can be bookmarked or shared.':'मैथिली शीर्षक, अंग्रेजी नाम वा दूनू अंक-पद्धतिमे वर्ष (2009 / २००९) सँ खोजू। फिल्टर आ क्रम URL मे रहैत अछि, तेँ एहि दृश्यकेँ बुकमार्क वा साझा कएल जा सकैत अछि।'}</p><div className="catalogue-tools"><label htmlFor="work-search">{english?'Find a book':'पोथी ताकू'}<Input id="work-search" aria-describedby="search-guidance" type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder={english?'Title, author, year…':'शीर्षक, लेखक, वर्ष…'}/></label><div className="author-filters" role="group" aria-label={english?'Filter by writer':'रचनाकार चुनू'}>{Object.entries(authorLabels).map(([value,labels])=><Button key={value} variant="ghost" aria-pressed={author===value} onClick={()=>pushFilters({author:value})}>{english?labels[0]:labels[1]}</Button>)}</div></div>
 <div className="catalogue-refine"><label>{english?'Genre / role':'विधा / भूमिका'}<NativeSelect value={genre} onChange={e=>pushFilters({genre:e.target.value})}><NativeSelectOption value="all">{english?'All genres':'सभ विधा'}</NativeSelectOption>{genreGroups.map(g=><NativeSelectOption key={g.id} value={g.id}>{english?g.en:g.mai}</NativeSelectOption>)}</NativeSelect></label><label>{english?'Edition year':'संस्करण-वर्ष'}<NativeSelect value={year} onChange={e=>pushFilters({year:e.target.value})}><NativeSelectOption value="all">{english?'All years':'सभ वर्ष'}</NativeSelectOption>{years.map(y=><NativeSelectOption key={y} value={String(y)}>{y}</NativeSelectOption>)}<NativeSelectOption value="null">{english?'Year not recorded':'वर्ष नहि दर्ज'}</NativeSelectOption></NativeSelect></label><label>{english?'Destination':'गन्तव्य'}<NativeSelect value={destinationFilter} onChange={e=>pushFilters({destinationFilter:e.target.value})}><NativeSelectOption value="all">{english?'All destinations':'सभ गन्तव्य'}</NativeSelectOption>{destinationGroups.map(d=><NativeSelectOption key={d.id} value={d.id}>{english?d.en:d.mai}</NativeSelectOption>)}</NativeSelect></label><label>{english?'Sort':'क्रम'}<NativeSelect value={sortMode} onChange={e=>pushFilters({sortMode:e.target.value})}>{sortOptions.map(s=><NativeSelectOption key={s.id} value={s.id}>{english?s.en:s.mai}</NativeSelectOption>)}</NativeSelect></label><Button variant="outline" onClick={clear}>{english?'Reset filters':'फिल्टर हटाउ'}</Button></div>
 <div className="results-line"><span role="status" aria-live="polite">{filtered.length} / {works.length} {english?'works shown':'रचना देखाओल'}</span><span>{english?'All works visible by default':'सभ रचना आरम्भेसँ उपलब्ध'}</span></div><div className="work-grid">{filtered.map(w=>{const review=reviews[w.id];const extras=(w as typeof w&{alternates?:{label:string;url:string}[]}).alternates||[];const role=preetiRole(w,english);const readingUrl=english&&'urlEn' in w&&w.urlEn?w.urlEn:w.url;return <article id={'work-'+w.id} data-citation-title={english?w.titleEn:w.title} className={'work-card '+w.author} key={w.id}><div className="work-top"><span>{english?w.kindEn:w.kind}</span><span>{w.year||'—'}</span></div><div><p className="work-author">{english?w.nameEn:w.name}</p><h3><a href={workPage(w,english)}>{english?w.titleEn:w.title}<span className="work-arrow" aria-hidden="true">→</span></a></h3><p className="destination-note" lang="en">{destination(w.url)}</p><p className="edition-meta">{editionStatus(w,english)}</p>{role&&<p className="translation-meta">{role}</p>}</div><div className="work-bottom"><p>{descriptiveNote(w,english)}</p></div><div className="work-actions"><a href={readingUrl}>{english?'READ':'पढ़ू'} ↗</a>{review&&<a href={english?'/gajendra-preeti/criticism/en/'+review+'.html':'/gajendra-preeti/criticism/'+review+'.html'}>{english?'CRITICISM':'समालोचना'} →</a>}<a href={w.source}>{english?'SOURCE':'स्रोत'} ↗</a></div><div className="work-reference-links"><a href={'#work-'+w.id} aria-label={(english?'Cite anchor for ':'उद्धरण-कड़ी: ')+(english?w.titleEn:w.title)}>{english?'CITE':'उद्धरण'} · #{w.id.toUpperCase()}</a>{extras.map(a=><a href={a.url} key={a.url}>{a.label} ↗</a>)}</div></article>;})}</div>
 {!filtered.length&&<div className="no-results"><h3>{english?'No matching works.':'कोनो रचना नहि भेटल।'}</h3><Button onClick={clear}>{english?'Clear all filters':'सभ फिल्टर हटाउ'}</Button></div>}<p className="catalogue-note">{english?'This is a selected bibliography. Years describe editions, not necessarily first publication; all displayed years use 0–9. Preeti Thakur’s four children’s originals are original Maithili works authored by her; the twelve translated picture-books are English-to-Maithili translations by her. Select a work’s Cite anchor, then use the fixed bottom Reading Tools bar’s Cite control for a ready-made citation.':'ई चुनल कृति-सूची अछि। वर्ष संस्करणक अछि, आवश्यक नहि जे प्रथम प्रकाशनक हो। प्रीति ठाकुरक चारि बाल-कृति मूल मैथिलीमे हुनक लिखल अछि; बारह बाल-चित्रपोथी English सँ मैथिलीमे हुनके अनूदित अछि। कृतिक “उद्धरण” कड़ी चुनि नीचाँ स्थिर Reading Tools पट्टीक “उद्धरण · Cite” नियंत्रणसँ तैयार उद्धरण लिअ।'} <a href="https://www.videha.co.in/pothi.htm">{english?'Full Videha catalogue':'पूर्ण विदेह पोथी-सूची'} ↗</a></p></div>;
}
