import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata={title:'प्रीति ठाकुर आ गजेन्द्र ठाकुर',description:'प्रीति ठाकुर आ गजेन्द्र ठाकुरक रचना, अनुवाद आ अभिलेख — A Videha literary atlas.',alternates:{canonical:'https://videha-ejournal.github.io/gajendra-preeti/'},icons:{icon:'/gajendra-preeti/icon.svg'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="mai"><body>{children}</body></html>}