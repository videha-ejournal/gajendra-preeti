'use client';

import {useEffect,useState} from 'react';
import {Tabs,TabsList,TabsTrigger,TabsContent} from '@/components/ui/tabs';
import {Input} from '@/components/ui/input';
import {Button} from '@/components/ui/button';
import works from './works.json';
import CatalogueView from './catalogue-view';

const selections=[
  {id:'children',label:'बाल साहित्य',en:'For the curious reader',title:'चित्र, कथा आ कल्पना।',text:'प्रीति ठाकुरक चित्रकथा आ अनुवादसँ बाल साहित्यक संसारमे प्रवेश करू।',ids:['p0','p1','p13']},
  {id:'literature',label:'कथा आ पद्य',en:'For the literary explorer',title:'लघु कथासँ उपन्यास धरि।',text:'गजेन्द्र ठाकुरक कथात्मक आ काव्यात्मक लेखनक तीन प्रवेश-द्वार।',ids:['g0','g2','g4']},
  {id:'memory',label:'अभिलेख आ शोध',en:'For the archive explorer',title:'स्मृतिक पन्ना खोलू।',text:'पञ्जी-अभिलेख, साहित्यक इतिहास आ दूनू रचनाकार पर समालोचना पढ़ू।',ids:['p16','g6','j0']}
];

export function ReadingPaths(){return <Tabs defaultValue="children" className="reading-paths"><TabsList aria-label="पढ़बाक बाट चुनू" className="path-tabs">{selections.map(s=><TabsTrigger key={s.id} value={s.id}>{s.label}</TabsTrigger>)}</TabsList>{selections.map(s=><TabsContent key={s.id} value={s.id} className="path-panel"><div><p className="eyebrow" lang="en">{s.en}</p><h3>{s.title}</h3><p>{s.text}</p></div><ol>{s.ids.map((id,i)=>{const w=works.find(w=>w.id===id)!;return <li key={id}><span>0{i+1}</span><a href={w.url}>{w.title}<small>{w.name} <b aria-hidden="true">↗</b></small></a></li>})}</ol></TabsContent>)}</Tabs>}

export function Catalogue(){return <CatalogueView/>;}

export function ReadingProgress(){const[progress,setProgress]=useState(0);useEffect(()=>{let pending=false;const update=()=>{const max=document.documentElement.scrollHeight-window.innerHeight;setProgress(max>0?Math.min(100,window.scrollY/max*100):0);pending=false};const onScroll=()=>{if(!pending){pending=true;requestAnimationFrame(update)}};update();window.addEventListener('scroll',onScroll,{passive:true});window.addEventListener('resize',onScroll);return()=>{window.removeEventListener('scroll',onScroll);window.removeEventListener('resize',onScroll)}},[]);return <div className="reading-progress" aria-hidden="true" style={{transform:`scaleX(${progress/100})`}}/>}
