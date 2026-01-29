interface PageMetaProps {
  tags?: string[]
  lastUpdated: string
}

export function PageMeta({ tags, lastUpdated }: PageMetaProps) {
  return (
    <div className="mt-8 pt-4 border-t border-gray-200 text-sm text-gray-600">
      {tags && tags.length > 0 && (
        <p className="mb-2">
          <strong>Tags:</strong> {tags.join(' • ')}
        </p>
      )}
      <p className="mb-2">
        <strong>Last Updated:</strong> {lastUpdated}
      </p>
      <p>
        <strong>Sources Verified:</strong> {lastUpdated}
      </p>
    </div>
  )
}
