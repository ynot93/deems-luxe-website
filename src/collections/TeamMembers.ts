import type { Access, CollectionConfig } from 'payload'
import { rebuildPages } from '@/lib/revalidate'
import { isManager } from './leads/shared'

const managersOnly: Access = ({ req: { user } }) => isManager(user)

// People shown on the About page. Only real staff, with their permission and a real photo.
export const TeamMembers: CollectionConfig = {
  slug: 'team-members',
  labels: { singular: 'Team member', plural: 'Team' },
  admin: {
    group: 'Content',
    useAsTitle: 'name',
    defaultColumns: ['name', 'role', 'published', 'order'],
    description: 'The About page shows published team members. It hides the team section while none are published.',
  },
  access: {
    read: ({ req: { user } }) => (user ? true : { published: { equals: true } }),
    create: managersOnly,
    update: managersOnly,
    delete: managersOnly,
  },
  defaultSort: 'order',
  hooks: {
    afterChange: [() => rebuildPages('/about', 'page')],
    afterDelete: [() => rebuildPages('/about', 'page')],
  },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'role', type: 'text', required: true, admin: { description: 'For example Senior agent' } },
      ],
    },
    { name: 'bio', type: 'textarea', maxLength: 400 },
    { name: 'photo', type: 'upload', relationTo: 'media', required: true },
    {
      name: 'registration',
      type: 'group',
      admin: { description: 'Only fill this in with a registration number that has been checked.' },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'body',
              type: 'select',
              options: [
                { label: 'Estate Agents Registration Board (EARB)', value: 'EARB' },
                { label: 'Valuers Registration Board (VRB)', value: 'VRB' },
              ],
            },
            { name: 'number', type: 'text' },
          ],
        },
      ],
    },
    { name: 'order', type: 'number', defaultValue: 0, admin: { position: 'sidebar', description: 'Lower shows first.' } },
    { name: 'published', type: 'checkbox', defaultValue: false, admin: { position: 'sidebar' } },
  ],
}
