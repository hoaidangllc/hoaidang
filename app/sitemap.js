export default function sitemap(){
  const base='https://hoaidang.com';
  const pages=[
    {path:'',changeFrequency:'weekly',priority:1},
    {path:'/about',changeFrequency:'monthly',priority:.8},
    {path:'/contact',changeFrequency:'monthly',priority:.7},
    {path:'/privacy',changeFrequency:'yearly',priority:.5},
    {path:'/terms',changeFrequency:'yearly',priority:.5},
  ];
  return pages.map(({path,changeFrequency,priority})=>({url:`${base}${path}`,changeFrequency,priority}));
}
