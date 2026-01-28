import Link from 'next/link'
import { cn } from '@/lib/utils'

interface ButtonProps {
  href: string
  children: React.ReactNode
  variant?: 'primary' | 'secondary'
}

export function Button({ href, children, variant = 'primary' }: ButtonProps) {
  return (
    <Link
      href={href}
      className={cn(
        'inline-block px-6 py-3 rounded font-semibold transition-colors no-underline mr-2 mb-2',
        variant === 'primary' && 'bg-orange text-white hover:bg-orange-dark',
        variant === 'secondary' && 'bg-teal text-white hover:bg-teal-dark'
      )}
    >
      {children}
    </Link>
  )
}
