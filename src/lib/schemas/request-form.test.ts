import { describe, expect, it } from 'vitest'
import { parseAreas } from '@/lib/locations/areas'
import { COUNTIES } from '@/lib/locations/counties'
import { requestCriteriaSchema, summarizeCriteria } from './request-criteria'
import { quickRequestDefaults, requestFormSchema, toRequestCriteria, type RequestFormValues } from './request-form'

const valid: RequestFormValues = {
  intent: 'rent',
  category: 'residential',
  propertyTypes: ['apartment'],
  bedrooms: '3',
  county: 'Nairobi',
  areas: 'Kilimani, lavington, Kilimani',
  currency: 'KES',
  budgetMin: '',
  budgetMax: '120,000',
  paymentMode: 'mortgage',
  mustHaves: ['parking', 'backup_power'],
  titleRequirement: 'title_deed',
  timeline: '1_3_months',
  notes: '  Near a school  ',
  whatsapp: true,
  name: 'Wanjiru Kamau',
  phone: '0712 345 678',
  email: '',
  consent: true,
  company: '',
}

describe('counties', () => {
  it('lists all 47, once each', () => {
    expect(COUNTIES).toHaveLength(47)
    expect(new Set(COUNTIES).size).toBe(47)
  })
})

describe('parseAreas', () => {
  it('splits, tidies and removes repeats', () => {
    expect(parseAreas(' Kilimani,  Upper   Hill;kilimani\nKaren ')).toEqual(['Kilimani', 'Upper Hill', 'Karen'])
    expect(parseAreas('')).toEqual([])
  })
})

describe('requestFormSchema', () => {
  it('accepts a complete form', () => {
    expect(requestFormSchema.safeParse(valid).success).toBe(true)
  })

  it('needs consent, a real phone number and a highest budget', () => {
    const result = requestFormSchema.safeParse({ ...valid, consent: false, phone: '0712', budgetMax: '' })
    expect(result.success).toBe(false)
    const fields = result.error?.issues.map((issue) => issue.path[0])
    expect(fields).toEqual(expect.arrayContaining(['consent', 'phone', 'budgetMax']))
  })

  it('refuses a lowest budget above the highest', () => {
    const result = requestFormSchema.safeParse({ ...valid, budgetMin: '200,000' })
    expect(result.error?.issues[0]?.path).toEqual(['budgetMin'])
  })

  it('refuses a property type from another category', () => {
    const result = requestFormSchema.safeParse({ ...valid, propertyTypes: ['warehouse'] })
    expect(result.error?.issues[0]?.path).toEqual(['propertyTypes'])
  })
})

describe('toRequestCriteria', () => {
  it('maps a rental onto RequestCriteria, dropping buy-only answers', () => {
    const criteria = toRequestCriteria(valid)
    expect(requestCriteriaSchema.parse(criteria)).toEqual({
      intent: 'rent',
      category: 'residential',
      propertyTypes: ['apartment'],
      bedrooms: { min: 3 },
      locations: { county: 'Nairobi', areas: ['Kilimani', 'lavington'] },
      budget: { max: { amount: 120000, currency: 'KES' }, period: 'monthly' },
      mustHaves: ['parking', 'backup_power'],
      timeline: '1_3_months',
      notes: 'Near a school',
    })
  })

  it('keeps payment and title for a purchase, and drops bedrooms and must-haves for land', () => {
    const criteria = toRequestCriteria({
      ...valid,
      intent: 'buy',
      category: 'land',
      propertyTypes: ['plot'],
      currency: 'USD',
      budgetMin: '20000',
      budgetMax: '50,000',
    })
    expect(criteria).toMatchObject({
      bedrooms: undefined,
      mustHaves: [],
      paymentMode: 'mortgage',
      titleRequirement: 'title_deed',
      budget: { min: { amount: 20000, currency: 'USD' }, max: { amount: 50000, currency: 'USD' }, period: 'total' },
    })
  })
})

describe('summarizeCriteria', () => {
  it('reads like a board card', () => {
    expect(summarizeCriteria(toRequestCriteria(valid))).toBe(
      '3-bed apartment to rent, Kilimani, lavington, Nairobi, up to KES 120,000 a month',
    )
    expect(
      summarizeCriteria(
        toRequestCriteria({
          ...valid,
          intent: 'buy',
          propertyTypes: ['maisonette', 'townhouse'],
          bedrooms: '4',
          county: 'Machakos',
          areas: 'Syokimau',
          budgetMin: '15000000',
          budgetMax: '20000000',
        }),
      ),
    ).toBe('4-bed maisonette or townhouse to buy, Syokimau, Machakos, KES 15 million to 20 million')
  })
})

describe('quickRequestDefaults', () => {
  it('reads the homepage quick request', () => {
    expect(quickRequestDefaults({ intent: 'buy', area: 'Karen', budget: '10000000-20000000' })).toEqual({
      intent: 'buy',
      areas: 'Karen',
      budgetMin: '10,000,000',
      budgetMax: '20,000,000',
    })
  })

  it('ignores missing or odd values', () => {
    expect(quickRequestDefaults({ intent: 'steal', budget: '250000-' })).toEqual({
      intent: 'rent',
      areas: '',
      budgetMin: '250,000',
      budgetMax: '',
    })
  })
})
