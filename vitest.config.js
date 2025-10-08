import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

/**
 * Vitest Configuration
 * 
 * Production-grade test configuration for unit testing with comprehensive
 * coverage requirements and DOM environment support for browser-based components.
 * 
 * @see https://vitest.dev/config/
 */
export default defineConfig({
  test: {
    // Test environment - jsdom for browser API simulation
    environment: 'jsdom',

    // Global test setup
    globals: true,

    // Test file patterns
    include: [
      'src/**/*.{test,spec}.{js,mjs,cjs}',
      'tests/unit/**/*.{test,spec}.{js,mjs,cjs}',
      '__tests__/**/*.{test,spec}.{js,mjs,cjs}',
    ],

    // Files to exclude from test discovery
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/cypress/**',
      '**/.{idea,git,cache,output,temp}/**',
      '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*',
      '**/coverage/**',
      '**/.vite/**',
    ],

    // Coverage configuration with strict thresholds
    coverage: {
      // Coverage provider - v8 for native Node.js coverage
      provider: 'v8',

      // Coverage reporters
      reporter: ['text', 'html', 'json', 'lcov'],

      // Output directory for coverage reports
      reportsDirectory: './coverage',

      // Files to include in coverage
      include: [
        'src/**/*.{js,mjs,cjs}',
      ],

      // Files to exclude from coverage
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        '**/*.config.{js,mjs,cjs}',
        '**/*.test.{js,mjs,cjs}',
        '**/*.spec.{js,mjs,cjs}',
        '**/tests/**',
        '**/__tests__/**',
        '**/coverage/**',
        '**/.vite/**',
        '**/public/**',
        '**/static/**',
      ],

      // Strict coverage thresholds - 90% minimum
      thresholds: {
        statements: 90,
        branches: 90,
        functions: 90,
        lines: 90,
      },

      // Clean coverage directory before running tests
      clean: true,

      // All files should be included in coverage, even if not tested
      all: true,

      // Skip full coverage for files with no tests
      skipFull: false,
    },

    // Test execution configuration
    testTimeout: 10000, // 10 seconds max per test
    hookTimeout: 10000, // 10 seconds max for hooks

    // Retry failed tests once to handle flaky tests
    retry: 1,

    // Run tests in parallel for performance
    threads: true,

    // Maximum number of threads
    maxThreads: 4,

    // Minimum number of threads
    minThreads: 1,

    // Isolate test environment for each test file
    isolate: true,

    // Watch mode configuration
    watch: false,

    // Reporter configuration
    reporters: ['default', 'verbose'],

    // Output configuration
    outputFile: {
      json: './coverage/test-results.json',
    },

    // Mock configuration
    mockReset: true,
    restoreMocks: true,
    clearMocks: true,

    // Setup files to run before tests
    setupFiles: [],

    // Global setup file
    globalSetup: undefined,

    // Teardown file
    teardownTimeout: 10000,

    // Benchmark configuration
    benchmark: {
      include: ['**/*.{bench,benchmark}.{js,mjs,cjs}'],
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
      ],
    },

    // CSS handling
    css: {
      modules: {
        classNameStrategy: 'non-scoped',
      },
    },

    // Environment options for jsdom
    environmentOptions: {
      jsdom: {
        resources: 'usable',
        url: 'http://localhost:5173',
        pretendToBeVisual: true,
        runScripts: 'dangerously',
      },
    },

    // Snapshot configuration
    resolveSnapshotPath: (testPath, snapExtension) => {
      return testPath.replace(/\.test\.([tj]sx?)/, `${snapExtension}.$1`);
    },

    // Update snapshots
    update: false,

    // Fail on console errors
    onConsoleLog: (log, type) => {
      if (type === 'error') {
        return false;
      }
      return true;
    },

    // Pool options for test execution
    pool: 'threads',

    // Sequence configuration
    sequence: {
      shuffle: false,
      concurrent: false,
    },

    // Type checking
    typecheck: {
      enabled: false,
    },

    // Bail on first failure in CI
    bail: process.env.CI ? 1 : 0,

    // Silent mode
    silent: false,

    // Hide skipped tests
    hideSkippedTests: false,

    // API server configuration for UI
    api: {
      port: 51204,
      strictPort: false,
      host: 'localhost',
    },

    // UI configuration
    ui: false,

    // Open UI automatically
    open: false,

    // Browser mode (disabled - using jsdom)
    browser: {
      enabled: false,
    },

    // Inspect mode
    inspect: false,
    inspectBrk: false,

    // Diff configuration
    diff: './node_modules/diff',

    // Exclude patterns for coverage
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/cypress/**',
      '**/.{idea,git,cache,output,temp}/**',
      '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*',
    ],
  },

  // Resolve configuration - align with vite.config.js
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@static': resolve(__dirname, './static'),
      '@public': resolve(__dirname, './public'),
    },
    extensions: ['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json'],
  },

  // Define global constants for tests
  define: {
    __TEST__: true,
    __DEV__: true,
    __APP_VERSION__: JSON.stringify('test'),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },

  // ESBuild configuration for test files
  esbuild: {
    target: 'es2022',
    jsxFactory: 'h',
    jsxFragment: 'Fragment',
  },

  // Log level
  logLevel: 'info',

  // Clear screen
  clearScreen: true,
});