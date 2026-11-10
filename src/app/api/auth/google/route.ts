import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { authorizationUrl, createSignInAttempt, isGoogleConfigured } from '@/lib/auth/google'
import { SIGN_IN_ATTEMPT_COOKIE, loginErrorUrl, signInAttemptCookieOptions } from '@/lib/auth/cookies'

export const GET = async () => {
  if (!isGoogleConfigured()) return NextResponse.redirect(loginErrorUrl('not_configured'))

  const attempt = createSignInAttempt()
  const cookieStore = await cookies()
  cookieStore.set(SIGN_IN_ATTEMPT_COOKIE, JSON.stringify(attempt), signInAttemptCookieOptions)

  return NextResponse.redirect(authorizationUrl(attempt))
}
