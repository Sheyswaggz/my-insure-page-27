/**
 * Header Component Module
 *
 * Manages responsive header behavior including:
 * - Mobile menu toggle with ARIA state management
 * - Sticky header on scroll using IntersectionObserver
 * - Keyboard accessibility (Escape key to close menu)
 * - Auto-close menu on navigation link clicks
 * - Feature flag support for sticky behavior
 *
 * @module components/header
 * @generated-from task-id:TASK-002 sprint:current
 * @modifies header navigation behavior
 */

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
    // Logging disabled in production for performance
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.log('[Header]', message, {
        timestamp: new Date().toISOString(),
        ...context,
      });
    }
  },

  /**
   * Log warning message
   * @param {string} message - Warning message
   * @param {Object} context - Additional context data
   */
  warn: (message, context = {}) => {
    console.warn('[Header]', message, {
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
    console.error('[Header]', message, {
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
 * Header state management
 * @private
 */
const headerState = {
  isMenuOpen: false,
  isStickyEnabled: true,
  cleanupFunctions: [],
  intersectionObserver: null,
  elements: {
    header: null,
    menuToggle: null,
    nav: null,
    navLinks: [],
  },
};

/**
 * Validates that required DOM elements exist
 * @private
 * @param {HTMLElement} header - Header element
 * @throws {Error} If required elements are missing
 */
function validateHeaderElements(header) {
  if (!header) {
    throw new Error('Header element is required but was not found');
  }

  const menuToggle = header.querySelector('[data-menu-toggle]');
  const nav = header.querySelector('nav');

  if (!menuToggle) {
    throw new Error('Menu toggle button with [data-menu-toggle] attribute not found in header');
  }

  if (!nav) {
    throw new Error('Navigation element not found in header');
  }

  logger.info('Header elements validated successfully', {
    hasMenuToggle: !!menuToggle,
    hasNav: !!nav,
  });
}

/**
 * Toggles mobile menu open/closed state
 * Updates ARIA attributes and manages focus
 * @private
 */
function toggleMobileMenu() {
  const { menuToggle, nav } = headerState.elements;

  if (!menuToggle || !nav) {
    logger.error('Cannot toggle menu: required elements not initialized');
    return;
  }

  headerState.isMenuOpen = !headerState.isMenuOpen;

  /* Update ARIA attributes for accessibility */
  menuToggle.setAttribute('aria-expanded', String(headerState.isMenuOpen));
  nav.setAttribute('aria-hidden', String(!headerState.isMenuOpen));

  /* Toggle visual state class */
  nav.classList.toggle('is-open', headerState.isMenuOpen);
  menuToggle.classList.toggle('is-active', headerState.isMenuOpen);

  /* Prevent body scroll when menu is open on mobile */
  if (headerState.isMenuOpen) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }

  logger.info('Mobile menu toggled', {
    isOpen: headerState.isMenuOpen,
    timestamp: Date.now(),
  });

  /* Track menu toggle for analytics */
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event: 'menu_toggle',
      menuState: headerState.isMenuOpen ? 'open' : 'closed',
    });
  }
}

/**
 * Closes mobile menu
 * @private
 */
function closeMobileMenu() {
  if (!headerState.isMenuOpen) {
    return;
  }

  const { menuToggle, nav } = headerState.elements;

  if (!menuToggle || !nav) {
    return;
  }

  headerState.isMenuOpen = false;

  menuToggle.setAttribute('aria-expanded', 'false');
  nav.setAttribute('aria-hidden', 'true');
  nav.classList.remove('is-open');
  menuToggle.classList.remove('is-active');
  document.body.style.overflow = '';

  logger.info('Mobile menu closed');
}

/**
 * Handles menu toggle button click
 * @private
 * @param {Event} event - Click event
 */
function handleMenuToggleClick(event) {
  event.preventDefault();
  event.stopPropagation();
  toggleMobileMenu();
}

/**
 * Handles navigation link clicks
 * Closes mobile menu and tracks navigation
 * @private
 * @param {Event} event - Click event
 */
function handleNavLinkClick(event) {
  const link = event.target.closest('a');

  if (!link) {
    return;
  }

  /* Close mobile menu when navigation link is clicked */
  closeMobileMenu();

  logger.info('Navigation link clicked', {
    href: link.getAttribute('href'),
    text: link.textContent.trim(),
  });

  /* Track navigation click for analytics */
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event: 'navigation_click',
      linkText: link.textContent.trim(),
      linkHref: link.getAttribute('href'),
    });
  }
}

