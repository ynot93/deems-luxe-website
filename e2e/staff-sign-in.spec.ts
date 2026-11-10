import { expect, test, type Page } from '@playwright/test'
import { SignJWT } from 'jose'

const stubUrl = 'http://127.0.0.1:3101'

const admin = { sub: 'google-admin', email: 'first.admin@example.com', emailVerified: true, name: 'First Admin' }
const agent = { sub: 'google-agent', email: 'agent@example.com', emailVerified: true, name: 'Agent One' }

const signInWithGoogle = async (page: Page, identity: object) => {
  await page.request.post(`${stubUrl}/identity`, { data: identity })
  await page.goto('/admin/login')
  await page.getByRole('link', { name: 'Sign in with Google' }).click()
}

const expectSignedIn = (page: Page) => expect(page).toHaveURL(/\/admin\/?$/)

// Asks from inside the page, because the session cookie is refused without browser headers
const currentUser = (page: Page) =>
  page.evaluate(async () => (await (await fetch('/api/users/me')).json()).user)

const expectRefused = async (page: Page, reason: string, message: RegExp) => {
  await expect(page).toHaveURL(new RegExp(`/admin/login\\?error=${reason}`))
  await expect(page.getByRole('alert').filter({ hasText: message })).toBeVisible()
  await page.goto('/admin')
  await expect(page).toHaveURL(/\/admin\/login/)
}

// These run in order: the first admin creates the staff the later tests sign in as.
test.describe.configure({ mode: 'serial' })

test('the login page offers Google only, with no password form', async ({ page }) => {
  await page.goto('/admin/login')
  await expect(page.getByRole('link', { name: 'Sign in with Google' })).toBeVisible()
  await expect(page.locator('input[type="password"]')).toHaveCount(0)
})

test('password login and first-user creation are closed', async ({ page, request }) => {
  const login = await request.post('/api/users/login', {
    data: { email: admin.email, password: 'anything' },
  })
  expect(login.ok()).toBe(false)

  const firstUser = await request.post('/api/users/first-register', {
    data: { email: admin.email, password: 'anything' },
  })
  expect(firstUser.ok()).toBe(false)

  await page.goto('/admin/create-first-user')
  await expect(page.locator('input[type="password"]')).toHaveCount(0)
})

test('an email that is not on the list is refused', async ({ page }) => {
  await signInWithGoogle(page, { sub: 'google-x', email: 'stranger@example.com', emailVerified: true })
  await expectRefused(page, 'not_listed', /isn’t on the staff list/)
})

test('an unverified Google email is refused, even on the bootstrap list', async ({ page }) => {
  await signInWithGoogle(page, { ...admin, emailVerified: false })
  await expectRefused(page, 'unverified_email', /hasn’t verified/)
})

test('the bootstrap email becomes the first admin and stays signed in across pages', async ({ page }) => {
  await signInWithGoogle(page, admin)
  await expectSignedIn(page)

  const user = await currentUser(page)
  expect(user.email).toBe(admin.email)
  expect(user.staffLevel).toBe('admin')

  await page.goto('/admin/collections/users')
  await expect(page).toHaveURL(/collections\/users/)
  await expect(page.getByText(admin.email).first()).toBeVisible()
})

test('a session survives opening the admin from another site, such as a Gmail link', async ({ page }) => {
  await signInWithGoogle(page, admin)
  await expectSignedIn(page)

  await page.goto(`${stubUrl}/health`)
  await page.setContent('<a href="http://localhost:3100/admin/collections/users">Open lead</a>')
  await page.getByRole('link', { name: 'Open lead' }).click()
  await expect(page).toHaveURL(/collections\/users/)
})

test('a token refresh keeps the session working', async ({ page }) => {
  await signInWithGoogle(page, admin)
  await expectSignedIn(page)

  const refresh = await page.evaluate(async () => {
    const response = await fetch('/api/users/refresh-token', { method: 'POST' })
    return response.status
  })
  expect(refresh).toBe(200)

  await page.reload()
  await expectSignedIn(page)
  expect((await currentUser(page))?.email).toBe(admin.email)
})

