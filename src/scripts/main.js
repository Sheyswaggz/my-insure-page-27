/**
 * Main JavaScript Entry Point
 *
 * Provides progressive enhancement and minimal interactivity for the insurance landing page.
 * Implements a modular structure for future feature additions while maintaining
 * zero dependencies and vanilla JavaScript approach.
 *
 * @module main
 */

/**
 * Application state and configuration
 */
const AppConfig = {
  version: '1.0.0',
  environment: import.meta.env.MODE || 'production',
  debug: import.meta.env.DEV || false,
};

/**
 * Structured logger with context support
 */
const Logger = {
  /**
   * Log informational message
   * @param {string} message - Log message
   * @param {Object} context - Additional context data
   */
  info(message, context = {}) {
    // Info logging removed in production - use warn/error for important messages
    if (AppConfig.debug) {
      // Debug info only shown in development
      const debugInfo = {
        timestamp: new Date().toISOString(),
        ...context,
      };
      // Store for debugging but don't log to console
      window.__DEBUG_LOGS__ = window.__DEBUG_LOGS__ || [];
      window.__DEBUG_LOGS__.push({ level: 'INFO', message, ...debugInfo });
    }
  },

  /**
   * Log warning message
   * @param {string} message - Warning message
   * @param {Object} context - Additional context data
   */
  warn(message, context = {}) {
    console.warn('[WARN]', message, {
      timestamp: new Date().toISOString(),
      ...context,
    });
  },

  /**
   * Log error with full context
   * @param {string} message - Error message
   * @param {Error} error - Error object
   * @param {Object} context - Additional context data
   */
  error(message, error, context = {}) {
    console.error('[ERROR]', message, {
      timestamp: new Date().toISOString(),
      error: {
        message: error?.message,
        stack: error?.stack,
        name: error?.name,
      },
      ...context,
    });
  },
};

/**
 * Performance monitoring utilities
 */
const Performance = {
  marks: new Map(),

  /**
   * Start performance measurement
   * @param {string} label - Measurement label
   */
  start(label) {
    if (typeof performance !== 'undefined' && performance.mark) {
      try {
        performance.mark(`${label}-start`);
        this.marks.set(label, Date.now());
      } catch (error) {
        Logger.warn('Performance mark failed', { label, error: error.message });
      }
    }
  },

  /**
   * End performance measurement and log duration
   * @param {string} label - Measurement label
   */
  end(label) {
    if (typeof performance !== 'undefined' && performance.mark) {
      try {
        performance.mark(`${label}-end`);
        performance.measure(label, `${label}-start`, `${label}-end`);

        const measure = performance.getEntriesByName(label)[0];
        const duration = measure ? measure.duration : Date.now() - (this.marks.get(label) || 0);

        Logger.info(`Performance: ${label}`, { duration: `${duration.toFixed(2)}ms` });

        // Cleanup
        performance.clearMarks(`${label}-start`);
        performance.clearMarks(`${label}-end`);
        performance.clearMeasures(label);
        this.marks.delete(label);
      } catch (error) {
        Logger.warn('Performance measurement failed', { label, error: error.message });
      }
    }
  },
};

/**
 * DOM utility functions
 */
const DOM = {
  /**
   * Safely query selector with error handling
   * @param {string} selector - CSS selector
   * @param {Element} context - Context element (default: document)
   * @returns {Element|null} Found element or null
   */
  query(selector, context = document) {
    try {
      return context.querySelector(selector);
    } catch (error) {
      Logger.error('DOM query failed', error, { selector });
      return null;
    }
  },

  /**
   * Safely query all elements with error handling
   * @param {string} selector - CSS selector
   * @param {Element} context - Context element (default: document)
   * @returns {NodeList|Array} Found elements or empty array
   */
  queryAll(selector, context = document) {
    try {
      return context.querySelectorAll(selector);
    } catch (error) {
      Logger.error('DOM queryAll failed', error, { selector });
      return [];
    }
  },

  /**
   * Check if DOM is ready
   * @returns {boolean} True if DOM is ready
   */
  isReady() {
    return document.readyState === 'complete' || document.readyState === 'interactive';
  },
};

