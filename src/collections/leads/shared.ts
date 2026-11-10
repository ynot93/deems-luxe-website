import { APIError, type Access, type Field, type FieldAccess, type PayloadRequest } from 'payload'

type Staff = PayloadRequest['user']

export const isManager = (user: Staff) => user?.staffLevel === 'manager' || user?.staffLevel === 'admin'

const idOf = (value: unknown) =>
  value && typeof value === 'object' && 'id' in value ? (value as { id: unknown }).id : (value ?? null)

// Agents see unassigned leads and their own; managers and admins see all
export const leadAccess: Access = ({ req: { user } }) => {
  if (!user) return false
  if (isManager(user)) return true
  return { or: [{ assignedAgent: { exists: false } }, { assignedAgent: { equals: user.id } }] }
}

const neverThroughApi: FieldAccess = () => false

// Leads are only ever written by the server, so the public API cannot create them, and the
// details a visitor gave cannot be edited afterwards.
export const leadCollectionAccess = {
  admin: ({ req: { user } }: { req: PayloadRequest }) => Boolean(user),
  create: () => false,
  read: leadAccess,
  update: leadAccess,
  delete: ({ req: { user } }: { req: PayloadRequest }) => user?.staffLevel === 'admin',
}

export const contactGroup: Field = {
  name: 'contact',
  type: 'group',
  access: { update: neverThroughApi },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'phone', type: 'text', required: true, admin: { description: 'Call to confirm before acting.' } },
        { name: 'email', type: 'email' },
      ],
    },
  ],
}

export const assignedAgentField: Field = {
  name: 'assignedAgent',
  type: 'relationship',
  relationTo: 'users',
  index: true,
  admin: {
    position: 'sidebar',
    description: 'Agents can take an unassigned lead. Only managers can reassign one.',
  },
  hooks: {
    beforeChange: [
      ({ req: { user }, value, originalDoc }) => {
        if (!user || isManager(user)) return value
        const before = idOf(originalDoc?.assignedAgent)
        const after = idOf(value)
        if (before === after) return value
        if (before === null && after === user.id) return value
        throw new APIError('Only managers can reassign a lead. You can take an unassigned lead yourself.', 403)
      },
    ],
  },
}

// Bookkeeping kept on every lead: consent, email delivery and the CRM link
export const leadTrackingFields: Field[] = [
  {
    name: 'consentAt',
    type: 'date',
    required: true,
    access: { update: neverThroughApi },
    admin: { position: 'sidebar', readOnly: true, date: { pickerAppearance: 'dayAndTime' } },
  },
  {
    name: 'emailStatus',
    type: 'select',
    defaultValue: 'pending',
    options: [
      { label: 'Waiting to send', value: 'pending' },
      { label: 'Sent', value: 'sent' },
      { label: 'Failed, will retry', value: 'failed' },
      { label: 'Gave up', value: 'gave_up' },
    ],
    access: { update: neverThroughApi },
    admin: { position: 'sidebar', readOnly: true, description: 'The email to the lead inbox.' },
  },
  { name: 'emailAttempts', type: 'number', defaultValue: 0, access: { update: neverThroughApi }, admin: { hidden: true } },
  { name: 'lastEmailError', type: 'text', access: { update: neverThroughApi }, admin: { hidden: true } },
  // A keyed hash of the sender's IP address, used only to limit repeat submissions
  {
    name: 'ipHash',
    type: 'text',
    index: true,
    access: { read: neverThroughApi, update: neverThroughApi },
    admin: { hidden: true },
  },
  {
    name: 'crmId',
    type: 'text',
    label: 'CRM ID',
    access: { update: neverThroughApi },
    admin: { position: 'sidebar', readOnly: true, description: 'Filled in once the CRM is connected.' },
  },
  { name: 'staffNotes', type: 'textarea', admin: { description: 'Only staff see these notes.' } },
]
