interface FactsSectionProps {
  children: React.ReactNode
}

export function FactsSection({ children }: FactsSectionProps) {
  return (
    <div className="bg-teal-light py-6 px-6 sm:py-8 sm:px-8 md:px-10 outdent mb-12 rounded-sm">
      <h2 className="text-2xl sm:text-3xl font-bold text-teal-dark uppercase mb-2">
        FACTS
      </h2>
      <p className="text-sm italic text-gray-600 mb-6 border-b-2 border-teal-dark pb-6">
        This section contains only verifiable, primary-sourced information.
      </p>
      <div className="mt-6
        [&_h2]:ml-0 [&_h2]:border-teal
        [&_h3]:ml-0 [&_h3]:border-teal [&_h3]:pt-6 [&_h3]:mt-6
        [&_h3:first-child]:mt-0 [&_h3:first-child]:pt-0 [&_h3:first-child]:border-t-0
        [&_h4]:ml-0
        [&_hr]:hidden
        [&_p]:ml-4 [&_p]:sm:ml-6 [&_p]:md:ml-8
        [&_ul]:ml-4 [&_ul]:sm:ml-6 [&_ul]:md:ml-8
        [&_ol]:ml-4 [&_ol]:sm:ml-6 [&_ol]:md:ml-8
        [&_blockquote]:ml-4 [&_blockquote]:sm:ml-6 [&_blockquote]:md:ml-8
        [&_table]:ml-0 [&_table]:max-w-full [&_table]:overflow-x-auto">
        {children}
      </div>
    </div>
  )
}
