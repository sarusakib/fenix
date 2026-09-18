import './globals.css'

import AuthSync from '../components/AuthSync'
import FenixFlow from './FenixFlow'
import HomeThemeProvider from '../components/theme/HomeThemeProvider'
import SiteBackground from '../components/layout/SiteBackground'

export const metadata = {
  title: 'FeniX | Feni Business Ecosystem',
  description: 'Build. Connect. Grow. — Feni Business Ecosystem.',
  manifest: '/manifest.json',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen w-full overflow-x-clip antialiased">
        <AuthSync />

        <FenixFlow>
          <HomeThemeProvider>
            <SiteBackground />

            <div className="relative z-10 min-h-screen">
              {children}
            </div>
          </HomeThemeProvider>
        </FenixFlow>
      </body>
    </html>
  )
}
