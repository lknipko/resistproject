import { auth } from '@/lib/auth'
import UserMenu from './UserMenu'
import SignInLink from './SignInLink'

export default async function AuthButton() {
  let session = null

  try {
    session = await auth()
  } catch (error) {
    console.error('Auth error:', error)
    // If auth fails, show sign in button
  }

  if (session?.user) {
    return <UserMenu user={session.user} />
  }

  return <SignInLink />
}
