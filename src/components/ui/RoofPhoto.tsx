import Image from 'next/image'
import type { ReactNode } from 'react'

type Photo = { src: string; alt: string; width: number; height: number }

// A photo cut to the logo's roofline. Without a photo it shows a neutral placement block,
// so a missing image is obvious in review.
export const RoofPhoto = ({
  photo,
  sizes = '100vw',
  priority = false,
  className = 'aspect-[4/3]',
}: {
  photo?: Photo
  sizes?: string
  priority?: boolean
  className?: string
}) => (
  <div className={`roof relative overflow-hidden bg-purple-tint ${className}`}>
    {photo ? (
      <Image
        src={photo.src}
        alt={photo.alt}
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover"
      />
    ) : (
      <span className="absolute inset-0 flex items-center justify-center px-2 text-center text-sm text-mute">
        Photo goes here
      </span>
    )}
  </div>
)

// A floating interface card over a roofline photo. Sits outside the clipped area so the card
// keeps its corners and shadow. On phones it overlaps the bottom edge instead of the side.
export const PhotoWithCard = ({
  children,
  card,
  cardSide = 'right',
}: {
  children: ReactNode
  card: ReactNode
  cardSide?: 'left' | 'right'
}) => (
  <div className="relative pb-32 md:pb-10">
    {children}
    <div
      className={`absolute bottom-0 w-[min(21rem,calc(100%-2rem))] ${
        cardSide === 'right' ? 'right-4 md:-right-2' : 'left-4 md:-left-2'
      }`}
    >
      {card}
    </div>
  </div>
)
