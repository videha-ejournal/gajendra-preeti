import fs from 'node:fs';
import assert from 'node:assert/strict';

const sourcePath='content/reception-gists.json';
const authorityPath='content/translated-pdf-resources.json';
const source=JSON.parse(fs.readFileSync(sourcePath,'utf8'));
const authority=JSON.parse(fs.readFileSync(authorityPath,'utf8'));

for(const id of ['preeti-karan','setusham']){
  const book=(source.books||[]).find(x=>x.id===id);
  const verified=authority.reception?.[id];
  assert(book,`Missing reception book metadata: ${id}`);
  assert(verified,`Missing authoritative translated-resource metadata: ${id}`);
  assert.equal(verified.translator,'Gajendra Thakur',`${id}: verified English translator must be Gajendra Thakur`);
  assert.equal(verified.sourceEditor,'Ashish Anchinhar',`${id}: verified source editor must be Ashish Anchinhar`);
  book.translator=verified.translator;
  book.editor=verified.sourceEditor;
  if(id==='preeti-karan'){
    book.editionNote='The title page uses Ashish Anchinhar; signed contributions use Ashish Anchinhaar. Repository-verified paired-resource metadata credits the English translation to Gajendra Thakur. No publication year was identified in the supplied front matter.';
  }else if(id==='setusham'){
    book.editionNote='The title page spells the title Setushama; the running title uses Setusham. Repository-verified paired-resource metadata credits the Maithili original to editor Ashish Anchinhar and the English translation to Gajendra Thakur. No publication year was identified in the supplied front matter.';
  }
}

fs.writeFileSync(sourcePath,JSON.stringify(source,null,2)+'\n');
console.log('Critical-appreciation provenance source synchronized: Preeti Karan + Setusham editor/translator metadata now follows content/translated-pdf-resources.json.');
