import { z } from 'zod'
import { COUNTIES } from '@/lib/locations/counties'
import { contactFields } from './contact'
import { labelFor, PROPERTY_TYPES, TIMELINES } from './request-criteria'

const pick = <T extends string>(options: readonly { value: T }[]) => options.map((option) => option.value) as [T, ...T[]]

export const SERVICES = [
  { value: 'management', label: 'Property management' },
  { value: 'valuation', label: 'Property valuation' },
  { value: 'agency', label: 'Real estate agency' },
  { value: 'general', label: 'General enquiry' },
] as const
export type Service = (typeof SERVICES)[number]['value']

export const MANAGED_PROPERTY_TYPES = [
  { value: 'apartment_block', label: 'Apartment block' },
  { value: 'houses', label: 'Houses or maisonettes' },
  { value: 'single_unit', label: 'A single apartment or house' },
  { value: 'commercial', label: 'Commercial building' },
  { value: 'mixed_use', label: 'Mixed use' },
] as const

export const OCCUPANCY = [
  { value: 'fully_let', label: 'Fully let' },
  { value: 'partly_let', label: 'Partly let' },
  { value: 'vacant', label: 'Vacant' },
  { value: 'new_build', label: 'New build, not yet let' },
] as const

export const MANAGEMENT_SERVICES = [
  { value: 'full_management', label: 'Full management' },
  { value: 'tenant_placement', label: 'Finding tenants' },
  { value: 'rent_collection', label: 'Rent collection' },
  { value: 'maintenance', label: 'Repairs and maintenance' },
  { value: 'inspections', label: 'Inspections' },
] as const

export const VALUATION_PURPOSES = [
  { value: 'sale_purchase', label: 'Sale or purchase' },
  { value: 'mortgage', label: 'Mortgage or bank' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'probate', label: 'Probate or estate planning' },
  { value: 'rent_review', label: 'Rent review' },
  { value: 'other', label: 'Something else' },
] as const

export const TITLE_TYPES = [
  { value: 'freehold', label: 'Freehold' },
  { value: 'leasehold', label: 'Leasehold' },
  { value: 'sectional', label: 'Sectional title' },
  { value: 'not_sure', label: 'Not sure' },
] as const

export const URGENCY = [
  { value: 'this_week', label: 'This week' },
  { value: 'this_month', label: 'This month' },
  { value: 'no_rush', label: 'No rush' },
] as const

export const AGENCY_GOALS = [
  { value: 'sell', label: 'Sell' },
  { value: 'let', label: 'Let' },
  { value: 'buy', label: 'Buy' },
  { value: 'rent', label: 'Rent' },
] as const

const location = {
  county: z.enum(COUNTIES, 'Choose a county.'),
  area: z.string().trim().max(120),
}

export const serviceFormSchemas = {
  management: z.object({
    propertyType: z.enum(pick(MANAGED_PROPERTY_TYPES), 'Choose the type of property.'),
    ...location,
    units: z.string().regex(/^\d{1,4}$/, 'Enter the number of units, such as 12.'),
    occupancy: z.enum(pick(OCCUPANCY), 'Choose how much of it is let.'),
    servicesWanted: z.array(z.enum(pick(MANAGEMENT_SERVICES))).min(1, 'Choose at least one service.'),
    message: z.string().max(2000),
    ...contactFields,
  }),
  valuation: z.object({
    purpose: z.enum(pick(VALUATION_PURPOSES), 'Choose what the valuation is for.'),
    propertyType: z.enum(pick(PROPERTY_TYPES), 'Choose the type of property.'),
    ...location,
    size: z.string().trim().max(80),
    titleType: z.enum(pick(TITLE_TYPES), 'Choose the title type, or Not sure.'),
    urgency: z.enum(pick(URGENCY), 'Choose when you need it.'),
    message: z.string().max(2000),
    ...contactFields,
  }),
  agency: z.object({
    goal: z.enum(pick(AGENCY_GOALS), 'Choose what you want to do.'),
    ...location,
    propertyDetails: z.string().trim().min(10, 'Tell us a little about the property.').max(2000),
    timeline: z.enum(pick(TIMELINES), 'Choose when.'),
    ...contactFields,
  }),
  general: z.object({
    message: z.string().trim().min(10, 'Tell us a little more, so the right person can reply.').max(2000),
    ...contactFields,
  }),
}

export type ServiceFormValues<S extends Service> = z.infer<(typeof serviceFormSchemas)[S]>

const CONTACT_KEYS = new Set(['name', 'phone', 'email', 'consent', 'company'])

const FIELD_LABELS: Record<string, { label: string; options?: readonly { value: string; label: string }[] }> = {
  propertyType: { label: 'Property', options: [...MANAGED_PROPERTY_TYPES, ...PROPERTY_TYPES] },
  county: { label: 'County' },
  area: { label: 'Area' },
  units: { label: 'Units' },
  occupancy: { label: 'Occupancy', options: OCCUPANCY },
  servicesWanted: { label: 'Services wanted', options: MANAGEMENT_SERVICES },
  purpose: { label: 'Purpose', options: VALUATION_PURPOSES },
  size: { label: 'Size' },
  titleType: { label: 'Title', options: TITLE_TYPES },
  urgency: { label: 'Needed', options: URGENCY },
  goal: { label: 'Wants to', options: AGENCY_GOALS },
  propertyDetails: { label: 'Property details' },
  timeline: { label: 'Timeline', options: TIMELINES },
  message: { label: 'Message' },
}

// The service-specific answers, without contact details, ready to store as the lead's details
export const serviceDetails = (values: Record<string, unknown>) =>
  Object.fromEntries(Object.entries(values).filter(([key, value]) => !CONTACT_KEYS.has(key) && value !== ''))

// Readable lines for the admin panel and the agent email, such as "Purpose: Mortgage or bank"
export const describeServiceDetails = (details: Record<string, unknown>) =>
  Object.entries(details)
    .map(([key, value]) => {
      const field = FIELD_LABELS[key]
      if (!field) return null
      const show = (item: unknown) =>
        field.options ? labelFor(field.options, String(item)) : String(item)
      return `${field.label}: ${Array.isArray(value) ? value.map(show).join(', ') : show(value)}`
    })
    .filter(Boolean)
    .join('\n')
