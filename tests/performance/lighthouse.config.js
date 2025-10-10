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
        
        /* Skip certain audits that may not be relevant */
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
      /* Lighthouse score thresholds - strict production requirements */
      assertions: {
        /* Performance category - minimum score 90 */
        'categories:performance': ['error', { minScore: 0.90 }],
        
        /* Accessibility category - minimum score 95 */
        'categories:accessibility': ['error', { minScore: 0.95 }],
        
        /* Best practices category - minimum score 90 */
        'categories:best-practices': ['error', { minScore: 0.90 }],
        
        /* SEO category - minimum score 90 */
        'categories:seo': ['error', { minScore: 0.90 }],
        
        /* Core Web Vitals - Largest Contentful Paint */
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        
        /* Core Web Vitals - First Input Delay (via Total Blocking Time) */
        'total-blocking-time': ['error', { maxNumericValue: 300 }],
        
        /* Core Web Vitals - Cumulative Layout Shift */
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        
        /* First Contentful Paint */
        'first-contentful-paint': ['error', { maxNumericValue: 1800 }],
        
        /* Speed Index */
        'speed-index': ['error', { maxNumericValue: 3400 }],
        
        /* Time to Interactive */
        'interactive': ['error', { maxNumericValue: 3800 }],
        
        /* Resource budgets - total page weight */
        'resource-summary:total:size': ['error', { maxNumericValue: 1048576 }], // 1MB
        
        /* JavaScript bundle size */
        'resource-summary:script:size': ['error', { maxNumericValue: 204800 }], // 200KB
        
        /* CSS bundle size */
        'resource-summary:stylesheet:size': ['error', { maxNumericValue: 102400 }], // 100KB
        
        /* Image total size */
        'resource-summary:image:size': ['error', { maxNumericValue: 524288 }], // 512KB
        
        /* Font total size */
        'resource-summary:font:size': ['error', { maxNumericValue: 102400 }], // 100KB
        
        /* Number of requests */
        'resource-summary:total:count': ['error', { maxNumericValue: 50 }],
        
        /* Modern image formats */
        'modern-image-formats': ['warn', { maxLength: 0 }],
        
        /* Efficient image encoding */
        'uses-optimized-images': ['warn', { maxLength: 0 }],
        
        /* Properly sized images */
        'uses-responsive-images': ['warn', { maxLength: 0 }],
        
        /* Offscreen images lazy loaded */
        'offscreen-images': ['warn', { maxLength: 0 }],
        
        /* Text compression enabled */
        'uses-text-compression': ['error', { maxLength: 0 }],
        
        /* Minified CSS */
        'unminified-css': ['error', { maxLength: 0 }],
        
        /* Minified JavaScript */
        'unminified-javascript': ['error', { maxLength: 0 }],
        
        /* Unused CSS */
        'unused-css-rules': ['warn', { maxLength: 3 }],
        
        /* Unused JavaScript */
        'unused-javascript': ['warn', { maxLength: 3 }],
        
        /* Render-blocking resources */
        'render-blocking-resources': ['warn', { maxLength: 2 }],
        
        /* Efficient cache policy */
        'uses-long-cache-ttl': ['warn', { maxLength: 5 }],
        
        /* Avoid enormous network payloads */
        'total-byte-weight': ['error', { maxNumericValue: 1048576 }], // 1MB
        
        /* DOM size */
        'dom-size': ['warn', { maxNumericValue: 1500 }],
        
        /* Critical request chains */
        'critical-request-chains': ['warn', { maxLength: 3 }],
        
        /* Main thread work */
        'mainthread-work-breakdown': ['warn', { maxNumericValue: 4000 }],
        
        /* JavaScript execution time */
        'bootup-time': ['warn', { maxNumericValue: 3500 }],
        
        /* Font display optimization */
        'font-display': ['error', { maxLength: 0 }],
        
        /* Accessibility - color contrast */
        'color-contrast': ['error', { maxLength: 0 }],
        
        /* Accessibility - image alt text */
        'image-alt': ['error', { maxLength: 0 }],
        
        /* Accessibility - ARIA attributes */
        'aria-valid-attr': ['error', { maxLength: 0 }],
        'aria-valid-attr-value': ['error', { maxLength: 0 }],
        
        /* Accessibility - button names */
        'button-name': ['error', { maxLength: 0 }],
        
        /* Accessibility - document title */
        'document-title': ['error', { minScore: 1 }],
        
        /* Accessibility - HTML lang attribute */
        'html-has-lang': ['error', { minScore: 1 }],
        
        /* Accessibility - heading order */
        'heading-order': ['error', { maxLength: 0 }],
        
        /* Accessibility - link names */
        'link-name': ['error', { maxLength: 0 }],
        
        /* Accessibility - tap targets */
        'tap-targets': ['warn', { minScore: 0.9 }],
        
        /* SEO - meta description */
        'meta-description': ['error', { minScore: 1 }],
        
        /* SEO - viewport meta tag */
        'viewport': ['error', { minScore: 1 }],
        
        /* SEO - crawlable links */
        'crawlable-anchors': ['error', { maxLength: 0 }],
        
        /* Best practices - HTTPS */
        'is-on-https': ['error', { minScore: 1 }],
        
        /* Best practices - no console errors */
        'errors-in-console': ['error', { maxLength: 0 }],
        
        /* Best practices - valid source maps */
        'valid-source-maps': ['warn', { minScore: 0.8 }],
        
        /* Best practices - no document.write */
        'no-document-write': ['error', { minScore: 1 }],
        
        /* Best practices - passive event listeners */
        'uses-passive-event-listeners': ['warn', { minScore: 0.9 }],
        
        /* Best practices - no vulnerable libraries */
        'no-vulnerable-libraries': ['error', { minScore: 1 }],
      },
      
      /* Assertion matrix for different environments */
      preset: 'lighthouse:recommended',
      
      /* Include passed audits in output */
      includePassedAssertions: false,
    },
    
    upload: {
      /* Target for uploading results - configure based on CI/CD setup */
      target: 'temporary-public-storage',
      
      /* Token for authenticated uploads (use environment variable) */
      token: process.env.LHCI_TOKEN || '',
      
      /* Server URL for Lighthouse CI server (if using) */
      serverBaseUrl: process.env.LHCI_SERVER_URL || '',
      
      /* GitHub App token for GitHub integration */
      githubToken: process.env.LHCI_GITHUB_TOKEN || '',
      
      /* GitHub status check configuration */
      githubStatusContextSuffix: '/lighthouse',
    },
    
    server: {
      /* Lighthouse CI server configuration (if self-hosting) */
      port: 9001,
      storage: {
        storageMethod: 'sql',
        sqlDialect: 'sqlite',
        sqlDatabasePath: './lighthouse-ci.db',
      },
    },
  },
  
  /* Budget configuration for resource types */
  budgets: [
    {
      /* Resource budgets for the landing page */
      path: '/*',
      resourceSizes: [
        {
          resourceType: 'document',
          budget: 50, // 50KB for HTML
        },
        {
          resourceType: 'script',
          budget: 200, // 200KB for JavaScript
        },
        {
          resourceType: 'stylesheet',
          budget: 100, // 100KB for CSS
        },
        {
          resourceType: 'image',
          budget: 512, // 512KB for images
        },
        {
          resourceType: 'font',
          budget: 100, // 100KB for fonts
        },
        {
          resourceType: 'media',
          budget: 0, // No video/audio expected
        },
        {
          resourceType: 'third-party',
          budget: 50, // 50KB for third-party resources
        },
        {
          resourceType: 'total',
          budget: 1024, // 1MB total page weight
        },
      ],
      resourceCounts: [
        {
          resourceType: 'document',
          budget: 1,
        },
        {
          resourceType: 'script',
          budget: 5,
        },
        {
          resourceType: 'stylesheet',
          budget: 3,
        },
        {
          resourceType: 'image',
          budget: 15,
        },
        {
          resourceType: 'font',
          budget: 3,
        },
        {
          resourceType: 'third-party',
          budget: 5,
        },
        {
          resourceType: 'total',
          budget: 50,
        },
      ],
      timings: [
        {
          metric: 'first-contentful-paint',
          budget: 1800, // 1.8s
        },
        {
          metric: 'largest-contentful-paint',
          budget: 2500, // 2.5s
        },
        {
          metric: 'cumulative-layout-shift',
          budget: 0.1,
        },
        {
          metric: 'total-blocking-time',
          budget: 300, // 300ms
        },
        {
          metric: 'speed-index',
          budget: 3400, // 3.4s
        },
        {
          metric: 'interactive',
          budget: 3800, // 3.8s
        },
      ],
    },
  ],
};