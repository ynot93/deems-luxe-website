import config from '@payload-config'
import { getPayload } from 'payload'
import { cache } from 'react'

export type PublicContact = {
  phone?: string | null
  whatsapp?: string | null
  email?: string | null
  officeAddress?: string | null
  officeHours?: string | null
}

// Runs without a user, so access control strips staff-only fields such as the lead inbox.
export const getPublicContact = cache(async (): Promise<PublicContact> => {
  const payload = await getPayload({ config })
  const { phone, whatsapp, email, officeAddress, officeHours } = await payload.findGlobal({
    slug: 'site-settings',
    depth: 0,
    overrideAccess: false,
  })
  return { phone, whatsapp, email, officeAddress, officeHours }
})
