const PROJECT='/gajendra-preeti';
const VERSION='20261031-isbn-tools2';
const CREDIT='(c) Gajendra Thakur, Editor, Videha, First Maithili Fortnightly eJournal';

/** Reuse the home-page controls on the two static ISBN catalogue pages. */
export function withIsbnPageShell(html){
 const lang=html.match(/<html\b[^>]*lang=["']([^"']+)["']/i)?.[1]||'en';
 const other=lang==='mai'?'en':'mai';
 const target=other==='en'?`${PROJECT}/en/isbn/`:`${PROJECT}/isbn/`;
 const label=other==='en'?'English edition':'मैथिली संस्करण';
 if(!new RegExp(`<a\\b[^>]*hreflang=["']${other}["']`,'i').test(html)){
  html=html.replace('</header>',`<nav aria-label="ISBN language editions"><a class="switch" href="${target}" hreflang="${other}">${label} →</a></nav></header>`);
 }
 const css=`<link rel="stylesheet" href="${PROJECT}/reading-tools.css?v=${VERSION}">`;
 if(!html.includes(`${PROJECT}/reading-tools.css?`))html=html.replace('</head>',`${css}</head>`);
 const credit=`<p data-videha-isbn-footer="true" data-videha-research-identity="true">${CREDIT} · <a href="https://www.videha.co.in/">https://www.videha.co.in/</a> &amp; <a href="https://videha-ejournal.github.io/videha/">https://videha-ejournal.github.io/videha/</a></p>`;
 if(!html.includes('data-videha-isbn-footer="true"'))html=html.replace('</footer>',`${credit}</footer>`);
 if(!html.includes('id="videha-reading-tools"')){
  const tools=`<div id="videha-reading-tools" aria-live="polite" data-maithili-url="${PROJECT}/isbn/" data-english-url="${PROJECT}/en/isbn/"></div><script src="${PROJECT}/reading-tools.js?v=${VERSION}" defer></script><script src="${PROJECT}/reading-tools-resilience.js?v=${VERSION}" defer></script>`;
  html=html.replace('</body>',`${tools}</body>`);
 }
 return html;
}
