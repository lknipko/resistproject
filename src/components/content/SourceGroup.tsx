interface SourceGroupProps {
  sources: string // JSON string: [{href, label}, ...]
}

export function SourceGroup({ sources: sourcesJSON }: SourceGroupProps) {
  const sources = JSON.parse(sourcesJSON) as Array<{ href: string; label: string }>

  return (
    <div className="text-right text-sm italic text-gray-600 mt-2 mb-4">
      <em>Sources:</em>{' '}
      {sources.map((source, i) => (
        <span key={i}>
          {i > 0 && ', '}
          <a
            href={source.href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-link hover:text-link-hover underline font-medium"
          >
            {source.label}
          </a>
        </span>
      ))}
    </div>
  )
}
