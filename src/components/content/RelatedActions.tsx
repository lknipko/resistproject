interface RelatedActionsProps {
  children: React.ReactNode
}

export function RelatedActions({ children }: RelatedActionsProps) {
  return (
    <div className="bg-gray-100 p-6 my-8 border-l-4 border-orange">
      <h3 className="text-orange font-semibold mb-4 !mt-0 !ml-0 !border-0 !p-0">
        Related Actions
      </h3>
      <div className="text-gray-800 [&_h3]:ml-0 [&_h2]:ml-0">{children}</div>
    </div>
  )
}
