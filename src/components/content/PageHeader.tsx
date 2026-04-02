import Link from 'next/link'
import { cn } from '@/lib/utils'

interface PageHeaderProps {
  type: 'learn' | 'act' | 'environment'
}

const sectionConfig: Record<string, { href: string; bg: string }> = {
  learn: { href: '/learn', bg: 'bg-steel-600' },
  act: { href: '/act', bg: 'bg-orange-dark' },
  environment: { href: '/environment', bg: 'bg-forest-700' },
}

export function PageHeader({ type }: PageHeaderProps) {
  const config = sectionConfig[type] ?? sectionConfig.learn
  return (
    <Link
      href={config.href}
      className={cn(
        'block w-full text-center py-2 px-4 text-white font-semibold text-sm tracking-widest uppercase hover:opacity-90 transition-opacity',
        config.bg
      )}
    >
      {type}
    </Link>
  )
}