/**
 * Handles keyboard events for accessibility
 * Closes menu on Escape key press
 * @private
 * @param {KeyboardEvent} event - Keyboard event
 */
function handleKeyboardEvent(event) {
  if (event.key === 'Escape' || event.keyCode === 27) {
    if (headerState.isMenuOpen) {
      event.preventDefault();
      closeMobileMenu();

      /* Return focus to menu toggle button */
      const { menuToggle } = headerState.elements;
      if (menuToggle) {
        menuToggle.focus();
      }

      logger.info('Menu closed via Escape key');
    }
  }
}

/**
 * Sets up IntersectionObserver for sticky header behavior
 * Observes a sentinel element to detect scroll position
 * @private
 * @param {HTMLElement} header - Header element
 */
function setupStickyHeaderObserver(header) {
  /* Check feature flag */
  const stickyDisabled = header.getAttribute('data-sticky') === 'false';

  if (stickyDisabled) {
    headerState.isStickyEnabled = false;
    logger.info('Sticky header behavior disabled via feature flag');
    return;
  }

  /* Create sentinel element for intersection observation */
  const sentinel = document.createElement('div');
  sentinel.className = 'header-sentinel';
  sentinel.style.position = 'absolute';
  sentinel.style.top = '0';
  sentinel.style.left = '0';
  sentinel.style.width = '100%';
  sentinel.style.height = '1px';
  sentinel.style.pointerEvents = 'none';
  sentinel.style.visibility = 'hidden';
  sentinel.setAttribute('aria-hidden', 'true');

  /* Insert sentinel before header */
  if (header.parentNode) {
    header.parentNode.insertBefore(sentinel, header);
  } else {
    logger.warn('Cannot setup sticky observer: header has no parent node');
    return;
  }

  /* Create IntersectionObserver */
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: [0, 1],
  };

  headerState.intersectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      /* When sentinel is not intersecting, header should be sticky */
      const shouldBeSticky = !entry.isIntersecting;

      if (shouldBeSticky) {
        header.classList.add('is-sticky');
        logger.info('Header became sticky', {
          scrollY: window.scrollY,
        });
      } else {
        header.classList.remove('is-sticky');
        logger.info('Header unstuck', {
          scrollY: window.scrollY,
        });
      }
    });
  }, observerOptions);

  headerState.intersectionObserver.observe(sentinel);

  /* Store cleanup function */
  headerState.cleanupFunctions.push(() => {
    if (headerState.intersectionObserver) {
      headerState.intersectionObserver.disconnect();
      headerState.intersectionObserver = null;
    }
    if (sentinel.parentNode) {
      sentinel.parentNode.removeChild(sentinel);
    }
  });

  logger.info('Sticky header observer initialized');
}

/**
 * Sets up event listeners for header interactions
 * @private
 */
function setupEventListeners() {
  const { menuToggle, nav } = headerState.elements;

  if (!menuToggle || !nav) {
    logger.error('Cannot setup event listeners: required elements not initialized');
    return;
  }

  /* Menu toggle click handler */
  menuToggle.addEventListener('click', handleMenuToggleClick);
  headerState.cleanupFunctions.push(() => {
    menuToggle.removeEventListener('click', handleMenuToggleClick);
  });

  /* Navigation link click handler with event delegation */
  nav.addEventListener('click', handleNavLinkClick);
  headerState.cleanupFunctions.push(() => {
    nav.removeEventListener('click', handleNavLinkClick);
  });

  /* Keyboard event handler for Escape key */
  document.addEventListener('keydown', handleKeyboardEvent);
  headerState.cleanupFunctions.push(() => {
    document.removeEventListener('keydown', handleKeyboardEvent);
  });

  /* Close menu when clicking outside on mobile */
  const handleOutsideClick = (event) => {
    if (!headerState.isMenuOpen) {
      return;
    }

    const header = headerState.elements.header;
    if (header && !header.contains(event.target)) {
      closeMobileMenu();
      logger.info('Menu closed via outside click');
    }
  };

  document.addEventListener('click', handleOutsideClick);
  headerState.cleanupFunctions.push(() => {
    document.removeEventListener('click', handleOutsideClick);
  });

  /* Handle window resize - close menu if transitioning to desktop */
  let resizeTimeout;
  const handleResize = () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      const isDesktop = window.matchMedia('(min-width: 768px)').matches;
      if (isDesktop && headerState.isMenuOpen) {
        closeMobileMenu();
        logger.info('Menu closed due to viewport resize to desktop');
      }
    }, 150);
  };

  window.addEventListener('resize', handleResize);
  headerState.cleanupFunctions.push(() => {
    window.removeEventListener('resize', handleResize);
    clearTimeout(resizeTimeout);
  });

  logger.info('Event listeners initialized', {
    listenerCount: headerState.cleanupFunctions.length,
  });
}

