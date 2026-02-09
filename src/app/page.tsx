import Link from 'next/link'
import { Hero } from '@/components/home/Hero'
import { FeaturedIssue } from '@/components/home/FeaturedIssue'
import { HowItWorks } from '@/components/home/HowItWorks'

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <Hero />

      {/* Featured Issues */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Most Urgent Issues
            </h2>
            <p className="text-xl text-gray-600">
              These issues require immediate attention and action from citizens.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <FeaturedIssue
              title="DOGE & Federal Workforce"
              description="260K+ federal employees fired. Treasury access granted to unelected officials. CFPB and USAID dismantled while Musk holds $15B+ in government contracts."
              learnSlug="doge"
              actSlug="protect-federal-services"
              badge="Urgent"
              icon="government"
            />
            <FeaturedIssue
              title="ICE Detention Crisis"
              description="Detention population doubled. Military bases converted to camps. Sensitive locations policy revoked. U.S. citizens wrongfully detained."
              learnSlug="ice-detention-deportation"
              actSlug="ice-detention-defense"
              badge="Urgent"
              icon="rights"
            />
            <FeaturedIssue
              title="January 6th Pardons"
              description="~1,500 pardoned including seditious conspiracy convictions. Career prosecutors purged. DOJ weaponized against political opponents."
              learnSlug="pardons-justice-system"
              actSlug="defend-justice"
              badge="Urgent"
              icon="justice"
            />
            <FeaturedIssue
              title="Press Freedom Under Attack"
              description="Journalists arrested, outlets banned, DOJ subpoenas for sources, and FCC license threats. The free press faces direct assault."
              learnSlug="press-freedom"
              actSlug="press-freedom-defense"
              icon="press"
            />
            <FeaturedIssue
              title="Public Health Dismantled"
              description="WHO withdrawal, NIH 40% budget cuts, CDC interference, vaccine schedule changes. Decades of public health infrastructure destroyed."
              learnSlug="public-health"
              actSlug="public-health"
              icon="health"
            />
            <FeaturedIssue
              title="Impoundment Crisis"
              description="Illegally withholding congressionally appropriated funds, violating the Impoundment Control Act and defying court orders."
              learnSlug="impoundment"
              actSlug="congressional-power"
              icon="government"
            />
          </div>

          <div className="text-center">
            <Link
              href="/learn"
              className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 font-semibold text-lg"
            >
              Browse all issues
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <HowItWorks />

      {/* Quick Actions Bar */}
      <section className="py-16 bg-orange-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Take Action in 5 Minutes
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <Link
              href="/act/contact-congress"
              className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-lg p-8 text-center transition-all hover:scale-105"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Call Congress</h3>
              <p className="text-white/90 text-sm">
                Use issue-specific scripts to call your representatives. High call volume works.
              </p>
            </Link>

            <a
              href="https://5calls.org"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-lg p-8 text-center transition-all hover:scale-105"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">5 Calls</h3>
              <p className="text-white/90 text-sm">
                Quick scripts with tap-to-call. Make 5 calls on the issues you care about.
              </p>
            </a>

            <a
              href="https://resist.bot"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-lg p-8 text-center transition-all hover:scale-105"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Resistbot</h3>
              <p className="text-white/90 text-sm">
                Text RESIST to 50409 to send letters to your representatives in 2 minutes.
              </p>
            </a>
          </div>
        </div>
      </section>

      {/* Join the Community */}
      <section className="py-16 bg-gradient-to-r from-teal-600 to-teal-700 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-6">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Join Our Community of Contributors
          </h2>
          <p className="text-xl text-teal-50 mb-8 max-w-3xl mx-auto">
            This platform is powered by community contributions. Anyone can propose edits or create new pages.
            All content goes through a peer review process to maintain credibility.
          </p>
          <Link
            href="/act/contribute"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-teal-700 hover:bg-teal-50 font-bold rounded-lg shadow-lg transition-all hover:scale-105 text-lg"
          >
            Learn How to Contribute
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
          <div className="mt-8 grid md:grid-cols-3 gap-6 text-left">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="text-3xl font-bold mb-2">Community</div>
              <p className="text-teal-50 text-sm">
                Edit proposals reviewed by community members with weighted voting
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="text-3xl font-bold mb-2">Quality First</div>
              <p className="text-teal-50 text-sm">
                Tier system rewards quality contributions and builds trust over time
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="text-3xl font-bold mb-2">Transparent</div>
              <p className="text-teal-50 text-sm">
                All edits logged and audited. Clear separation of facts and analysis.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Browse by Category */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
            Browse Issues by Category
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link
              href="/learn"
              className="bg-white border-2 border-gray-200 hover:border-teal-500 rounded-lg p-6 text-center transition-all hover:shadow-lg group"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-100 text-teal-600 rounded-full mb-4 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Government & Power</h3>
              <p className="text-gray-600 text-sm">DOGE, Project 2025, Impoundment, Schedule F</p>
            </Link>

            <Link
              href="/learn"
              className="bg-white border-2 border-gray-200 hover:border-teal-500 rounded-lg p-6 text-center transition-all hover:shadow-lg group"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-100 text-teal-600 rounded-full mb-4 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Rights & Immigration</h3>
              <p className="text-gray-600 text-sm">ICE Detention, Birthright Citizenship, LGBTQ+, Voting Rights</p>
            </Link>

            <Link
              href="/learn"
              className="bg-white border-2 border-gray-200 hover:border-teal-500 rounded-lg p-6 text-center transition-all hover:shadow-lg group"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-100 text-teal-600 rounded-full mb-4 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Justice & Courts</h3>
              <p className="text-gray-600 text-sm">Jan 6 Pardons, Supreme Court, Epstein Files, DOJ Politicization</p>
            </Link>

            <Link
              href="/learn"
              className="bg-white border-2 border-gray-200 hover:border-teal-500 rounded-lg p-6 text-center transition-all hover:shadow-lg group"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-100 text-teal-600 rounded-full mb-4 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Health & Environment</h3>
              <p className="text-gray-600 text-sm">Public Health, WHO Withdrawal, Climate Rollback, EPA Gutting</p>
            </Link>
          </div>
        </div>
      </section>

      {/* Guiding Principles */}
      <section className="py-16 bg-white border-t-2 border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
            Our Principles
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center font-bold text-xl">
                  1
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Primary Sources Only</h3>
                <p className="text-gray-600">
                  Federal Register, Congress.gov, court filings, .gov domains. No news media as primary sources.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center font-bold text-xl">
                  2
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Facts & Analysis Separated</h3>
                <p className="text-gray-600">
                  Readers always know what's verified vs. interpreted. Credibility through transparency.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold text-xl">
                  3
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Action Over Awareness</h3>
                <p className="text-gray-600">
                  Information without action is insufficient. Every issue has concrete next steps.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold text-xl">
                  4
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Non-Partisan Framing</h3>
                <p className="text-gray-600">
                  Focus on rights and principles, not party politics. One bad source undermines everything.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-12 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Ready to Make a Difference?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of informed citizens taking meaningful action.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/learn"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg transition-all text-lg"
            >
              Start Learning
            </Link>
            <Link
              href="/act"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg transition-all text-lg"
            >
              Take Action
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
