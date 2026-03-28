import { AutoSidebar } from './AutoSidebar'

interface MainContentLayoutProps {
  children: React.ReactNode
  sidebar?: React.ReactNode
}

export function MainContentLayout({ children, sidebar }: MainContentLayoutProps) {
  const sidebarContent = sidebar || <AutoSidebar />

  return (
    <div className="grid grid-cols-1 md:grid-cols-[1fr_280px] gap-6 md:gap-8 md:pl-4 lg:pl-8">
      <div className="min-w-0">
        {children}
      </div>

      {/* Desktop TOC only — FloatingTOC handles mobile */}
      <div className="hidden md:block">
        {sidebarContent}
      </div>
    </div>
  )
}
