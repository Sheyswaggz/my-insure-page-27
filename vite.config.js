import { defineConfig } from 'vite';
import { resolve } from 'path';

/**
 * Vite Configuration for Static Site Generation
 * 
 * Production-grade configuration for building and serving a static insurance
 * landing page with optimized assets, HTML minification, and development server.
 * 
 * Key Features:
 * - Multi-page HTML entry points support
 * - Asset optimization and minification
 * - Source maps for debugging
 * - Development server with proper CORS and error handling
 * - Build output to dist/ directory
 * - CSS code splitting and optimization
 * 
 * @see https://vitejs.dev/config/
 */
export default defineConfig({
  // Root directory for source files
  root: '.',

  // Public directory for static assets that should be copied as-is
  publicDir: 'public',

  // Base public path when served in development or production
  base: './',

  // Build configuration
  build: {
    // Output directory for production build
    outDir: 'dist',

    // Directory for assets relative to outDir
    assetsDir: 'assets',

    // Generate source maps for production debugging
    sourcemap: true,

    // Minification configuration
    minify: 'terser',
    terserOptions: {
      compress: {
        // Remove console logs in production
        drop_console: false,
        drop_debugger: true,
        pure_funcs: ['console.debug'],
      },
      format: {
        // Preserve license comments
        comments: /^!/,
      },
    },

    // Rollup-specific options
    rollupOptions: {
      // Multi-page configuration - add more entry points as needed
      input: {
        main: resolve(__dirname, 'index.html'),
      },
      output: {
        // Manual chunk splitting for better caching
        manualChunks: undefined,
        // Asset file naming pattern
        assetFileNames: (assetInfo) => {
          // Organize assets by type
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `assets/images/[name]-[hash][extname]`;
          }
          if (/woff2?|ttf|otf|eot/i.test(ext)) {
            return `assets/fonts/[name]-[hash][extname]`;
          }
          if (/css/i.test(ext)) {
            return `assets/css/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
        // Chunk file naming pattern
        chunkFileNames: 'assets/js/[name]-[hash].js',
        // Entry file naming pattern
        entryFileNames: 'assets/js/[name]-[hash].js',
      },
    },

    // Asset inline threshold (bytes) - files smaller than this will be inlined as base64
    assetsInlineLimit: 4096,

    // CSS code splitting
    cssCodeSplit: true,

    // CSS minification
    cssMinify: true,

    // Report compressed size
    reportCompressedSize: true,

    // Chunk size warning limit (kB)
    chunkSizeWarningLimit: 500,

    // Clean output directory before build
    emptyOutDir: true,

    // Copy public directory to output
    copyPublicDir: true,
  },

  // Development server configuration
  server: {
    // Port for development server
    port: 5173,

    // Automatically open browser on server start
    open: false,

    // Enable CORS for development
    cors: true,

    // Strict port - fail if port is already in use
    strictPort: false,

    // Host configuration - use true for network access
    host: 'localhost',

    // HMR (Hot Module Replacement) configuration
    hmr: {
      overlay: true,
      protocol: 'ws',
      host: 'localhost',
    },

    // Watch configuration
    watch: {
      // Ignore node_modules for better performance
      ignored: ['**/node_modules/**', '**/dist/**'],
    },

    // Proxy configuration (if needed for API calls)
    proxy: {},

    // File system serving configuration
    fs: {
      // Allow serving files from project root
      strict: true,
      allow: ['.'],
    },
  },

  // Preview server configuration (for testing production build)
  preview: {
    port: 4173,
    strictPort: false,
    host: 'localhost',
    cors: true,
    open: false,
  },

  // CSS configuration
  css: {
    // CSS modules configuration
    modules: {
      localsConvention: 'camelCase',
    },
    // PostCSS configuration (if needed)
    postcss: {},
    // CSS preprocessor options
    preprocessorOptions: {},
    devSourcemap: true,
  },

  // Dependency optimization
  optimizeDeps: {
    // Include dependencies that should be pre-bundled
    include: [],
    // Exclude dependencies from pre-bundling
    exclude: [],
    // Force dependency pre-optimization
    force: false,
  },

  // Plugin configuration
  plugins: [],

  // Environment variables configuration
  envPrefix: 'VITE_',

  // Log level for build output
  logLevel: 'info',

  // Clear screen on rebuild
  clearScreen: true,

  // Define global constants
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },

  // Resolve configuration
  resolve: {
    // Path aliases
    alias: {
      '@': resolve(__dirname, './src'),
      '@static': resolve(__dirname, './static'),
      '@public': resolve(__dirname, './public'),
    },
    // Extensions to try when resolving imports
    extensions: ['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json'],
  },

  // JSON configuration
  json: {
    // Generate named exports from JSON
    namedExports: true,
    // Stringify JSON
    stringify: false,
  },

  // ESBuild configuration
  esbuild: {
    // JSX configuration (if needed in future)
    jsxFactory: 'h',
    jsxFragment: 'Fragment',
    // Drop console and debugger in production
    drop: process.env.NODE_ENV === 'production' ? ['debugger'] : [],
    // Legal comments handling
    legalComments: 'inline',
  },

  // Worker configuration
  worker: {
    format: 'es',
    plugins: [],
    rollupOptions: {},
  },

  // App type - 'spa' for single page app, 'mpa' for multi-page app
  appType: 'mpa',
});