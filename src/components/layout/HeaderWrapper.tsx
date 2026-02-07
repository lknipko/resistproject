import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import Header from './Header'

export default async function HeaderWrapper() {
  let session = null
  let userTier = 1

  try {
    session = await auth()

    // Get user tier if authenticated
    if (session?.user?.id) {
      const userExtended = await prisma.userExtended.findUnique({
        where: { userId: session.user.id },
        select: { userTier: true }
      })
      if (userExtended) {
        userTier = userExtended.userTier
      }
    }
  } catch (error) {
    console.error('Auth error in HeaderWrapper:', error)
  }

  return <Header session={session} userTier={userTier} />
}
