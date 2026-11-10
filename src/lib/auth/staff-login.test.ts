import { describe, expect, it } from 'vitest'
import { decideStaffLogin, parseEmailList, type GoogleIdentity } from './staff-login'

const identity: GoogleIdentity = { sub: 'google-1', email: 'Agent@Example.com', emailVerified: true }

describe('decideStaffLogin', () => {
  it('refuses an email Google has not verified, even for listed staff', () => {
    const decision = decideStaffLogin({
      identity: { ...identity, emailVerified: false },
      staff: { id: 1, active: true },
      bootstrapEmails: ['agent@example.com'],
    })
    expect(decision).toEqual({ outcome: 'deny', reason: 'unverified_email' })
  })

  it('refuses an email that is not on the approved list', () => {
    expect(decideStaffLogin({ identity, staff: null, bootstrapEmails: [] })).toEqual({
      outcome: 'deny',
      reason: 'not_listed',
    })
  })

  it('creates an admin only for a bootstrap email, ignoring case', () => {
    expect(
      decideStaffLogin({ identity, staff: null, bootstrapEmails: ['agent@example.com'] }),
    ).toEqual({ outcome: 'create_admin' })
  })

  it('refuses deactivated staff', () => {
    expect(
      decideStaffLogin({ identity, staff: { id: 1, active: false }, bootstrapEmails: [] }),
    ).toEqual({ outcome: 'deny', reason: 'deactivated' })
  })

  it('links the Google account on first sign-in', () => {
    expect(
      decideStaffLogin({ identity, staff: { id: 1, active: true }, bootstrapEmails: [] }),
    ).toEqual({ outcome: 'allow', id: 1, linkGoogleSub: true })
  })

  it('allows the linked Google account without relinking', () => {
    expect(
      decideStaffLogin({
        identity,
        staff: { id: 1, active: true, googleSub: 'google-1' },
        bootstrapEmails: [],
      }),
    ).toEqual({ outcome: 'allow', id: 1, linkGoogleSub: false })
  })

  it('refuses a different Google account using a linked email', () => {
    expect(
      decideStaffLogin({
        identity: { ...identity, sub: 'google-2' },
        staff: { id: 1, active: true, googleSub: 'google-1' },
        bootstrapEmails: [],
      }),
    ).toEqual({ outcome: 'deny', reason: 'account_mismatch' })
  })
})

describe('parseEmailList', () => {
  it('normalises and drops blanks', () => {
    expect(parseEmailList(' A@x.com, ,b@X.com,')).toEqual(['a@x.com', 'b@x.com'])
    expect(parseEmailList(undefined)).toEqual([])
  })
})
