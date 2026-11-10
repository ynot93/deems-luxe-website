import type { CollectionConfig } from 'payload'
import { SERVICES } from '@/lib/schemas/service-forms'
import { assignedAgentField, contactGroup, leadCollectionAccess, leadTrackingFields } from './shared'

export const ServiceLeads: CollectionConfig = {
  slug: 'service-leads',
  labels: { singular: 'Quote or enquiry', plural: 'Quotes and enquiries' },
  admin: {
    group: 'Leads',
    useAsTitle: 'title',
    defaultColumns: ['title', 'service', 'status', 'assignedAgent', 'createdAt'],
    description: 'Quote requests from the service pages, and messages from the contact page.',
  },
  access: leadCollectionAccess,
  defaultSort: '-createdAt',
  fields: [
    { name: 'title', type: 'text', access: { update: () => false }, admin: { readOnly: true } },
    {
      name: 'service',
      type: 'select',
      required: true,
      index: true,
      options: SERVICES.map(({ value, label }) => ({ value, label })),
      access: { update: () => false },
    },
    {
      name: 'summary',
      type: 'textarea',
      label: 'Their answers',
      access: { update: () => false },
      admin: { readOnly: true },
    },
    // The same answers as stored data, for the CRM and Phase 2
    { name: 'details', type: 'json', access: { update: () => false }, admin: { hidden: true } },
    contactGroup,
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'new',
      index: true,
      options: [
        { label: 'New', value: 'new' },
        { label: 'Quoted', value: 'quoted' },
        { label: 'Won', value: 'won' },
        { label: 'Lost', value: 'lost' },
      ],
      admin: { position: 'sidebar' },
    },
    assignedAgentField,
    ...leadTrackingFields,
  ],
}
