import fs from 'node:fs';
const file='scripts/build-scholarly-bibliography.mjs';
const before=fs.readFileSync(file,'utf8');
const old="const year=yearFrom(raw,match),isbn=isbnFrom(raw),languages=inferLanguage(raw.title,raw.author);";
const next="const year=yearFrom(raw,match),isbn=match?.isbn||isbnFrom(raw),languages=inferLanguage(raw.title,raw.author);";
if(before.includes(next)){
 console.log('Scholarly bibliography already consumes atlas ISBN authority.');
 process.exit(0);
}
if(!before.includes(old)) throw new Error('Scholarly bibliography ISBN assignment anchor changed; refusing a silent patch.');
fs.writeFileSync(file,before.replace(old,next));
console.log('Scholarly bibliography source patched: app/works.json authority ISBNs take precedence.');
