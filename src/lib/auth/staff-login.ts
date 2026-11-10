export type GoogleIdentity = {
  sub: string
  email: string
  emailVerified: boolean
  name?: string
}

export type StaffRecord = {
  id: number | string
  googleSub?: string | null
  active?: boolean | null
}

export type LoginDenial = 'unverified_email' | 'not_listed' | 'deactivated' | 'account_mismatch'

export type LoginDecision =
  | { outcome: 'allow'; id: StaffRecord['id']; linkGoogleSub: boolean }
  | { outcome: 'create_admin' }
  | { outcome: 'deny'; reason: LoginDenial }

export const normalizeEmail = (email: string) => email.trim().toLowerCase()

export const parseEmailList = (list: string | undefined) =>
  (list ?? '').split(',').map(normalizeEmail).filter(Boolean)

/**
 * The approved list is the only gate, because staff use personal Google accounts.
 * Once linked, an account is matched on Google's stable ID, so a recycled email can't take it over.
 */
export const decideStaffLogin = ({
  identity,
  staff,
  bootstrapEmails,
}: {
  identity: GoogleIdentity
  staff: StaffRecord | null
  bootstrapEmails: string[]
}): LoginDecision => {
  if (!identity.emailVerified) return { outcome: 'deny', reason: 'unverified_email' }

  if (!staff) {
    return bootstrapEmails.includes(normalizeEmail(identity.email))
      ? { outcome: 'create_admin' }
      : { outcome: 'deny', reason: 'not_listed' }
  }

  if (staff.active === false) return { outcome: 'deny', reason: 'deactivated' }
  if (staff.googleSub && staff.googleSub !== identity.sub) {
    return { outcome: 'deny', reason: 'account_mismatch' }
  }

  return { outcome: 'allow', id: staff.id, linkGoogleSub: !staff.googleSub }
}
