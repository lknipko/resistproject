import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-12 mt-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="text-white font-semibold mb-4">Resist Project</h3>
            <p className="text-sm">
              Empowering citizens with fact-based information and concrete action opportunities for civic engagement.
            </p>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">Navigate</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/learn" className="hover:text-white transition-colors">LEARN</Link></li>
              <li><Link href="/act" className="hover:text-white transition-colors">ACT</Link></li>
              <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
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
        <div className="border-t border-gray-700 pt-8 text-sm text-center">
          <p>&copy; {new Date().getFullYear()} Resist Project. All sources are publicly verified.</p>
        </div>
      </div>
    </footer>
  )
}
