/**
 * Main JavaScript Entry Point
 * 
 * Initializes all interactive components and utilities for the insurance landing page.
 * Handles header navigation, lazy loading, and performance monitoring.
 * 
 * @module main
 * @version 1.0.0
 * 
 * @generated-from: task-id:TASK-003
 * @modifies: DOM initialization and component setup
 * @dependencies: ["header", "lazyload"]
 */

import { initHeader } from './components/header.js';
import { initLazyLoad } from './utils/lazyload.js';

/**
 * Logger utility for structured logging
 * @type {Object}
 */
const logger = {
  info: (message, context = {}) => {
    if (typeof console !== 'undefined' && console.info) {
      console.info(`[Main] ${message}`, context);
    }
  },
  warn: (message, context = {}) => {
    if (typeof console !== 'undefined' && console.warn) {
      console.warn(`[Main] ${message}`, context);
    }
  },
  error: (message, error = null, context = {}) => {
    if (typeof console !== 'undefined' && console.error) {
      console.error(`[Main] ${message}`, { error, ...context });
    }
  },
};

/**
 * Initialize all application components
 * Sets up header navigation, lazy loading, and performance monitoring
 * 
 * @returns {void}
 */
function initializeApp() {
  try {
    /* Performance mark for initialization start */
    if (typeof performance !== 'undefined' && performance.mark) {
      performance.mark('app-init-start');
    }

    logger.info('Initializing application');

    /* Initialize header component */
    try {
      initHeader();
      logger.info('Header initialized successfully');
    } catch (headerError) {
      logger.error('Failed to initialize header', headerError);
      /* Continue initialization even if header fails */
    }

    /* Initialize lazy loading utility */
    try {
      const lazyLoadCleanup = initLazyLoad({
        selector: '[data-src], [data-srcset]',
        rootMargin: '50px',
        threshold: 0.01,
        enableNativeLazy: true,
        retryAttempts: 3,
        retryDelay: 1000,
      });

      logger.info('Lazy loading initialized successfully');

      /* Store cleanup function for potential future use */
      if (typeof window !== 'undefined') {
        window.__lazyLoadCleanup = lazyLoadCleanup;
      }
    } catch (lazyLoadError) {
      logger.error('Failed to initialize lazy loading', lazyLoadError);
      /* Continue initialization even if lazy loading fails */
    }

    /* Performance mark for initialization end */
    if (typeof performance !== 'undefined' && performance.mark) {
      performance.mark('app-init-end');
      
      try {
        performance.measure('app-initialization', 'app-init-start', 'app-init-end');
        
        /* Log initialization time */
        const measure = performance.getEntriesByName('app-initialization')[0];
        if (measure) {
          logger.info('Application initialization completed', {
            duration: `${measure.duration.toFixed(2)}ms`,
          });
        }
      } catch (measureError) {
        /* Ignore measure errors */
        logger.info('Application initialization completed');
      }
    } else {
      logger.info('Application initialization completed');
    }

  } catch (error) {
    logger.error('Critical error during application initialization', error);
    /* Rethrow to prevent silent failures */
    throw error;
  }
}

/**
 * DOMContentLoaded event handler
 * Ensures DOM is fully loaded before initializing components
 */
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp, { once: true });
  } else {
    /* DOM already loaded, initialize immediately */
    initializeApp();
  }
}

/**
 * Export initialization function for testing purposes
 */
export { initializeApp };