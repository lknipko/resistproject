import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'urgent' | 'high' | 'medium' | 'low'
}

export function Badge({ children, variant = 'urgent' }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-block text-xs font-bold px-2 py-1 rounded uppercase tracking-wide',
        variant === 'urgent' && 'bg-red-600 text-white',
        variant === 'high' && 'bg-orange text-white',
        variant === 'medium' && 'bg-teal text-white',
        variant === 'low' && 'bg-gray-400 text-white'
      )}
    >
      {children}
    </span>
  )
}
