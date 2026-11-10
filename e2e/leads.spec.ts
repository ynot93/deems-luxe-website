import { expect, test, type Browser, type Page } from '@playwright/test'
import { admin, api, expectSignedIn, sentEmails, signInWithGoogle, stubUrl } from './support/helpers'

const INBOX = 'leads@example.com'
const agentA = { sub: 'google-lead-a', email: 'lead.agent.a@example.com', emailVerified: true, name: 'Agent A' }
const agentB = { sub: 'google-lead-b', email: 'lead.agent.b@example.com', emailVerified: true, name: 'Agent B' }

// Each test sends from its own address, so the per-sender limit only bites where it's tested
let nextIp = 10
const visitor = async (browser: Browser) => {
  const context = await browser.newContext({ extraHTTPHeaders: { 'x-forwarded-for': `203.0.113.${nextIp++}` } })
  return context.newPage()
}

const signedIn = async (browser: Browser, identity: object) => {
  const page = await (await browser.newContext()).newPage()
  await signInWithGoogle(page, identity)
  await expectSignedIn(page)
  return page
}

const findLeads = async (page: Page, collection: string, query = '') =>
  (await api(page, `/api/${collection}?depth=0&limit=100${query}`)).body.docs as Record<string, any>[]

const leadByPhone = (page: Page, collection: string, phone: string) =>
  findLeads(page, collection, `&where[contact.phone][equals]=${encodeURIComponent(phone)}`).then((docs) => docs[0])

const fillContact = async (page: Page, { name, phone, email = '' }: { name: string; phone: string; email?: string }) => {
  await page.getByLabel('Your name').fill(name)
  await page.getByLabel('Phone number').fill(phone)
  if (email) await page.getByLabel('Email').fill(email)
  await page.getByRole('checkbox', { name: /I agree that Deems/ }).check()
}

let adminPage: Page

test.describe.configure({ mode: 'serial' })

test.beforeAll(async ({ browser }) => {
  adminPage = await signedIn(browser, admin)
  expect((await api(adminPage, '/api/globals/site-settings', { method: 'POST', body: { leadInboxEmail: INBOX } })).status).toBe(200)
  for (const agent of [agentA, agentB]) {
    await api(adminPage, '/api/users', { method: 'POST', body: { email: agent.email, staffLevel: 'agent' } })
  }
  await adminPage.request.delete(`${stubUrl}/emails`)
  await adminPage.request.post(`${stubUrl}/emails/fail`, { data: { fail: false } })
})

test('a request from the homepage is saved, emailed to the inbox and confirmed to the visitor', async ({ browser }) => {
  const page = await visitor(browser)
  await page.goto('/')
  await page.getByLabel('Where').fill('Kilimani')
  await page.getByLabel('Budget').selectOption({ label: 'KES 60,000 to 120,000 a month' })
  await page.getByRole('button', { name: 'Continue' }).click()

  await expect(page.getByRole('heading', { name: 'Post a Request' })).toBeVisible()
  await expect(page.getByRole('radio', { name: 'Rent' })).toBeChecked()
  await expect(page.getByLabel('Areas or estates')).toHaveValue('Kilimani')
  await expect(page.getByLabel('Lowest a month')).toHaveValue('60,000')
  await expect(page.getByLabel('Highest a month')).toHaveValue('120,000')

  await page.getByRole('checkbox', { name: 'Apartment' }).check()
  await page.getByLabel('Bedrooms').selectOption('3')
  await page.getByRole('checkbox', { name: 'Backup power' }).check()
  await page.getByLabel('When you’d move in').selectOption({ label: 'In 1 to 3 months' })
  await fillContact(page, { name: 'Wanjiru Kamau', phone: '0712 345 678', email: 'wanjiru@example.com' })
  await page.getByRole('button', { name: 'Send my request' }).click()
  await expect(page.getByRole('heading', { name: 'Request sent' })).toBeVisible()

  const summary = '3-bed apartment to rent, Kilimani, Nairobi, KES 60,000 to 120,000 a month'
  await expect.poll(async () => (await leadByPhone(adminPage, 'request-leads', '+254712345678'))?.emailStatus).toBe('sent')
  const lead = await leadByPhone(adminPage, 'request-leads', '+254712345678')
  expect(lead).toMatchObject({
    summary,
    status: 'new',
    source: 'website',
    whatsapp: true,
    contact: { name: 'Wanjiru Kamau', email: 'wanjiru@example.com' },
    criteria: { intent: 'rent', propertyTypes: ['apartment'], mustHaves: ['backup_power'], bedrooms: { min: 3 } },
  })
  expect(lead.consentAt).toBeTruthy()
  expect(lead.ipHash).toBeUndefined()

  const emails = await sentEmails(page)
  expect(emails).toContainEqual(expect.objectContaining({ to: [INBOX], subject: `New property request: ${summary}` }))
  expect(emails).toContainEqual(expect.objectContaining({ to: ['wanjiru@example.com'] }))
})

test('missing answers are marked on their fields and nothing is saved', async ({ browser }) => {
  const page = await visitor(browser)
  const before = (await findLeads(adminPage, 'request-leads')).length
  await page.goto('/post-a-request')
  await page.getByRole('button', { name: 'Send my request' }).click()

  await expect(page.getByText('Choose at least one type of property.')).toBeVisible()
  await expect(page.getByText('Enter your highest budget, such as 120,000.')).toBeVisible()
  await expect(page.getByText('Enter your name.')).toBeVisible()
  await expect(page.getByText('Tick this box so we can handle your request.')).toBeVisible()
  await expect(page.getByLabel('Your name')).toHaveAttribute('aria-invalid', 'true')
  expect((await findLeads(adminPage, 'request-leads')).length).toBe(before)
})

