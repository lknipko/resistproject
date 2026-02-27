interface SectionIntroProps {
  children: React.ReactNode
}

export function SectionIntro({ children }: SectionIntroProps) {
  return (
    <div className="text-sm italic text-gray-600 mb-6">
      {children}
    </div>
  )
}
