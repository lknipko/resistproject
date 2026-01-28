interface RelatedLinksProps {
  children: React.ReactNode
}

export function RelatedLinks({ children }: RelatedLinksProps) {
  return (
    <div className="bg-teal-light p-6 my-8 border-l-4 border-teal">
      <h3 className="text-teal font-semibold mb-4 !mt-0 !border-0 !p-0">
        Related Information
      </h3>
      <div className="text-gray-800">{children}</div>
    </div>
  )
}
