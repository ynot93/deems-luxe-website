import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import { Media } from './collections/Media'
import { Users } from './collections/Users'
import { SiteSettings } from './globals/SiteSettings'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL ?? 'http://localhost:3000'

export default buildConfig({
  serverURL: serverUrl,
  csrf: [serverUrl],
  secret: process.env.PAYLOAD_SECRET ?? '',
  telemetry: false,
  graphQL: { disable: true },
  admin: {
    user: Users.slug,
    importMap: { baseDir: dirname },
    meta: { titleSuffix: ' | Deems Luxe Homes' },
    components: {
      beforeLogin: ['/components/admin/GoogleSignIn#GoogleSignIn'],
      graphics: {
        Icon: '/components/admin/Brand#AdminIcon',
        Logo: '/components/admin/Brand#AdminLogo',
      },
    },
  },
  collections: [Users, Media],
  globals: [SiteSettings],
  editor: lexicalEditor(),
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URL },
  }),
  sharp,
  typescript: { outputFile: path.join(dirname, 'payload-types.ts') },
})
