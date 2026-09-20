'use client';

import {useEffect} from 'react';

let scriptsReady: Promise<void> | undefined;

function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => { script.remove(); reject(new Error(`Could not load ${src}`)); };
    document.body.appendChild(script);
  });
}

export default function ReadingTools(){
  useEffect(()=>{
    let active = true;
    // These scripts mutate the host and body. Start them only after hydration,
    // not from a parser-executed deferred script in the server HTML.
    scriptsReady ??= loadScript('/gajendra-preeti/reading-tools.js')
      .then(() => loadScript('/gajendra-preeti/reading-tools-resilience.js'))
      .catch((error: unknown) => { scriptsReady = undefined; throw error; });
    void scriptsReady.then(() => {
      if (active) window.dispatchEvent(new Event('videha-tools-mount'));
    }).catch((error: unknown) => console.error(error));
    return () => { active = false; };
  },[]);

  return <div id="videha-reading-tools" aria-live="polite" />;
}
