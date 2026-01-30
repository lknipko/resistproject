import type { Metadata } from 'next'
import './globals.css'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}
