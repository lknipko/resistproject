import Link from 'next/link'
import Image from 'next/image'

interface LogoProps {
  variant?: 'icon' | 'wordmark'
  theme?: 'color' | 'white'
  className?: string
  linkToHome?: boolean
}

export default function Logo({
  variant = 'wordmark',
  theme = 'color',
  className = '',
  linkToHome = true
}: LogoProps) {
  const iconSrc = theme === 'white' ? '/logo-icon-white.svg' : '/logo-icon.svg'
  const textColor = theme === 'white' ? 'text-white' : 'text-gray-900'

  const logoContent = (
    <>
      {variant === 'icon' ? (
        <Image
          src={iconSrc}
          alt="Resist Project Logo"
          width={40}
          height={40}
          className={className}
          priority
        />
      ) : (
        <div className={`flex items-center gap-3 ${className}`}>
          <Image
            src={iconSrc}
            alt="Resist Project Logo"
            width={40}
            height={40}
            className="flex-shrink-0"
            priority
          />
          <div className="flex flex-col leading-tight">
            <span className={`text-xl font-black tracking-tight ${textColor}`}>
              RESIST
            </span>
            <span className={`text-xl font-black tracking-tight ${textColor}`}>
              PROJECT
            </span>
          </div>
        </div>
      )}
    </>
  )

  if (linkToHome) {
    return (
      <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
        {logoContent}
      </Link>
    )
  }

  return logoContent
}
