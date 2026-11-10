import { expect, test } from '@playwright/test'

test('the quick request hands its answers to the full request form', async ({ page }) => {
  await page.goto('/')
  const form = page.locator('form[action="/post-a-request"]')

  await form.getByRole('radio', { name: 'Buy' }).check()
  await form.getByLabel('Where').fill('Syokimau')
  await form.getByLabel('Budget').selectOption({ label: 'KES 10 to 20 million' })
  await form.getByRole('button', { name: 'Continue' }).click()

  await expect(page).toHaveURL(/\/post-a-request\?/)
  const params = new URL(page.url()).searchParams
  expect(Object.fromEntries(params)).toEqual({
    intent: 'buy',
    area: 'Syokimau',
    budget: '10000000-20000000',
  })
})

test('budget ranges follow the choice of renting or buying', async ({ page }) => {
  await page.goto('/')
  const budget = page.getByLabel('Budget')

  await expect(budget.getByRole('option', { name: 'Under KES 30,000 a month' })).toHaveCount(1)
  await page.getByRole('radio', { name: 'Buy' }).check()
  await expect(budget.getByRole('option', { name: 'Under KES 5 million' })).toHaveCount(1)
  await expect(budget.getByRole('option', { name: 'Under KES 30,000 a month' })).toHaveCount(0)
})

test('every illustrative card on the homepage is badged Example', async ({ page }) => {
  await page.goto('/')
  // Hero, then one card for each buyer step
  await expect(page.getByText('Example', { exact: true })).toHaveCount(4)
})
