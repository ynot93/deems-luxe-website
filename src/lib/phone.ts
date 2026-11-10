// Accepts Kenyan numbers written the usual ways (0712 345 678, 254712345678, +254 712 345 678)
// and international numbers with a leading +, for diaspora buyers. Returns E.164, or null.
export const normalizePhone = (raw: string): string | null => {
  const compact = raw.trim().replace(/[\s\-().]/g, '')
  if (/^0[17]\d{8}$/.test(compact)) return `+254${compact.slice(1)}`
  if (/^254[17]\d{8}$/.test(compact)) return `+${compact}`
  if (/^\+254[17]\d{8}$/.test(compact)) return compact
  if (/^\+(?!254)[1-9]\d{7,14}$/.test(compact)) return compact
  return null
}
