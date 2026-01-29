interface DefinitionListProps {
  children: React.ReactNode
}

export function DefinitionList({ children }: DefinitionListProps) {
  return <div className="space-y-4 my-6">{children}</div>
}
