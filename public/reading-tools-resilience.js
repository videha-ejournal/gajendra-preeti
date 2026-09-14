(() => {
  'use strict';
  const HOST_ID='videha-reading-tools';
  let scheduled=false;

  function requestMount(){
    if(scheduled)return;
    scheduled=true;
    queueMicrotask(()=>{
      scheduled=false;
      const host=document.getElementById(HOST_ID);
      if(!host||host.querySelector('.vt-bar'))return;
      delete host.dataset.mounted;
      window.dispatchEvent(new Event('videha-tools-mount'));
    });
  }

  function start(){
    requestMount();
    const observer=new MutationObserver(()=>requestMount());
    observer.observe(document.documentElement,{childList:true,subtree:true});
    [50,250,1000,2500].forEach(ms=>setTimeout(requestMount,ms));
    window.addEventListener('pageshow',requestMount);
    document.addEventListener('visibilitychange',()=>{if(!document.hidden)requestMount();});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
