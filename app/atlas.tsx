'use client';

import {useEffect,useState} from 'react';
import {Tabs,TabsList,TabsTrigger,TabsContent} from '@/components/ui/tabs';
import {Input} from '@/components/ui/input';
import {Button} from '@/components/ui/button';
import works from './works.json';
import CatalogueView from './catalogue-view';

type ReadingPath={id:string;label:string;en:string;title:string;text:string;ids:string[];href?:string;linkTitle?:string;linkMeta?:string};
const selections:ReadingPath[]=[
  {id:'children',label:'बाल साहित्य',en:'For the curious reader',title:'चित्र, कथा आ कल्पना।',text:'प्रीति ठाकुरक चित्रकथा आ अनुवादसँ बाल साहित्यक संसारमे प्रवेश करू।',ids:['p0','p1','p13']},
  {id:'literature',label:'कथा आ पद्य',en:'For the literary explorer',title:'लघु कथासँ उपन्यास धरि।',text:'गजेन्द्र ठाकुरक कथात्मक आ काव्यात्मक लेखनक तीन प्रवेश-द्वार।',ids:['g0','g2','g4']},
  {id:'dreams',label:'स्वप्नमे मिज्झर होइत',en:'WHEN DREAMS MERGE · BOOK GUIDE',title:'स्वप्नसँ भाषा, दर्शन आ न्याय धरि।',text:'सम्पूर्ण 2026 संशोधित अंग्रेजी संस्करणक 447 विषय-सूची प्रविष्टिक स्रोत-आधारित सारांश।',ids:[],href:'/gajendra-preeti/when-dreams-merge/',linkTitle:'WHEN DREAMS MERGE',linkMeta:'819 PDF पृष्ठ · 447 सारांश प्रविष्टि · 8 मुख्य खण्ड'},
  {id:'water',label:'गोहि सभक बीच जलसमाधि',en:'WATER-BURIAL AMONG THE CROCODILES · BOOK GUIDE',title:'नाम, जल, स्मृति आ न्याय केर 301-अध्याय यात्रा।',text:'सम्पूर्ण 2026 एकल-खंड अंग्रेजी संस्करण: अध्याय -100 सँ 200 धरि स्रोत-आधारित अध्याय-सार, कथा-चक्र आ विषय-पथ।',ids:[],href:'/gajendra-preeti/water-burial-among-the-crocodiles/',linkTitle:'WATER-BURIAL AMONG THE CROCODILES',linkMeta:'301 अध्याय · 3 मुख्य भाग · 19 कथात्मक चक्र'},
  {id:'parallel',label:'समानान्तर दर्शन',en:'PARALLEL PHILOSOPHY · BILINGUAL GUIDE',title:'172 अध्यायक मैथिली–अंग्रेजी दार्शनिक यात्रा।',text:'खण्ड 1 केर 72 आ खण्ड 2 केर 100 अध्याय—सभक स्रोत-आधारित द्विभाषी सार आ अध्याय-पथ।',ids:[],href:'/gajendra-preeti/parallel-philosophy/',linkTitle:'गजेन्द्र ठाकुरक समानान्तर दर्शन · PARALLEL PHILOSOPHY',linkMeta:'172 अध्याय · 2 खण्ड · 23 विषय-खण्ड · मैथिली + English'},
  {id:'history',label:'समानान्तर इतिहास',en:'PARALLEL HISTORY · BILINGUAL GUIDE',title:'178 अध्यायक मिथिला–वज्जि–अंग इतिहास यात्रा।',text:'सामान्य-राजनीतिक इतिहासक 28 आ सामाजिक-सांस्कृतिक-आर्थिक इतिहासक 150 अध्याय—सभक स्रोत-आधारित मैथिली–अंग्रेजी सार आ अध्याय-रूपरेखा।',ids:[],href:'/gajendra-preeti/parallel-history/',linkTitle:'मिथिला, वज्जि आ अंगक समानान्तर इतिहास · PARALLEL HISTORY',linkMeta:'178 अध्याय · 2 पोथी · 20 स्रोत-खण्ड · मैथिली + English'},
  {id:'memory',label:'अभिलेख आ शोध',en:'For the archive explorer',title:'स्मृतिक पन्ना खोलू।',text:'पञ्जी-अभिलेख, साहित्यक इतिहास आ दूनू रचनाकार पर समालोचना पढ़ू।',ids:['p16','g6','j0']}
];

export function ReadingPaths(){return <Tabs defaultValue="children" className="reading-paths"><TabsList aria-label="पढ़बाक बाट चुनू" className="path-tabs">{selections.map(s=><TabsTrigger key={s.id} value={s.id}>{s.label}</TabsTrigger>)}</TabsList>{selections.map(s=><TabsContent key={s.id} value={s.id} className="path-panel"><div><p className="eyebrow" lang="en">{s.en}</p><h3>{s.title}</h3><p>{s.text}</p></div><ol>{s.href?<li><span>01</span><a href={s.href}>{s.linkTitle}<small>{s.linkMeta} <b aria-hidden="true">→</b></small></a></li>:s.ids.map((id,i)=>{const w=works.find(w=>w.id===id)!;return <li key={id}><span>0{i+1}</span><a href={w.url}>{w.title}<small>{w.name} <b aria-hidden="true">↗</b></small></a></li>})}</ol></TabsContent>)}</Tabs>}

export function Catalogue(){return <CatalogueView/>;}

export function ReadingProgress(){const[progress,setProgress]=useState(0);useEffect(()=>{let pending=false;const update=()=>{const max=document.documentElement.scrollHeight-window.innerHeight;setProgress(max>0?Math.min(100,window.scrollY/max*100):0);pending=false};const onScroll=()=>{if(!pending){pending=true;requestAnimationFrame(update)}};update();window.addEventListener('scroll',onScroll,{passive:true});window.addEventListener('resize',onScroll);return()=>{window.removeEventListener('scroll',onScroll);window.removeEventListener('resize',onScroll)}},[]);return <div className="reading-progress" aria-hidden="true" style={{transform:`scaleX(${progress/100})`}}/>}
