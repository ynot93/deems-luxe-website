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
const getPublicSettings = cache(async () => {
  const payload = await getPayload({ config })
  return payload.findGlobal({ slug: 'site-settings', depth: 0, overrideAccess: false })
})

export const getPublicContact = cache(async (): Promise<PublicContact> => {
  const { phone, whatsapp, email, officeAddress, officeHours } = await getPublicSettings()
  return { phone, whatsapp, email, officeAddress, officeHours }
})

// For showing approximate USD and KES equivalents. Null until staff set a rate.
export const getKesPerUsd = async () => (await getPublicSettings()).kesPerUsd ?? null