/**
 * Initializes ARIA attributes for accessibility
 * @private
 */
function initializeAriaAttributes() {
  const { menuToggle, nav } = headerState.elements;

  if (!menuToggle || !nav) {
    return;
  }

  /* Set initial ARIA attributes */
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-controls', nav.id || 'primary-navigation');
  menuToggle.setAttribute('aria-label', 'Toggle navigation menu');

  nav.setAttribute('aria-hidden', 'true');

  /* Ensure nav has an ID for aria-controls reference */
  if (!nav.id) {
    nav.id = 'primary-navigation';
  }

  logger.info('ARIA attributes initialized');
}

/**
 * Caches DOM element references
 * @private
 * @param {HTMLElement} header - Header element
 */
function cacheElements(header) {
  headerState.elements.header = header;
  headerState.elements.menuToggle = header.querySelector('[data-menu-toggle]');
  headerState.elements.nav = header.querySelector('nav');
  headerState.elements.navLinks = Array.from(
    header.querySelectorAll('nav a'),
  );

  logger.info('DOM elements cached', {
    navLinkCount: headerState.elements.navLinks.length,
  });
}

/**
 * Initializes the header component
 * Sets up mobile menu toggle, sticky behavior, and accessibility features
 *
 * @public
 * @param {string|HTMLElement} [selector='header'] - CSS selector or HTMLElement for header
 * @returns {Function} Cleanup function to remove all event listeners and observers
 * @throws {Error} If header element is not found or required elements are missing
 *
 * @example
 * // Initialize with default selector
 * const cleanup = initHeader();
 *
 * @example
 * // Initialize with custom selector
 * const cleanup = initHeader('#main-header');
 *
 * @example
 * // Initialize with element reference
 * const headerEl = document.querySelector('.site-header');
 * const cleanup = initHeader(headerEl);
 *
 * @example
 * // Cleanup when component unmounts
 * const cleanup = initHeader();
 * // Later...
 * cleanup();
 */
export function initHeader(selector = 'header') {
  try {
    logger.info('Initializing header component', { selector });

    /* Get header element */
    const header = typeof selector === 'string'
      ? document.querySelector(selector)
      : selector;

    if (!header) {
      throw new Error(`Header element not found with selector: ${selector}`);
    }

    /* Validate required elements exist */
    validateHeaderElements(header);

    /* Cache DOM elements */
    cacheElements(header);

    /* Initialize ARIA attributes */
    initializeAriaAttributes();

    /* Setup event listeners */
    setupEventListeners();

    /* Setup sticky header observer */
    setupStickyHeaderObserver(header);

    logger.info('Header component initialized successfully', {
      stickyEnabled: headerState.isStickyEnabled,
      navLinkCount: headerState.elements.navLinks.length,
    });

    /* Return cleanup function */
    return () => {
      logger.info('Cleaning up header component');

      /* Execute all cleanup functions */
      headerState.cleanupFunctions.forEach((cleanup) => {
        try {
          cleanup();
        } catch (error) {
          logger.error('Error during cleanup', error);
        }
      });

      /* Reset state */
      headerState.cleanupFunctions = [];
      headerState.isMenuOpen = false;
      headerState.intersectionObserver = null;
      headerState.elements = {
        header: null,
        menuToggle: null,
        nav: null,
        navLinks: [],
      };

      /* Restore body scroll */
      document.body.style.overflow = '';

      logger.info('Header component cleanup completed');
    };

  } catch (error) {
    logger.error('Failed to initialize header component', error);
    throw error;
  }
}

/**
 * Gets current header state (useful for testing and debugging)
 * @public
 * @returns {Object} Current header state
 */
export function getHeaderState() {
  return {
    isMenuOpen: headerState.isMenuOpen,
    isStickyEnabled: headerState.isStickyEnabled,
    hasElements: {
      header: !!headerState.elements.header,
      menuToggle: !!headerState.elements.menuToggle,
      nav: !!headerState.elements.nav,
      navLinks: headerState.elements.navLinks.length,
    },
  };
}

/* Export for testing purposes */
export const __testing__ = {
  toggleMobileMenu,
  closeMobileMenu,
  handleMenuToggleClick,
  handleNavLinkClick,
  handleKeyboardEvent,
  validateHeaderElements,
  headerState,
};