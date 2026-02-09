import Link from 'next/link'
import Image from 'next/image'

export function Hero() {
  return (
    <section className="relative bg-gradient-to-br from-gray-50 to-gray-100 border-b-4 border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="text-center max-w-4xl mx-auto mb-12">
          {/* Wordmark Logo */}
          <div className="flex justify-center mb-16">
            <div className="flex items-center gap-4 scale-[2] md:scale-[3]">
              <Image
                src="/logo-icon.svg"
                alt="Resist Project Logo"
                width={40}
                height={40}
                className="flex-shrink-0"
                priority
              />
              <div className="flex flex-col leading-tight text-left">
                <span className="text-xl font-black tracking-tight" style={{ color: '#F15A29' }}>
                  RESIST
                </span>
                <span className="text-xl font-black tracking-tight" style={{ color: '#F15A29' }}>
                  PROJECT
                </span>
              </div>
            </div>
          </div>

          <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
            Know the Facts.<br />Take Action.
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed">
            Understand government actions with verified primary sources.
            Take meaningful action with concrete, effective opportunities.
          </p>
        </div>

        {/* Clickable Cards: LEARN / ACT */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <Link
            href="/learn"
            className="bg-teal-600 hover:bg-teal-700 text-white p-8 rounded-lg shadow-lg transition-all hover:shadow-xl hover:scale-105 block"
          >
            <div className="flex items-center gap-3 mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-2xl font-bold">LEARN</h3>
            </div>
            <p className="text-teal-50">
              Every claim backed by primary sources: Federal Register, court filings, and official government documents.
            </p>
          </Link>

          <Link
            href="/act"
            className="bg-orange-600 hover:bg-orange-700 text-white p-8 rounded-lg shadow-lg transition-all hover:shadow-xl hover:scale-105 block"
          >
            <div className="flex items-center gap-3 mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
              </svg>
              <h3 className="text-2xl font-bold">ACT</h3>
            </div>
            <p className="text-orange-50">
              Concrete, low-barrier actions: call scripts, email templates, petitions, and organizations to join.
            </p>
          </Link>
        </div>
      </div>
    </section>
  )
}
