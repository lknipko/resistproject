interface ActionsSectionProps {
  children: React.ReactNode
  section?: string
  title?: string
}

export function ActionsSection({ children, section = 'learn', title }: ActionsSectionProps) {
  const displayTitle = title ?? 'Actions'
  const isEnv = section === 'environment'

  const headingColor = isEnv ? 'text-forest-800' : 'text-orange-dark'
  const borderColor = isEnv ? 'border-forest-600' : 'border-orange'
  const h3Border = isEnv ? '[&_h3]:border-forest-600' : '[&_h3]:border-orange'

  return (
    <div className="mt-12 mb-8 actions-section">
      <h2
        id={displayTitle.toLowerCase().replace(/\s+/g, '-')}
        className={`text-2xl sm:text-3xl font-bold ${headingColor} uppercase mb-2 outdent`}
      >
        {displayTitle}
      </h2>
      <p className={`text-sm italic text-gray-600 mb-6 border-b-2 ${borderColor} pb-6 outdent`}>
        {displayTitle.toLowerCase().includes('sustained')
          ? 'Ongoing actions requiring more time commitment'
          : 'Complete these in under 5 minutes'}
      </p>
      <div className={`mt-6 ${h3Border} [&_h3:first-child]:border-t-0 [&_h3:first-child]:pt-0 [&_hr]:hidden`}>
        {children}
      </div>
    </div>
  )
}
