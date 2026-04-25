import type { Metadata, Viewport } from 'next';
import { Geist } from 'next/font/google';
import Link from 'next/link';
import { PWAProvider } from '@/components/PWAProvider';
import './globals.css';

const geist = Geist({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Recipe AI — Recettes par IA',
  description: 'Générez des recettes de cuisine personnalisées avec l\'IA',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Recipe AI',
  },
  icons: {
    icon: '/icons/icon-192.png',
    apple: '/icons/icon-192.png',
  },

  openGraph: {
    title: 'Recipe AI',
    description: 'Générez des recettes personnalisées avec l\'IA',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#FF6B6B',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={geist.className}>
      <body className="min-h-screen overflow-x-hidden">
        <PWAProvider />
        {/* Rainbow accent bar */}
        <div className="h-[4px] bg-gradient-to-r from-coral via-mango via-sunshine via-mint via-sky to-lavender" />

        <header className="sticky top-0 z-20 backdrop-blur-md bg-white/80 border-b border-coral/10">
          <div className="max-w-3xl mx-auto px-5 py-3.5 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5 group">
              <span className="w-10 h-10 rounded-2xl bg-gradient-to-br from-coral to-mango text-white text-lg font-bold flex items-center justify-center transition-all group-hover:scale-105 group-hover:rotate-3 select-none shadow-lg shadow-coral/30">
                R
              </span>
              <div className="flex flex-col">
                <span className="font-bold text-lg text-stone-900 tracking-tight leading-tight">Recipe AI</span>
                <span className="text-xs text-mango font-medium">Cuisinez en famille</span>
              </div>
            </Link>

            <Link
              href="/saved"
              className="group flex items-center gap-2 text-sm font-semibold bg-gradient-to-r from-mint to-sky text-white px-5 py-2.5 rounded-full transition-all hover:shadow-lg hover:shadow-mint/30 hover:-translate-y-0.5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              Mes recettes
            </Link>
          </div>
        </header>

        {/* Decorative blobs */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
          <div className="floating-shape blob-1 shape-coral" />
          <div className="floating-shape blob-2 shape-mint" />
          <div className="floating-shape blob-3 shape-sunshine" />
        </div>

        <main className="max-w-3xl mx-auto px-5 py-8">{children}</main>
      </body>
    </html>
  );
}
