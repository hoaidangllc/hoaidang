import './globals.css';
import './secondary.css';
import './pro-theme.css';
import './polish.css';

const siteUrl='https://hoaidang.com';
const siteName='HoaiStudio';
const description='HoaiStudio is a creator publishing workspace for preparing original content, connecting authorized creator accounts, reviewing publishing settings, and intentionally submitting posts.';

export const metadata={
 metadataBase:new URL(siteUrl),
 title:{default:'HoaiStudio — Creator Publishing Workspace',template:'%s | HoaiStudio'},
 description,
 applicationName:siteName,
 keywords:['HoaiStudio','creator publishing workspace','content publishing','creator tools','TikTok publishing workspace','social media publishing'],
 alternates:{canonical:'/'},
 robots:{index:true,follow:true,googleBot:{index:true,follow:true,'max-image-preview':'large','max-snippet':-1,'max-video-preview':-1}},
 icons:{icon:{url:'/assets/images/hoaistudio_icon.png',type:'image/png',sizes:'512x512'},shortcut:'/assets/images/hoaistudio_icon.png',apple:'/assets/images/hoaistudio_icon.png'},
 openGraph:{title:'HoaiStudio — Creator Publishing Workspace',description,url:siteUrl,siteName,type:'website',locale:'en_US',images:[{url:'/assets/images/hoaistudio_icon.png',width:512,height:512,alt:'HoaiStudio logo'}]},
 twitter:{card:'summary',title:'HoaiStudio — Creator Publishing Workspace',description,images:['/assets/images/hoaistudio_icon.png']},
};

const structuredData={
 '@context':'https://schema.org',
 '@graph':[
  {'@type':'WebSite','@id':`${siteUrl}/#website`,url:siteUrl,name:siteName,alternateName:'Hoai Studio',description,inLanguage:'en-US',publisher:{'@id':`${siteUrl}/#organization`}},
  {'@type':'Organization','@id':`${siteUrl}/#organization`,name:siteName,alternateName:'Hoai Studio',url:siteUrl,logo:{'@type':'ImageObject',url:`${siteUrl}/assets/images/hoaistudio_icon.png`,contentUrl:`${siteUrl}/assets/images/hoaistudio_icon.png`,width:512,height:512},description},
  {'@type':'SoftwareApplication','@id':`${siteUrl}/#software`,name:siteName,alternateName:'Hoai Studio',url:siteUrl,applicationCategory:'MultimediaApplication',operatingSystem:'Web',description,publisher:{'@id':`${siteUrl}/#organization`}}
 ]
};

export default function RootLayout({children}){return <html lang="en"><body><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(structuredData)}}/>{children}</body></html>}
