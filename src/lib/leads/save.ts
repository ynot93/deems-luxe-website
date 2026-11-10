import { createHmac } from 'node:crypto'
import config from '@payload-config'
import { after } from 'next/server'
import { headers } from 'next/headers'
import { getPayload, type RequiredDataFromCollectionSlug, type Where } from 'payload'
import { notifyLead, type LeadCollection } from './notify'

export type SubmitResult =
  | { ok: true }
  | { ok: false; message: string; fieldErrors?: Record<string, string> }

const RATE_WINDOW_MINUTES = 15
const rateLimit = () => Number(process.env.LEAD_RATE_LIMIT ?? 5)

// Vercel sets x-forwarded-for itself, so visitors can't forge it there
const clientIpHash = async () => {
  const forwarded = (await headers()).get('x-forwarded-for')?.split(',')[0]?.trim()
  return createHmac('sha256', process.env.PAYLOAD_SECRET ?? '').update(forwarded || 'unknown').digest('hex')
}

export const RATE_LIMITED: SubmitResult = {
  ok: false,
  message: 'We’ve had several forms from you in the last few minutes. Please wait a little and try again, or call us.',
}

type LeadData<C extends LeadCollection> = Omit<
  RequiredDataFromCollectionSlug<C>,
  'ipHash' | 'consentAt' | 'emailStatus' | 'emailAttempts'
>

// Saves a lead from a public form, then emails it once the response has gone back.
// Checks the per-IP limit across both lead types first.
export const saveLead = async <C extends LeadCollection>(collection: C, data: LeadData<C>): Promise<SubmitResult> => {
  const payload = await getPayload({ config })
  const ipHash = await clientIpHash()
  const since = new Date(Date.now() - RATE_WINDOW_MINUTES * 60_000).toISOString()
  const where: Where = { and: [{ ipHash: { equals: ipHash } }, { createdAt: { greater_than: since } }] }
  const [requests, quotes] = await Promise.all([
    payload.count({ collection: 'request-leads', where, overrideAccess: true }),
    payload.count({ collection: 'service-leads', where, overrideAccess: true }),
  ])
  if (requests.totalDocs + quotes.totalDocs >= rateLimit()) return RATE_LIMITED

  const lead = await payload.create({
    collection,
    data: { ...data, ipHash, consentAt: new Date().toISOString(), emailStatus: 'pending', emailAttempts: 0 } as RequiredDataFromCollectionSlug<C>,
    overrideAccess: true,
  })
  after(() => notifyLead(collection, lead.id as number))
  return { ok: true }
}

// Turns Zod issues into one message per field, for the form to show
export const fieldErrorsFrom = (issues: { path: PropertyKey[]; message: string }[]) => {
  const errors: Record<string, string> = {}
  for (const issue of issues) {
    const key = String(issue.path[0] ?? 'form')
    errors[key] ??= issue.message
  }
  return errors
}

export const INVALID: SubmitResult = { ok: false, message: 'Some answers need fixing. They’re marked below.' }
