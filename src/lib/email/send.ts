export type Email = { to: string; subject: string; text: string; replyTo?: string }

// Sends through Resend's HTTP API. RESEND_API_URL points tests at a stub.
export const sendEmail = async ({ to, subject, text, replyTo }: Email) => {
  const key = process.env.RESEND_API_KEY
  const from = process.env.LEAD_FROM_EMAIL
  if (!key || !from) throw new Error('Email is not set up: RESEND_API_KEY and LEAD_FROM_EMAIL are needed')

  const response = await fetch(`${process.env.RESEND_API_URL ?? 'https://api.resend.com'}/emails`, {
    method: 'POST',
    headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' },
    body: JSON.stringify({ from, to: [to], subject, text, reply_to: replyTo }),
    signal: AbortSignal.timeout(10_000),
  })
  if (!response.ok) throw new Error(`The email service answered ${response.status}`)
}
