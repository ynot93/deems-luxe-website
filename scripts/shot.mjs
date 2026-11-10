// Usage: pnpm shot <route> [--base=http://localhost:3000]
// Saves full-page desktop (1440px) and mobile (375px) PNGs to screenshots/.
import { mkdir } from 'node:fs/promises'
import { chromium } from '@playwright/test'

const args = process.argv.slice(2).filter((arg) => arg !== '--')
const route = args.find((arg) => !arg.startsWith('--')) ?? '/'
const base = args.find((arg) => arg.startsWith('--base='))?.slice(7) ?? 'http://localhost:3000'
const name = route.replace(/^\/|\/$/g, '').replace(/\//g, '-') || 'home'
const viewports = [
  { label: 'desktop', width: 1440, height: 900 },
  { label: 'mobile', width: 375, height: 812 },
]

await mkdir('screenshots', { recursive: true })
const browser = await chromium.launch()

for (const { label, width, height } of viewports) {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 })
  const errors = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })

  const response = await page.goto(new URL(route, base).href, { waitUntil: 'networkidle' })
  // Scroll the page through so lazy images load before the full-page capture
  await page.evaluate(async (step) => {
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo(0, y)
      await new Promise((resolve) => setTimeout(resolve, 100))
    }
    window.scrollTo(0, 0)
  }, height)
  await page.waitForLoadState('networkidle')
  await page.evaluate(() =>
    Promise.all(
      [...document.images].map((image) =>
        image.complete ? null : new Promise((resolve) => (image.onload = image.onerror = resolve)),
      ),
    ),
  )
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  )
  const path = `screenshots/${name}-${label}.png`
  await page.screenshot({ path, fullPage: true })

  console.log(`${path} (HTTP ${response?.status()})`)
  if (overflow > 0) console.log(`  horizontal overflow: ${overflow}px`)
  for (const error of errors) console.log(`  console error: ${error}`)
  await page.close()
}

await browser.close()
