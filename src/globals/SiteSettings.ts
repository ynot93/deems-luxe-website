import type { GlobalConfig } from 'payload'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  admin: {
    group: 'Settings',
    description: 'Contact details only appear on the site once they are filled in here.',
  },
  access: {
    read: () => true,
    update: ({ req: { user } }) => user?.staffLevel === 'admin' || user?.staffLevel === 'manager',
  },
  fields: [
    { name: 'phone', type: 'text', admin: { description: 'For example +254 700 000 000' } },
    {
      name: 'whatsapp',
      type: 'text',
      admin: { description: 'International format with digits only, for example 254700000000' },
    },
    { name: 'email', type: 'email', label: 'Public email' },
    { name: 'officeAddress', type: 'textarea' },
    { name: 'officeHours', type: 'text' },
    {
      name: 'leadInboxEmail',
      type: 'email',
      admin: { description: 'New requests and quote forms are emailed here. Never shown on the site.' },
      access: { read: ({ req: { user } }) => Boolean(user) },
    },
    {
      name: 'kesPerUsd',
      type: 'number',
      label: 'KES per 1 USD',
      min: 1,
      admin: { description: 'Used to show approximate USD and KES equivalents on forms.' },
    },
  ],
}
