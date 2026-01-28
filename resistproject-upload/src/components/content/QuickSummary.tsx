interface QuickSummaryProps {
  children: React.ReactNode
  highlight?: string
}

export function QuickSummary({ children, highlight }: QuickSummaryProps) {
  return (
    <div className="bg-gray-100 p-6 border-l-4 border-gray-400">
      <h2 className="text-base font-bold text-gray-700 uppercase tracking-wide mb-4 !m-0 !p-0 !border-0 !bg-transparent">
        QUICK SUMMARY
      </h2>
      <div className="space-y-3 text-sm leading-relaxed text-gray-800">
        {children}
        {highlight && (
          <p className="font-bold text-gray-900 !mb-0 pt-2">
            {highlight}
          </p>
        )}
      </div>
    </div>
  )
}
