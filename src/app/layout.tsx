import './globals.css'
import AuthSync from '../components/AuthSync'
import FenixFlow from './FenixFlow'

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
    <html lang="en">
      <body className="min-h-screen bg-[#030506] text-white antialiased">
        <AuthSync />

        <FenixFlow>
          {children}
        </FenixFlow>
      </body>
    </html>
  )
}
