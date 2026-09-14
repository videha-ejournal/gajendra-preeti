'use client';

import {useEffect} from 'react';

export default function ReadingTools(){
  useEffect(()=>{
    const kick=()=>window.dispatchEvent(new Event('videha-tools-mount'));
    kick();
    const timers=[50,250,1000].map(ms=>window.setTimeout(kick,ms));
    return ()=>timers.forEach(id=>window.clearTimeout(id));
  },[]);

  return <>
    <div id="videha-reading-tools" aria-live="polite" suppressHydrationWarning />
    <script src="/gajendra-preeti/reading-tools.js" defer data-videha-tools="true"></script>
    <script src="/gajendra-preeti/reading-tools-resilience.js" defer data-videha-tools-resilience="true"></script>
  </>;
}
