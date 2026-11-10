import { describe, expect, it } from 'vitest'
import { normalizePhone } from './phone'

describe('normalizePhone', () => {
  it.each([
    ['0712 345 678', '+254712345678'],
    ['0112-345-678', '+254112345678'],
    ['254712345678', '+254712345678'],
    ['+254 712 345 678', '+254712345678'],
    ['+44 7700 900123', '+447700900123'],
    ['+1 (415) 555-0100', '+14155550100'],
  ])('accepts %s', (raw, expected) => {
    expect(normalizePhone(raw)).toBe(expected)
  })

  it.each(['0712', '0812345678', '+2547123', '712345678', 'call me', '+0 123 456 789'])('refuses %s', (raw) => {
    expect(normalizePhone(raw)).toBeNull()
  })
})
