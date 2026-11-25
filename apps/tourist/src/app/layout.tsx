import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SmartGuide · Ichan-Qala AI Tour Guide',
  description:
    'Instant QR-powered AI audio & vision tour guide for Ichan-Qala, Khiva. Verified museum archives, zero hallucinations, 6 languages.',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
};

export const viewport: Viewport = {
  themeColor: '#090D16',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen silk-road-pattern text-slate-100 selection:bg-amber-400/30 selection:text-amber-100">
        {children}
      </body>
    </html>
  );
}
