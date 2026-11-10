import config from '@payload-config'
import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'
import { getFieldsToSign, getPayload, jwtSign } from 'payload'
import {
  SIGN_IN_ATTEMPT_COOKIE,
  adminUrl,
  loginErrorUrl,
  signInAttemptCookieOptions,
} from '@/lib/auth/cookies'
import { exchangeCodeForIdentity, type SignInAttempt } from '@/lib/auth/google'
import { decideStaffLogin, normalizeEmail, parseEmailList } from '@/lib/auth/staff-login'

const readAttempt = (value: string | undefined): SignInAttempt | null => {
  try {
    return value ? (JSON.parse(value) as SignInAttempt) : null
  } catch {
    return null
  }
}

export const GET = async (request: NextRequest) => {
  const code = request.nextUrl.searchParams.get('code')
  const state = request.nextUrl.searchParams.get('state')

  const cookieStore = await cookies()
  const attempt = readAttempt(cookieStore.get(SIGN_IN_ATTEMPT_COOKIE)?.value)
  cookieStore.set(SIGN_IN_ATTEMPT_COOKIE, '', { ...signInAttemptCookieOptions, maxAge: 0 })

  if (!code || !state || !attempt || attempt.state !== state) {
    return NextResponse.redirect(loginErrorUrl('expired'))
  }

  let identity
  try {
    identity = await exchangeCodeForIdentity(code, attempt)
  } catch (error) {
    console.error('Google sign-in failed', error)
    return NextResponse.redirect(loginErrorUrl('google_failed'))
  }

  const payload = await getPayload({ config })
  const email = normalizeEmail(identity.email)
  const { docs } = await payload.find({
    collection: 'users',
    where: { email: { equals: email } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  const staff = docs[0] ?? null

  const decision = decideStaffLogin({
    identity,
    staff,
    bootstrapEmails: parseEmailList(process.env.BOOTSTRAP_ADMIN_EMAILS),
  })
  if (decision.outcome === 'deny') return NextResponse.redirect(loginErrorUrl(decision.reason))

  const user =
    decision.outcome === 'create_admin'
      ? await payload.create({
          collection: 'users',
          data: { email, name: identity.name, staffLevel: 'admin', active: true, googleSub: identity.sub },
          overrideAccess: true,
        })
      : decision.linkGoogleSub
        ? await payload.update({
            id: decision.id,
            collection: 'users',
            data: { googleSub: identity.sub, name: staff?.name || identity.name },
            overrideAccess: true,
          })
        : staff!

  const collectionConfig = payload.collections.users.config
  const { token } = await jwtSign({
    fieldsToSign: getFieldsToSign({
      collectionConfig,
      email,
      user: { ...user, collection: 'users' },
    }),
    secret: payload.secret,
    tokenExpiration: collectionConfig.auth.tokenExpiration,
  })

  // Same cookie name Payload clears on logout and rewrites on refresh.
  cookieStore.set(`${payload.config.cookiePrefix}-token`, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: collectionConfig.auth.tokenExpiration,
  })

  return NextResponse.redirect(adminUrl())
}
