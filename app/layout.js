import './globals.css';
import './secondary.css';
import './pro-theme.css';

export const metadata={
 metadataBase:new URL('https://hoaidang.com'),
 title:{default:'HoaiStudio — Creator Publishing Workspace',template:'%s | HoaiStudio'},
 description:'HoaiStudio helps creators prepare original content, review connected-account publishing choices, and intentionally submit posts from one focused workspace.',
 applicationName:'HoaiStudio',
 alternates:{canonical:'/'},
 robots:{index:true,follow:true},
 icons:{icon:'/assets/images/hoaistudio_icon.png',shortcut:'/assets/images/hoaistudio_icon.png',apple:'/assets/images/hoaistudio_icon.png'},
 openGraph:{title:'HoaiStudio — Creator Publishing Workspace',description:'Prepare with clarity. Publish with control.',url:'https://hoaidang.com',siteName:'HoaiStudio',type:'website',images:[{url:'/assets/images/hoaistudio_icon.png',width:512,height:512,alt:'HoaiStudio'}]},
 twitter:{card:'summary',title:'HoaiStudio — Creator Publishing Workspace',description:'Prepare with clarity. Publish with control.',images:['/assets/images/hoaistudio_icon.png']},
};

export default function RootLayout({children}){return <html lang="en"><body>{children}</body></html>}
