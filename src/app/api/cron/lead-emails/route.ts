import config from '@payload-config'
import { getPayload } from 'payload'
import { MAX_EMAIL_ATTEMPTS, notifyLead, type LeadCollection } from '@/lib/leads/notify'

// Vercel Cron calls this every 15 minutes (see vercel.json) with CRON_SECRET as a bearer token.
// It resends lead emails that failed, and any still waiting a minute after the lead was saved.
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  const payload = await getPayload({ config })
  // Leaves fresh leads alone while their first send may still be running
  const settleSeconds = Number(process.env.LEAD_RETRY_SETTLE_SECONDS ?? 60)
  const settledBefore = new Date(Date.now() - settleSeconds * 1000).toISOString()
  const retried: string[] = []

  for (const collection of ['request-leads', 'service-leads'] as LeadCollection[]) {
    const { docs } = await payload.find({
      collection,
      where: {
        and: [
          { emailStatus: { in: ['failed', 'pending'] } },
          { emailAttempts: { less_than: MAX_EMAIL_ATTEMPTS } },
          { updatedAt: { less_than: settledBefore } },
        ],
      },
      limit: 50,
      depth: 0,
      overrideAccess: true,
    })
    for (const lead of docs) {
      await notifyLead(collection, lead.id)
      retried.push(`${collection}/${lead.id}`)
    }
  }

  return Response.json({ retried })
}
