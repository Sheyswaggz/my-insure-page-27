/**
 * Main JavaScript Entry Point
 * 
 * Initializes all interactive components and utilities for the insurance landing page.
 * Handles header navigation, lazy loading of images, contact form, and performance monitoring.
 * 
 * @module main
 * @version 1.0.0
 * 
 * @generated-from: task-id:TASK-003, task-id:d2b87a04-ff1d-4e18-b0de-51e86102b9a1
 * @modifies: DOM initialization and component setup
 * @dependencies: ["header", "lazyload", "contact-form"]
 */

import { initHeader } from './components/header.js';
import { initLazyLoad } from './utils/lazyload.js';
import { initContactForm } from './components/contact-form.js';

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
 * Sets up header navigation, lazy loading functionality, and contact form
 * 
 * @returns {void}
 */
function initializeApp() {
  try {
    /* Mark initialization start */
    if (typeof performance !== 'undefined' && performance.mark) {
      performance.mark('app-init-start');
    }

    logger.info('Initializing application');

    /* Initialize header component */
    try {
      if (typeof performance !== 'undefined' && performance.mark) {
        performance.mark('header-init-start');
      }

      initHeader();

      if (typeof performance !== 'undefined' && performance.mark) {
        performance.mark('header-init-end');
        performance.measure('header-init-duration', 'header-init-start', 'header-init-end');
      }

      logger.info('Header initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize header', error);
      /* Continue initialization even if header fails */
    }

    /* Initialize lazy loading for images */
    try {
      if (typeof performance !== 'undefined' && performance.mark) {
        performance.mark('lazyload-init-start');
      }

      const lazyLoadCleanup = initLazyLoad('img[data-src], [data-src]', {
        rootMargin: '50px',
        threshold: 0.01,
        enableNativeLazy: true,
        retryAttempts: 3,
      });

      if (typeof performance !== 'undefined' && performance.mark) {
        performance.mark('lazyload-init-end');
        performance.measure('lazyload-init-duration', 'lazyload-init-start', 'lazyload-init-end');
      }

      logger.info('Lazy loading initialized successfully');

      /* Store cleanup function for potential later use */
      window.__lazyLoadCleanup = lazyLoadCleanup;
    } catch (error) {
      logger.error('Failed to initialize lazy loading', error);
      /* Continue even if lazy loading fails */
    }

    /* Initialize contact form */
    try {
      if (typeof performance !== 'undefined' && performance.mark) {
        performance.mark('contact-form-init-start');
      }

      const contactFormCleanup = initContactForm('#contact-form');

      if (typeof performance !== 'undefined' && performance.mark) {
        performance.mark('contact-form-init-end');
        performance.measure('contact-form-init-duration', 'contact-form-init-start', 'contact-form-init-end');
      }

      logger.info('Contact form initialized successfully');

      /* Store cleanup function for potential later use */
      window.__contactFormCleanup = contactFormCleanup;
    } catch (error) {
      logger.error('Failed to initialize contact form', error);
      /* Continue even if contact form fails */
    }

    /* Mark initialization complete */
    if (typeof performance !== 'undefined' && performance.mark) {
      performance.mark('app-init-end');
      performance.measure('app-init-duration', 'app-init-start', 'app-init-end');

      /* Log performance metrics */
      try {
        const initMeasure = performance.getEntriesByName('app-init-duration')[0];
        if (initMeasure) {
          logger.info('Application initialization completed', {
            duration: `${initMeasure.duration.toFixed(2)}ms`,
          });
        }
      } catch (perfError) {
        logger.warn('Could not retrieve performance metrics', { error: perfError });
      }
    }

    logger.info('Application initialization completed successfully');
  } catch (error) {
    logger.error('Critical error during application initialization', error);
    /* Application should still be partially functional */
  }
}

/**
 * DOM Content Loaded Event Handler
 * Ensures DOM is fully loaded before initializing components
 */
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
  } else {
    /* DOM already loaded, initialize immediately */
    initializeApp();
  }
}

/**
 * Cleanup on page unload
 * Ensures proper cleanup of observers and event listeners
 */
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    logger.info('Page unloading, performing cleanup');

    /* Call lazy load cleanup if available */
    if (typeof window.__lazyLoadCleanup === 'function') {
      try {
        window.__lazyLoadCleanup();
        delete window.__lazyLoadCleanup;
      } catch (error) {
        logger.error('Error during lazy load cleanup', error);
      }
    }

    /* Call contact form cleanup if available */
    if (typeof window.__contactFormCleanup === 'function') {
      try {
        window.__contactFormCleanup();
        delete window.__contactFormCleanup;
      } catch (error) {
        logger.error('Error during contact form cleanup', error);
      }
    }
  });
}

/**
 * Export for testing purposes
 * @private
 */
export const __testing__ = {
  initializeApp,
  logger,
};