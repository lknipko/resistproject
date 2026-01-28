interface FactsSubheadingProps {
  children: React.ReactNode
  id?: string
}

export function FactsSubheading({ children, id }: FactsSubheadingProps) {
  return (
    <h3 id={id} className="text-xl font-bold text-gray-900 mt-8 mb-4 pt-4 border-t-2 border-teal -ml-12">
      {children}
    </h3>
  )
}
