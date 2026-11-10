import type { Service } from '@/lib/schemas/service-forms'
import { stockPhotos } from '@/lib/stock-photos'

// Draft copy for the service pages, written from docs/requirements.md. Moves into the CMS
// once the owner signs it off. Credentials (registered valuers, EARB numbers) are left out
// until they are confirmed.
export type ServicePage = {
  slug: string
  service: Exclude<Service, 'general'>
  title: string
  summary: string
  description: string
  lead: string
  photo: (typeof stockPhotos)[keyof typeof stockPhotos]
  included: { title: string; items: string[] }[]
  forWho: string[]
  steps: { title: string; text: string }[]
  formTitle: string
  formIntro: string
  submitLabel: string
}

export const SERVICE_PAGES: ServicePage[] = [
  {
    slug: 'property-management',
    service: 'management',
    title: 'Property management',
    summary: 'Tenant placement, rent collection, repairs and monthly statements for your property.',
    description:
      'Property management in Kenya from Deems Luxe Homes: tenants found and screened, rent collected, repairs handled and a statement every month.',
    lead: 'We find and screen tenants, collect the rent, look after repairs and send you a statement every month, so the property earns without taking your time.',
    photo: stockPhotos.nairobiTowers,
    included: [
      {
        title: 'What’s included',
        items: [
          'Marketing vacant units',
          'Tenant screening and placement',
          'Lease preparation',
          'Rent collection',
          'Following up arrears',
          'Repairs and maintenance, coordinated for you',
          'Regular inspections',
          'A statement every month',
        ],
      },
    ],
    forWho: [
      'Landlords with an apartment block or several units',
      'Owners letting a single apartment or house',
      'Owners abroad who can’t be there in person',
      'Owners of commercial buildings',
    ],
    steps: [
      { title: 'Tell us about the property', text: 'Where it is, how many units, and how much is let today.' },
      { title: 'We visit and send a proposal', text: 'We see the property, then set out the services and fees in writing.' },
      { title: 'We take over the day to day', text: 'Tenants, rent and repairs come to us, and you get a statement every month.' },
    ],
    formTitle: 'Ask for a management quote',
    formIntro: 'Tell us about the property and we’ll be in touch to arrange a visit.',
    submitLabel: 'Ask for a quote',
  },
  {
    slug: 'property-valuation',
    service: 'valuation',
    title: 'Property valuation',
    summary: 'Valuations for sale, mortgage, insurance, probate, rent reviews and land.',
    description:
      'Property and land valuation in Kenya from Deems Luxe Homes, for sale or purchase, mortgages, insurance, probate and rent reviews.',
    lead: 'Know what a property or plot is worth before you sell, buy, borrow, insure or divide an estate.',
    photo: stockPhotos.landCityView,
    included: [
      {
        title: 'Valuations for',
        items: [
          'Sale or purchase',
          'Mortgages and bank lending',
          'Insurance',
          'Probate and estate planning',
          'Rent reviews',
          'Land and plots',
        ],
      },
    ],
    forWho: [
      'Owners selling, or buyers checking a price',
      'Borrowers whose bank needs a valuation',
      'Families settling an estate',
      'Landlords and tenants agreeing a rent review',
    ],
    steps: [
      { title: 'Tell us what it’s for', text: 'The purpose, the property and where it is.' },
      { title: 'We confirm the fee and a date', text: 'Then we ask for a copy of the title and any photos.' },
      { title: 'Inspection and report', text: 'We inspect the property and send you a written report.' },
    ],
    formTitle: 'Ask for a valuation quote',
    formIntro: 'Tell us about the property and what the valuation is for.',
    submitLabel: 'Ask for a quote',
  },
  {
    slug: 'real-estate-agency',
    service: 'agency',
    title: 'Real estate agency',
    summary: 'Pricing advice, marketing, negotiation and support through to transfer, for sellers and buyers.',
    description:
      'Sell, let, buy or rent property in Kenya with a Deems Luxe Homes agent handling pricing, viewings, negotiation and paperwork.',
    lead: 'Hand the whole job to a Deems agent, whether you’re selling, letting, buying or renting.',
    photo: stockPhotos.nairobiCityscape,
    included: [
      {
        title: 'For sellers and landlords',
        items: [
          'Advice on price or rent',
          'Marketing the property',
          'Putting it in front of buyers and tenants whose requests fit',
          'Viewings and negotiation',
          'Support through to transfer or move-in',
        ],
      },
      {
        title: 'For buyers and tenants',
        items: [
          'An agent who searches for you',
          'Documents checked before you view',
          'An agent with you at viewings',
          'Negotiation and the paperwork, handled',
        ],
      },
    ],
    forWho: [
      'Owners who want to sell or let without the legwork',
      'Buyers and tenants who want someone searching for them',
      'Diaspora clients buying or selling from abroad',
    ],
    steps: [
      { title: 'Tell us what you need', text: 'Selling, letting, buying or renting, and the property or what you want.' },
      { title: 'Your agent makes a plan', text: 'Price, marketing or the search, agreed with you before anything starts.' },
      { title: 'Your agent sees it through', text: 'Viewings, negotiation and paperwork, through to transfer or keys.' },
    ],
    formTitle: 'Talk to an agent',
    formIntro: 'Tell us what you need and an agent will be in touch.',
    submitLabel: 'Send to an agent',
  },
]

export const servicePage = (slug: string) => SERVICE_PAGES.find((page) => page.slug === slug)
