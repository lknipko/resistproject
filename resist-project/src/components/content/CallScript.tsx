interface CallScriptProps {
  children: React.ReactNode
}

export function CallScript({ children }: CallScriptProps) {
  return (
    <div className="bg-gray-100 border-l-4 border-orange p-6 my-6 relative">
      <div className="text-xs font-bold text-orange tracking-wider mb-3">SCRIPT</div>
      <div className="text-gray-800">{children}</div>
    </div>
  )
}
