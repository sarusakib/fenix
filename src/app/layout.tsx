import './globals.css'

import Script from 'next/script'
import AuthSync from '../components/AuthSync'
import FenixFlow from './FenixFlow'
import HomeThemeProvider from '../components/theme/HomeThemeProvider'
import SiteBackground from '../components/layout/SiteBackground'
import MobileDock from '../components/MobileDock'
import { FenixLocaleProvider } from '../components/i18n/FenixLocaleProvider'

export const metadata = {
  title: 'FeniX | Feni Business Ecosystem',
  description: 'Build. Connect. Grow. — Feni Business Ecosystem.',
  manifest: '/manifest.json',
  icons: {
    icon: '/fenix-mark.svg',
    shortcut: '/fenix-mark.svg',
    apple: '/fenix-mark.svg',
  },
  openGraph: {
    title: 'FeniX | Feni Business Ecosystem',
    description: 'Build. Connect. Grow. — Feni Business Ecosystem.',
    type: 'website',
    images: [{ url: '/og-fenix.svg', width: 1200, height: 630, type: 'image/svg+xml', alt: 'FeniX — Feni Business Ecosystem' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FeniX | Feni Business Ecosystem',
    description: 'Build. Connect. Grow. — Feni Business Ecosystem.',
    images: ['/og-fenix.svg'],
  },
  applicationName: 'FeniX',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#0B1736',
}

const themeBootstrap = `
(function () {
  try {
    var root = document.documentElement;
    var saved = localStorage.getItem('fenix-home-theme');
    var theme =
      saved === 'dark' || saved === 'light'
        ? saved
        : window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light';

    root.classList.toggle('dark', theme === 'dark');
    root.dataset.homeTheme = theme;
    root.style.colorScheme = theme;

    var themeColor = document.querySelector('meta[name="theme-color"]');
    if (themeColor) {
      themeColor.setAttribute(
        'content',
        theme === 'dark' ? '#030506' : '#F3F7F7'
      );
    }
  } catch (_) {
    // Theme bootstrap must never block application startup.
  }
})();
`

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="bn" suppressHydrationWarning>
      <body className="min-h-screen w-full overflow-x-clip antialiased">
        <Script
          id="fenix-theme-bootstrap"
          strategy="beforeInteractive"
        >
          {themeBootstrap}
        </Script>

        <AuthSync />

        <FenixLocaleProvider>
          <HomeThemeProvider>
          <FenixFlow>
            <SiteBackground />

            <div className="relative z-10 min-h-screen">
              {children}
            </div>

            <MobileDock />
          </FenixFlow>
          </HomeThemeProvider>
        </FenixLocaleProvider>
      </body>
    </html>
  )
}
