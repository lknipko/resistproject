interface ContentLayoutProps {
  children: React.ReactNode
  sidebar?: React.ReactNode
}

export function ContentLayout({ children, sidebar }: ContentLayoutProps) {
  return (
    <div className="grid md:grid-cols-[1fr_280px] gap-8">
      <div className="max-w-[900px]">{children}</div>
      {sidebar && <div className="hidden md:block">{sidebar}</div>}
    </div>
  )
}
