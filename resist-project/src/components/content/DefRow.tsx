interface DefRowProps {
  term: string
  children: React.ReactNode
}

export function DefRow({ term, children }: DefRowProps) {
  return (
    <div className="grid md:grid-cols-[200px_1fr] gap-4 pb-4 border-b border-gray-200 last:border-0">
      <div className="font-semibold text-teal md:text-right">{term}</div>
      <div className="text-gray-800">{children}</div>
    </div>
  )
}
