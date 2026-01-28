interface StatsGridProps {
  children: React.ReactNode
}

export function StatsGrid({ children }: StatsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
      {children}
    </div>
  )
}
