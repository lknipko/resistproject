interface PageContentProps {
  children: React.ReactNode
}

export function PageContent({ children }: PageContentProps) {
  return (
    <div className="max-w-[1400px] mx-auto py-8 md:py-12">
      <div className="px-4 sm:px-6 md:px-8 lg:px-12">
        {children}
      </div>
    </div>
  )
}
