/**
 * Lazy Loading Utility Module
 * 
 * Provides enhanced lazy loading functionality using IntersectionObserver API
 * with fallback support for browsers without native lazy loading.
 * Handles responsive images with srcset and provides comprehensive error handling.
 * 
 * @module lazyload
 * @version 1.0.0
 * 
 * @generated-from: task-id:TASK-003
 * @modifies: DOM images with data-src attributes
 * @dependencies: []
 */

/**
 * Configuration for lazy loading behavior
 * @typedef {Object} LazyLoadConfig
 * @property {string} rootMargin - Margin around root for intersection detection
 * @property {number} threshold - Visibility threshold to trigger loading
 * @property {string} loadingClass - CSS class applied during image loading
 * @property {string} loadedClass - CSS class applied after successful load
 * @property {string} errorClass - CSS class applied on load error
 * @property {boolean} enableNativeLazy - Use native lazy loading when available
 * @property {number} retryAttempts - Number of retry attempts on load failure
 * @property {number} retryDelay - Delay between retry attempts (ms)
 */

/**
 * Default configuration for lazy loading
 * @type {LazyLoadConfig}
 */
const DEFAULT_CONFIG = Object.freeze({
  rootMargin: '50px',
  threshold: 0.01,
  loadingClass: 'lazy-loading',
  loadedClass: 'lazy-loaded',
  errorClass: 'lazy-error',
  enableNativeLazy: true,
  retryAttempts: 3,
  retryDelay: 1000,
});

/**
 * State management for lazy loading instances
 * @type {WeakMap<Element, Object>}
 */
const imageStates = new WeakMap();

/**
 * Logger utility for structured logging
 * @type {Object}
 */
const logger = {
  info: (message, context = {}) => {
    if (typeof console !== 'undefined' && console.info) {
      console.info(`[LazyLoad] ${message}`, context);
    }
  },
  warn: (message, context = {}) => {
    if (typeof console !== 'undefined' && console.warn) {
      console.warn(`[LazyLoad] ${message}`, context);
    }
  },
  error: (message, error = null, context = {}) => {
    if (typeof console !== 'undefined' && console.error) {
      console.error(`[LazyLoad] ${message}`, { error, ...context });
    }
  },
};

/**
 * Check if IntersectionObserver is supported
 * @returns {boolean} True if IntersectionObserver is available
 */
function isIntersectionObserverSupported() {
  return (
    typeof window !== 'undefined' &&
    'IntersectionObserver' in window &&
    'IntersectionObserverEntry' in window &&
    'intersectionRatio' in window.IntersectionObserverEntry.prototype
  );
}

/**
 * Check if native lazy loading is supported
 * @returns {boolean} True if loading attribute is supported
 */
function isNativeLazyLoadSupported() {
  return typeof HTMLImageElement !== 'undefined' && 'loading' in HTMLImageElement.prototype;
}

/**
 * Validate image element has required attributes
 * @param {HTMLElement} element - Image element to validate
 * @throws {Error} If element is invalid
 */
function validateImageElement(element) {
  if (!element) {
    throw new Error('Image element is null or undefined');
  }

  if (!(element instanceof HTMLElement)) {
    throw new Error('Provided element is not an HTMLElement');
  }

  const dataSrc = element.getAttribute('data-src');
  if (!dataSrc || dataSrc.trim() === '') {
    throw new Error(`Image element missing data-src attribute: ${element.outerHTML.substring(0, 100)}`);
  }
}

/**
 * Load image with retry logic and exponential backoff
 * @param {HTMLImageElement} img - Image element to load
 * @param {string} src - Image source URL
 * @param {string|null} srcset - Image srcset attribute
 * @param {LazyLoadConfig} config - Configuration object
 * @param {number} attempt - Current retry attempt
 * @returns {Promise<void>}
 */
