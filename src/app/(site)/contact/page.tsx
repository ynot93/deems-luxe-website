import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'
import { QuoteForm } from '@/components/forms/QuoteForm'
import { DraftRibbon } from '@/components/ui/DraftRibbon'
import { showDrafts } from '@/lib/drafts'
import { getPublicContact } from '@/lib/site-settings'

const reviewed = true

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Call, WhatsApp, email or write to Deems Luxe Homes.',
}

const Detail = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="border-t border-line pt-4">
    <dt className="text-sm font-semibold text-mute">{label}</dt>
    <dd className="mt-1 text-lg">{children}</dd>
  </div>
)

const linkClass = 'font-semibold text-purple underline-offset-4 hover:underline'

export default async function ContactPage() {
  if (!reviewed && !showDrafts) notFound()
  const contact = await getPublicContact()
  const hasDetails = Boolean(contact.phone || contact.whatsapp || contact.email || contact.officeAddress)

  return (
    <>
      {reviewed ? null : <DraftRibbon note="Contact copy" />}
      <div className="page-gutter grid gap-12 pt-10 pb-20 md:pt-16 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:gap-20">
        <div>
          <h1 className="text-h1">Contact us</h1>
          <p className="text-lead mt-4 text-mute">
            Questions about a service, a property or a request: send us a message and the right person will reply.
          </p>
          <p className="mt-6 rounded-card bg-purple-tint p-5">
            Looking for a property?{' '}
            <Link href="/post-a-request" className={linkClass}>
              Post a Request
            </Link>{' '}
            instead, so your agent has everything they need.
          </p>
          {hasDetails ? (
            <dl className="mt-10 grid gap-4">
              {contact.phone ? (
                <Detail label="Phone">
                  <a href={`tel:${contact.phone.replace(/[^\d+]/g, '')}`} className={linkClass}>
                    {contact.phone}
                  </a>
                </Detail>
              ) : null}
              {contact.whatsapp ? (
                <Detail label="WhatsApp">
                  <a href={`https://wa.me/${contact.whatsapp}`} className={linkClass}>
                    Message us on WhatsApp
                  </a>
                </Detail>
              ) : null}
              {contact.email ? (
                <Detail label="Email">
                  <a href={`mailto:${contact.email}`} className={linkClass}>
                    {contact.email}
                  </a>
                </Detail>
              ) : null}
              {contact.officeAddress ? (
                <Detail label="Office">
                  <address className="whitespace-pre-line not-italic">{contact.officeAddress}</address>
                  {contact.officeHours ? <p className="mt-1 text-base text-mute">{contact.officeHours}</p> : null}
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contact.officeAddress)}`}
                    className={`${linkClass} mt-2 inline-block text-base`}
                  >
                    Open in Google Maps
                  </a>
                </Detail>
              ) : null}
            </dl>
          ) : null}
        </div>
        <div className="rounded-card border border-line bg-white p-5 sm:p-8">
          <h2 className="text-h3 mb-6">Send a message</h2>
          <QuoteForm service="general" submitLabel="Send message" />
        </div>
      </div>
    </>
  )
}
