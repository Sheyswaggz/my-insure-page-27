```javascript
/**
 * Lighthouse CI Configuration
 * 
 * Production-grade Lighthouse CI configuration for performance budgets and quality thresholds.
 * Enforces strict performance metrics and best practices for the insurance landing page.
 * 
 * @module tests/performance/lighthouse.config
 */

module.exports = {
  ci: {
    collect: {
      /* URLs to audit - adjust based on deployment environment */
      url: [
        'http://localhost:5173/',
        'http://localhost:5173/index.html',
      ],
      
      /* Number of runs per URL for consistent results */
      numberOfRuns: 3,
      
      /* Lighthouse settings */
      settings: {
        /* Emulate mobile device for primary testing */
        emulatedFormFactor: 'mobile',
        
        /* Throttling settings - simulate 4G connection */
        throttling: {
          rttMs: 150,
          throughputKbps: 1638.4,
          cpuSlowdownMultiplier: 4,
          requestLatencyMs: 150,
          downloadThroughputKbps: 1638.4,
          uploadThroughputKbps: 675,
        },
        
        /* Screen emulation */
        screenEmulation: {
          mobile: true,
          width: 375,
          height: 667,
          deviceScaleFactor: 2,
          disabled: false,
        },
        
        /* Only run specific categories for performance focus */
        onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
        
        /* Skip certain audits that aren't relevant */
        skipAudits: [
          'uses-http2',
          'canonical',
        ],
        
        /* Disable storage reset between runs for consistency */
        disableStorageReset: false,
        
        /* Maximum wait time for page load */
        maxWaitForLoad: 45000,
        
        /* Locale for reports */
        locale: 'en-US',
      },
      
      /* Chrome flags for consistent testing environment */
      chromeFlags: [
        '--no-sandbox',
        '--disable-gpu',
        '--disable-dev-shm-usage',
        '--disable-software-rasterizer',
        '--disable-extensions',
      ],
    },
    
    assert: {
      /* Assertion preset - use recommended with custom overrides */
      preset: 'lighthouse:recommended',
      
      assertions: {
        /* ============================================
         * PERFORMANCE CATEGORY ASSERTIONS
         * ============================================ */
        
        /* Overall performance score must be >90 */
        'categories:performance': ['error', { minScore: 0.90 }],
        
        /* Core Web Vitals - Critical metrics */
        
        /* Largest Contentful Paint - must be <2.5s */
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        
        /* First Contentful Paint - must be <1.8s */
        'first-contentful-paint': ['error', { maxNumericValue: 1800 }],
        
        /* Cumulative Layout Shift - must be <0.1 */
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        
        /* Total Blocking Time - must be <200ms */
        'total-blocking-time': ['error', { maxNumericValue: 200 }],
        
        /* Speed Index - must be <3.4s */
        'speed-index': ['error', { maxNumericValue: 3400 }],
        
        /* Time to Interactive - must be <3.8s */
        'interactive': ['error', { maxNumericValue: 3800 }],
        
        /* First Meaningful Paint - must be <2.0s */
        'first-meaningful-paint': ['warn', { maxNumericValue: 2000 }],
        
        /* Max Potential FID - must be <100ms */
        'max-potential-fid': ['error', { maxNumericValue: 100 }],
        
        /* ============================================
         * RESOURCE OPTIMIZATION ASSERTIONS
         * ============================================ */
        
        /* Image optimization */
        'modern-image-formats': ['warn', { minScore: 0.9 }],
        'uses-optimized-images': ['error', { minScore: 0.9 }],
        'uses-responsive-images': ['warn', { minScore: 0.9 }],
        'offscreen-images': ['error', { minScore: 1 }],
        
        /* JavaScript optimization */
        'unused-javascript': ['warn', { maxNumericValue: 50000 }],
        'unminified-javascript': ['error', { minScore: 1 }],
        'bootup-time': ['warn', { maxNumericValue: 3500 }],
        'mainthread-work-breakdown': ['warn', { maxNumericValue: 4000 }],
        
        /* CSS optimization */
        'unused-css-rules': ['warn', { maxNumericValue: 50000 }],
        'unminified-css': ['error', { minScore: 1 }],
        
        /* Network optimization */
        'uses-text-compression': ['error', { minScore: 1 }],
        'uses-long-cache-ttl': ['warn', { minScore: 0.75 }],
        'efficient-animated-content': ['warn', { minScore: 1 }],
        
        /* Resource sizes */
        'total-byte-weight': ['warn', { maxNumericValue: 1500000 }],
        'dom-size': ['warn', { maxNumericValue: 1500 }],
        
        /* ============================================
         * RENDERING PERFORMANCE ASSERTIONS
         * ============================================ */
        
        /* Layout shifts */
        'layout-shift-elements': ['error', { minScore: 1 }],
        
        /* Font loading */
        'font-display': ['warn', { minScore: 1 }],
        
        /* Third-party code */
        'third-party-summary': ['warn', { maxNumericValue: 500 }],
        
        /* Render blocking resources */
        'render-blocking-resources': ['warn', { maxNumericValue: 500 }],
        
        /* ============================================
         * ACCESSIBILITY CATEGORY ASSERTIONS
         * ============================================ */
        
        /* Overall accessibility score must be >95 */
        'categories:accessibility': ['error', { minScore: 0.95 }],
        
        /* Critical accessibility audits */
        'color-contrast': ['error', { minScore: 1 }],
        'image-alt': ['error', { minScore: 1 }],
        'button-name': ['error', { minScore: 1 }],
        'link-name': ['error', { minScore: 1 }],
        'document-title': ['error', { minScore: 1 }],
        'html-has-lang': ['error', { minScore: 1 }],
        'meta-viewport': ['error', { minScore: 1 }],
        'aria-allowed-attr': ['error', { minScore: 1 }],
        'aria-required-attr': ['error', { minScore: 1 }],
        'aria-valid-attr': ['error', { minScore: 1 }],
        'aria-valid-attr-value': ['error', { minScore: 1 }],
        'heading-order': ['warn', { minScore: 1 }],
        'label': ['error', { minScore: 1 }],
        'list': ['warn', { minScore: 1 }],
        'listitem': ['warn', { minScore: 1 }],
        
        /* ============================================
         * BEST PRACTICES CATEGORY ASSERTIONS
         * ============================================ */
        
        /* Overall best practices score must be >90 */
        'categories:best-practices': ['error', { minScore: 0.90 }],
        
        /* Security */
        'is-on-https': ['error', { minScore: 1 }],
        'no-vulnerable-libraries': ['error', { minScore: 1 }],
        
        /* Browser compatibility */
        'doctype': ['error', { minScore: 1 }],
        'charset': ['error', { minScore: 1 }],
        
        /* Error handling */
        'errors-in-console': ['warn', { minScore: 1 }],
        
        /* Image optimization */
        'image-aspect-ratio': ['warn', { minScore: 1 }],
        'image-size-responsive': ['warn', { minScore: 1 }],
        
        /* ============================================
         * SEO CATEGORY ASSERTIONS
         * ============================================ */
        
        /* Overall SEO score must be >90 */
        'categories:seo': ['error', { minScore: 0.90 }],
        
        /* Meta tags */
        'meta-description': ['error', { minScore: 1 }],
        'viewport': ['error', { minScore: 1 }],
        
        /* Content */
        'font-size': ['error', { minScore: 1 }],
        'tap-targets': ['warn', { minScore: 0.9 }],
        
        /* Crawlability */
        'robots-txt': ['warn', { minScore: 1 }],
        'hreflang': ['warn', { minScore: 1 }],
        
        /* ============================================
         * CUSTOM RESOURCE BUDGETS
         * ============================================ */
        
        /* Individual resource type budgets */
        'resource-summary:script:size': ['warn', { maxNumericValue: 300000 }],
        'resource-summary:stylesheet:size': ['warn', { maxNumericValue: 100000 }],
        'resource-summary:image:size': ['error', { maxNumericValue: 800000 }],
        'resource-summary:font:size': ['warn', { maxNumericValue: 150000 }],
        'resource-summary:document:size': ['warn', { maxNumericValue: 50000 }],
        'resource-summary:other:size': ['warn', { maxNumericValue: 100000 }],
        'resource-summary:total:size': ['warn', { maxNumericValue: 1500000 }],
        
        /* Request count budgets */
        'resource-summary:script:count': ['warn', { maxNumericValue: 10 }],
        'resource-summary:stylesheet:count': ['warn', { maxNumericValue: 5 }],
        'resource-summary:image:count': ['warn', { maxNumericValue: 20 }],
        'resource-summary:font:count': ['warn', { maxNumericValue: 4 }],
        'resource-summary:total:count': ['warn', { maxNumericValue: 50 }],
      },
    },
    
    upload: {
      /* Target for uploading results - configure based on CI/CD setup */
      target: 'temporary-public-storage',
      
      /* Token for authenticated uploads (use environment variable) */
      token: process.env.LHCI_TOKEN || undefined,
      
      /* Server URL if using Lighthouse CI server */
      serverBaseUrl: process.env.LHCI_SERVER_URL || undefined,
      
      /* GitHub App token for GitHub integration */
      githubToken: process.env.LHCI_GITHUB_TOKEN || undefined,
      
      /* GitHub App ID for status checks */
      githubAppToken: process.env.LHCI_GITHUB_APP_TOKEN || undefined,
    },
    
    server: {
      /* Port for local Lighthouse CI server */
      port: 9001,
      
      /* Storage configuration */
      storage: {
        storageMethod: 'sql',
        sqlDialect: 'sqlite',
        sqlDatabasePath: '.lighthouseci/db.sql',
      },
    },
  },
};

/**
 * Performance Budget Guidelines:
 * 
 * LCP (Largest Contentful Paint):
 * - Good: < 2.5s
 * - Needs Improvement: 2.5s - 4.0s
 * - Poor: > 4.0s
 * 
 * FID (First Input Delay):
 * - Good: < 100ms
 * - Needs Improvement: 100ms - 300ms
 * - Poor: > 300ms
 * 
 * CLS (Cumulative Layout Shift):
 * - Good: < 0.1
 * - Needs Improvement: 0.1 - 0.25
 * - Poor: > 0.25
 * 
 * Resource Size Budgets:
 * - Total page weight: < 1.5MB
 * - JavaScript: < 300KB
 * - CSS: < 100KB
 * - Images: < 800KB (total), < 200KB (individual)
 * - Fonts: < 150KB
 * 
 * Usage:
 * 
 * 1. Install Lighthouse CI:
 *    npm install -g @lhci/cli
 * 
 * 2. Run locally:
 *    lhci autorun --config=tests/performance/lighthouse.config.js
 * 
 * 3. Run in CI/CD:
 *    - Set environment variables: LHCI_TOKEN, LHCI_SERVER_URL
 *    - Add to CI pipeline: lhci autorun
 * 
 * 4. View results:
 *    - Temporary storage: Check console output for URL
 *    - CI server: Navigate to LHCI_SERVER_URL
 *    - GitHub: Check PR status checks
 * 
 * Troubleshooting:
 * 
 * - If LCP fails: Optimize hero image, reduce render-blocking resources
 * - If CLS fails: Add explicit dimensions to images, avoid dynamic content insertion
 * - If TBT fails: Reduce JavaScript execution time, split large bundles
 * - If accessibility fails: Check color contrast, add alt text, fix ARIA attributes
 * 
 * Environment Variables:
 * 
 * - LHCI_TOKEN: Authentication token for Lighthouse CI server
 * - LHCI_SERVER_URL: URL of Lighthouse CI server instance
 * - LHCI_GITHUB_TOKEN: GitHub personal access token for PR comments
 * - LHCI_GITHUB_APP_TOKEN: GitHub App token for status checks
 */