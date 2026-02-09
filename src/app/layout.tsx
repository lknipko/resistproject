import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import HeaderWrapper from '@/components/layout/HeaderWrapper'
import Footer from '@/components/layout/Footer'
import { SessionProvider } from '@/components/providers/SessionProvider'
import { auth } from '@/lib/auth'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: {
    default: 'Resist Project',
    template: '%s | Resist Project',
  },
  description: 'Fact-based civic engagement platform providing verified information and actionable opportunities.',
  keywords: ['civic engagement', 'government accountability', 'citizen action', 'democracy'],
  authors: [{ name: 'Resist Project' }],
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://resistproject.com',
    siteName: 'Resist Project',
    title: 'Resist Project',
    description: 'Fact-based civic engagement platform providing verified information and actionable opportunities.',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans min-h-screen flex flex-col antialiased`}>
        <SessionProvider session={session}>
          <HeaderWrapper />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
        </SessionProvider>
      </body>
    </html>
  )
}
