'use client'

import { useSession } from 'next-auth/react'
import Header from './Header'

export default function HeaderWrapper() {
  const { data: session } = useSession()
  const userTier = session?.user?.userTier ?? 1

  return <Header session={session} userTier={userTier} />
}