async function loadImageWithRetry(img, src, srcset, config, attempt = 1) {
  return new Promise((resolve, reject) => {
    /* Create temporary image for preloading */
    const tempImg = new Image();
    
    /* Set up success handler */
    const handleLoad = () => {
      try {
        /* Apply source to actual image element */
        if (img.tagName === 'IMG') {
          img.src = src;
          if (srcset) {
            img.srcset = srcset;
          }
        } else {
          /* Handle background images */
          img.style.backgroundImage = `url('${src}')`;
        }

        /* Update state */
        const state = imageStates.get(img);
        if (state) {
          state.loaded = true;
          state.loading = false;
          state.error = null;
        }

        /* Apply loaded class */
        img.classList.remove(config.loadingClass);
        img.classList.add(config.loadedClass);

        /* Mark performance */
        if (typeof performance !== 'undefined' && performance.mark) {
          performance.mark(`lazy-load-complete-${src}`);
        }

        logger.info('Image loaded successfully', { src, attempt });
        resolve();
      } catch (error) {
        logger.error('Error applying image source', error, { src });
        reject(error);
      }
    };

    /* Set up error handler with retry logic */
    const handleError = async (error) => {
      if (attempt < config.retryAttempts) {
        const delay = config.retryDelay * Math.pow(2, attempt - 1);
        logger.warn(`Image load failed, retrying in ${delay}ms`, {
          src,
          attempt,
          maxAttempts: config.retryAttempts,
        });

        /* Wait before retry with exponential backoff */
        await new Promise(resolve => setTimeout(resolve, delay));

        try {
          await loadImageWithRetry(img, src, srcset, config, attempt + 1);
          resolve();
        } catch (retryError) {
          reject(retryError);
        }
      } else {
        /* Max retries reached */
        const state = imageStates.get(img);
        if (state) {
          state.loading = false;
          state.error = error;
        }

        img.classList.remove(config.loadingClass);
        img.classList.add(config.errorClass);

        logger.error('Image load failed after all retries', error, {
          src,
          attempts: config.retryAttempts,
        });

        reject(new Error(`Failed to load image after ${config.retryAttempts} attempts: ${src}`));
      }
    };

    /* Attach event listeners */
    tempImg.addEventListener('load', handleLoad, { once: true });
    tempImg.addEventListener('error', handleError, { once: true });

    /* Start loading */
    if (srcset) {
      tempImg.srcset = srcset;
    }
    tempImg.src = src;
  });
}

/**
 * Load image element
 * @param {HTMLElement} element - Image element to load
 * @param {LazyLoadConfig} config - Configuration object
 * @returns {Promise<void>}
 */
async function loadImage(element, config) {
  try {
    /* Validate element */
    validateImageElement(element);

    /* Check if already loaded or loading */
    const state = imageStates.get(element);
    if (state && (state.loaded || state.loading)) {
      logger.info('Image already loaded or loading', {
        src: element.getAttribute('data-src'),
        state: state.loaded ? 'loaded' : 'loading',
      });
      return;
    }

    /* Initialize state */
    imageStates.set(element, {
      loaded: false,
      loading: true,
      error: null,
    });

    /* Apply loading class */
    element.classList.add(config.loadingClass);

    /* Get image sources */
    const src = element.getAttribute('data-src');
    const srcset = element.getAttribute('data-srcset');

    /* Mark performance start */
    if (typeof performance !== 'undefined' && performance.mark) {
      performance.mark(`lazy-load-start-${src}`);
    }

    /* Load image with retry logic */
    await loadImageWithRetry(element, src, srcset, config);

    /* Remove data attributes after successful load */
    element.removeAttribute('data-src');
    element.removeAttribute('data-srcset');

  } catch (error) {
    logger.error('Failed to load image', error, {
      element: element.outerHTML.substring(0, 100),
    });
    throw error;
  }
}

/**
 * Handle intersection observer callback
 * @param {IntersectionObserverEntry[]} entries - Intersection entries
 * @param {IntersectionObserver} observer - Observer instance
 * @param {LazyLoadConfig} config - Configuration object
 */
function handleIntersection(entries, observer, config) {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const element = entry.target;

      /* Stop observing this element */
      observer.unobserve(element);

      /* Load the image */
      loadImage(element, config).catch(error => {
        logger.error('Error in intersection handler', error, {
          element: element.outerHTML.substring(0, 100),
        });
      });
    }
  });
}

/**
 * Fallback loading for browsers without IntersectionObserver
 * @param {HTMLElement[]} elements - Array of image elements
 * @param {LazyLoadConfig} config - Configuration object
 */
function fallbackLoad(elements, config) {
  logger.warn('Using fallback loading (no IntersectionObserver support)');

  /* Load all images immediately in fallback mode */
  elements.forEach(element => {
    loadImage(element, config).catch(error => {
      logger.error('Error in fallback load', error, {
        element: element.outerHTML.substring(0, 100),
      });
    });
  });
}

/**
 * Apply native lazy loading attribute
 * @param {HTMLElement} element - Image element
 */
function applyNativeLazyLoading(element) {
  if (element.tagName === 'IMG') {
    element.loading = 'lazy';
  }
}

