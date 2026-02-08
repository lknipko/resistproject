interface SourceLinkProps {
  href: string
  label?: string
  children?: React.ReactNode
}

export function SourceLink({ href, label, children }: SourceLinkProps) {
  // Extract text from URL if no label/children provided
  const getLabelFromUrl = (url: string) => {
    try {
      const urlObj = new URL(url)
      const hostname = urlObj.hostname.replace('www.', '')

      // Map common domains to friendly names
      const domainMap: Record<string, string> = {
        'aila.org': 'American Immigration Lawyers Association',
        'uscis.gov': 'U.S. Citizenship and Immigration Services',
        'supremecourt.gov': 'Supreme Court of the United States',
        'lwv.org': 'League of Women Voters',
        'federalregister.gov': 'Federal Register',
        'congress.gov': 'Congress.gov',
        'law.umich.edu': 'University of Michigan Law School',
        'michigan.law.umich.edu': 'Michigan Law Review',
      }

      return domainMap[hostname] || hostname
    } catch {
      return 'View Source'
    }
  }

  const displayText = children || label || getLabelFromUrl(href)

  return (
    <p className="text-right text-sm italic text-gray-600 mt-2 !mb-4">
      <em>Source:</em>{' '}
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-link hover:text-link-hover underline font-medium"
      >
        {displayText}
      </a>
    </p>
  )
}
