import './globals.css';

export const metadata = {
  metadataBase: new URL('https://hoaidang.com'),
  title: { default: 'HoaiStudio — Create, manage and publish', template: '%s | HoaiStudio' },
  description: 'HoaiStudio helps creators and businesses prepare, manage and publish original social content from one focused workspace.',
  openGraph: { title: 'HoaiStudio', description: 'A focused workspace for social content publishing.', url: 'https://hoaidang.com', siteName: 'HoaiStudio', type: 'website' },
};

export default function RootLayout({ children }) {
  return <html lang="en"><body>{children}</body></html>;
}