/**
 * Initialize lazy loading for images
 * 
 * @param {string|HTMLElement|NodeList|HTMLElement[]} selector - CSS selector, element, or array of elements
 * @param {Partial<LazyLoadConfig>} userConfig - User configuration to override defaults
 * @returns {Function} Cleanup function to disconnect observer and clear state
 * 
 * @example
 * // Basic usage with selector
 * const cleanup = initLazyLoad('img[data-src]');
 * 
 * @example
 * // With custom configuration
 * const cleanup = initLazyLoad('img[data-src]', {
 *   rootMargin: '100px',
 *   threshold: 0.1,
 *   retryAttempts: 5
 * });
 * 
 * @example
 * // Cleanup when done
 * cleanup();
 */
export function initLazyLoad(selector = 'img[data-src], [data-src]', userConfig = {}) {
  try {
    /* Merge user config with defaults */
    const config = { ...DEFAULT_CONFIG, ...userConfig };

    logger.info('Initializing lazy load', {
      selector: typeof selector === 'string' ? selector : 'element(s)',
      config,
    });

    /* Get elements to lazy load */
    let elements = [];

    if (typeof selector === 'string') {
      elements = Array.from(document.querySelectorAll(selector));
    } else if (selector instanceof HTMLElement) {
      elements = [selector];
    } else if (selector instanceof NodeList || Array.isArray(selector)) {
      elements = Array.from(selector);
    } else {
      throw new Error('Invalid selector type. Expected string, HTMLElement, NodeList, or Array');
    }

    if (elements.length === 0) {
      logger.warn('No elements found for lazy loading', { selector });
      return () => {}; /* Return no-op cleanup function */
    }

    logger.info(`Found ${elements.length} elements for lazy loading`);

    /* Check for native lazy loading support */
    const useNativeLazy = config.enableNativeLazy && isNativeLazyLoadSupported();

    if (useNativeLazy) {
      logger.info('Using native lazy loading');
      elements.forEach(element => {
        applyNativeLazyLoading(element);
        /* Still need to swap data-src to src */
        const dataSrc = element.getAttribute('data-src');
        const dataSrcset = element.getAttribute('data-srcset');
        
        if (dataSrc) {
          element.src = dataSrc;
          element.removeAttribute('data-src');
        }
        if (dataSrcset) {
          element.srcset = dataSrcset;
          element.removeAttribute('data-srcset');
        }
      });

      /* Return no-op cleanup for native lazy loading */
      return () => {
        logger.info('Cleanup called (native lazy loading)');
      };
    }

    /* Check for IntersectionObserver support */
    if (!isIntersectionObserverSupported()) {
      fallbackLoad(elements, config);
      
      /* Return cleanup function */
      return () => {
        logger.info('Cleanup called (fallback mode)');
        elements.forEach(element => imageStates.delete(element));
      };
    }

    /* Create IntersectionObserver */
    const observerOptions = {
      root: null,
      rootMargin: config.rootMargin,
      threshold: config.threshold,
    };

    const observer = new IntersectionObserver(
      (entries) => handleIntersection(entries, observer, config),
      observerOptions
    );

    /* Observe all elements */
    elements.forEach(element => {
      try {
        validateImageElement(element);
        observer.observe(element);
      } catch (error) {
        logger.error('Failed to observe element', error, {
          element: element.outerHTML.substring(0, 100),
        });
      }
    });

    logger.info('Lazy load initialized successfully', {
      observedElements: elements.length,
      useIntersectionObserver: true,
    });

    /* Return cleanup function */
    return () => {
      logger.info('Cleaning up lazy load observer');

      /* Disconnect observer */
      if (observer) {
        observer.disconnect();
      }

      /* Clear state for all elements */
      elements.forEach(element => {
        imageStates.delete(element);
        element.classList.remove(config.loadingClass, config.loadedClass, config.errorClass);
      });

      logger.info('Lazy load cleanup completed');
    };

  } catch (error) {
    logger.error('Failed to initialize lazy load', error);
    throw error;
  }
}

/**
 * Get loading state for an element
 * @param {HTMLElement} element - Image element
 * @returns {Object|null} State object or null if not tracked
 */
export function getImageState(element) {
  return imageStates.get(element) || null;
}

/**
 * Check if lazy loading is supported
 * @returns {Object} Support information
 */
export function checkSupport() {
  return {
    intersectionObserver: isIntersectionObserverSupported(),
    nativeLazyLoad: isNativeLazyLoadSupported(),
    recommended: isIntersectionObserverSupported() ? 'IntersectionObserver' : 'fallback',
  };
}

/**
 * Export for testing purposes
 * @private
 */
export const __testing__ = {
  validateImageElement,
  loadImageWithRetry,
  loadImage,
  handleIntersection,
  fallbackLoad,
  isIntersectionObserverSupported,
  isNativeLazyLoadSupported,
  DEFAULT_CONFIG,
  imageStates,
};