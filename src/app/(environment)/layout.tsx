import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../globals.css'
import EnvironmentHeader from '@/components/environment/EnvironmentHeader'
import EnvironmentFooter from '@/components/environment/EnvironmentFooter'
import { SessionProvider } from '@/components/providers/SessionProvider'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: {
    default: 'Environment Hub | Resist Project',
    template: '%s | Environment Hub',
  },
  description: 'Track environmental rollbacks, protect public lands, and take action for clean air, water, and wildlife.',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://resistproject.com/environment',
    siteName: 'Resist Project — Environment Hub',
    title: 'Environment Hub',
    description: 'Track environmental rollbacks, protect public lands, and take action for clean air, water, and wildlife.',
  },
}

export default function EnvironmentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans min-h-screen flex flex-col antialiased`}>
        <SessionProvider>
          <EnvironmentHeader />
          <main className="flex-grow">
            {children}
          </main>
          <EnvironmentFooter />
        </SessionProvider>
      </body>
    </html>
  )
}
