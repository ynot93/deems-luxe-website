import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { RequestForm } from '@/components/forms/RequestForm'
import { DraftRibbon } from '@/components/ui/DraftRibbon'
import { showDrafts } from '@/lib/drafts'
import { quickRequestDefaults } from '@/lib/schemas/request-form'
import { getKesPerUsd } from '@/lib/site-settings'

const reviewed = true

export const metadata: Metadata = {
  title: 'Post a Request',
  description:
    'Tell Deems Luxe Homes what you want to buy or rent anywhere in Kenya. It takes about 2 minutes and needs no account.',
}

const NEXT_STEPS = [
  'Your request goes to the Deems team straight away.',
  'An agent contacts you to confirm the details.',
  'Your agent looks for properties that fit, checks them, and sends you a shortlist.',
]

export default async function PostARequestPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  if (!reviewed && !showDrafts) notFound()
  const [params, kesPerUsd] = await Promise.all([searchParams, getKesPerUsd()])

  return (
    <>
      {reviewed ? null : <DraftRibbon note="Post a Request copy" />}
      <div className="page-gutter grid gap-12 pt-10 pb-20 md:pt-16 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-20">
        <div className="max-w-2xl">
          <h1 className="text-h1">Post a Request</h1>
          <p className="text-lead mt-4 text-mute">
            Tell us what you’re looking for. It takes about 2 minutes, and you don’t need an account.
          </p>
          <div className="mt-10">
            <RequestForm defaults={quickRequestDefaults(params)} kesPerUsd={kesPerUsd} />
          </div>
        </div>
        <aside aria-labelledby="next" className="lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-card bg-purple-tint p-6">
            <h2 id="next" className="text-h3">
              What happens next
            </h2>
            <ol className="mt-4 grid gap-4">
              {NEXT_STEPS.map((step, index) => (
                <li key={step} className="grid grid-cols-[1.75rem_1fr] gap-2">
                  <span aria-hidden className="font-display font-semibold text-purple">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
            <p className="mt-5 border-t border-purple/15 pt-5 text-sm text-mute">
              Your details stay with Deems. Sellers and other agents never see them.
            </p>
          </div>
        </aside>
      </div>
    </>
  )
}
