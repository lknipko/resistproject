import Link from 'next/link'

interface LearnMoreBoxProps {
  href: string
  children: React.ReactNode
}

export function LearnMoreBox({ href, children }: LearnMoreBoxProps) {
  return (
    <Link
      href={href}
      className="block bg-teal text-white p-6 text-center hover:bg-teal-dark transition-all hover:-translate-y-1 no-underline"
    >
      <h2 className="text-3xl font-bold mb-2 !m-0 !mb-2 !p-0 !border-0 !bg-transparent !text-white">
        LEARN MORE
      </h2>
      <p className="italic text-white/90 text-sm !mb-0">
        {children}
      </p>
    </Link>
  )
}
