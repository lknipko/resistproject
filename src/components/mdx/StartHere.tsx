'use client'

export function StartHere({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-8 rounded-xl border-2 border-orange-400 bg-gradient-to-br from-orange-50 to-amber-50 p-5 sm:p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-600 text-white text-sm font-bold rounded-full shrink-0">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Start Here
        </span>
        <span className="text-sm text-gray-500">Recommended first action</span>
      </div>
      <div className="[&>h3]:mt-0 [&>h3]:border-t-0 [&>h3]:pt-0">{children}</div>
    </div>
  )
}
