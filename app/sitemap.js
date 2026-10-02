export default function sitemap(){
  const base='https://hoaidang.com';
  const pages=[
    {path:'',changeFrequency:'weekly',priority:1},
    {path:'/about',changeFrequency:'monthly',priority:.8},
    {path:'/contact',changeFrequency:'monthly',priority:.8},
    {path:'/privacy',changeFrequency:'monthly',priority:.6},
    {path:'/terms',changeFrequency:'monthly',priority:.6},
  ];
  return pages.map(({path,changeFrequency,priority})=>({
    url:`${base}${path}`,
    lastModified:new Date(),
    changeFrequency,
    priority,
  }));
}
