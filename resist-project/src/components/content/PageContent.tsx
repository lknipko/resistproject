interface PageContentProps {
  children: React.ReactNode
}

export function PageContent({ children }: PageContentProps) {
  return (
    <div className="max-w-[1200px] mx-auto py-12">
      <div className="pl-16 pr-8">
        {children}
      </div>
    </div>
  )
}
