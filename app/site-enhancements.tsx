/* oxlint-disable next/no-html-link-for-pages, next/no-img-element -- Static GitHub Pages routes need full document navigation; images use the preserved local assets. */
import {SITE_UPDATED,SITE_UPDATED_DISPLAY,SITE_UPDATED_DISPLAY_MAI} from './site-meta';

export default function SiteEnhancements({lang}:{lang:'mai'|'en'}){
 const en=lang==='en';
 const criticism=en?'/gajendra-preeti/criticism/en/':'/gajendra-preeti/criticism/';
 const reception=en?'/gajendra-preeti/criticism/reception/en/':'/gajendra-preeti/criticism/reception/';
 const bibliography=en?'/gajendra-preeti/en/bibliography/':'/gajendra-preeti/bibliography/';
 const authority=en?'/gajendra-preeti/en/author/gajendra-thakur/':'/gajendra-preeti/author/gajendra-thakur/';
 return <div className="atlas-utility-shell">
  <nav className="atlas-section-nav" aria-label={en?'Quick section navigation':'त्वरित खण्ड नेविगेशन'}>
   <a href="#writers">{en?'Writers':'रचनाकार'}</a>
   <a href="#archive">{en?'Selected works':'चुनल रचना'}</a>
   <a href={bibliography}>{en?'Complete bibliography':'पूर्ण ग्रन्थ-सूची'}</a>
   <a href="#journey">{en?'Timeline':'समय-यात्रा'}</a>
   <a href={criticism}>{en?'Criticism':'समालोचना'}</a>
   <a href="#sources">{en?'Sources':'स्रोत'}</a>
   <a href="#top" aria-label={en?'Back to top':'ऊपर जाउ'}>↑</a>
  </nav>
  <details className="research-gateway">
   <summary>{en?'For researchers':'शोधार्थी लेल'}</summary>
   <div className="research-gateway-panel">
    <p>{en?'Direct routes into the complete synchronized bibliography, criticism, contributors, authority record, manuscript sources and citation exports.':'पूर्ण समकालित ग्रन्थ-सूची, समालोचना, योगदानकर्ता, लेखक-प्रामाणिकता, पाण्डुलिपि-स्रोत आ उद्धरण-निर्यातक सीधा बाट।'}</p>
    <nav aria-label={en?'Research resources':'शोध संसाधन'}>
     <a href={bibliography}>{en?'Complete bibliography':'पूर्ण ग्रन्थ-सूची'}</a>
     <a href={`${bibliography}#cite`}>{en?'Preferred citation':'अनुशंसित उद्धरण'}</a>
     <a href="/gajendra-preeti/bibliography/export.bib">BibTeX</a>
     <a href="/gajendra-preeti/bibliography/export.ris">RIS</a>
     <a href="/gajendra-preeti/bibliography/export.json">CSL-JSON</a>
     <a href={authority}>{en?'Gajendra Thakur authority record':'गजेन्द्र ठाकुर प्रामाणिकता अभिलेख'}</a>
     <a href={criticism}>{en?'Criticism':'समालोचना'}</a>
     <a href={reception}>{en?'Contributors':'योगदानकर्ता'}</a>
     <a href="https://videha-ejournal.github.io/videha/gajendra-thakur-samagra.htm#main-resources">00 {en?'Mukhya Samagra source ↗':'मुख्य समग्र स्रोत ↗'}</a>
     <a href="https://www.videha.co.in/pothi.htm">{en?'Manuscripts & books ↗':'पाण्डुलिपि आ पोथी ↗'}</a>
     <a href="#sources">{en?'Sources & method':'स्रोत आ पद्धति'}</a>
    </nav>
    <small>{en?'Sources checked ':'स्रोत-जाँच: '}<time dateTime={SITE_UPDATED}>{en?SITE_UPDATED_DISPLAY:SITE_UPDATED_DISPLAY_MAI}</time></small>
   </div>
  </details>
 </div>;
}
