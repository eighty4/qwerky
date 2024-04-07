import {defineConfig, devices} from '@playwright/test'

// https://playwright.dev/docs/test-configuration.
export default defineConfig({
    testDir: '.',
    testMatch: '**/*.test.ts',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: process.env.CI ? 'html' : 'null',
    use: {
        baseURL: `http://localhost:${process.env.CI ? 4173 : 5395}`,
        trace: 'on-first-retry',
    },

    /* Configure projects for major browsers */
    projects: [
        {
            name: 'chrome',
            use: {...devices['Desktop Chrome']},
        },
        {
            name: 'firefox',
            use: {...devices['Desktop Firefox']},
        },
        {
            name: 'safari',
            use: {...devices['Desktop Safari']},
        },
    ],

    webServer: {
        command: './e2e_start.sh',
        url: `http://localhost:${process.env.CI ? 4173 : 5395}`,
        reuseExistingServer: !process.env.CI,
    },
})
