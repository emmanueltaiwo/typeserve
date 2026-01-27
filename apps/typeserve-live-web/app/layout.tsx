import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { Analytics } from '@vercel/analytics/react';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Typeserve Live - Spin up live mock APIs from TypeScript',
  description:
    'Create temporary mock APIs from TypeScript types — instantly. No auth, no accounts, everything disposable.',
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
    url: 'https://typeserve.live',
    title: 'Typeserve Live - Spin up live mock APIs from TypeScript',
    description:
      'Create temporary mock APIs from TypeScript types — instantly. No auth, no accounts, everything disposable.',
    siteName: 'Typeserve Live',
    images: [
      {
        url: '/og.png',
        width: 1200,
        height: 630,
        alt: 'Typeserve Live - Spin up live mock APIs from TypeScript',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Typeserve Live - Spin up live mock APIs from TypeScript',
    description:
      'Create temporary mock APIs from TypeScript types — instantly. No auth, no accounts, everything disposable.',
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
  metadataBase: new URL('https://typeserve.live'),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute='class'
          defaultTheme='dark'
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
