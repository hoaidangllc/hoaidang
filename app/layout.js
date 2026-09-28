import './globals.css';
import './secondary.css';

export const metadata={
 metadataBase:new URL('https://hoaidang.com'),
 title:{default:'HoaiStudio — Creator Publishing Workspace',template:'%s | HoaiStudio'},
 description:'HoaiStudio helps creators prepare original content, review connected-account publishing choices, and intentionally submit posts from one focused workspace.',
 applicationName:'HoaiStudio',
 alternates:{canonical:'/'},
 robots:{index:true,follow:true},
 openGraph:{title:'HoaiStudio — Creator Publishing Workspace',description:'Prepare with clarity. Publish with control.',url:'https://hoaidang.com',siteName:'HoaiStudio',type:'website'},
 twitter:{card:'summary',title:'HoaiStudio — Creator Publishing Workspace',description:'Prepare with clarity. Publish with control.'},
};

export default function RootLayout({children}){return <html lang="en"><body>{children}</body></html>}
