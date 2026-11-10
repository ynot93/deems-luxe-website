import { jwtVerify } from 'jose'
import { parseCookies, type AuthStrategy } from 'payload'
import { canUseSessionCookie } from './session-request'

// Payload's own JWT strategy switches off with password login, so this one verifies the
// same cookie and token. Payload's logout and token refresh keep working unchanged.
export const googleSessionStrategy: AuthStrategy = {
  name: 'google-session',
  authenticate: async ({ headers, payload }) => {
    const token = parseCookies(headers).get(`${payload.config.cookiePrefix}-token`)
    if (!token || !canUseSessionCookie(headers, payload.config.csrf)) return { user: null }

    try {
      const secret = new TextEncoder().encode(payload.secret)
      const { payload: claims } = await jwtVerify(token, secret, { algorithms: ['HS256'] })
      const id = claims.id ?? claims.sub
      if (claims.collection !== 'users' || (typeof id !== 'string' && typeof id !== 'number')) {
        return { user: null }
      }

      const user = await payload.findByID({
        id,
        collection: 'users',
        depth: 0,
        overrideAccess: true,
        disableErrors: true,
      })
      // Checked on every request, so deactivating someone ends their session straight away.
      if (!user || user.active === false) return { user: null }

      return { user: { ...user, collection: 'users', _strategy: 'google-session' } }
    } catch {
      return { user: null }
    }
  },
}
