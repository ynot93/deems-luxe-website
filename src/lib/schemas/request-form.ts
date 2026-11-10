import { z } from 'zod'
import { parseAreas } from '@/lib/locations/areas'
import { COUNTIES } from '@/lib/locations/counties'
import { contactFields } from './contact'
import {
  CATEGORIES,
  CURRENCIES,
  INTENTS,
  MUST_HAVES,
  PAYMENT_MODES,
  PROPERTY_TYPES,
  TIMELINES,
  TITLE_REQUIREMENTS,
  type RequestCriteria,
} from './request-criteria'

const pick = <T extends string>(options: readonly { value: T }[]) => options.map((option) => option.value) as [T, ...T[]]
const amount = /^\d[\d,\s]*(\.\d+)?$/

export const parseAmount = (value: string) => {
  const number = Number(value.replace(/[,\s]/g, ''))
  return Number.isFinite(number) && number > 0 ? number : undefined
}

// The Post a Request form as the browser sends it: flat fields, numbers as typed
export const requestFormSchema = z
  .object({
    intent: z.enum(pick(INTENTS)),
    category: z.enum(pick(CATEGORIES)),
    propertyTypes: z.array(z.enum(pick(PROPERTY_TYPES))).min(1, 'Choose at least one type of property.'),
    bedrooms: z.enum(['', '0', '1', '2', '3', '4', '5']),
    county: z.enum(COUNTIES, 'Choose a county.'),
    areas: z.string().max(400),
    currency: z.enum(CURRENCIES),
    budgetMin: z.union([z.literal(''), z.string().regex(amount, 'Enter a number, such as 80,000.')]),
    budgetMax: z.string().regex(amount, 'Enter your highest budget, such as 120,000.'),
    paymentMode: z.union([z.literal(''), z.enum(pick(PAYMENT_MODES))]),
    mustHaves: z.array(z.enum(pick(MUST_HAVES))),
    titleRequirement: z.union([z.literal(''), z.enum(pick(TITLE_REQUIREMENTS))]),
    timeline: z.enum(pick(TIMELINES), 'Choose when you need it.'),
    notes: z.string().max(2000, 'Keep this under 2,000 characters.'),
    whatsapp: z.boolean(),
    ...contactFields,
  })
  .superRefine((form, ctx) => {
    for (const type of form.propertyTypes) {
      if (PROPERTY_TYPES.find((option) => option.value === type)?.category !== form.category) {
        ctx.addIssue({ code: 'custom', path: ['propertyTypes'], message: 'Choose a type that matches what you’re looking for.' })
        break
      }
    }
    if (parseAreas(form.areas).length > 10) {
      ctx.addIssue({ code: 'custom', path: ['areas'], message: 'List up to 10 areas.' })
    }
    const min = form.budgetMin ? parseAmount(form.budgetMin) : undefined
    const max = parseAmount(form.budgetMax)
    if (min !== undefined && max !== undefined && min > max) {
      ctx.addIssue({ code: 'custom', path: ['budgetMin'], message: 'This is above your highest budget.' })
    }
  })

export type RequestFormValues = z.infer<typeof requestFormSchema>

export const toRequestCriteria = (form: RequestFormValues): RequestCriteria => {
  const min = form.budgetMin ? parseAmount(form.budgetMin) : undefined
  const isHome = form.category === 'residential'
  return {
    intent: form.intent,
    category: form.category,
    propertyTypes: form.propertyTypes,
    bedrooms: isHome && form.bedrooms !== '' ? { min: Number(form.bedrooms) } : undefined,
    locations: { county: form.county, areas: parseAreas(form.areas) },
    budget: {
      min: min ? { amount: min, currency: form.currency } : undefined,
      max: { amount: parseAmount(form.budgetMax) ?? 0, currency: form.currency },
      period: form.intent === 'rent' ? 'monthly' : 'total',
    },
    paymentMode: form.intent === 'buy' && form.paymentMode ? form.paymentMode : undefined,
    mustHaves: form.category === 'land' ? [] : form.mustHaves,
    titleRequirement: form.intent === 'buy' && form.titleRequirement ? form.titleRequirement : undefined,
    timeline: form.timeline,
    notes: form.notes.trim() || undefined,
  }
}

// Reads the homepage quick request's URL parameters into starting values for the form
export const quickRequestDefaults = (params: Record<string, string | string[] | undefined>) => {
  const single = (key: string) => (typeof params[key] === 'string' ? (params[key] as string) : '')
  const intent = single('intent') === 'buy' ? 'buy' : 'rent'
  const [min = '', max = ''] = single('budget').split('-')
  const valid = (value: string) => (/^\d+$/.test(value) && Number(value) > 0 ? Number(value).toLocaleString('en-KE') : '')
  return {
    intent,
    areas: single('area').slice(0, 400),
    budgetMin: valid(min),
    budgetMax: valid(max),
  } as const
}
