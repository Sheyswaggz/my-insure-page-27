/**
 * Test Setup File
 * Configures the test environment with necessary polyfills and global setup
 */

/* Suppress console output during tests to keep test output clean */
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeAll(() => {
  /* Suppress console.error and console.warn during tests */
  console.error = (...args) => {
    /* Only show errors that are not from our component logging */
    const message = args[0]?.toString() || '';
    if (!message.includes('[Header]') && !message.includes('[Main]')) {
      originalConsoleError(...args);
    }
  };

  console.warn = (...args) => {
    /* Only show warnings that are not from our component logging */
    const message = args[0]?.toString() || '';
    if (!message.includes('[Header]') && !message.includes('[Main]')) {
      originalConsoleWarn(...args);
    }
  };
});

afterAll(() => {
  /* Restore original console methods */
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});

/*
 * Mock IntersectionObserver for jsdom environment
 * IntersectionObserver is not available in jsdom by default
 */
global.IntersectionObserver = class IntersectionObserver {
  constructor(callback, options) {
    this.callback = callback;
    this.options = options;
    this.observedElements = new Set();
  }

  observe(element) {
    this.observedElements.add(element);
    /* Simulate immediate intersection for testing */
    setTimeout(() => {
      this.callback(
        [
          {
            target: element,
            isIntersecting: true,
            intersectionRatio: 1,
            boundingClientRect: element.getBoundingClientRect(),
            intersectionRect: element.getBoundingClientRect(),
            rootBounds: null,
            time: Date.now(),
          },
        ],
        this,
      );
    }, 0);
  }

  unobserve(element) {
    this.observedElements.delete(element);
  }

  disconnect() {
    this.observedElements.clear();
  }

  takeRecords() {
    return [];
  }
};

/*
 * Mock matchMedia for responsive behavior testing
 * matchMedia is not fully implemented in jsdom
 */
global.matchMedia =
  global.matchMedia ||
  function (query) {
    return {
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => true,
    };
  };

/*
 * Mock window.dataLayer for analytics tracking tests
 */
if (typeof window !== 'undefined') {
  window.dataLayer = window.dataLayer || [];
}

/* Set up process.env for tests */
if (typeof process !== 'undefined') {
  process.env.NODE_ENV = process.env.NODE_ENV || 'test';
}