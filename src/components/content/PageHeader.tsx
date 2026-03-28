import Link from 'next/link'
import { cn } from '@/lib/utils'

interface PageHeaderProps {
  type: 'learn' | 'act'
}

export function PageHeader({ type }: PageHeaderProps) {
  return (
    <Link
      href={type === 'learn' ? '/learn' : '/act'}
      className={cn(
        'block w-full text-center py-2 px-4 text-white font-semibold text-sm tracking-widest uppercase hover:opacity-90 transition-opacity',
        type === 'learn' ? 'bg-steel-600' : 'bg-orange-dark'
      )}
    >
      {type}
    </Link>
  )
}
