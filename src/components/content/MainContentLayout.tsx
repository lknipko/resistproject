import { AutoSidebar } from './AutoSidebar'

interface MainContentLayoutProps {
  children: React.ReactNode
  sidebar?: React.ReactNode
}

export function MainContentLayout({ children, sidebar }: MainContentLayoutProps) {
  const sidebarContent = sidebar || <AutoSidebar />

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8 lg:gap-12 lg:pl-16 xl:pl-24">
      <div className="min-w-0">
        {children}
      </div>

      {/* Desktop TOC only — FloatingTOC handles smaller screens */}
      <div className="hidden lg:block">
        {sidebarContent}
      </div>
    </div>
  )
}