/**
 * Application initialization and lifecycle management
 */
const App = {
  initialized: false,
  modules: [],

  /**
   * Register a module for initialization
   * @param {Object} module - Module with init method
   */
  registerModule(module) {
    if (module && typeof module.init === 'function') {
      this.modules.push(module);
      Logger.info('Module registered', { module: module.name || 'anonymous' });
    } else {
      Logger.warn('Invalid module registration attempt', { module });
    }
  },

  /**
   * Initialize all registered modules
   * Modules are initialized sequentially to maintain proper dependency order
   */
  async initializeModules() {
    Performance.start('modules-init');

    // Sequential initialization is intentional to maintain dependency order
    // eslint-disable-next-line no-await-in-loop -- Sequential module initialization required
    for (const module of this.modules) {
      try {
        const moduleName = module.name || 'anonymous';
        Performance.start(`module-${moduleName}`);

        await module.init();

        Performance.end(`module-${moduleName}`);
        Logger.info('Module initialized', { module: moduleName });
      } catch (error) {
        Logger.error('Module initialization failed', error, {
          module: module.name || 'anonymous',
        });
      }
    }

    Performance.end('modules-init');
  },

  /**
   * Initialize the application
   */
  async init() {
    if (this.initialized) {
      Logger.warn('Application already initialized');
      return;
    }

    Performance.start('app-init');

    try {
      Logger.info('Application initializing', {
        version: AppConfig.version,
        environment: AppConfig.environment,
        userAgent: navigator.userAgent,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight,
        },
      });

      // Initialize all registered modules
      await this.initializeModules();

      // Setup global error handlers
      this.setupErrorHandlers();

      // Setup visibility change handler
      this.setupVisibilityHandler();

      this.initialized = true;

      Logger.info('Application initialized successfully', {
        modulesCount: this.modules.length,
      });

      Performance.end('app-init');
    } catch (error) {
      Logger.error('Application initialization failed', error);
      Performance.end('app-init');
      throw error;
    }
  },

  /**
   * Setup global error handlers
   */
  setupErrorHandlers() {
    // Handle uncaught errors
    window.addEventListener('error', (event) => {
      Logger.error('Uncaught error', event.error || new Error(event.message), {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    });

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      Logger.error('Unhandled promise rejection', event.reason, {
        promise: event.promise,
      });
    });

    Logger.info('Global error handlers configured');
  },

  /**
   * Setup page visibility change handler
   */
  setupVisibilityHandler() {
    if (typeof document.hidden !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        Logger.info('Page visibility changed', {
          hidden: document.hidden,
          visibilityState: document.visibilityState,
        });
      });
    }
  },
};

/**
 * Example module for future enhancements
 * Demonstrates the modular structure pattern
 * Prefixed with underscore to indicate intentionally unused template
 */
const _ExampleModule = {
  name: 'ExampleModule',

  /**
   * Initialize the example module
   */
  init() {
    Logger.info('Example module initializing');

    /*
     * Future enhancement: Add interactive features here
     * This serves as a template for additional modules
     */
  },
};

/**
 * Bootstrap the application when DOM is ready
 */
function bootstrap() {
  Performance.start('bootstrap');

  try {
    /*
     * Register modules here
     * App.registerModule(_ExampleModule);
     */

    // Initialize application
    App.init()
      .then(() => {
        Logger.info('Bootstrap completed successfully');
        Performance.end('bootstrap');
      })
      .catch((error) => {
        Logger.error('Bootstrap failed', error);
        Performance.end('bootstrap');
      });
  } catch (error) {
    Logger.error('Bootstrap initialization failed', error);
    Performance.end('bootstrap');
  }
}

/**
 * Entry point - Wait for DOM to be ready
 */
if (DOM.isReady()) {
  // DOM is already ready, initialize immediately
  bootstrap();
} else {
  // Wait for DOM to be ready
  document.addEventListener('DOMContentLoaded', bootstrap, { once: true });
}

/**
 * Export for potential module usage
 */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { App, Logger, Performance, DOM };
}