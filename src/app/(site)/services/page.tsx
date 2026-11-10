import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ButtonLink } from '@/components/ui/Button'
import { DraftRibbon } from '@/components/ui/DraftRibbon'
import { RoofPhoto } from '@/components/ui/RoofPhoto'
import { SERVICE_PAGES } from '@/content/services'
import { showDrafts } from '@/lib/drafts'

const reviewed = true

export const metadata: Metadata = {
  title: 'Services',
  description:
    'Property management, valuation and real estate agency across Kenya from Deems Luxe Homes, for owners at home and abroad.',
}

export default function ServicesPage() {
  if (!reviewed && !showDrafts) notFound()

  return (
    <>
      {reviewed ? null : <DraftRibbon note="Services copy" />}

      <section className="page-gutter pt-10 pb-12 md:pt-16 md:pb-16">
        <h1 className="text-h1 max-w-3xl">Services for property owners, buyers and tenants</h1>
        <p className="text-lead mt-5 max-w-2xl text-mute">
          Beyond finding property, Deems manages, values and sells it, anywhere in Kenya and for owners abroad.
        </p>
      </section>

      <ul className="page-gutter grid gap-20 pb-20 md:gap-28 md:pb-28">
        {SERVICE_PAGES.map((page, index) => (
          <li key={page.slug} className="grid items-center gap-8 md:grid-cols-2 md:gap-12 lg:gap-20">
            <div className={index % 2 ? 'md:order-2' : ''}>
              <RoofPhoto
                photo={page.photo}
                priority={index === 0}
                sizes="(min-width: 768px) 50vw, 100vw"
                className="aspect-[4/3]"
              />
            </div>
            <div>
              <h2 className="text-h2">
                <Link href={`/services/${page.slug}`} className="underline-offset-4 hover:underline">
                  {page.title}
                </Link>
              </h2>
              <p className="text-lead mt-4 text-mute">{page.lead}</p>
              <ul className="mt-6 grid gap-2">
                {page.included[0].items.slice(0, 4).map((item) => (
                  <li key={item} className="grid grid-cols-[1.25rem_1fr] gap-2">
                    <span aria-hidden className="mt-2.5 size-2 rotate-45 bg-purple" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex flex-wrap gap-3">
                <ButtonLink href={`/services/${page.slug}`}>{`Explore ${page.title.toLowerCase()}`}</ButtonLink>
                <ButtonLink href={`/services/${page.slug}#quote`} variant="outline">
                  {page.formTitle}
                </ButtonLink>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <section aria-labelledby="looking" className="roof on-dark bg-ink">
        <div className="page-gutter grid gap-6 pt-24 pb-16 md:grid-cols-[1fr_auto] md:items-end md:pt-32 md:pb-20">
          <div className="max-w-2xl">
            <h2 id="looking" className="text-h1 text-white">
              Looking to buy or rent?
            </h2>
            <p className="text-lead mt-4 text-mute-on-dark">
              Tell us what you want, and a Deems agent brings you options that fit.
            </p>
          </div>
          <ButtonLink href="/post-a-request" variant="accent" size="lg">
            Post a Request
          </ButtonLink>
        </div>
      </section>
    </>
  )
}
