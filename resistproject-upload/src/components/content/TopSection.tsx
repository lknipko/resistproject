interface TopSectionProps {
  children: React.ReactNode
}

export function TopSection({ children }: TopSectionProps) {
  return (
    <div className="grid md:grid-cols-[2fr_1fr] gap-6 mb-12">
      {children}
    </div>
  )
}
