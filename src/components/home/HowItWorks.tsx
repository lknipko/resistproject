export function HowItWorks() {
  return (
    <section className="bg-gray-50 border-y-2 border-gray-200 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
          How It Works
        </h2>

        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-2 max-w-6xl mx-auto">
          {/* Step 1: Read Facts */}
          <div className="text-center flex-1">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-teal-600 text-white rounded-full mb-6 shadow-lg">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="mb-2">
              <span className="inline-block px-3 py-1 bg-teal-100 text-teal-800 text-xs font-bold rounded-full uppercase mb-3">
                Step 1
              </span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Read Verified Facts</h3>
            <p className="text-gray-600 leading-relaxed text-sm">
              Every claim backed by primary sources: Federal Register, court filings, and official documents.
            </p>
          </div>

          {/* Arrow */}
          <div className="hidden md:flex items-center justify-center flex-shrink-0 px-2">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </div>

          {/* Step 2: Understand Context */}
          <div className="text-center flex-1">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 text-white rounded-full mb-6 shadow-lg">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div className="mb-2">
              <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-full uppercase mb-3">
                Step 2
              </span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Understand Context</h3>
            <p className="text-gray-600 leading-relaxed text-sm">
              Analysis explains what actions mean, who's affected, and legal/policy context.
            </p>
          </div>

          {/* Arrow */}
          <div className="hidden md:flex items-center justify-center flex-shrink-0 px-2">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </div>

          {/* Step 3: Take Action */}
          <div className="text-center flex-1">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-600 text-white rounded-full mb-6 shadow-lg">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="mb-2">
              <span className="inline-block px-3 py-1 bg-orange-100 text-orange-800 text-xs font-bold rounded-full uppercase mb-3">
                Step 3
              </span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Take Effective Action</h3>
            <p className="text-gray-600 leading-relaxed text-sm">
              Concrete opportunities: call scripts, email templates, petitions, and organizations to join.
            </p>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600 font-semibold">
            Information without action is insufficient. Every issue has concrete next steps.
          </p>
        </div>
      </div>
    </section>
  )
}
