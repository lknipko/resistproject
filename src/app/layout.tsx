import type { Metadata } from 'next'
import './globals.css'
import HeaderWrapper from '@/components/layout/HeaderWrapper'
import Footer from '@/components/layout/Footer'
import { SessionProvider } from '@/components/providers/SessionProvider'
import { auth } from '@/lib/auth'

export const metadata: Metadata = {
  title: {
    default: 'Resist Project',
    template: '%s | Resist Project',
  },
  description: 'Fact-based civic engagement platform providing verified information and actionable opportunities.',
  keywords: ['civic engagement', 'government accountability', 'citizen action', 'democracy'],
  authors: [{ name: 'Resist Project' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://resistproject.com',
    siteName: 'Resist Project',
    title: 'Resist Project',
    description: 'Fact-based civic engagement platform providing verified information and actionable opportunities.',
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
      <body className="min-h-screen flex flex-col">
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
