'use client'

import { usePathname } from 'next/navigation'
import HeaderWrapper from './HeaderWrapper'
import Footer from './Footer'

export function MainChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isEnvironment = pathname.startsWith('/ourhome')

  if (isEnvironment) {
    return <>{children}</>
  }

  return (
    <>
      <HeaderWrapper />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </>
  )
}
