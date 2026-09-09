import type { Metadata } from 'next';
import './globals.css';
import './edition.css';
import './reference.css';
import './reading-tools.css';
import ReadingTools from './reading-tools';
export const metadata: Metadata={title:'प्रीति ठाकुर आ गजेन्द्र ठाकुर',description:'प्रीति ठाकुर आ गजेन्द्र ठाकुरक रचना, अनुवाद आ अभिलेख — A Videha literary atlas.',alternates:{canonical:'https://videha-ejournal.github.io/gajendra-preeti/',languages:Object.fromEntries([['mai','https://videha-ejournal.github.io/gajendra-preeti/'],['en','https://videha-ejournal.github.io/gajendra-preeti/en/']])},icons:{icon:'/gajendra-preeti/icon.svg'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="mai"><body>{children}<ReadingTools/></body></html>}
