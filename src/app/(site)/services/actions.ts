'use server'

import { normalizePhone } from '@/lib/phone'
import { fieldErrorsFrom, INVALID, saveLead, type SubmitResult } from '@/lib/leads/save'
import { labelFor } from '@/lib/schemas/request-criteria'
import {
  describeServiceDetails,
  serviceDetails,
  serviceFormSchemas,
  SERVICES,
  type Service,
} from '@/lib/schemas/service-forms'

// Quote forms on the service pages, and the contact form as the "general" service
export async function submitServiceLead(service: Service, values: unknown): Promise<SubmitResult> {
  // The service name comes from the browser, so check it's one of ours
  if (!Object.hasOwn(serviceFormSchemas, service)) return { ok: false, message: 'This form is not available.' }
  const schema = serviceFormSchemas[service]
  const parsed = schema.safeParse(values)
  if (!parsed.success) return { ...INVALID, fieldErrors: fieldErrorsFrom(parsed.error.issues) } as SubmitResult
  const form = parsed.data
  if (form.company) return { ok: true }

  const details = serviceDetails(form)
  return saveLead('service-leads', {
    title: `${labelFor(SERVICES, service)}: ${form.name}`,
    service,
    summary: describeServiceDetails(details),
    details,
    contact: { name: form.name, phone: normalizePhone(form.phone) as string, email: form.email || undefined },
    status: 'new',
  })
}
