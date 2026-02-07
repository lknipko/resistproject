interface PageContentProps {
  children: React.ReactNode
}

export function PageContent({ children }: PageContentProps) {
  return (
    <div className="max-w-[1200px] mx-auto py-8 md:py-12">
      <div className="px-4 sm:px-6 md:px-12 lg:px-16">
        {children}
      </div>
    </div>
  )
}
