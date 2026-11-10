import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { QuoteForm } from '@/components/forms/QuoteForm'
import { ButtonLink } from '@/components/ui/Button'
import { DraftRibbon } from '@/components/ui/DraftRibbon'
import { RoofPhoto } from '@/components/ui/RoofPhoto'
import { SERVICE_PAGES, servicePage } from '@/content/services'
import { showDrafts } from '@/lib/drafts'

const reviewed = true

type Props = { params: Promise<{ slug: string }> }

export const dynamicParams = false
export const generateStaticParams = () => SERVICE_PAGES.map(({ slug }) => ({ slug }))

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = servicePage((await params).slug)
  return page ? { title: page.title, description: page.description } : {}
}

export default async function ServicePage({ params }: Props) {
  const page = servicePage((await params).slug)
  if (!page || (!reviewed && !showDrafts)) notFound()

  return (
    <>
      {reviewed ? null : <DraftRibbon note={`${page.title} copy`} />}

      <section className="page-gutter grid gap-10 pt-8 pb-16 md:pt-12 lg:grid-cols-2 lg:items-center lg:gap-16 lg:pb-24">
        <div>
          <Link href="/services" className="text-sm font-semibold text-purple underline-offset-4 hover:underline">
            Services
          </Link>
          <h1 className="text-h1 mt-3">{page.title}</h1>
          <p className="text-lead mt-5 max-w-xl text-mute">{page.lead}</p>
          <div className="mt-8">
            <ButtonLink href="#quote" size="lg">
              {page.formTitle}
            </ButtonLink>
          </div>
        </div>
        <RoofPhoto photo={page.photo} priority sizes="(min-width: 1024px) 50vw, 100vw" className="aspect-[4/3]" />
      </section>

      <section aria-labelledby="included" className="border-y border-line bg-white">
        <div className="page-gutter grid gap-12 py-16 md:py-20 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:gap-20">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            <h2 id="included" className="sr-only">
              What’s included
            </h2>
            {page.included.map((group) => (
              <div key={group.title}>
                <h3 className="text-h2">{group.title}</h3>
                <ul className="mt-6 grid gap-3">
                  {group.items.map((item) => (
                    <li key={item} className="grid grid-cols-[1.25rem_1fr] gap-2">
                      <span aria-hidden className="mt-2.5 size-2 rotate-45 bg-purple" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="rounded-card bg-purple-tint p-6 md:p-8 lg:self-start">
            <h2 className="text-h3">Who it’s for</h2>
            <ul className="mt-4 grid gap-3">
              {page.forWho.map((who) => (
                <li key={who} className="border-t border-purple/15 pt-3 first:border-t-0 first:pt-0">
                  {who}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section aria-labelledby="steps" className="page-gutter py-16 md:py-24">
        <h2 id="steps" className="text-h1">
          How it works
        </h2>
        <ol className="mt-10 grid gap-10 md:grid-cols-3 md:gap-8">
          {page.steps.map((step, index) => (
            <li key={step.title}>
              <span aria-hidden className="font-display text-h2 text-purple">
                {index + 1}
              </span>
              <h3 className="text-h3 mt-2">{step.title}</h3>
              <p className="mt-2 text-mute">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section id="quote" aria-labelledby="quote-title" className="roof on-dark bg-purple">
        <div className="page-gutter grid gap-10 pt-24 pb-16 md:pt-36 md:pb-24 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:gap-16">
          <div>
            <h2 id="quote-title" className="text-h1 text-white">
              {page.formTitle}
            </h2>
            <p className="text-lead mt-4 text-mute-on-dark">{page.formIntro}</p>
          </div>
          <div className="rounded-card bg-white p-5 sm:p-8">
            <QuoteForm service={page.service} submitLabel={page.submitLabel} />
          </div>
        </div>
      </section>
    </>
  )
}
