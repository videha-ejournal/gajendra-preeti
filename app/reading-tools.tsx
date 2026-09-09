'use client';
import {useEffect} from 'react';
export default function ReadingTools(){useEffect(()=>{if(document.querySelector('script[data-videha-tools]')){window.dispatchEvent(new Event('videha-tools-mount'));return;}const script=document.createElement('script');script.src='/gajendra-preeti/reading-tools.js';script.dataset.videhaTools='true';script.async=true;document.body.appendChild(script);},[]);return <div id="videha-reading-tools"/>;}
