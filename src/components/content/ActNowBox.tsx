import Link from 'next/link'

interface ActNowBoxProps {
  href: string
  children: React.ReactNode
}

export function ActNowBox({ href, children }: ActNowBoxProps) {
  return (
    <Link
      href={href}
      className="block bg-orange text-white p-6 text-center hover:bg-orange-dark transition-all hover:-translate-y-1 no-underline"
    >
      <h2 className="text-3xl font-bold mb-2 !m-0 !mb-2 !p-0 !border-0 !bg-transparent !text-white">
        ACT NOW
      </h2>
      <div className="italic text-white/90 text-sm !mb-0">
        {children}
      </div>
    </Link>
  )
}
