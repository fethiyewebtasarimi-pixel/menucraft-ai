import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/shared/Providers';
import { Toaster } from 'sonner';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'MenuCraft AI - AI Destekli Dijital Menu Platformu',
  description:
    'MenuCraft AI ile restoranınız için AI destekli dijital menü oluşturun, QR kod ile müşterilerinize sunun ve sipariş yönetimi yapın.',
  keywords: [
    'dijital menu',
    'QR menu',
    'restoran menu',
    'AI menu',
    'menu yapay zeka',
    'restoran yonetim',
    'dijital restoran',
  ],
  authors: [{ name: 'MenuCraft AI' }],
  creator: 'MenuCraft AI',
  publisher: 'MenuCraft AI',
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
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    url: 'https://menucraft-ai.com',
    siteName: 'MenuCraft AI',
    title: 'MenuCraft AI - AI Destekli Dijital Menu Platformu',
    description:
      'MenuCraft AI ile restoranınız için AI destekli dijital menü oluşturun, QR kod ile müşterilerinize sunun ve sipariş yönetimi yapın.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'MenuCraft AI',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MenuCraft AI - AI Destekli Dijital Menu Platformu',
    description:
      'MenuCraft AI ile restoranınız için AI destekli dijital menü oluşturun, QR kod ile müşterilerinize sunun ve sipariş yönetimi yapın.',
    images: ['/og-image.png'],
    creator: '@menucraftai',
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans`}>
        <Providers>
          {children}
          <Toaster
            position="top-right"
            expand={false}
            richColors
            closeButton
            duration={4000}
          />
        </Providers>
      </body>
    </html>
  );
}
