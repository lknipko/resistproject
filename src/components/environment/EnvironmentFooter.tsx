import Link from 'next/link'

export default function EnvironmentFooter() {
  return (
    <footer className="bg-forest-900 text-forest-300 py-12 mt-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="text-white font-semibold mb-4">Our Home</h3>
            <p className="text-sm">
              Track environmental rollbacks, protect public lands, and take action for clean air, water, and wildlife.
            </p>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">Navigate</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/environment" className="hover:text-white transition-colors">All Topics</Link></li>
              <li><Link href="/" className="hover:text-white transition-colors">Main Site</Link></li>
              <li><Link href="/learn" className="hover:text-white transition-colors">Learn</Link></li>
              <li><Link href="/act" className="hover:text-white transition-colors">Act</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">Contact</h3>
            <p className="text-sm">
              Questions or corrections?<br />
              Email: <a href="mailto:info@resistproject.com" className="hover:text-white transition-colors">info@resistproject.com</a>
            </p>
          </div>
        </div>
        <div className="border-t border-forest-800 pt-8 text-sm text-center">
          <p>&copy; {new Date().getFullYear()} Resist Project &mdash; Our Home. All sources are publicly verified.</p>
        </div>
      </div>
    </footer>
  )
}
