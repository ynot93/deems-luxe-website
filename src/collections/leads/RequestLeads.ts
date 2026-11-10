import type { CollectionConfig, Field } from 'payload'
import { COUNTIES } from '@/lib/locations/counties'
import {
  CATEGORIES,
  CURRENCIES,
  INTENTS,
  MUST_HAVES,
  PAYMENT_MODES,
  PROPERTY_TYPES,
  TIMELINES,
  TITLE_REQUIREMENTS,
} from '@/lib/schemas/request-criteria'
import { assignedAgentField, contactGroup, leadCollectionAccess, leadTrackingFields } from './shared'

const options = (list: readonly { value: string; label: string }[]) =>
  list.map(({ value, label }) => ({ value, label }))

const moneyFields = (name: string, label: string): Field => ({
  name,
  label,
  type: 'group',
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'amount', type: 'number', min: 0 },
        { name: 'currency', type: 'select', options: [...CURRENCIES] },
      ],
    },
  ],
})

// Mirrors RequestCriteria in src/lib/schemas/request-criteria.ts, so Phase 1 leads move onto
// the Phase 2 board unchanged. The server validates with that schema before saving.
const criteriaGroup: Field = {
  name: 'criteria',
  type: 'group',
  label: 'What they want',
  access: { update: () => false },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'intent', type: 'select', required: true, options: options(INTENTS) },
        { name: 'category', type: 'select', required: true, options: options(CATEGORIES) },
        { name: 'timeline', type: 'select', required: true, options: options(TIMELINES) },
      ],
    },
    { name: 'propertyTypes', type: 'select', hasMany: true, required: true, options: options(PROPERTY_TYPES) },
    {
      name: 'locations',
      type: 'group',
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'county', type: 'select', required: true, options: [...COUNTIES] },
            { name: 'areas', type: 'text', hasMany: true },
          ],
        },
      ],
    },
    {
      name: 'budget',
      type: 'group',
      fields: [
        moneyFields('min', 'Lowest'),
        moneyFields('max', 'Highest'),
        {
          name: 'period',
          type: 'select',
          options: [
            { label: 'Total price', value: 'total' },
            { label: 'Per month', value: 'monthly' },
          ],
        },
      ],
    },
    {
      name: 'bedrooms',
      type: 'group',
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'min', type: 'number', label: 'At least' },
            { name: 'max', type: 'number', label: 'At most' },
          ],
        },
      ],
    },
    { name: 'bathrooms', type: 'number' },
    {
      type: 'row',
      fields: [
        { name: 'paymentMode', type: 'select', options: options(PAYMENT_MODES) },
        { name: 'titleRequirement', type: 'select', options: options(TITLE_REQUIREMENTS) },
      ],
    },
    { name: 'mustHaves', type: 'select', hasMany: true, options: options(MUST_HAVES) },
    { name: 'notes', type: 'textarea' },
  ],
}

export const RequestLeads: CollectionConfig = {
  slug: 'request-leads',
  labels: { singular: 'Property request', plural: 'Property requests' },
  admin: {
    group: 'Leads',
    useAsTitle: 'summary',
    defaultColumns: ['summary', 'contact.name', 'status', 'assignedAgent', 'createdAt'],
    description: 'Requests from the Post a Request form. Call each person to confirm before you start.',
  },
  access: leadCollectionAccess,
  defaultSort: '-createdAt',
  fields: [
    { name: 'summary', type: 'text', access: { update: () => false }, admin: { readOnly: true } },
    criteriaGroup,
    contactGroup,
    {
      name: 'whatsapp',
      type: 'checkbox',
      label: 'Happy to be contacted on WhatsApp',
      access: { update: () => false },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'new',
      index: true,
      options: [
        { label: 'New', value: 'new' },
        { label: 'Contacted', value: 'contacted' },
        { label: 'Qualified', value: 'qualified' },
        { label: 'Closed', value: 'closed' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'source',
      type: 'select',
      required: true,
      defaultValue: 'website',
      options: [
        { label: 'Website', value: 'website' },
        { label: 'WhatsApp', value: 'whatsapp' },
        { label: 'Phone', value: 'phone' },
        { label: 'Walk-in', value: 'walk_in' },
      ],
      admin: { position: 'sidebar' },
    },
    assignedAgentField,
    ...leadTrackingFields,
  ],
}
