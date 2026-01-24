import type { Metadata } from 'next';
import { JetBrains_Mono, Orbitron } from 'next/font/google';
import { RootProvider } from 'fumadocs-ui/provider/next';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

const orbitron = Orbitron({
  variable: '--font-orbitron',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
});

export const metadata: Metadata = {
  title: 'TypeServe - Generate Live Mock APIs from TypeScript Types',
  description:
    'The first and only tool that generates live mock APIs from your TypeScript types. No backend needed. TypeScript-first, lightning fast, with hot reload.',
  keywords: [
    'TypeScript',
    'Mock API',
    'API Generator',
    'TypeScript Mock',
    'Mock Server',
    'Development Tools',
  ],
  authors: [{ name: 'Emmanuel Taiwo' }],
  creator: 'Emmanuel Taiwo',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://typeserve.com',
    title: 'TypeServe - Generate Live Mock APIs from TypeScript Types',
    description:
      'The first and only tool that generates live mock APIs from your TypeScript types.',
    siteName: 'TypeServe',
    images: [
      {
        url: '/og.png',
        width: 1200,
        height: 630,
        alt: 'TypeServe - Generate Live Mock APIs from TypeScript Types',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TypeServe - Generate Live Mock APIs from TypeScript Types',
    description:
      'The first and only tool that generates live mock APIs from your TypeScript types. No backend needed. TypeScript-first, lightning fast, with hot reload.',
    creator: '@ez0xai',
    images: ['/og.png'],
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
  metadataBase: new URL('https://typeserve.com'),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body
        className={`${jetbrainsMono.variable} ${orbitron.variable} antialiased`}
      >
        <RootProvider
          theme={{
            forcedTheme: 'dark',
            enableSystem: false,
            defaultTheme: 'dark',
          }}
        >
          {children}
        </RootProvider>
        <Analytics />
      </body>
    </html>
  );
}
