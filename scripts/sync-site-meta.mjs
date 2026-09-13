import fs from 'node:fs';
const meta=JSON.parse(fs.readFileSync('content/site-meta.json','utf8'));

function writeIfChanged(file,transform){
 const before=fs.readFileSync(file,'utf8');
 const after=transform(before);
 if(after!==before)fs.writeFileSync(file,after);
}

writeIfChanged('scripts/build-work-pages.mjs',source=>source.replace(/const updated='[^']+';/,`const updated='${meta.updated}';`));

writeIfChanged('app/(english)/en/page.tsx',source=>{
 let out=source;
 out=out.replace("type:'website',images:","type:'website',locale:'en_IN',alternateLocale:['mai_IN'],images:");
 out=out.replace("twitter:{card:'summary',","twitter:{card:'summary_large_image',");
 out=out.replace(/<p className="verified-banner">Sources checked: [^<]+ · <a/,`<p className="verified-banner">Sources checked: <time dateTime="${meta.updated}">${meta.updatedDisplayEn}</time> · <a`);
 out=out.replace(/<p className="verified-banner">Timeline sources checked: [^<]+<\/p>/,`<p className="verified-banner">Timeline sources checked: <time dateTime="${meta.updated}">${meta.updatedDisplayEn}</time></p>`);
 out=out.replace(/<p>Sources checked [^.]+\. This selection/,`<p>Sources checked <time dateTime="${meta.updated}">${meta.updatedDisplayEn}</time>. This selection`);
 out=out.replace(/<small className="maintenance-stamp">Site updated: [^·]+ · Sources checked: [^·]+ · <a/,`<small className="maintenance-stamp">Site updated: <time dateTime="${meta.updated}">${meta.updatedDisplayEn}</time> · Sources checked: <time dateTime="${meta.updated}">${meta.updatedDisplayEn}</time> · <a`);
 return out;
});

writeIfChanged('app/(maithili)/page.tsx',source=>{
 let out=source;
 out=out.replace(/<p className="verified-banner">स्रोत-जाँच: [^<]+ · <a/,`<p className="verified-banner">स्रोत-जाँच: <time dateTime="${meta.updated}">${meta.updatedDisplayMai}</time> · <a`);
 out=out.replace(/<p className="verified-banner">समय-यात्राक स्रोत-जाँच: [^<]+<\/p>/,`<p className="verified-banner">समय-यात्राक स्रोत-जाँच: <time dateTime="${meta.updated}">${meta.updatedDisplayMai}</time></p>`);
 out=out.replace(/<p>स्रोत-जाँच: [^।]+। ई चयन/,`<p>स्रोत-जाँच: <time dateTime="${meta.updated}">${meta.updatedDisplayMai}</time>। ई चयन`);
 out=out.replace(/<small className="maintenance-stamp">साइट अद्यतन: [^·]+ · स्रोत-जाँच: [^·]+ · <a/,`<small className="maintenance-stamp">साइट अद्यतन: <time dateTime="${meta.updated}">${meta.updatedDisplayMai}</time> · स्रोत-जाँच: <time dateTime="${meta.updated}">${meta.updatedDisplayMai}</time> · <a`);
 return out;
});

console.log(`Synchronized visible and generated metadata to ${meta.updated}.`);
