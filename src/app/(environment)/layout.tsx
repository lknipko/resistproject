import type { Metadata } from 'next'
import EnvironmentHeader from '@/components/environment/EnvironmentHeader'
import EnvironmentFooter from '@/components/environment/EnvironmentFooter'

export const metadata: Metadata = {
  title: {
    default: 'Our Home | Resist Project',
    template: '%s | Our Home',
  },
  description: 'Track environmental rollbacks, protect public lands, and take action for clean air, water, and wildlife.',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://resistproject.com/environment',
    siteName: 'Resist Project — Our Home',
    title: 'Our Home',
    description: 'Track environmental rollbacks, protect public lands, and take action for clean air, water, and wildlife.',
  },
}

export default function EnvironmentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <EnvironmentHeader />
      <main className="flex-grow">
        {children}
      </main>
      <EnvironmentFooter />
    </>
  )
}
