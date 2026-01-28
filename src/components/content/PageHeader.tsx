import { cn } from '@/lib/utils'

interface PageHeaderProps {
  type: 'learn' | 'act'
}

export function PageHeader({ type }: PageHeaderProps) {
  return (
    <div
      className={cn(
        'w-full text-center py-2 px-4 text-white font-semibold text-sm tracking-widest uppercase',
        type === 'learn' ? 'bg-teal-dark' : 'bg-orange-dark'
      )}
    >
      <span>{type}</span>
    </div>
  )
}
