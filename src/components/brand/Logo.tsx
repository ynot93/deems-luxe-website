import Image from 'next/image'

const brand = { purple: '#3F07C3', gold: '#FFC900', white: '#FFFFFF' }

// Traced from the logo PNG. Replace with the source vector when it is added to public/brand/.
export const LogoMark = ({
  reversed = false,
  className,
}: {
  reversed?: boolean
  className?: string
}) => (
  <svg viewBox="0 0 1043 875" className={className} aria-hidden="true" focusable="false">
    <path
      fill={reversed ? brand.white : brand.purple}
      fillRule="evenodd"
      d="M0 215 529 0v875H79V241ZM227 257v467l155-55V197Z"
    />
    <path fill={brand.gold} d="M565 0l166 95v622h312v158H565Z" />
  </svg>
)

export const Logo = ({
  reversed = false,
  compactOnPhones = false,
  className,
}: {
  reversed?: boolean
  // Drops the wordmark on narrow screens so the header keeps room for its button
  compactOnPhones?: boolean
  className?: string
}) => (
  <span className={`inline-flex items-center gap-2.5 ${className ?? ''}`}>
    <LogoMark reversed={reversed} className="h-9 w-auto shrink-0 md:h-10" />
    <Image
      src={reversed ? '/brand/wordmark-reversed.png' : '/brand/wordmark.png'}
      alt="Deems Luxe Homes Limited"
      width={720}
      height={148}
      className={`h-8 w-auto md:h-9 ${compactOnPhones ? 'max-sm:hidden' : ''}`}
      priority
    />
  </span>
)
