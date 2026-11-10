import config from '@payload-config'
import { getPayload } from 'payload'
import { sendEmail } from '@/lib/email/send'
import type { RequestLead, ServiceLead } from '@/payload-types'
import { labelFor } from '@/lib/schemas/request-criteria'
import { SERVICES } from '@/lib/schemas/service-forms'

export type LeadCollection = 'request-leads' | 'service-leads'

// After this many failed sends a lead is marked "Gave up" and the retry job stops
export const MAX_EMAIL_ATTEMPTS = 5

const serverUrl = () => process.env.NEXT_PUBLIC_SERVER_URL ?? 'http://localhost:3000'

const contactLines = (lead: RequestLead | ServiceLead) =>
  [
    `Name: ${lead.contact.name}`,
    `Phone: ${lead.contact.phone}`,
    lead.contact.email ? `Email: ${lead.contact.email}` : null,
    'whatsapp' in lead && lead.whatsapp ? 'Happy to be contacted on WhatsApp' : null,
  ].filter(Boolean)

const agentEmail = (collection: LeadCollection, lead: RequestLead | ServiceLead, to: string) => {
  const link = `${serverUrl()}/admin/collections/${collection}/${lead.id}`
  if (collection === 'request-leads') {
    const request = lead as RequestLead
    return {
      to,
      subject: `New property request: ${request.summary}`,
      replyTo: request.contact.email ?? undefined,
      text: [request.summary, '', ...contactLines(request), '', request.criteria.notes ?? '', `Open the request: ${link}`]
        .filter((line, index, lines) => line !== '' || lines[index - 1] !== '')
        .join('\n'),
    }
  }
  const quote = lead as ServiceLead
  return {
    to,
    subject: `New ${labelFor(SERVICES, quote.service).toLowerCase()} lead from ${quote.contact.name}`,
    replyTo: quote.contact.email ?? undefined,
    text: [quote.summary ?? '', '', ...contactLines(quote), '', `Open the lead: ${link}`].join('\n'),
  }
}

const confirmationEmail = (collection: LeadCollection, lead: RequestLead | ServiceLead) => ({
  to: lead.contact.email as string,
  subject: 'We’ve received your request | Deems Luxe Homes',
  text: [
    `Hi ${lead.contact.name},`,
    '',
    collection === 'request-leads'
      ? `Thanks for telling us what you’re looking for: ${(lead as RequestLead).summary}.`
      : 'Thanks for getting in touch with Deems Luxe Homes.',
    `A member of our team will contact you on ${lead.contact.phone}.`,
    '',
    'If anyone using the Deems name asks you for money before a viewing, contact us first.',
    '',
    'Deems Luxe Homes',
  ].join('\n'),
})

// Emails a lead to the lead inbox and records the outcome on the lead. The lead is already
// saved, so a failure here never loses it: the retry job picks it up again.
export const notifyLead = async (collection: LeadCollection, id: number) => {
  const payload = await getPayload({ config })
  const lead = (await payload.findByID({ collection, id, depth: 0, overrideAccess: true })) as RequestLead | ServiceLead
  const { leadInboxEmail } = await payload.findGlobal({ slug: 'site-settings', depth: 0, overrideAccess: true })
  const attempts = (lead.emailAttempts ?? 0) + 1

  try {
    if (!leadInboxEmail) throw new Error('No lead inbox email is set in Site settings')
    await sendEmail(agentEmail(collection, lead, leadInboxEmail))
    await payload.update({
      collection,
      id,
      data: { emailStatus: 'sent', emailAttempts: attempts, lastEmailError: null },
      overrideAccess: true,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    payload.logger.error(`Lead email failed for ${collection} ${id}: ${message}`)
    await payload.update({
      collection,
      id,
      data: {
        emailStatus: attempts >= MAX_EMAIL_ATTEMPTS ? 'gave_up' : 'failed',
        emailAttempts: attempts,
        lastEmailError: message,
      },
      overrideAccess: true,
    })
  }

  // The visitor's confirmation is a courtesy, sent once and never retried
  if (attempts === 1 && lead.contact.email) {
    await sendEmail(confirmationEmail(collection, lead)).catch((error) =>
      payload.logger.warn(`Confirmation email failed for ${collection} ${id}: ${error}`),
    )
  }
}
