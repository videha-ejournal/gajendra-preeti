'use client';

import {useEffect,useState} from 'react';
import {Tabs,TabsList,TabsTrigger,TabsContent} from '@/components/ui/tabs';
import {Input} from '@/components/ui/input';
import {Button} from '@/components/ui/button';
import works from './works.json';
import CatalogueView from './catalogue-view';

type ReadingPath={id:string;label:string;en:string;title:string;text:string;ids:string[];href?:string;linkTitle?:string;linkMeta?:string};
const selections:ReadingPath[]=[
  {id:'children',label:'Children’s books',en:'For the curious reader',title:'Pictures, stories, imagination.',text:'Enter children’s literature through Preeti Thakur’s picture stories and translations.',ids:['p0','p1','p13']},
  {id:'literature',label:'Fiction and poetry',en:'For the literary explorer',title:'From short fiction to the novel.',text:'Three starting points in Gajendra Thakur’s fiction and poetry.',ids:['g0','g2','g4']},
  {id:'dreams',label:'When Dreams Merge',en:'COMPLETE BOOK GUIDE',title:'From dream to language, philosophy and justice.',text:'Explore source-grounded summaries for all 447 contents entries in the complete 2026 revised English volume.',ids:[],href:'/gajendra-preeti/when-dreams-merge/',linkTitle:'WHEN DREAMS MERGE',linkMeta:'819 PDF pages · 447 summary entries · 8 main sections'},
  {id:'water',label:'Water-Burial Among the Crocodiles',en:'COMPLETE NOVEL GUIDE',title:'Names, water, memory and justice across 301 chapters.',text:'Explore source-grounded chapter summaries from Chapter -100 through Chapter 200 in the complete 2026 single-volume English edition.',ids:[],href:'/gajendra-preeti/water-burial-among-the-crocodiles/',linkTitle:'WATER-BURIAL AMONG THE CROCODILES',linkMeta:'301 chapters · 3 principal parts · 19 narrative arcs'},
  {id:'memory',label:'Archives and research',en:'For the archive explorer',title:'Open the pages of memory.',text:'Explore the Panji archive, literary history and critical writing about both authors.',ids:['p16','g6','j0']}
];

export function ReadingPaths(){return <Tabs defaultValue="children" className="reading-paths"><TabsList aria-label="Choose a reading path" className="path-tabs">{selections.map(s=><TabsTrigger key={s.id} value={s.id}>{s.label}</TabsTrigger>)}</TabsList>{selections.map(s=><TabsContent key={s.id} value={s.id} className="path-panel"><div><p className="eyebrow" lang="en">{s.en}</p><h3>{s.title}</h3><p>{s.text}</p></div><ol>{s.href?<li><span>01</span><a href={s.href}>{s.linkTitle}<small>{s.linkMeta} <b aria-hidden="true">→</b></small></a></li>:s.ids.map((id,i)=>{const w=works.find(w=>w.id===id)!;return <li key={id}><span>0{i+1}</span><a href={w.url}>{w.titleEn}<small>{w.nameEn} <b aria-hidden="true">↗</b></small></a></li>})}</ol></TabsContent>)}</Tabs>}

export function Catalogue(){return <CatalogueView english/>;}

export function ReadingProgress(){const[progress,setProgress]=useState(0);useEffect(()=>{let pending=false;const update=()=>{const max=document.documentElement.scrollHeight-window.innerHeight;setProgress(max>0?Math.min(100,window.scrollY/max*100):0);pending=false};const onScroll=()=>{if(!pending){pending=true;requestAnimationFrame(update)}};update();window.addEventListener('scroll',onScroll,{passive:true});window.addEventListener('resize',onScroll);return()=>{window.removeEventListener('scroll',onScroll);window.removeEventListener('resize',onScroll)}},[]);return <div className="reading-progress" aria-hidden="true" style={{transform:`scaleX(${progress/100})`}}/>}
