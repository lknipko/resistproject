import Link from 'next/link'

interface ActNowBottomProps {
  href: string
  label: string
}

export function ActNowBottom({ href, label }: ActNowBottomProps) {
  return (
    <div className="max-w-lg mx-auto my-12 bg-orange text-white p-8 text-center hover:bg-orange-dark transition-all hover:-translate-y-1">
      <Link href={href} className="block text-white no-underline">
        <h2 className="text-4xl font-bold mb-3 !text-white !m-0 !mb-3 !p-0 !border-0 !bg-transparent">
          ACT NOW
        </h2>
        <p className="italic text-white/90 !mb-0">{label}</p>
      </Link>
    </div>
  )
}
