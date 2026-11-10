import { defineConfig, devices } from '@playwright/test'

const baseURL = 'http://localhost:3100'
// Deliberately a different host from the app, so Google's redirect back counts as cross-site
const stubUrl = 'http://127.0.0.1:3101'

export default defineConfig({
  testDir: './e2e',
  workers: 1,
  fullyParallel: false,
  timeout: 60_000,
  reporter: 'list',
  use: { baseURL, trace: 'retain-on-failure' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: [
    {
      command: 'node e2e/support/stub-google.mjs',
      url: `${stubUrl}/health`,
      reuseExistingServer: false,
    },
    {
      command: 'bash e2e/support/start-server.sh',
      url: `${baseURL}/styleguide`,
      reuseExistingServer: false,
      timeout: 180_000,
      env: {
        NEXT_DIST_DIR: '.next-test',
        DATABASE_URL: 'postgres://deems@127.0.0.1:55433/deems_luxe_test',
        PAYLOAD_SECRET: 'e2e-only-secret-not-used-anywhere-else',
        NEXT_PUBLIC_SERVER_URL: baseURL,
        GOOGLE_CLIENT_ID: 'e2e-client',
        GOOGLE_CLIENT_SECRET: 'e2e-secret',
        GOOGLE_OIDC_STUB_URL: stubUrl,
        BOOTSTRAP_ADMIN_EMAILS: 'first.admin@example.com',
      },
    },
  ],
})
