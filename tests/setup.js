/**
 * Vitest Test Setup
 * 
 * Global test configuration and setup that runs before all tests.
 * This file is referenced in vitest.config.js setupFiles.
 * 
 * Purpose:
 * - Configure jsdom environment
 * - Set up global test utilities
 * - Mock browser APIs if needed
 * - Initialize test helpers
 */

// Configure jsdom environment
if (typeof window !== 'undefined') {
  // Set up any global browser API mocks or configurations here
  
  // Example: Mock IntersectionObserver if needed
  if (!window.IntersectionObserver) {
    window.IntersectionObserver = class IntersectionObserver {
      constructor() {}
      disconnect() {}
      observe() {}
      takeRecords() {
        return [];
      }
      unobserve() {}
    };
  }
  
  // Example: Mock matchMedia if needed
  if (!window.matchMedia) {
    window.matchMedia = (query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => true,
    });
  }
}

// Global test utilities can be added here
// Example: Custom matchers, test helpers, etc.