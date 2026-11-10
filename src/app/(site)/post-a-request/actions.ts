'use server'

import { normalizePhone } from '@/lib/phone'
import { fieldErrorsFrom, INVALID, saveLead, type SubmitResult } from '@/lib/leads/save'
import { requestCriteriaSchema, summarizeCriteria } from '@/lib/schemas/request-criteria'
import { requestFormSchema, toRequestCriteria } from '@/lib/schemas/request-form'

export async function submitRequest(values: unknown): Promise<SubmitResult> {
  const parsed = requestFormSchema.safeParse(values)
  if (!parsed.success) return { ...INVALID, fieldErrors: fieldErrorsFrom(parsed.error.issues) } as SubmitResult
  const form = parsed.data
  // Bots fill in the hidden field. Thank them and keep nothing.
  if (form.company) return { ok: true }

  const criteria = requestCriteriaSchema.parse(toRequestCriteria(form))
  return saveLead('request-leads', {
    summary: summarizeCriteria(criteria),
    criteria,
    contact: { name: form.name, phone: normalizePhone(form.phone) as string, email: form.email || undefined },
    whatsapp: form.whatsapp,
    status: 'new',
    source: 'website',
  })
}
