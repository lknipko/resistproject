import Link from 'next/link'

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-teal-dark text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-xl font-bold hover:text-teal-light transition-colors">
            Resist Project
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/learn" className="hover:text-teal-light transition-colors font-medium">
              LEARN
            </Link>
            <Link href="/act" className="hover:text-teal-light transition-colors font-medium">
              ACT
            </Link>
            <Link href="/about" className="hover:text-teal-light transition-colors">
              About
            </Link>
          </nav>
          <button
            className="md:hidden text-white"
            aria-label="Open menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  )
}
