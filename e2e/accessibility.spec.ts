import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

const routes = ['/styleguide', '/a-page-that-does-not-exist', '/admin/login']
const viewports = [
  { label: 'desktop', width: 1440, height: 900 },
  { label: 'mobile', width: 375, height: 812 },
]

for (const route of routes) {
  for (const viewport of viewports) {
    test(`${route} has no WCAG A or AA violations on ${viewport.label}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height })
      await page.goto(route)

      const { violations } = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze()

      expect(
        violations.map(({ id, nodes }) => `${id}: ${nodes.map((node) => node.target).join(', ')}`),
      ).toEqual([])
    })
  }
}

test('the phone menu opens, closes and can be reached by keyboard', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto('/styleguide')

  const toggle = page.getByRole('button', { name: 'Menu' })
  await expect(toggle).toHaveAttribute('aria-expanded', 'false')
  await expect(page.locator('#mobile-menu')).toBeHidden()

  await toggle.focus()
  await page.keyboard.press('Enter')
  await expect(page.locator('#mobile-menu')).toBeVisible()
  await expect(page.locator('#mobile-menu').getByRole('link', { name: 'Services' })).toBeVisible()

  await page.getByRole('button', { name: 'Close' }).click()
  await expect(page.locator('#mobile-menu')).toBeHidden()
})
