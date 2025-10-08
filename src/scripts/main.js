/**
 * Main JavaScript Entry Point
 *
 * Initializes all components and utilities for the landing page.
 * Handles DOMContentLoaded event and component initialization with error handling.
 *
 * @module main
 * @generated-from task-id:e59bcfd2-c7fd-4e21-a4e7-991d3345a5a2 sprint:current
 * @modifies main application initialization
 */

import { initHeader } from './components/header.js';

/**
 * Logger utility for structured logging with context
 * @private
 */
const logger = {
  /**
   * Log informational message
   * @param {string} message - Log message
   * @param {Object} context - Additional context data
   */
  info: (message, context = {}) => {
    // Info logging disabled in production for performance
    // Uncomment for development debugging:
    // console.info('[Main]', message, { timestamp: new Date().toISOString(), ...context });
  },

  /**
   * Log warning message
   * @param {string} message - Warning message
   * @param {Object} context - Additional context data
   */
  warn: (message, context = {}) => {
    console.warn('[Main]', message, {
      timestamp: new Date().toISOString(),
      ...context,
    });
  },

  /**
   * Log error message
   * @param {string} message - Error message
   * @param {Error|Object} error - Error object or context
   */
  error: (message, error = {}) => {
    console.error('[Main]', message, {
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        name: error.name,
      } : error,
    });
  },
};

/**
 * Initializes the header component with error handling
 * @private
 * @returns {Function|null} Cleanup function or null if initialization failed
 */
function initializeHeader() {
  try {
    logger.info('Initializing header component');
    const cleanup = initHeader();
    logger.info('Header component initialized successfully');
    return cleanup;
  } catch (error) {
    logger.error('Failed to initialize header component', error);

    // Track initialization failure for monitoring
    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push({
        event: 'component_init_error',
        component: 'header',
        error: error.message,
      });
    }

    return null;
  }
}

/**
 * Main initialization function
 * Initializes all components when DOM is ready
 * @private
 */
function init() {
  logger.info('Application initialization started');

  const cleanupFunctions = [];

  // Initialize header component
  const headerCleanup = initializeHeader();
  if (headerCleanup) {
    cleanupFunctions.push(headerCleanup);
  }

  logger.info('Application initialization completed', {
    componentsInitialized: cleanupFunctions.length,
  });

  // Store cleanup functions for potential future use
  if (typeof window !== 'undefined') {
    window.__appCleanup = () => {
      logger.info('Running application cleanup');
      cleanupFunctions.forEach((cleanup) => {
        try {
          cleanup();
        } catch (error) {
          logger.error('Error during component cleanup', error);
        }
      });
      logger.info('Application cleanup completed');
    };
  }
}

/**
 * Initialize application when DOM is ready
 */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  // DOM is already ready, initialize immediately
  init();
}