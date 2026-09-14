import fs from 'node:fs';

const file='scripts/build-scholarly-bibliography.mjs';
let source=fs.readFileSync(file,'utf8');

const helperMarker='function authoritativeIsbnFor(title)';
if(!source.includes(helperMarker)){
 const anchor="function isbnFrom(rec){const all=[rec.title,...rec.links.flat()].join(' ');const m=all.match(/97[89][-\\d ]{10,20}/);return m?m[0].replace(/[^\\dXx]/g,''):null;}";
 if(!source.includes(anchor)) throw new Error('Scholarly bibliography ISBN helper anchor changed; refusing a silent patch.');
 const helper=`${anchor}\nconst isbnAuthority=JSON.parse(fs.readFileSync('public/isbn/isbn-authority-293.json','utf8'));\nconst authoritativeExact=new Map();\nconst authoritativeStrongAliases=[];\nfunction addExact(value,isbn){\n const key=norm(value);if(!key)return;\n const prior=authoritativeExact.get(key);\n if(prior&&prior!==isbn)authoritativeExact.set(key,null);else if(prior!==null)authoritativeExact.set(key,isbn);\n}\nfunction addStrongAlias(value,isbn){const key=norm(value);if(key.length>=8)authoritativeStrongAliases.push({key,isbn});}\nfor(const record of isbnAuthority.records||[]){\n addExact(record.title,record.isbn);\n addExact(record.sourceTitle,record.isbn);\n for(const alias of record.editorOverride?.aliases||[])addStrongAlias(alias,record.isbn);\n}\nfor(const rule of isbnAuthority.identityOverrides||[]){\n addStrongAlias(rule.canonicalLabel,rule.canonicalIsbn);\n for(const alias of rule.sameWorkAliases||[])addStrongAlias(alias,rule.canonicalIsbn);\n}\nfor(const rule of isbnAuthority.recordOverrides||[]){\n addStrongAlias(rule.canonicalTitle,rule.isbn);\n for(const alias of rule.aliases||[])addStrongAlias(alias,rule.isbn);\n}\nfunction authoritativeIsbnFor(title){\n const key=norm(title);\n const exact=authoritativeExact.get(key);if(exact)return exact;\n const hits=new Set(authoritativeStrongAliases.filter(x=>key.includes(x.key)).map(x=>x.isbn));\n return hits.size===1?[...hits][0]:null;\n}`;
 source=source.replace(anchor,helper);
}

const old="const year=yearFrom(raw,match),isbn=isbnFrom(raw),languages=inferLanguage(raw.title,raw.author);";
const oldAtlas="const year=yearFrom(raw,match),isbn=match?.isbn||isbnFrom(raw),languages=inferLanguage(raw.title,raw.author);";
const next="const year=yearFrom(raw,match),isbn=authoritativeIsbnFor(raw.title)||match?.isbn||isbnFrom(raw),languages=inferLanguage(raw.title,raw.author);";
if(source.includes(old)) source=source.replace(old,next);
else if(source.includes(oldAtlas)) source=source.replace(oldAtlas,next);
else if(!source.includes(next)) throw new Error('Scholarly bibliography ISBN assignment anchor changed; refusing a silent patch.');

fs.writeFileSync(file,source);
console.log('Scholarly bibliography source patched: authoritative ISBN registry/editor aliases take precedence; publisher data is not consumed.');
