interface AnalysisSectionProps {
  children: React.ReactNode
}

export function AnalysisSection({ children }: AnalysisSectionProps) {
  return (
    <div className="mt-12 mb-8 analysis-section">
      <h2 className="text-2xl sm:text-3xl font-bold text-orange uppercase mb-2 outdent">
        ANALYSIS
      </h2>
      <p className="text-sm italic text-gray-600 mb-6 border-b-2 border-orange pb-6 outdent">
        This section provides context and interpretation of the facts above.
      </p>
      <div className="mt-6 [&_h3]:border-orange [&_h3:first-child]:border-t-0 [&_h3:first-child]:pt-0">
        {children}
      </div>
    </div>
  )
}
