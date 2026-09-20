import type { Metadata } from 'next';
import './local-fonts.css';
import './globals.css';
import './edition.css';
import './reference.css';
import './reading-tools.css';
import './improvements.css';
import './ui-polish.css';
import ReadingTools from './reading-tools';
import LanguageSwitch from './language-switch';
import SiteEnhancements from './site-enhancements';
import {SOCIAL_IMAGE} from './site-meta';
export const metadata: Metadata={title:'प्रीति ठाकुर आ गजेन्द्र ठाकुर',description:'प्रीति ठाकुर आ गजेन्द्र ठाकुरक रचना, अनुवाद आ अभिलेख — A Videha literary atlas.',openGraph:{title:'प्रीति ठाकुर आ गजेन्द्र ठाकुर',description:'Writing, translations, archives and 59 English critical readings in the Videha Literary Atlas.',url:'https://videha-ejournal.github.io/gajendra-preeti/',type:'website',locale:'mai_IN',alternateLocale:['en_IN'],images:[{url:SOCIAL_IMAGE,width:1200,height:630,alt:'Preeti Thakur and Gajendra Thakur — The Videha Literary Atlas'}]},twitter:{card:'summary_large_image',title:'प्रीति ठाकुर आ गजेन्द्र ठाकुर',description:'Writing, translations, archives and 59 English critical readings in the Videha Literary Atlas.',images:[SOCIAL_IMAGE]},alternates:{canonical:'https://videha-ejournal.github.io/gajendra-preeti/',languages:Object.fromEntries([['mai','https://videha-ejournal.github.io/gajendra-preeti/'],['en','https://videha-ejournal.github.io/gajendra-preeti/en/'],['x-default','https://videha-ejournal.github.io/gajendra-preeti/']])},icons:{icon:'/gajendra-preeti/icon.svg'}};
export default function SiteLayout({children,lang}:{children:React.ReactNode;lang:"mai"|"en"}){return <html lang={lang}><body><SiteEnhancements lang={lang}/>{children}<LanguageSwitch/><ReadingTools/></body></html>}
