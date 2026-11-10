import { expect, test, type Page } from '@playwright/test'

// Pages the owner has approved. A change that alters how one looks fails here until it is
// approved too, then the pictures are refreshed with `pnpm test:e2e approved-pages --update-snapshots`.
const routes = [
  '/post-a-request',
  '/services',
  '/services/property-management',
  '/services/property-valuation',
  '/services/real-estate-agency',
  '/contact',
  '/about',
]

const viewports = [
  { label: 'desktop', width: 1440, height: 900 },
  { label: 'mobile', width: 375, height: 812 },
]

// Scroll the page through so lazy images load before the full-page capture
const loadAllImages = async (page: Page, step: number) => {
  await page.evaluate(async (step) => {
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo(0, y)
      await new Promise((resolve) => setTimeout(resolve, 100))
    }
    window.scrollTo(0, 0)
  }, step)
  await page.waitForLoadState('networkidle')
  await page.evaluate(() =>
    Promise.all(
      [...document.images].map((image) =>
        image.complete ? null : new Promise((resolve) => (image.onload = image.onerror = resolve)),
      ),
    ),
  )
}

for (const { label, width, height } of viewports) {
  test.describe(`approved pages on ${label}`, () => {
    test.use({ viewport: { width, height } })

    for (const route of routes) {
      test(`${route} looks as approved`, async ({ page }) => {
        await page.goto(route, { waitUntil: 'networkidle' })
        await loadAllImages(page, height)
        const name = route.slice(1).replace(/\//g, '-')
        await expect(page).toHaveScreenshot(`${name}-${label}.png`, { fullPage: true, maxDiffPixelRatio: 0.01 })
      })
    }
  })
}
