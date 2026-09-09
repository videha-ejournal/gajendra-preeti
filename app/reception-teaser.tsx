import reception from '../content/reception-gists.json';
const count=reception.articles.filter(a=>a.kind==='contribution').length;
export function ReceptionTeaser({lang}:{lang:'mai'|'en'}) {
 const en=lang==='en';
 return <aside className="reception-teaser" aria-label={en?'Gists from two edited books':'दू सम्पादित पोथीक लेख-सार'}>
  <div><p className="eyebrow" lang="en">CONTRIBUTORS’ PERSPECTIVES</p><strong>{count}</strong><span>{en?'attributed article gists':'सन्दर्भ सहित लेख-सार'}</span></div>
  <div><h3>{en?'Many voices. Two volumes.':'अनेक स्वर। दू पोथी।'}</h3><p>{en?'Reviews, interviews and memories from Preeti Karan Setu Banhal and Setusham, edited by Ashish Anchinhar. Every contribution has an English gist with author, book and page references.':'आशीष अनचिन्हार सम्पादित “प्रीति कारण सेतु बान्हल” आ “सेतुशम”सँ समीक्षा, साक्षात्कार आ संस्मरण। प्रत्येक लेखक अंग्रेजी सार संग लेखक, पोथी आ पृष्ठक सन्दर्भ।'}</p><a href="/gajendra-preeti/criticism/reception/">{en?'Read the contributors’ perspectives →':'लेखकसभक विचारक अंग्रेजी सार पढ़ू →'}</a></div>
 </aside>;
}
