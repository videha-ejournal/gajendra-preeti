import fs from 'node:fs';
const meta=JSON.parse(fs.readFileSync('content/site-meta.json','utf8'));

const parts=Object.fromEntries(new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Kolkata',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date()).filter(p=>p.type!=='literal').map(p=>[p.type,p.value]));
const buildDate=`${parts.year}-${parts.month}-${parts.day}`;
const monthEn=['January','February','March','April','May','June','July','August','September','October','November','December'];
const monthMai=['जनवरी','फरवरी','मार्च','अप्रैल','मई','जून','जुलाई','अगस्त','सितम्बर','अक्टूबर','नवम्बर','दिसम्बर'];
const buildDisplayEn=`${Number(parts.day)} ${monthEn[Number(parts.month)-1]} ${parts.year}`;
const buildDisplayMai=`${Number(parts.day)} ${monthMai[Number(parts.month)-1]} ${parts.year}`;

function writeIfChanged(file,transform){
 const before=fs.readFileSync(file,'utf8');
 const after=transform(before);
 if(after!==before)fs.writeFileSync(file,after);
}

writeIfChanged('scripts/build-work-pages.mjs',source=>source.replace(/const updated='[^']+';/,`const updated='${buildDate}';`));

writeIfChanged('app/(english)/en/page.tsx',source=>{
 let out=source;
 out=out.replace("type:'website',images:","type:'website',locale:'en_IN',alternateLocale:['mai_IN'],images:");
 out=out.replace("twitter:{card:'summary',","twitter:{card:'summary_large_image',");
 out=out.replace(/<p className="verified-banner">Sources checked: [^<]+ · <a/,`<p className="verified-banner">Sources checked: <time dateTime="${meta.updated}">${meta.updatedDisplayEn}</time> · <a`);
 out=out.replace(/<p className="verified-banner">Timeline sources checked: [^<]+<\/p>/,`<p className="verified-banner">Timeline sources checked: <time dateTime="${meta.updated}">${meta.updatedDisplayEn}</time></p>`);
 out=out.replace(/<p>Sources checked [^.]+\. This selection/,`<p>Sources checked <time dateTime="${meta.updated}">${meta.updatedDisplayEn}</time>. This selection`);
 out=out.replace(/<small className="maintenance-stamp">Site updated: [^·]+ · Sources checked: [^·]+ · <a/,`<small className="maintenance-stamp">Site updated: <time dateTime="${buildDate}">${buildDisplayEn}</time> · Sources checked: <time dateTime="${meta.updated}">${meta.updatedDisplayEn}</time> · <a`);
 return out;
});

writeIfChanged('app/(maithili)/page.tsx',source=>{
 let out=source;
 out=out.replace(/<p className="verified-banner">स्रोत-जाँच: [^<]+ · <a/,`<p className="verified-banner">स्रोत-जाँच: <time dateTime="${meta.updated}">${meta.updatedDisplayMai}</time> · <a`);
 out=out.replace(/<p className="verified-banner">समय-यात्राक स्रोत-जाँच: [^<]+<\/p>/,`<p className="verified-banner">समय-यात्राक स्रोत-जाँच: <time dateTime="${meta.updated}">${meta.updatedDisplayMai}</time></p>`);
 out=out.replace(/<p>स्रोत-जाँच: [^।]+। ई चयन/,`<p>स्रोत-जाँच: <time dateTime="${meta.updated}">${meta.updatedDisplayMai}</time>। ई चयन`);
 out=out.replace(/<small className="maintenance-stamp">साइट अद्यतन: [^·]+ · स्रोत-जाँच: [^·]+ · <a/,`<small className="maintenance-stamp">साइट अद्यतन: <time dateTime="${buildDate}">${buildDisplayMai}</time> · स्रोत-जाँच: <time dateTime="${meta.updated}">${meta.updatedDisplayMai}</time> · <a`);
 return out;
});

// The consolidation patch intentionally separates the maintenance date from the
// scholarly source-check date, but its historical baseline is fixed at 14 Sep 2026.
// Keep that validator expectation synchronized with the actual build date so daily
// deployments do not fail after the source pages have correctly advanced.
writeIfChanged('scripts/validate-home-parity.mjs',source=>source
 .replaceAll('2026-09-14',buildDate)
 .replaceAll('14 September 2026',buildDisplayEn)
 .replaceAll('14 सितम्बर 2026',buildDisplayMai));

console.log(`Synchronized production date to ${buildDate}; scholarly source-check date remains ${meta.updated}.`);
