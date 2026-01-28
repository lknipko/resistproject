interface ContentSidebarProps {
  children: React.ReactNode
}

export function ContentSidebar({ children }: ContentSidebarProps) {
  return (
    <div className="sticky top-24 bg-white border-2 border-gray-300 p-6 h-fit self-start">
      <h3 className="text-base font-bold text-gray-900 uppercase tracking-wide mb-4 !m-0 !mb-4 !p-0 !border-0">
        CONTENTS
      </h3>
      <div className="text-sm leading-relaxed [&_ul]:list-none [&_ul]:pl-0 [&_ul_ul]:pl-6">
        {children}
      </div>
    </div>
  )
}
