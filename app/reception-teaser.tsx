import reception from '../content/reception-gists.json';
const count=reception.articles.filter(a=>a.kind==='contribution').length;
export function ReceptionTeaser({lang}:{lang:'mai'|'en'}) {
 const en=lang==='en';
 const href=en?'/gajendra-preeti/criticism/reception/en/':'/gajendra-preeti/criticism/reception/';
 return <aside className="reception-teaser" aria-label={en?'Gists from two edited books':'दू सम्पादित पोथीक लेख-सार'}>
  <div><p className="eyebrow" lang={en?'en':'mai'}>{en?'CONTRIBUTORS’ PERSPECTIVES':'योगदानकर्तासभक दृष्टि'}</p><strong>{count}</strong><span>{en?'attributed article gists':'सन्दर्भ सहित लेख-सार'}</span></div>
  <div><h3>{en?'Many voices. Two volumes.':'अनेक स्वर। दू पोथी।'}</h3><p>{en?'Reviews, interviews and memories from Preeti Karan Setu Banhal and Setusham, edited by Ashish Anchinhar. Every contribution has an English gist with author, book and page references.':'आशीष अनचिन्हार सम्पादित “प्रीति कारण सेतु बान्हल” आ “सेतुशम”सँ समीक्षा, साक्षात्कार आ संस्मरण। प्रत्येक योगदानक मैथिली सार लेखक, पोथी आ पृष्ठ-सन्दर्भसहित उपलब्ध अछि।'}</p><a href={href}>{en?'Read the contributors’ perspectives →':'योगदानकर्तासभक दृष्टि पढ़ू →'}</a></div>
 </aside>;
}
