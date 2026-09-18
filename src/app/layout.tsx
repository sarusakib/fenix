import './globals.css'

import AuthSync from '../components/AuthSync'
import HomeThemeProvider from '../components/theme/HomeThemeProvider'

export const metadata = {
  title: 'FeniX | Feni Business Ecosystem',
  description: 'Build. Connect. Grow.',
  manifest: '/manifest.json',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen w-full overflow-x-clip bg-[#06080c] text-white antialiased">
        <AuthSync />
        <HomeThemeProvider>
          <div className="relative min-h-screen">
            {children}
          </div>
        </HomeThemeProvider>
      </body>
    </html>
  )
}
