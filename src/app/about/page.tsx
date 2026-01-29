export const metadata = {
  title: 'About',
  description: 'About Resist Project - Fact-based civic engagement platform',
}

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">
        About Resist Project
      </h1>

      <div className="prose prose-lg max-w-none">
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Our Mission
          </h2>
          <p className="text-gray-700 mb-4">
            Resist Project is a civic engagement platform designed to help citizens understand
            government actions and take meaningful, concrete action. We focus on verified facts
            with primary sources and actionable opportunities for civic participation.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            What We Do
          </h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Provide fact-based information about government actions</li>
            <li>Link directly to primary sources (executive orders, court filings, official documents)</li>
            <li>Offer concrete, low-barrier action opportunities</li>
            <li>Enable community contribution while maintaining high credibility standards</li>
            <li>Focus on material resistance and consequences, not just awareness</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Our Principles
          </h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900">Credibility First</h3>
              <p className="text-gray-700">
                Every factual claim is backed by primary sources. We prioritize federal documents,
                court filings, and official government statements over news coverage.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Action-Oriented</h3>
              <p className="text-gray-700">
                Every issue has concrete next steps. We focus on actions that have material impact,
                not just symbolic gestures.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Community-Driven</h3>
              <p className="text-gray-700">
                Contributors can propose edits through our collaborative editing system.
                Community voting and moderator review ensure quality.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Non-Partisan Framing</h3>
              <p className="text-gray-700">
                We focus on rights and principles, not party politics. Our goal is to inform
                and empower, not to persuade to a particular ideology.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            How It Works
          </h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900">LEARN Section</h3>
              <p className="text-gray-700">
                Information organized by issue areas. Each page separates FACTS (objective,
                verifiable, primary-sourced) from ANALYSIS (interpretation, context, explanation).
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">ACT Section</h3>
              <p className="text-gray-700">
                Action opportunities from quick actions (under 5 minutes) to sustained engagement.
                Each action includes templates, scripts, and step-by-step guides.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Collaborative Editing</h3>
              <p className="text-gray-700">
                Verified users can propose edits. Community voting and moderator review ensure
                quality while enabling rapid updates. Users gain reputation and tier up through
                quality contributions.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Get Involved
          </h2>
          <p className="text-gray-700 mb-4">
            Want to contribute? Create an account to:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Propose edits to content pages</li>
            <li>Vote on community submissions</li>
            <li>Gain reputation through quality contributions</li>
            <li>Become a trusted moderator</li>
          </ul>
          <p className="text-gray-700 mt-4">
            All content is publicly accessible. Authentication is only required for contributors.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Contact
          </h2>
          <p className="text-gray-700">
            Questions or feedback? Email us at{' '}
            <a href="mailto:contact@resistproject.com" className="text-teal-600 hover:text-teal-700">
              contact@resistproject.com
            </a>
          </p>
        </section>
      </div>
    </div>
  )
}
