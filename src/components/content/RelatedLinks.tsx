interface RelatedLinksProps {
  children: React.ReactNode
}

export function RelatedLinks({ children }: RelatedLinksProps) {
  return (
    <div className="bg-steel-50 p-6 my-8 border-l-4 border-steel-600">
      <h3 className="text-steel-600 font-semibold mb-4 !mt-0 !ml-0 !border-0 !p-0">
        Related Information
      </h3>
      <div className="text-gray-800 [&_h3]:ml-0 [&_h2]:ml-0">{children}</div>
    </div>
  )
}
