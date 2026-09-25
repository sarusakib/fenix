import './globals.css'

import { headers } from 'next/headers'
import Script from 'next/script'
import AuthSync from '../components/AuthSync'
import FenixFlow from './FenixFlow'
import HomeThemeProvider from '../components/theme/HomeThemeProvider'
import SiteBackground from '../components/layout/SiteBackground'
import MobileDock from '../components/MobileDock'
import ServiceWorkerRegister from '../components/pwa/ServiceWorkerRegister'
import VoiceSearchButton from '../components/search/VoiceSearchButton'
import FenixMessenger from '../components/messaging/FenixMessenger'
import { FenixLocaleProvider } from '../components/i18n/FenixLocaleProvider'

export const metadata = {
  title: 'FeniX | Feni Business Ecosystem',
  description: 'Build. Connect. Grow. — Feni Business Ecosystem.',
  manifest: '/manifest.json',
  icons: {
    icon: '/fenix-logo.svg',
    shortcut: '/fenix-logo.svg',
    apple: '/fenix-logo.svg',
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
        theme === 'dark' ? '#06090d' : '#F4F7F6'
      );
    }

    var reduceMotion = localStorage.getItem('fenix-reduce-motion') === 'true';
    root.dataset.reduceMotion = reduceMotion ? 'true' : 'false';
  } catch (_) {}
})();
`

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const nonce = (await headers()).get('x-fenix-nonce') ?? undefined

  return (
    <html lang="bn" suppressHydrationWarning>
      <body className="min-h-screen w-full overflow-x-clip antialiased">
        <Script id="fenix-theme-bootstrap" nonce={nonce} strategy="beforeInteractive">{themeBootstrap}</Script>
        <AuthSync />
        <FenixLocaleProvider>
          <HomeThemeProvider>
            <FenixFlow>
              <SiteBackground />
              <div className="relative z-10 min-h-screen">{children}</div>
              <MobileDock />
              <VoiceSearchButton />
              <FenixMessenger />
              <ServiceWorkerRegister />
            </FenixFlow>
          </HomeThemeProvider>
        </FenixLocaleProvider>
      </body>
    </html>
  )
}