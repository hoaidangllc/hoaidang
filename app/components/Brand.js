import Link from 'next/link';

const logo='https://raw.githubusercontent.com/hoaidangllc/hoaidang/main/assets/images/hoaistudio_icon.png';

export default function Brand({className=''}){
  return <Link className={`brand brandLockup ${className}`} href="/" aria-label="HoaiStudio home">
    <span className="brandIcon"><img src={logo} alt="" /></span>
    <span className="brandWord">Hoai<span>Studio</span></span>
  </Link>;
}
