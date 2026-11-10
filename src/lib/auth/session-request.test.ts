import { describe, expect, it } from 'vitest'
import { canUseSessionCookie } from './session-request'

const allowed = ['https://deems.example']
const check = (headers: Record<string, string>) => canUseSessionCookie(new Headers(headers), allowed)

describe('canUseSessionCookie', () => {
  it('allows requests from this site', () => {
    expect(check({ origin: 'https://deems.example' })).toBe(true)
    expect(check({ 'sec-fetch-site': 'same-origin', 'sec-fetch-mode': 'cors' })).toBe(true)
  })

  it('allows typing the address directly', () => {
    expect(check({ 'sec-fetch-site': 'none', 'sec-fetch-mode': 'navigate' })).toBe(true)
  })

  it('allows opening a page from another site, such as Google or Gmail', () => {
    expect(check({ 'sec-fetch-site': 'cross-site', 'sec-fetch-mode': 'navigate' })).toBe(true)
  })

  it('refuses a fetch from another site', () => {
    expect(check({ 'sec-fetch-site': 'cross-site', 'sec-fetch-mode': 'cors' })).toBe(false)
  })

  it('refuses a form post from another site, even as a navigation', () => {
    expect(
      check({
        origin: 'https://evil.example',
        'sec-fetch-site': 'cross-site',
        'sec-fetch-mode': 'navigate',
      }),
    ).toBe(false)
  })

  it('refuses clients that send no browser headers', () => {
    expect(check({})).toBe(false)
  })
})
