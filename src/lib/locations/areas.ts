import type { County } from './counties'

// Suggestions only: people can type any area. Covers Nairobi estates and the busiest
// satellite towns, where most requests are expected.
export const SUGGESTED_AREAS: Partial<Record<County, string[]>> = {
  Nairobi: [
    'Kilimani',
    'Kileleshwa',
    'Lavington',
    'Westlands',
    'Parklands',
    'Riverside',
    'Spring Valley',
    'Muthaiga',
    'Runda',
    'Gigiri',
    'Karen',
    'Langata',
    'Upper Hill',
    'Hurlingham',
    'Ngong Road',
    'South B',
    'South C',
    'Embakasi',
    'Donholm',
    'Buruburu',
    'Kasarani',
    'Roysambu',
    'Kahawa',
    'Thika Road',
  ],
  Kiambu: ['Ruaka', 'Kiambu Road', 'Ruiru', 'Juja', 'Thika', 'Kikuyu', 'Limuru', 'Tigoni'],
  Kajiado: ['Kitengela', 'Ongata Rongai', 'Ngong', 'Kiserian', 'Isinya'],
  Machakos: ['Syokimau', 'Athi River', 'Mlolongo', 'Machakos Town'],
  Mombasa: ['Nyali', 'Bamburi', 'Shanzu', 'Kizingo', 'Tudor'],
  Kilifi: ['Mtwapa', 'Kilifi Town', 'Watamu', 'Malindi'],
  Nakuru: ['Nakuru Town', 'Naivasha', 'Milimani'],
}

// Splits a typed list such as "Kilimani, Lavington" into tidy, unique area names
export const parseAreas = (value: string | undefined): string[] => {
  const seen = new Set<string>()
  return (value ?? '')
    .split(/[,;\n]/)
    .map((area) => area.trim().replace(/\s+/g, ' '))
    .filter((area) => {
      const key = area.toLowerCase()
      if (!area || seen.has(key)) return false
      seen.add(key)
      return true
    })
}
