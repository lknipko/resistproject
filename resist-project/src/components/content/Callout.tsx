import { cn } from '@/lib/utils'

interface CalloutProps {
  children: React.ReactNode
  variant?: 'info' | 'warning' | 'success'
  title?: string
}

export function Callout({ children, variant = 'info', title }: CalloutProps) {
  return (
    <div
      className={cn(
        'p-6 my-6 rounded border-l-4',
        variant === 'info' && 'bg-teal-light border-teal',
        variant === 'warning' && 'bg-orange-light/20 border-orange',
        variant === 'success' && 'bg-green-50 border-green-500'
      )}
    >
      {title && (
        <h4 className="font-semibold text-gray-900 mb-2 !mt-0">{title}</h4>
      )}
      <div className="text-gray-800">{children}</div>
    </div>
  )
}
