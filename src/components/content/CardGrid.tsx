interface CardGridProps {
  children: React.ReactNode
}

export function CardGrid({ children }: CardGridProps) {
  return (
    <div className="grid md:grid-cols-2 gap-6 my-6">
      {children}
    </div>
  )
}
