import Image from 'next/image'
import type { ReactNode } from 'react'

// `focus` is a CSS object-position, for photos whose subject isn't in the middle
type Photo = { src: string; alt: string; width: number; height: number; focus?: string }

// A photo cut to the logo's roofline. The rise scales with the photo's own width, so small
// and large photos share one slope. Without a photo it shows a neutral placement block,
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
  <div className={`@container relative ${className}`}>
    <div className="roof absolute inset-0 overflow-hidden bg-purple-tint [--roof-rise:13cqw]">
      {photo ? (
        <Image
          src={photo.src}
          alt={photo.alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
          style={photo.focus ? { objectPosition: photo.focus } : undefined}
        />
      ) : (
        <span className="absolute inset-0 flex items-center justify-center px-2 text-center text-sm text-mute">
          Photo goes here
        </span>
      )}
    </div>
  </div>
)

// A floating interface card over a roofline photo. Sits outside the clipped area so the card
// keeps its corners and shadow. On phones it sits below the photo and overlaps only its edge,
// so the photo stays visible.
export const PhotoWithCard = ({
  children,
  card,
  cardSide = 'right',
}: {
  children: ReactNode
  card: ReactNode
  cardSide?: 'left' | 'right'
}) => (
  <div className="relative md:pb-10">
    {children}
    <div
      className={`relative -mt-12 w-[min(21rem,calc(100%-2rem))] md:absolute md:bottom-0 md:mt-0 ${
        cardSide === 'right' ? 'mr-4 ml-auto md:-right-2 md:mr-0' : 'ml-4 md:-left-2 md:ml-0'
      }`}
    >
      {card}
    </div>
  </div>
)
