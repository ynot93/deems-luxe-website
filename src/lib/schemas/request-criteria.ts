import { z } from 'zod'
import { COUNTIES } from '@/lib/locations/counties'

// The shape of a property request, shared by the Phase 1 lead form and the Phase 2 board,
// so every request captured from launch migrates straight onto the board.
// See "Data models" in docs/requirements.md.

type Options<T extends string> = readonly { value: T; label: string }[]
const values = <T extends string>(options: Options<T>) => options.map((option) => option.value) as [T, ...T[]]
export const labelFor = <T extends string>(options: Options<T>, value: T | null | undefined) =>
  options.find((option) => option.value === value)?.label ?? value ?? ''

export const INTENTS = [
  { value: 'rent', label: 'Rent' },
  { value: 'buy', label: 'Buy' },
] as const

export const CATEGORIES = [
  { value: 'residential', label: 'Home' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'land', label: 'Land' },
] as const

export const PROPERTY_TYPES = [
  { value: 'apartment', label: 'Apartment', category: 'residential' },
  { value: 'maisonette', label: 'Maisonette', category: 'residential' },
  { value: 'bungalow', label: 'Bungalow', category: 'residential' },
  { value: 'townhouse', label: 'Townhouse', category: 'residential' },
  { value: 'villa', label: 'Villa', category: 'residential' },
  { value: 'office', label: 'Office', category: 'commercial' },
  { value: 'shop', label: 'Shop', category: 'commercial' },
  { value: 'warehouse', label: 'Warehouse', category: 'commercial' },
  { value: 'plot', label: 'Plot', category: 'land' },
] as const

export const PAYMENT_MODES = [
  { value: 'cash', label: 'Cash' },
  { value: 'mortgage', label: 'Mortgage' },
  { value: 'instalments', label: 'Instalments' },
  { value: 'off_plan', label: 'Off-plan' },
] as const

export const MUST_HAVES = [
  { value: 'parking', label: 'Parking' },
  { value: 'dsq', label: 'DSQ' },
  { value: 'garden', label: 'Garden' },
  { value: 'gated_community', label: 'Gated community' },
  { value: 'borehole', label: 'Borehole' },
  { value: 'backup_power', label: 'Backup power' },
  { value: 'lift', label: 'Lift' },
  { value: 'swimming_pool', label: 'Swimming pool' },
  { value: 'pet_friendly', label: 'Pet-friendly' },
  { value: 'furnished', label: 'Furnished' },
] as const

export const TITLE_REQUIREMENTS = [
  { value: 'any', label: 'No preference' },
  { value: 'title_deed', label: 'Title deed' },
  { value: 'sectional_title', label: 'Sectional title' },
] as const

export const TIMELINES = [
  { value: 'immediate', label: 'Straight away' },
  { value: '1_3_months', label: 'In 1 to 3 months' },
  { value: '3_6_months', label: 'In 3 to 6 months' },
  { value: '6_plus_months', label: 'In 6 months or more' },
] as const

export const CURRENCIES = ['KES', 'USD'] as const

export type Intent = (typeof INTENTS)[number]['value']
export type Category = (typeof CATEGORIES)[number]['value']
export type PropertyType = (typeof PROPERTY_TYPES)[number]['value']
export type Currency = (typeof CURRENCIES)[number]

const money = z.object({ amount: z.number().positive(), currency: z.enum(CURRENCIES) })

export const requestCriteriaSchema = z
  .object({
    intent: z.enum(values(INTENTS)),
    category: z.enum(values(CATEGORIES)),
    propertyTypes: z.array(z.enum(values(PROPERTY_TYPES))).min(1),
    bedrooms: z.object({ min: z.number().int().min(0).max(20), max: z.number().int().max(20).optional() }).optional(),
    bathrooms: z.number().int().min(1).max(20).optional(),
    locations: z.object({ county: z.enum(COUNTIES), areas: z.array(z.string().min(1).max(80)).max(10) }),
    budget: z.object({
      min: money.optional(),
      max: money,
      period: z.enum(['total', 'monthly']).optional(),
    }),
    paymentMode: z.enum(values(PAYMENT_MODES)).optional(),
    mustHaves: z.array(z.enum(values(MUST_HAVES))),
    titleRequirement: z.enum(values(TITLE_REQUIREMENTS)).optional(),
    timeline: z.enum(values(TIMELINES)),
    notes: z.string().max(2000).optional(),
  })
  .superRefine((criteria, ctx) => {
    for (const type of criteria.propertyTypes) {
      const option = PROPERTY_TYPES.find((propertyType) => propertyType.value === type)
      if (option?.category !== criteria.category) {
        ctx.addIssue({ code: 'custom', path: ['propertyTypes'], message: `${type} is not a ${criteria.category} type` })
      }
    }
    const { min, max } = criteria.budget
    if (min && min.currency !== max.currency) {
      ctx.addIssue({ code: 'custom', path: ['budget', 'min'], message: 'Use one currency for the whole budget' })
    }
    if (min && min.amount > max.amount) {
      ctx.addIssue({ code: 'custom', path: ['budget', 'min'], message: 'The lowest budget is above the highest' })
    }
    if (criteria.bedrooms?.max !== undefined && criteria.bedrooms.max < criteria.bedrooms.min) {
      ctx.addIssue({ code: 'custom', path: ['bedrooms', 'max'], message: 'Fewest bedrooms is above most' })
    }
  })

export type RequestCriteria = z.infer<typeof requestCriteriaSchema>

const formatAmount = ({ amount, currency }: { amount: number; currency: Currency }) => {
  if (amount >= 1_000_000) {
    const millions = amount / 1_000_000
    return `${currency} ${Number.isInteger(millions) ? millions : millions.toFixed(1)} million`
  }
  return `${currency} ${amount.toLocaleString('en-KE')}`
}

export const formatBudget = ({ min, max, period }: RequestCriteria['budget']) => {
  const range = min ? `${formatAmount(min)} to ${formatAmount(max).replace(`${max.currency} `, '')}` : `up to ${formatAmount(max)}`
  return period === 'monthly' ? `${range} a month` : range
}

// One line in the style of a board card, for example
// "3-bed apartment to rent, Kilimani, Nairobi, up to KES 120,000 a month"
export const summarizeCriteria = (criteria: RequestCriteria) => {
  const types = criteria.propertyTypes.map((type) => labelFor(PROPERTY_TYPES, type).toLowerCase()).join(' or ')
  const beds = criteria.bedrooms ? `${criteria.bedrooms.min === 0 ? 'studio' : `${criteria.bedrooms.min}-bed`} ` : ''
  const action = criteria.intent === 'rent' ? 'to rent' : 'to buy'
  const where = [...criteria.locations.areas, criteria.locations.county].join(', ')
  return `${beds}${types} ${action}, ${where}, ${formatBudget(criteria.budget)}`.replace(/^./, (first) =>
    first.toUpperCase(),
  )
}
