export const SIGN_IN_ATTEMPT_COOKIE = 'deems-google-signin'

const secure = process.env.NODE_ENV === 'production'

export const signInAttemptCookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure,
  path: '/api/auth/google',
  maxAge: 60 * 10,
} as const

const siteUrl = () => process.env.NEXT_PUBLIC_SERVER_URL ?? 'http://localhost:3000'

export const adminUrl = () => new URL('/admin', siteUrl())

export const loginErrorUrl = (error: string) => {
  const url = new URL('/admin/login', siteUrl())
  url.searchParams.set('error', error)
  return url
}
