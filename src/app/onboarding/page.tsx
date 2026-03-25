import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import OnboardingForm from './OnboardingForm'

export const metadata = {
  title: 'Set Up Your Profile | Resist Project',
}

interface OnboardingPageProps {
  searchParams: Promise<{ returnTo?: string }>
}

export default async function OnboardingPage({ searchParams }: OnboardingPageProps) {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  // Check if onboarding is still needed
  const userExtended = await prisma.userExtended.findUnique({
    where: { userId: session.user.id },
    select: { civicProfileCompleted: true, onboardingDismissed: true },
  })

  const params = await searchParams

  if (!userExtended || userExtended.civicProfileCompleted || userExtended.onboardingDismissed) {
    redirect(params.returnTo ? decodeURIComponent(params.returnTo) : '/')
  }

  const returnTo = params.returnTo ? decodeURIComponent(params.returnTo) : '/'

  return (
    <div className="min-h-screen bg-gray-50 flex items-start justify-center pt-16 pb-12 px-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-steel-600 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Set up your profile</h1>
          </div>
          <p className="text-gray-600 leading-relaxed">
            Add your contact info so action pages can pre-fill email templates and call scripts
            with your name and connect you to your specific representatives.
          </p>
        </div>

        {/* What this is used for */}
        <div className="bg-teal-50 border border-teal-200 rounded-lg p-4 mb-6">
          <h2 className="text-sm font-semibold text-teal-800 mb-2">What this info is used for</h2>
          <ul className="text-sm text-teal-700 space-y-1">
            <li className="flex gap-2">
              <span className="mt-0.5">•</span>
              <span>Pre-fill your name in email templates to representatives</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-0.5">•</span>
              <span>Show your specific senators and house representative by zip code</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-0.5">•</span>
              <span>Personalize call scripts with your name and location</span>
            </li>
          </ul>
          <p className="text-xs text-teal-600 mt-2">
            Your info is stored privately and never shared or sold.
          </p>
        </div>

        {/* Form card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <OnboardingForm returnTo={returnTo} />
        </div>
      </div>
    </div>
  )
}
