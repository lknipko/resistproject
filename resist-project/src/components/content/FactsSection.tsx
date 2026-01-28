interface FactsSectionProps {
  children: React.ReactNode
}

export function FactsSection({ children }: FactsSectionProps) {
  return (
    <div className="bg-teal-light py-8 pl-8 pr-12 -ml-16 mb-12 rounded-sm">
      <h2 className="text-3xl font-bold text-teal-dark uppercase mb-2">
        FACTS
      </h2>
      <p className="text-sm italic text-gray-600 mb-6">
        This section contains only verifiable, primary-sourced information.
      </p>
      <div className="pl-8 [&_h3]:border-teal [&_h3]:-ml-8">
        {children}
      </div>
    </div>
  )
}
