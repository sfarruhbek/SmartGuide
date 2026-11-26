import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
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
  manifest: '/manifest.webmanifest',
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
};

export const viewport: Viewport = {
  themeColor: '#FAF8F5',
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
      <body className="min-h-screen bg-[#FAF8F5] font-sans text-[#14181F] antialiased selection:bg-[#0E7470]/15 selection:text-[#0E7470]">
        {children}
      </body>
    </html>
  );
}
