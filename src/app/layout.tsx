import './globals.css'

import AuthSync from '../components/AuthSync'
import FenixFlow from './FenixFlow'
import HomeThemeProvider from '../components/theme/HomeThemeProvider'
import SiteBackground from '../components/layout/SiteBackground'

export const metadata = {
  title: 'FeniX | Business Ecosystem',
  description: 'One Account. One Ecosystem.',
  manifest: '/manifest.json',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen w-full overflow-x-clip bg-[#eef3f5] text-[#111827] antialiased dark:bg-[#030506] dark:text-white">
        <AuthSync />

        <FenixFlow>
          <HomeThemeProvider>
            <SiteBackground />
            {children}
          </HomeThemeProvider>
        </FenixFlow>
      </body>
    </html>
  )
}
