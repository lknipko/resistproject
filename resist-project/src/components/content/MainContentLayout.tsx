interface MainContentLayoutProps {
  children: React.ReactNode
  sidebar?: React.ReactNode
}

export function MainContentLayout({ children, sidebar }: MainContentLayoutProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[1fr_250px] gap-12">
      <div className="min-w-0">
        {children}
      </div>
      {sidebar && (
        <div className="hidden md:block">
          {sidebar}
        </div>
      )}
    </div>
  )
}
