import {SITE_UPDATED,SITE_UPDATED_DISPLAY,SITE_UPDATED_DISPLAY_MAI} from './site-meta';

export default function SiteEnhancements({lang}:{lang:'mai'|'en'}){
 const en=lang==='en';
 const base=en?'/gajendra-preeti/en/':'/gajendra-preeti/';
 const criticism=en?'/gajendra-preeti/criticism/en/':'/gajendra-preeti/criticism/';
 const reception=en?'/gajendra-preeti/criticism/reception/en/':'/gajendra-preeti/criticism/reception/';
 return <div className="atlas-utility-shell">
  <nav className="atlas-section-nav" aria-label={en?'Quick section navigation':'त्वरित खण्ड नेविगेशन'}>
   <a href="#writers">{en?'Writers':'रचनाकार'}</a>
   <a href="#archive">{en?'Works':'रचना'}</a>
   <a href="#journey">{en?'Timeline':'समय-यात्रा'}</a>
   <a href={criticism}>{en?'Criticism':'समालोचना'}</a>
   <a href="#sources">{en?'Sources':'स्रोत'}</a>
   <a href="#top" aria-label={en?'Back to top':'ऊपर जाउ'}>↑</a>
  </nav>
  <details className="research-gateway">
   <summary>{en?'For researchers':'शोधार्थी लेल'}</summary>
   <div className="research-gateway-panel">
    <p>{en?'Direct routes into the atlas’s bibliography, criticism, contributors, manuscript sources and citation tools.':'अटलसक ग्रन्थ-सूची, समालोचना, योगदानकर्ता, पाण्डुलिपि-स्रोत आ उद्धरण औजारक सीधा बाट।'}</p>
    <nav aria-label={en?'Research resources':'शोध संसाधन'}>
     <a href="#archive">{en?'Bibliography':'ग्रन्थ-सूची'}</a>
     <a href={criticism}>{en?'Criticism':'समालोचना'}</a>
     <a href={reception}>{en?'Contributors':'योगदानकर्ता'}</a>
     <a href="https://www.videha.co.in/pothi.htm">{en?'Manuscripts & books ↗':'पाण्डुलिपि आ पोथी ↗'}</a>
     <a href="#sources">{en?'Sources & method':'स्रोत आ पद्धति'}</a>
     <a href="#archive">{en?'Citation anchors':'उद्धरण-कड़ी'}</a>
    </nav>
    <small>{en?'Sources checked ':'स्रोत-जाँच: '}<time dateTime={SITE_UPDATED}>{en?SITE_UPDATED_DISPLAY:SITE_UPDATED_DISPLAY_MAI}</time></small>
   </div>
  </details>
 </div>;
}
