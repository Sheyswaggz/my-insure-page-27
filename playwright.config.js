// playwright.config.js
import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for integration testing
 * 
 * This configuration sets up end-to-end testing for the contact form and footer
 * with comprehensive browser coverage, accessibility testing, and proper error handling.
 * 
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  // Test directory containing integration tests
  testDir: './tests/integration',

  // Maximum time one test can run for
  timeout: 30000,

  // Test execution settings
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  // Reporter configuration
  reporter: [
    ['html', { 
      outputFolder: 'playwright-report',
      open: 'never',
    }],
    ['json', { 
      outputFile: 'test-results/results.json',
    }],
    ['junit', { 
      outputFile: 'test-results/junit.xml',
    }],
    ['list'],
  ],

  // Shared settings for all projects
  use: {
    // Base URL for navigation
    baseURL: process.env.BASE_URL || 'http://localhost:5173',

    // Collect trace on failure for debugging
    trace: 'retain-on-failure',

    // Screenshot on failure
    screenshot: 'only-on-failure',

    // Video recording on failure
    video: 'retain-on-failure',

    // Action timeout
    actionTimeout: 10000,

    // Navigation timeout
    navigationTimeout: 30000,

    // Viewport size
    viewport: { width: 1280, height: 720 },

    // Ignore HTTPS errors in development
    ignoreHTTPSErrors: true,

    // Locale and timezone
    locale: 'en-US',
    timezoneId: 'America/New_York',

    // Color scheme
    colorScheme: 'light',

    // User agent
    userAgent: 'Mozilla/5.0 (Playwright Test)',

    // Extra HTTP headers
    extraHTTPHeaders: {
      'Accept-Language': 'en-US,en;q=0.9',
    },
  },

  // Configure projects for major browsers
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // Enable accessibility testing
        contextOptions: {
          reducedMotion: 'reduce',
        },
      },
    },

    {
      name: 'firefox',
      use: { 
        ...devices['Desktop Firefox'],
        contextOptions: {
          reducedMotion: 'reduce',
        },
      },
    },

    {
      name: 'webkit',
      use: { 
        ...devices['Desktop Safari'],
        contextOptions: {
          reducedMotion: 'reduce',
        },
      },
    },

    // Mobile viewports
    {
      name: 'mobile-chrome',
      use: { 
        ...devices['Pixel 5'],
      },
    },

    {
      name: 'mobile-safari',
      use: { 
        ...devices['iPhone 12'],
      },
    },

    // Tablet viewports
    {
      name: 'tablet',
      use: {
        ...devices['iPad Pro'],
      },
    },

    // Accessibility testing project
    {
      name: 'accessibility',
      use: {
        ...devices['Desktop Chrome'],
        contextOptions: {
          reducedMotion: 'reduce',
        },
      },
      testMatch: /.*\.accessibility\.test\.js/,
    },
  ],

  // Web server configuration
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
    stdout: 'pipe',
    stderr: 'pipe',
    env: {
      NODE_ENV: 'test',
    },
  },

  // Global setup and teardown
  globalSetup: undefined,
  globalTeardown: undefined,

  // Expect configuration
  expect: {
    timeout: 5000,
    toHaveScreenshot: {
      maxDiffPixels: 100,
      threshold: 0.2,
    },
    toMatchSnapshot: {
      maxDiffPixels: 100,
      threshold: 0.2,
    },
  },

  // Output directory for test artifacts
  outputDir: 'test-results',

  // Preserve output between runs
  preserveOutput: 'failures-only',

  // Update snapshots
  updateSnapshots: process.env.UPDATE_SNAPSHOTS === 'true' ? 'all' : 'missing',

  // Grep configuration for filtering tests
  grep: process.env.TEST_GREP ? new RegExp(process.env.TEST_GREP) : undefined,
  grepInvert: process.env.TEST_GREP_INVERT ? new RegExp(process.env.TEST_GREP_INVERT) : undefined,

  // Metadata
  metadata: {
    project: 'my-insure-page-27',
    testType: 'integration',
    environment: process.env.CI ? 'ci' : 'local',
  },

  // Shard configuration for parallel execution in CI
  shard: process.env.CI && process.env.SHARD ? {
    current: parseInt(process.env.SHARD_INDEX || '1', 10),
    total: parseInt(process.env.SHARD_TOTAL || '1', 10),
  } : undefined,
});