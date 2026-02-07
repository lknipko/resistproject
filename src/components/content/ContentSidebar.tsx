interface ContentSidebarProps {
  children: React.ReactNode
}

export function ContentSidebar({ children }: ContentSidebarProps) {
  return (
    <div className="bg-gray-50 md:bg-white border border-gray-300 md:border-2 p-4 md:p-6 md:sticky md:top-24 h-fit md:self-start rounded-md">
      <h3 className="text-sm md:text-base font-bold text-gray-900 uppercase tracking-wide mb-3 md:mb-4 !m-0 !mb-3 md:!mb-4 !p-0 !border-0">
        CONTENTS
      </h3>
      <div className="text-xs md:text-sm leading-relaxed [&_ul]:list-none [&_ul]:pl-0 [&_ul_ul]:pl-4 md:[&_ul_ul]:pl-6">
        {children}
      </div>
    </div>
  )
}
