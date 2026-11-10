import { z } from 'zod'
import { normalizePhone } from '@/lib/phone'

// Contact details and consent, shared by every lead form
export const contactFields = {
  name: z.string().trim().min(2, 'Enter your name.').max(120),
  phone: z
    .string()
    .trim()
    .refine((value) => normalizePhone(value) !== null, 'Enter a phone number such as 0712 345 678, or +44 7700 900123 from abroad.'),
  email: z.union([z.literal(''), z.email('Enter an email address such as name@example.com.')]),
  consent: z.literal(true, 'Tick this box so we can handle your request.'),
  // Hidden from people. Bots that fill it in are thanked and ignored.
  company: z.string(),
}

export const CONSENT_TEXT =
  'I agree that Deems Luxe Homes may use these details to handle my request, as set out in the privacy policy.'
