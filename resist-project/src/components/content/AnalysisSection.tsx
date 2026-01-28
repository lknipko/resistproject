interface AnalysisSectionProps {
  children: React.ReactNode
}

export function AnalysisSection({ children }: AnalysisSectionProps) {
  return (
    <div className="mt-12 mb-8 analysis-section">
      <h2 className="text-3xl font-bold text-orange uppercase mb-2 -ml-16">
        ANALYSIS
      </h2>
      <p className="text-sm italic text-gray-600 mb-6 -ml-16">
        This section provides context and interpretation of the facts above.
      </p>
      <div className="[&_h3]:border-orange">
        {children}
      </div>
    </div>
  )
}
