interface MainContentLayoutProps {
  children: React.ReactNode
  sidebar?: React.ReactNode
}

export function MainContentLayout({ children, sidebar }: MainContentLayoutProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[1fr_250px] gap-12">
      <div className="min-w-0">
        {/* Mobile TOC - show at top */}
        {sidebar && (
          <div className="md:hidden mb-8">
            {sidebar}
          </div>
        )}

        {children}
      </div>

      {/* Desktop TOC - show in sidebar */}
      {sidebar && (
        <div className="hidden md:block">
          {sidebar}
        </div>
      )}
    </div>
  )
}
