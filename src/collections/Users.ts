import type { Access, CollectionConfig, FieldAccess } from 'payload'
import { googleSessionStrategy } from '@/lib/auth/session-strategy'
import { normalizeEmail } from '@/lib/auth/staff-login'

const isAdmin: Access = ({ req: { user } }) => user?.staffLevel === 'admin'
const isAdminField: FieldAccess = ({ req: { user } }) => user?.staffLevel === 'admin'

const isAdminOrSelf: Access = ({ req: { user } }) => {
  if (!user) return false
  if (user.staffLevel === 'admin') return true
  return { id: { equals: user.id } }
}

// Staff accounts for the admin panel. An admin invites someone by adding their email here;
// they then sign in with that Google account. Public accounts arrive in Phase 2.
export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'Staff member', plural: 'Staff' },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'name', 'staffLevel', 'active'],
    group: 'Settings',
  },
  auth: {
    disableLocalStrategy: true,
    strategies: [googleSessionStrategy],
    tokenExpiration: 60 * 60 * 8,
    cookies: {
      sameSite: 'Lax',
      secure: process.env.NODE_ENV === 'production',
    },
  },
  access: {
    admin: ({ req: { user } }) => Boolean(user),
    read: isAdminOrSelf,
    create: isAdmin,
    update: isAdminOrSelf,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'email',
      type: 'email',
      required: true,
      unique: true,
      index: true,
      access: { update: isAdminField },
      admin: { description: 'The Google account this person signs in with.' },
      hooks: {
        beforeValidate: [({ value }) => (typeof value === 'string' ? normalizeEmail(value) : value)],
      },
    },
    { name: 'name', type: 'text' },
    {
      name: 'staffLevel',
      type: 'select',
      required: true,
      defaultValue: 'agent',
      access: { update: isAdminField },
      options: [
        { label: 'Agent', value: 'agent' },
        { label: 'Manager', value: 'manager' },
        { label: 'Admin', value: 'admin' },
      ],
      admin: {
        description:
          'Agents see unassigned leads and their own. Managers and admins see all leads. Only admins manage staff.',
      },
    },
    {
      name: 'active',
      type: 'checkbox',
      defaultValue: true,
      access: { update: isAdminField },
      admin: { description: 'Untick to end this person’s access straight away.' },
    },
    {
      name: 'googleSub',
      type: 'text',
      index: true,
      access: { create: () => false, update: () => false, read: isAdminField },
      admin: { hidden: true },
    },
  ],
}
