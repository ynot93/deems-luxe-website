import Link from 'next/link'
import type { ComponentProps, ReactNode } from 'react'
import { RoofPhoto } from './RoofPhoto'

type Photo = NonNullable<ComponentProps<typeof RoofPhoto>['photo']>

export const Badge = ({
  tone = 'gold',
  children,
}: {
  tone?: 'gold' | 'purple'
  children: string
}) => (
  <span
    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
      tone === 'gold' ? 'bg-gold text-ink' : 'bg-purple-tint text-purple'
    }`}
  >
    {children}
  </span>
)

// Illustrates the product in hero and feature images. Always badged "Example", because
// Phase 1 has no live requests and this must not read as real data.
export const ExampleCard = ({ title, children }: { title: string; children: ReactNode }) => (
  <div className="rounded-card bg-white p-5 shadow-float">
    <Badge>Example</Badge>
    <p className="text-h3 mt-3 text-ink">{title}</p>
    <div className="mt-3 text-sm">{children}</div>
  </div>
)

export const ExampleRequestCard = ({
  title,
  location,
  budget,
  timing,
}: {
  title: string
  location: string
  budget: string
  timing: string
}) => (
  <ExampleCard title={title}>
    <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
      <dt className="text-mute">Where</dt>
      <dd className="font-medium">{location}</dd>
      <dt className="text-mute">Budget</dt>
      <dd className="font-medium">{budget}</dd>
      <dt className="text-mute">When</dt>
      <dd className="font-medium">{timing}</dd>
    </dl>
  </ExampleCard>
)

export const ServiceCard = ({
  title,
  description,
  href,
  linkLabel,
  photo,
}: {
  title: string
  description: string
  href: string
  linkLabel: string
  photo?: Photo
}) => (
  <div className="grid grid-cols-[6.5rem_1fr] gap-4 sm:grid-cols-[9rem_1fr] sm:gap-6 lg:grid-cols-1 lg:gap-5">
    <RoofPhoto
      photo={photo}
      sizes="(min-width: 1024px) 33vw, 144px"
      className="aspect-[4/5] lg:aspect-[3/2]"
    />
    <div>
      <h3 className="text-h3">{title}</h3>
      <p className="mt-2 text-[0.9375rem] text-mute">{description}</p>
      <Link href={href} className="mt-3 inline-block font-semibold text-purple underline-offset-4 hover:underline">
        {linkLabel}
      </Link>
    </div>
  </div>
)

export const ArticleCard = ({
  title,
  excerpt,
  href,
  photo,
}: {
  title: string
  excerpt: string
  href: string
  photo?: Photo
}) => (
  <article>
    <RoofPhoto photo={photo} sizes="(min-width: 768px) 33vw, 100vw" className="aspect-[3/2]" />
    <h3 className="text-h3 mt-4">
      <Link href={href} className="underline-offset-4 hover:underline">
        {title}
      </Link>
    </h3>
    <p className="mt-2 text-[0.9375rem] text-mute">{excerpt}</p>
  </article>
)

export const AudienceCard = ({
  title,
  description,
  href,
  linkLabel,
}: {
  title: string
  description: string
  href: string
  linkLabel: string
}) => (
  <div className="flex flex-col rounded-card bg-white/10 p-6 md:p-8">
    <h3 className="text-h3 text-white">{title}</h3>
    <p className="mt-2 grow text-mute-on-dark">{description}</p>
    <Link href={href} className="mt-5 font-semibold text-gold underline-offset-4 hover:underline">
      {linkLabel}
    </Link>
  </div>
)
