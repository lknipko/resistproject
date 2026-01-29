import { cn } from '@/lib/utils'

interface CardProps {
  children: React.ReactNode
  variant?: 'default' | 'teal' | 'orange'
}

export function Card({ children, variant = 'default' }: CardProps) {
  return (
    <div
      className={cn(
        'p-6 rounded',
        variant === 'teal' && 'bg-teal-light border-l-4 border-teal',
        variant === 'orange' && 'bg-orange-light/20 border-l-4 border-orange',
        variant === 'default' && 'bg-gray-100 border border-gray-200'
      )}
    >
      {children}
    </div>
  )
}
