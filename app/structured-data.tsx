import works from './works.json';
const base='https://videha-ejournal.github.io/gajendra-preeti/';
const bookKinds=new Set(['Children’s literature','Fiction','Drama','Poetry','Translation','Scripts']);
export default function StructuredData({english=false}:{english?:boolean}){
 const people=[{'@type':'Person','@id':base+'#preeti',name:'Preeti Thakur',alternateName:'प्रीति ठाकुर',url:base+'#preeti',image:base+'images/preeti-thakur.jpg',subjectOf:{'@type':'WebPage',url:'https://www.videha.co.in/ratna.htm'}},{'@type':'Person','@id':base+'#gajendra',name:'Gajendra Thakur',alternateName:'गजेन्द्र ठाकुर',url:base+'#gajendra',image:base+'images/gajendra-thakur.jpg',sameAs:['https://www.videha.co.in/gajendra-thakur-samagra.htm']}];
 const records=works.map(w=>{
  const person={'@id':base+'#'+w.author};
  const credit=w.author==='joint'?{about:people.map(p=>({'@id':p['@id']}))}:w.kindEn==='Translation'?{translator:person}:w.id==='p16'?{contributor:{'@type':'Role',roleName:'Compilation, scanning and cataloguing',contributor:person}}:w.id==='p15'?{contributor:{'@type':'Role',roleName:'Adaptation',contributor:person}}:{author:person};
  const isBook=bookKinds.has(w.kindEn);
  const translation=w.kindEn==='Translation'?{inLanguage:'mai',translationOfWork:{'@type':'Book',name:w.titleEn,inLanguage:'en'}}:{};
  return {'@type':isBook?'Book':'CreativeWork','@id':base+'#work-'+w.id,name:w.title,alternateName:w.titleEn,url:base+(english?'en/':'')+'#work-'+w.id,genre:w.kindEn,...credit,...(w.year?{datePublished:String(w.year)}:{}),...translation,encoding:{'@type':'MediaObject',contentUrl:w.url},isBasedOn:{'@type':'WebPage',url:w.source}};
 });
 const pageUrl=base+(english?'en/':'');
 const graph={'@context':'https://schema.org','@graph':[...people,...records,{'@type':'CollectionPage','@id':pageUrl,url:pageUrl,name:english?'Preeti Thakur & Gajendra Thakur — Videha Literary Atlas':'प्रीति ठाकुर आ गजेन्द्र ठाकुर',inLanguage:english?'en':'mai',dateModified:'2026-09-10',about:people.map(p=>({'@id':p['@id']})),mainEntity:{'@type':'ItemList',numberOfItems:records.length,itemListElement:records.map((r,i)=>({'@type':'ListItem',position:i+1,item:{'@id':r['@id']}}))}}]};
 return <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(graph).replace(/</g,'\\u003c')}}/>;
}