test('an admin can invite staff, who link their Google account on first sign-in', async ({ page, browser }) => {
  await signInWithGoogle(page, admin)
  await expectSignedIn(page)

  const created = await page.evaluate(async (email) => {
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, staffLevel: 'agent', googleSub: 'attacker-chosen' }),
    })
    return { status: response.status, body: await response.json() }
  }, agent.email)
  expect(created.status).toBe(201)

  const context = await browser.newContext()
  const agentPage = await context.newPage()
  await signInWithGoogle(agentPage, agent)
  await expectSignedIn(agentPage)
  await context.close()
})

test('a different Google account using a linked email is refused', async ({ page }) => {
  await signInWithGoogle(page, { ...agent, sub: 'google-impostor' })
  await expectRefused(page, 'account_mismatch', /linked to a different Google account/)
})

test('an agent cannot manage staff or raise their own level', async ({ page }) => {
  await signInWithGoogle(page, agent)
  await expectSignedIn(page)

  const result = await page.evaluate(async () => {
    const me = await (await fetch('/api/users/me')).json()
    const update = await fetch(`/api/users/${me.user.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ staffLevel: 'admin', active: true }),
    })
    const create = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'friend@example.com' }),
    })
    const list = await (await fetch('/api/users')).json()
    const after = await (await fetch('/api/users/me')).json()
    return { createStatus: create.status, level: after.user.staffLevel, seen: list.docs.length, update: update.status }
  })
  expect(result.createStatus).toBe(403)
  expect(result.level).toBe('agent')
  expect(result.seen).toBe(1)
})

test('deactivating someone ends their session straight away', async ({ page, browser }) => {
  const agentContext = await browser.newContext()
  const agentPage = await agentContext.newPage()
  await signInWithGoogle(agentPage, agent)
  await expectSignedIn(agentPage)

  await signInWithGoogle(page, admin)
  await expectSignedIn(page)
  const status = await page.evaluate(async (email) => {
    const list = await (await fetch(`/api/users?where[email][equals]=${encodeURIComponent(email)}`)).json()
    const response = await fetch(`/api/users/${list.docs[0].id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: false }),
    })
    return response.status
  }, agent.email)
  expect(status).toBe(200)

  await agentPage.goto('/admin')
  await expect(agentPage).toHaveURL(/\/admin\/login/)

  await signInWithGoogle(agentPage, agent)
  await expectRefused(agentPage, 'deactivated', /has been deactivated/)
  await agentContext.close()
})

test('logging out ends the session', async ({ page }) => {
  await signInWithGoogle(page, admin)
  await expectSignedIn(page)

  await page.goto('/admin/logout')
  await expect(page).toHaveURL(/\/admin\/login/)

  await page.goto('/admin')
  await expect(page).toHaveURL(/\/admin\/login/)
})

test('a callback with the wrong state is refused', async ({ page }) => {
  await page.request.post(`${stubUrl}/identity`, { data: admin })
  await page.goto('/api/auth/google/callback?code=made-up&state=made-up')
  await expect(page).toHaveURL(/error=expired/)
  await page.goto('/admin')
  await expect(page).toHaveURL(/\/admin\/login/)
})

test('a session token signed with the wrong secret is refused', async ({ page, context }) => {
  const forged = await new SignJWT({ id: 1, collection: 'users', email: admin.email })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(new TextEncoder().encode('not-the-real-secret'))
  await context.addCookies([{ name: 'payload-token', value: forged, url: 'http://localhost:3100' }])

  await page.goto('/admin')
  await expect(page).toHaveURL(/\/admin\/login/)
})

test('anonymous visitors cannot read staff records', async ({ request }) => {
  const response = await request.get('/api/users')
  expect(response.status()).toBe(403)
})

test('another site cannot use a signed-in session through a script', async ({ page }) => {
  await signInWithGoogle(page, admin)
  await expectSignedIn(page)

  await page.goto(`${stubUrl}/health`)
  const status = await page.evaluate(async () => {
    try {
      const response = await fetch('http://localhost:3100/api/users', { credentials: 'include' })
      return response.status
    } catch {
      return 'blocked by the browser'
    }
  })
  expect(status === 403 || status === 'blocked by the browser').toBe(true)
})
