interface StatBoxProps {
  number: string | number
  label: string
}

export function StatBox({ number, label }: StatBoxProps) {
  return (
    <div className="text-center p-4 bg-gray-100">
      <div className="text-3xl font-bold text-teal leading-none">{number}</div>
      <div className="text-xs text-gray-600 mt-2">{label}</div>
    </div>
  )
}
