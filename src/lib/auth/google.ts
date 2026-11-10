import { createHash, randomBytes } from 'node:crypto'
import { createRemoteJWKSet, jwtVerify } from 'jose'
import type { GoogleIdentity } from './staff-login'

const googleEndpoints = {
  issuer: 'https://accounts.google.com',
  authorize: 'https://accounts.google.com/o/oauth2/v2/auth',
  token: 'https://oauth2.googleapis.com/token',
  jwks: 'https://www.googleapis.com/oauth2/v3/certs',
}

// Tests point this at a stub identity provider. Production always talks to Google.
const stubBase = process.env.NODE_ENV === 'production' ? undefined : process.env.GOOGLE_OIDC_STUB_URL

const endpoints = stubBase
  ? {
      issuer: stubBase,
      authorize: `${stubBase}/authorize`,
      token: `${stubBase}/token`,
      jwks: `${stubBase}/jwks`,
    }
  : googleEndpoints

const jwks = createRemoteJWKSet(new URL(endpoints.jwks))

export const callbackUrl = () =>
  `${process.env.NEXT_PUBLIC_SERVER_URL ?? 'http://localhost:3000'}/api/auth/google/callback`

export const isGoogleConfigured = () =>
  Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)

export type SignInAttempt = { state: string; verifier: string; nonce: string }

const randomToken = () => randomBytes(32).toString('base64url')

export const createSignInAttempt = (): SignInAttempt => ({
  state: randomToken(),
  verifier: randomToken(),
  nonce: randomToken(),
})

export const authorizationUrl = ({ state, verifier, nonce }: SignInAttempt) => {
  const url = new URL(endpoints.authorize)
  url.search = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID ?? '',
    redirect_uri: callbackUrl(),
    response_type: 'code',
    scope: 'openid email profile',
    state,
    nonce,
    code_challenge: createHash('sha256').update(verifier).digest('base64url'),
    code_challenge_method: 'S256',
    prompt: 'select_account',
  }).toString()
  return url
}

export const exchangeCodeForIdentity = async (
  code: string,
  { verifier, nonce }: SignInAttempt,
): Promise<GoogleIdentity> => {
  const response = await fetch(endpoints.token, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID ?? '',
      client_secret: process.env.GOOGLE_CLIENT_SECRET ?? '',
      redirect_uri: callbackUrl(),
      grant_type: 'authorization_code',
      code_verifier: verifier,
    }),
  })
  if (!response.ok) throw new Error(`Google token exchange failed with ${response.status}`)

  const { id_token: idToken } = (await response.json()) as { id_token?: string }
  if (!idToken) throw new Error('Google token response had no ID token')

  const { payload: claims } = await jwtVerify(idToken, jwks, {
    issuer: endpoints.issuer,
    audience: process.env.GOOGLE_CLIENT_ID,
  })
  if (claims.nonce !== nonce) throw new Error('Google ID token nonce did not match')
  if (typeof claims.sub !== 'string' || typeof claims.email !== 'string') {
    throw new Error('Google ID token is missing the account ID or email')
  }

  return {
    sub: claims.sub,
    email: claims.email,
    emailVerified: claims.email_verified === true,
    name: typeof claims.name === 'string' ? claims.name : undefined,
  }
}
