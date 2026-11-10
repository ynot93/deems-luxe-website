import { describe, expect, it } from 'vitest'
import { describeServiceDetails, serviceDetails, serviceFormSchemas } from './service-forms'

const contact = { name: 'Otieno Ouma', phone: '+447700900123', email: '', consent: true, company: '' } as const

describe('serviceFormSchemas', () => {
  it('accepts a valuation request', () => {
    const result = serviceFormSchemas.valuation.safeParse({
      purpose: 'mortgage',
      propertyType: 'maisonette',
      county: 'Kiambu',
      area: 'Ruaka',
      size: '',
      titleType: 'not_sure',
      urgency: 'this_month',
      message: '',
      ...contact,
    })
    expect(result.success).toBe(true)
  })

  it('needs at least one management service', () => {
    const result = serviceFormSchemas.management.safeParse({
      propertyType: 'apartment_block',
      county: 'Nairobi',
      area: '',
      units: '12',
      occupancy: 'partly_let',
      servicesWanted: [],
      message: '',
      ...contact,
    })
    expect(result.error?.issues.map((issue) => issue.path[0])).toEqual(['servicesWanted'])
  })
})

describe('service details', () => {
  it('keeps the answers, drops contact details and blanks, and reads them back in words', () => {
    const details = serviceDetails({
      purpose: 'mortgage',
      propertyType: 'maisonette',
      county: 'Kiambu',
      area: '',
      servicesWanted: ['rent_collection', 'maintenance'],
      ...contact,
    })
    expect(details).toEqual({
      purpose: 'mortgage',
      propertyType: 'maisonette',
      county: 'Kiambu',
      servicesWanted: ['rent_collection', 'maintenance'],
    })
    expect(describeServiceDetails(details)).toBe(
      'Purpose: Mortgage or bank\nProperty: Maisonette\nCounty: Kiambu\nServices wanted: Rent collection, Repairs and maintenance',
    )
  })
})
