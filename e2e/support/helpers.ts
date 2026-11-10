import { expect, type Page } from '@playwright/test'

export const stubUrl = 'http://127.0.0.1:3101'

export const admin = { sub: 'google-admin', email: 'first.admin@example.com', emailVerified: true, name: 'First Admin' }

export const signInWithGoogle = async (page: Page, identity: object) => {
  await page.request.post(`${stubUrl}/identity`, { data: identity })
  await page.goto('/admin/login')
  await page.getByRole('link', { name: 'Sign in with Google' }).click()
}

export const expectSignedIn = (page: Page) => expect(page).toHaveURL(/\/admin\/?$/)

// Asks from inside the page, because the session cookie is refused without browser headers
export const currentUser = (page: Page) =>
  page.evaluate(async () => (await (await fetch('/api/users/me')).json()).user)

// Calls the REST API from inside a signed-in page, for the same reason
export const api = (page: Page, path: string, init: { method?: string; body?: unknown } = {}) =>
  page.evaluate(
    async ({ path, method, body }) => {
      const response = await fetch(path, {
        method: method ?? 'GET',
        headers: body ? { 'Content-Type': 'application/json' } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      })
      return { status: response.status, body: await response.json().catch(() => null) }
    },
    { path, method: init.method, body: init.body },
  )

export type SentEmail = { to: string[]; subject: string; text: string; reply_to?: string }

export const sentEmails = async (page: Page): Promise<SentEmail[]> =>
  (await page.request.get(`${stubUrl}/emails`)).json()
