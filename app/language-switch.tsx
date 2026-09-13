'use client';
import {useEffect} from 'react';
export default function LanguageSwitch(){
 useEffect(()=>{
  const update=()=>{
   const hash=window.location.hash||'';
   document.querySelectorAll<HTMLAnchorElement>('a.language-link').forEach(a=>{
    const base=a.dataset.baseHref||a.getAttribute('href')||'';
    if(!a.dataset.baseHref)a.dataset.baseHref=base.split('#')[0];
    a.href=(a.dataset.baseHref||base.split('#')[0])+hash;
   });
  };
  update();
  window.addEventListener('hashchange',update);
  window.addEventListener('popstate',update);
  document.addEventListener('click',event=>{
   const link=(event.target as Element|null)?.closest?.('a.language-link') as HTMLAnchorElement|null;
   if(link)update();
  },true);
  return()=>{window.removeEventListener('hashchange',update);window.removeEventListener('popstate',update);};
 },[]);
 return null;
}