test('a filled-in hidden field is thanked and ignored, as bots do', async ({ browser }) => {
  const page = await visitor(browser)
  await page.goto('/contact')
  await page.getByLabel('How can we help?').fill('Do you manage properties in Nyali?')
  await fillContact(page, { name: 'Robot', phone: '0700 000 001' })
  await page.locator('input[name="company"]').fill('Spam Ltd', { force: true })
  await page.getByRole('button', { name: 'Send message' }).click()

  await expect(page.getByRole('heading', { name: 'Message sent' })).toBeVisible()
  expect(await leadByPhone(adminPage, 'service-leads', '+254700000001')).toBeUndefined()
})

test('a failed email keeps the lead, and the retry job sends it later', async ({ browser }) => {
  await adminPage.request.post(`${stubUrl}/emails/fail`, { data: { fail: true } })
  const page = await visitor(browser)
  await page.goto('/services/property-valuation')
  await page.getByLabel('What the valuation is for').selectOption({ label: 'Mortgage or bank' })
  await page.getByLabel('Type of property').selectOption({ label: 'Maisonette' })
  await page.getByLabel('County').selectOption('Kiambu')
  await page.getByLabel('Title').selectOption({ label: 'Not sure' })
  await page.getByLabel('When you need it').selectOption({ label: 'This month' })
  await fillContact(page, { name: 'Otieno Ouma', phone: '+44 7700 900123' })
  await page.getByRole('button', { name: 'Ask for a quote' }).click()
  await expect(page.getByRole('heading', { name: 'Message sent' })).toBeVisible()

  await expect.poll(async () => (await leadByPhone(adminPage, 'service-leads', '+447700900123'))?.emailStatus).toBe('failed')
  const lead = await leadByPhone(adminPage, 'service-leads', '+447700900123')
  expect(lead).toMatchObject({ service: 'valuation', title: 'Property valuation: Otieno Ouma' })
  expect(lead.summary).toContain('Purpose: Mortgage or bank')

  const cron = `http://localhost:3100/api/cron/lead-emails`
  expect((await page.request.get(cron)).status()).toBe(401)
  await adminPage.request.post(`${stubUrl}/emails/fail`, { data: { fail: false } })
  const retry = await page.request.get(cron, { headers: { authorization: 'Bearer e2e-cron-secret' } })
  expect(retry.status()).toBe(200)

  expect((await leadByPhone(adminPage, 'service-leads', '+447700900123')).emailStatus).toBe('sent')
  expect(await sentEmails(page)).toContainEqual(
    expect.objectContaining({ to: [INBOX], subject: 'New property valuation lead from Otieno Ouma' }),
  )
})

test('one sender can send five forms in a short time, then is asked to wait', async ({ browser }) => {
  const page = await visitor(browser)
  for (let message = 1; message <= 6; message++) {
    await page.goto('/contact')
    await page.getByLabel('How can we help?').fill(`Question number ${message} about letting my flat`)
    await fillContact(page, { name: 'Busy Person', phone: `0722 000 00${message}` })
    await page.getByRole('button', { name: 'Send message' }).click()
    if (message <= 5) await expect(page.getByRole('heading', { name: 'Message sent' })).toBeVisible()
  }
  await expect(page.getByText(/several forms from you/)).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Message sent' })).toHaveCount(0)
})

test('visitors cannot read or create leads through the API', async ({ request }) => {
  for (const collection of ['request-leads', 'service-leads']) {
    expect((await request.get(`/api/${collection}`)).status()).toBe(403)
    const created = await request.post(`/api/${collection}`, { data: { summary: 'forged' } })
    expect(created.status()).toBe(403)
  }
})

test('agents see unassigned leads and their own, and can take an unassigned lead but not reassign one', async ({ browser }) => {
  const leads = await findLeads(adminPage, 'service-leads')
  const [forA, open] = leads
  const users = (await api(adminPage, '/api/users?limit=50')).body.docs as { id: number; email: string }[]
  const idOf = (email: string) => users.find((user) => user.email === email)!.id
  const assigned = await api(adminPage, `/api/service-leads/${forA.id}`, {
    method: 'PATCH',
    body: { assignedAgent: idOf(agentA.email) },
  })
  expect(assigned.status).toBe(200)

  const pageB = await signedIn(browser, agentB)
  const seenByB = (await findLeads(pageB, 'service-leads')).map((lead) => lead.id)
  expect(seenByB).toContain(open.id)
  expect(seenByB).not.toContain(forA.id)
  expect((await api(pageB, `/api/service-leads/${forA.id}`)).status).toBe(404)

  const take = await api(pageB, `/api/service-leads/${open.id}`, {
    method: 'PATCH',
    body: { assignedAgent: idOf(agentB.email), status: 'quoted' },
  })
  expect(take.status).toBe(200)
  const handOff = await api(pageB, `/api/service-leads/${open.id}`, {
    method: 'PATCH',
    body: { assignedAgent: idOf(agentA.email) },
  })
  expect(handOff.status).toBe(403)

  const editContact = await api(pageB, `/api/service-leads/${open.id}`, {
    method: 'PATCH',
    body: { contact: { name: 'Changed', phone: '+254700000000' } },
  })
  const after = (await api(adminPage, `/api/service-leads/${open.id}?depth=0`)).body
  expect(editContact.status === 403 || after.contact.name !== 'Changed').toBe(true)
  expect(after.assignedAgent).toBe(idOf(agentB.email))

  const pageA = await signedIn(browser, agentA)
  expect((await findLeads(pageA, 'service-leads')).map((lead) => lead.id)).toContain(forA.id)
})
