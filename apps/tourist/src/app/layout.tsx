import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import { PwaRegistrar } from '@/components/PwaRegistrar';
import './globals.css';
import './journey.css';
import './api-integration.css';

const playfair = localFont({
  src: './fonts/PlayfairDisplay.ttf',
  weight: '400 900',
  variable: '--font-display',
  display: 'swap',
});

const inter = localFont({
  src: './fonts/Inter.ttf',
  weight: '100 900',
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'SmartGuide · Uzbekistan at your own pace',
  description:
    'Plan a solo journey across Uzbekistan. Daily itineraries, budget estimates, local discoveries and source-backed stories, at your own pace.',
  icons: {
    icon: [
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
};

export const viewport: Viewport = {
  themeColor: '#0E7470',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <head>
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="SmartGuide" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className="min-h-screen bg-[#FAF8F5] font-sans text-[#14181F] antialiased selection:bg-[#0E7470]/15 selection:text-[#0E7470]">
        <PwaRegistrar />
        {children}
      </body>
    </html>
  );
}
