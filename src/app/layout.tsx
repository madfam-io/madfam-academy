import { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from '@/components/providers';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import './globals.css';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: {
    default: 'MADFAM Academy - Educational Marketplace',
    template: '%s | MADFAM Academy',
  },
  description: 'Discover and enroll in cutting-edge courses designed for the future. Join MADFAM Academy\'s educational marketplace and advance your skills.',
  keywords: [
    'online learning',
    'courses',
    'education',
    'skill development',
    'marketplace',
    'MADFAM Academy',
    'professional development',
    'certification'
  ],
  authors: [{ name: 'MADFAM Academy Team' }],
  creator: 'MADFAM Academy',
  publisher: 'MADFAM Academy',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'MADFAM Academy',
    title: 'MADFAM Academy - Educational Marketplace',
    description: 'Discover and enroll in cutting-edge courses designed for the future.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'MADFAM Academy - Educational Marketplace',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MADFAM Academy - Educational Marketplace',
    description: 'Discover and enroll in cutting-edge courses designed for the future.',
    images: ['/twitter-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>
          <div className="relative flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}