import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const routes=[
 'public/when-dreams-merge/index.html',
 'public/when-dreams-merge/en/index.html',
 'public/water-burial-among-the-crocodiles/index.html',
 'public/water-burial-among-the-crocodiles/en/index.html',
 'public/media-learning/index.html',
 'public/media-learning/en/index.html'
];
const image='https://videha-ejournal.github.io/gajendra-preeti/images/gajendra-thakur.jpg';

for(const file of routes){
 assert(fs.existsSync(file),`Generated route missing before metadata polish: ${file}`);
 let html=fs.readFileSync(file,'utf8');
 const title=html.match(/<title>([\s\S]*?)<\/title>/i)?.[1];
 const desc=html.match(/<meta name="description" content="([^"]*)"/i)?.[1];
 const canonical=html.match(/<link rel="canonical" href="([^"]+)"/i)?.[1];
 assert(title&&desc&&canonical,`${file}: title, description and canonical required before social metadata polish`);
 const tags=[];
 if(!/property="og:title"/i.test(html)) tags.push(`<meta property="og:title" content="${title}">`);
 if(!/property="og:description"/i.test(html)) tags.push(`<meta property="og:description" content="${desc}">`);
 if(!/property="og:type"/i.test(html)) tags.push('<meta property="og:type" content="website">');
 if(!/property="og:url"/i.test(html)) tags.push(`<meta property="og:url" content="${canonical}">`);
 if(!/property="og:image"/i.test(html)) tags.push(`<meta property="og:image" content="${image}">`);
 if(!/name="twitter:card"/i.test(html)) tags.push('<meta name="twitter:card" content="summary">');
 if(!/name="twitter:title"/i.test(html)) tags.push(`<meta name="twitter:title" content="${title}">`);
 if(!/name="twitter:description"/i.test(html)) tags.push(`<meta name="twitter:description" content="${desc}">`);
 if(!/name="twitter:image"/i.test(html)) tags.push(`<meta name="twitter:image" content="${image}">`);
 if(tags.length) html=html.replace('</head>',tags.join('')+'</head>');
 // Remove an unattractive fallback emitted when older arc data lacks a stored count.
 html=html.replaceAll('<span>undefined अध्याय</span>','');
 fs.writeFileSync(file,html,'utf8');
 assert(/property="og:title"/i.test(html),`${file}: og:title missing after polish`);
 assert(/name="twitter:card"/i.test(html),`${file}: twitter:card missing after polish`);
}
console.log('Polished social metadata for six generated bilingual guide/media routes.');
