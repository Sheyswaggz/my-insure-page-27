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
 * Validate image element and data attributes
 * @param {Element} element - Image element to validate
 * @throws {Error} If element is invalid
 */
function validateImageElement(element) {
  if (!element || !(element instanceof Element)) {
    throw new Error('Invalid element provided for lazy loading');
  }

  if (!element.hasAttribute('data-src') && !element.hasAttribute('data-srcset')) {
    throw new Error('Element must have data-src or data-srcset attribute');
  }
}

/**
 * Load image with retry logic and exponential backoff
 * @param {HTMLImageElement} img - Image element to load
 * @param {string} src - Image source URL
 * @param {string|null} srcset - Image srcset attribute
 * @param {number} attempt - Current retry attempt
 * @param {LazyLoadConfig} config - Configuration object
 * @returns {Promise<void>}
 */
async function loadImageWithRetry(img, src, srcset, attempt, config) {
  return new Promise((resolve, reject) => {
    const tempImg = new Image();
    
    /* Timeout handler for slow loading images */
    const timeoutId = setTimeout(() => {
      tempImg.src = '';
      reject(new Error(`Image load timeout: ${src}`));
    }, 30000);

    /* Success handler */
    const handleLoad = () => {
      clearTimeout(timeoutId);
      
      /* Apply loaded source to actual image */
      if (srcset) {
        img.srcset = srcset;
      }
      img.src = src;
      
      /* Update state */
      const state = imageStates.get(img);
      if (state) {
        state.loaded = true;
        state.loading = false;
      }
      
      resolve();
    };

    /* Error handler with retry logic */
    const handleError = async (error) => {
      clearTimeout(timeoutId);
      
      if (attempt < config.retryAttempts) {
        const delay = config.retryDelay * Math.pow(2, attempt - 1);
        logger.warn(`Image load failed, retrying in ${delay}ms`, {
          src,
          attempt,
          maxAttempts: config.retryAttempts,
        });
        
        await new Promise(resolve => setTimeout(resolve, delay));
        
        try {
          await loadImageWithRetry(img, src, srcset, attempt + 1, config);
          resolve();
        } catch (retryError) {
          reject(retryError);
        }
      } else {
        reject(error || new Error(`Failed to load image after ${config.retryAttempts} attempts: ${src}`));
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
 * Load image element with state management
 * @param {HTMLImageElement} element - Image element to load
 * @param {LazyLoadConfig} config - Configuration object
 * @returns {Promise<void>}
 */
async function loadImage(element, config) {
  /* Check if already loading or loaded */
  const state = imageStates.get(element);
  if (state && (state.loading || state.loaded)) {
    return;
  }

  /* Initialize state */
  imageStates.set(element, {
    loading: true,
    loaded: false,
    error: false,
  });

  /* Add loading class */
  element.classList.add(config.loadingClass);
  element.classList.remove(config.errorClass);

  /* Get source attributes */
  const src = element.getAttribute('data-src');
  const srcset = element.getAttribute('data-srcset');
  const sizes = element.getAttribute('data-sizes');

  if (!src && !srcset) {
    logger.error('No data-src or data-srcset attribute found', null, {
      element: element.outerHTML.substring(0, 100),
    });
    return;
  }

  try {
    /* Performance mark for metrics */
    if (typeof performance !== 'undefined' && performance.mark) {
      performance.mark(`lazy-load-start-${src || srcset}`);
    }

    /* Load image with retry logic */
    await loadImageWithRetry(element, src, srcset, 1, config);

    /* Apply sizes attribute if present */
    if (sizes) {
      element.sizes = sizes;
    }

    /* Update classes */
    element.classList.remove(config.loadingClass);
    element.classList.add(config.loadedClass);

    /* Remove data attributes to prevent reprocessing */
    element.removeAttribute('data-src');
    element.removeAttribute('data-srcset');
    element.removeAttribute('data-sizes');

    /* Performance measure */
    if (typeof performance !== 'undefined' && performance.measure) {
      try {
        performance.measure(
          `lazy-load-${src || srcset}`,
          `lazy-load-start-${src || srcset}`
        );
      } catch (measureError) {
        /* Ignore measure errors */
      }
    }

    logger.info('Image loaded successfully', {
      src: src || srcset,
      hassrcset: !!srcset,
    });

  } catch (error) {
    /* Update state and classes on error */
    const state = imageStates.get(element);
    if (state) {
      state.loading = false;
      state.error = true;
    }

    element.classList.remove(config.loadingClass);
    element.classList.add(config.errorClass);

    logger.error('Failed to load image', error, {
      src: src || srcset,
      element: element.outerHTML.substring(0, 100),
    });

    /* Dispatch custom error event for error handling */
    const errorEvent = new CustomEvent('lazyloaderror', {
      detail: {
        element,
        src: src || srcset,
        error,
      },
      bubbles: true,
    });
    element.dispatchEvent(errorEvent);
  }
}

/**
 * Create IntersectionObserver for lazy loading
 * @param {LazyLoadConfig} config - Configuration object
 * @returns {IntersectionObserver}
 */
function createIntersectionObserver(config) {
  const observerConfig = {
    rootMargin: config.rootMargin,
    threshold: config.threshold,
  };

  const observer = new IntersectionObserver((entries, observerInstance) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const element = entry.target;
        
        /* Unobserve immediately to prevent multiple triggers */
        observerInstance.unobserve(element);
        
        /* Load image */
        loadImage(element, config).catch(error => {
          logger.error('Error in intersection observer callback', error, {
            element: element.outerHTML.substring(0, 100),
          });
        });
      }
    });
  }, observerConfig);

  return observer;
}

/**
 * Fallback loading for browsers without IntersectionObserver
 * @param {NodeList|Array<Element>} elements - Elements to load
 * @param {LazyLoadConfig} config - Configuration object
 */
function fallbackLoad(elements, config) {
  logger.warn('Using fallback loading (no IntersectionObserver support)');

  /* Load all images immediately in fallback mode */
  elements.forEach(element => {
    try {
      validateImageElement(element);
      loadImage(element, config).catch(error => {
        logger.error('Error in fallback load', error, {
          element: element.outerHTML.substring(0, 100),
        });
      });
    } catch (validationError) {
      logger.error('Invalid element in fallback load', validationError);
    }
  });
}

/**
 * Apply native lazy loading attribute
 * @param {Element} element - Image element
 */
function applyNativeLazyLoading(element) {
  if (element.tagName === 'IMG' && !element.hasAttribute('loading')) {
    element.setAttribute('loading', 'lazy');
  }
}

/**
 * Initialize lazy loading for images
 * 
 * @param {Object} options - Configuration options
 * @param {string} [options.selector='[data-src], [data-srcset]'] - CSS selector for lazy load elements
 * @param {string} [options.rootMargin='50px'] - Root margin for intersection observer
 * @param {number} [options.threshold=0.01] - Intersection threshold
 * @param {string} [options.loadingClass='lazy-loading'] - CSS class during loading
 * @param {string} [options.loadedClass='lazy-loaded'] - CSS class after load
 * @param {string} [options.errorClass='lazy-error'] - CSS class on error
 * @param {boolean} [options.enableNativeLazy=true] - Use native lazy loading when available
 * @param {number} [options.retryAttempts=3] - Number of retry attempts
 * @param {number} [options.retryDelay=1000] - Delay between retries (ms)
 * @param {Element} [options.root=null] - Root element for intersection observer
 * 
 * @returns {Function} Cleanup function to disconnect observer and remove listeners
 * 
 * @example
 * // Basic usage
 * const cleanup = initLazyLoad();
 * 
 * @example
 * // Custom configuration
 * const cleanup = initLazyLoad({
 *   selector: '.lazy-image',
 *   rootMargin: '100px',
 *   threshold: 0.1,
 *   retryAttempts: 5
 * });
 * 
 * // Later, cleanup when component unmounts
 * cleanup();
 */
export function initLazyLoad(options = {}) {
  try {
    /* Merge configuration with defaults */
    const config = {
      ...DEFAULT_CONFIG,
      ...options,
    };

    /* Validate configuration */
    if (typeof config.rootMargin !== 'string') {
      throw new Error('rootMargin must be a string');
    }
    if (typeof config.threshold !== 'number' || config.threshold < 0 || config.threshold > 1) {
      throw new Error('threshold must be a number between 0 and 1');
    }
    if (typeof config.retryAttempts !== 'number' || config.retryAttempts < 0) {
      throw new Error('retryAttempts must be a non-negative number');
    }

    const selector = config.selector || '[data-src], [data-srcset]';
    
    logger.info('Initializing lazy load', {
      selector,
      rootMargin: config.rootMargin,
      threshold: config.threshold,
      nativeSupport: isNativeLazyLoadSupported(),
      observerSupport: isIntersectionObserverSupported(),
    });

    /* Get all lazy load elements */
    const elements = document.querySelectorAll(selector);
    
    if (elements.length === 0) {
      logger.warn('No elements found for lazy loading', { selector });
      return () => {}; /* Return no-op cleanup function */
    }

    logger.info(`Found ${elements.length} elements for lazy loading`);

    /* Apply native lazy loading if enabled and supported */
    if (config.enableNativeLazy && isNativeLazyLoadSupported()) {
      elements.forEach(element => {
        applyNativeLazyLoading(element);
      });
    }

    /* Use IntersectionObserver if supported */
    if (isIntersectionObserverSupported()) {
      const observer = createIntersectionObserver(config);
      
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

      /* Return cleanup function */
      return () => {
        logger.info('Cleaning up lazy load observer');
        observer.disconnect();
        
        /* Clear state for all elements */
        elements.forEach(element => {
          imageStates.delete(element);
        });
      };
    } else {
      /* Fallback for browsers without IntersectionObserver */
      fallbackLoad(elements, config);
      
      /* Return no-op cleanup function */
      return () => {
        logger.info('Cleaning up lazy load (fallback mode)');
        elements.forEach(element => {
          imageStates.delete(element);
        });
      };
    }

  } catch (error) {
    logger.error('Failed to initialize lazy load', error);
    throw error;
  }
}

/**
 * Manually trigger lazy loading for a specific element
 * 
 * @param {Element} element - Element to load
 * @param {Object} options - Configuration options (same as initLazyLoad)
 * @returns {Promise<void>}
 * 
 * @example
 * const img = document.querySelector('.my-image');
 * await loadElement(img);
 */
export async function loadElement(element, options = {}) {
  const config = {
    ...DEFAULT_CONFIG,
    ...options,
  };

  try {
    validateImageElement(element);
    await loadImage(element, config);
  } catch (error) {
    logger.error('Failed to load element', error, {
      element: element.outerHTML.substring(0, 100),
    });
    throw error;
  }
}

/**
 * Check if an element has been loaded
 * 
 * @param {Element} element - Element to check
 * @returns {boolean} True if element has been loaded
 * 
 * @example
 * if (isLoaded(imgElement)) {
 *   console.log('Image is loaded');
 * }
 */
export function isLoaded(element) {
  const state = imageStates.get(element);
  return state ? state.loaded : false;
}

/**
 * Check if an element is currently loading
 * 
 * @param {Element} element - Element to check
 * @returns {boolean} True if element is loading
 * 
 * @example
 * if (isLoading(imgElement)) {
 *   console.log('Image is loading');
 * }
 */
export function isLoading(element) {
  const state = imageStates.get(element);
  return state ? state.loading : false;
}

/**
 * Get loading state for an element
 * 
 * @param {Element} element - Element to check
 * @returns {Object|null} State object or null if not tracked
 * 
 * @example
 * const state = getLoadState(imgElement);
 * console.log(state); // { loading: false, loaded: true, error: false }
 */
export function getLoadState(element) {
  return imageStates.get(element) || null;
}

/* Export for testing purposes */
export const __testing__ = {
  isIntersectionObserverSupported,
  isNativeLazyLoadSupported,
  validateImageElement,
  loadImageWithRetry,
  createIntersectionObserver,
  fallbackLoad,
  imageStates,
  DEFAULT_CONFIG,
};