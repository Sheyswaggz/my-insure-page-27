/**
 * Header Component Tests
 *
 * Tests for header.js component functionality including:
 * - Component initialization and cleanup
 * - Mobile menu toggle behavior
 * - Keyboard accessibility (Escape key)
 * - Sticky header behavior
 * - Event listener management
 * - ARIA attribute management
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { initHeader, getHeaderState } from './header.js';

/**
 * Creates a mock header DOM structure for testing
 * @returns {HTMLElement} Mock header element
 */
function createMockHeader() {
  const header = document.createElement('header');
  header.innerHTML = `
    <button data-menu-toggle aria-label="Toggle menu">Menu</button>
    <nav id="primary-navigation">
      <a href="#home">Home</a>
      <a href="#about">About</a>
      <a href="#contact">Contact</a>
    </nav>
  `;
  return header;
}

describe('Header Component', () => {
  let header;
  let cleanup;

  beforeEach(() => {
    /* Create and append mock header to document */
    header = createMockHeader();
    document.body.appendChild(header);
  });

  afterEach(() => {
    /* Cleanup component and remove from DOM */
    if (cleanup) {
      cleanup();
      cleanup = null;
    }
    if (header && header.parentNode) {
      header.parentNode.removeChild(header);
    }
    document.body.style.overflow = '';
  });

  describe('Initialization', () => {
    it('should initialize successfully with valid header', () => {
      cleanup = initHeader(header);
      expect(cleanup).toBeTypeOf('function');

      const state = getHeaderState();
      expect(state.hasElements.header).toBe(true);
      expect(state.hasElements.menuToggle).toBe(true);
      expect(state.hasElements.nav).toBe(true);
    });

    it('should set initial ARIA attributes correctly', () => {
      cleanup = initHeader(header);

      const menuToggle = header.querySelector('[data-menu-toggle]');
      const nav = header.querySelector('nav');

      expect(menuToggle.getAttribute('aria-expanded')).toBe('false');
      expect(menuToggle.getAttribute('aria-controls')).toBe('primary-navigation');
      expect(nav.getAttribute('aria-hidden')).toBe('true');
    });

    it('should throw error if header element not found', () => {
      expect(() => {
        initHeader('#non-existent-header');
      }).toThrow('Header element not found');
    });

    it('should throw error if menu toggle button is missing', () => {
      const invalidHeader = document.createElement('header');
      invalidHeader.innerHTML = '<nav></nav>';
      document.body.appendChild(invalidHeader);

      expect(() => {
        initHeader(invalidHeader);
      }).toThrow('Menu toggle button');

      document.body.removeChild(invalidHeader);
    });
  });

  describe('Mobile Menu Toggle', () => {
    beforeEach(() => {
      cleanup = initHeader(header);
    });

    it('should toggle menu open state when button clicked', () => {
      const menuToggle = header.querySelector('[data-menu-toggle]');
      const nav = header.querySelector('nav');

      /* Initially closed */
      expect(getHeaderState().isMenuOpen).toBe(false);

      /* Click to open */
      menuToggle.click();
      expect(getHeaderState().isMenuOpen).toBe(true);
      expect(nav.classList.contains('is-open')).toBe(true);
      expect(menuToggle.getAttribute('aria-expanded')).toBe('true');

      /* Click to close */
      menuToggle.click();
      expect(getHeaderState().isMenuOpen).toBe(false);
      expect(nav.classList.contains('is-open')).toBe(false);
      expect(menuToggle.getAttribute('aria-expanded')).toBe('false');
    });

    it('should prevent body scroll when menu is open', () => {
      const menuToggle = header.querySelector('[data-menu-toggle]');

      menuToggle.click();
      expect(document.body.style.overflow).toBe('hidden');

      menuToggle.click();
      expect(document.body.style.overflow).toBe('');
    });

    it('should close menu when navigation link is clicked', () => {
      const menuToggle = header.querySelector('[data-menu-toggle]');
      const navLink = header.querySelector('nav a');

      /* Open menu */
      menuToggle.click();
      expect(getHeaderState().isMenuOpen).toBe(true);

      /* Click nav link */
      navLink.click();
      expect(getHeaderState().isMenuOpen).toBe(false);
    });
  });

  describe('Keyboard Accessibility', () => {
    beforeEach(() => {
      cleanup = initHeader(header);
    });

    it('should close menu when Escape key is pressed', () => {
      const menuToggle = header.querySelector('[data-menu-toggle]');

      /* Open menu */
      menuToggle.click();
      expect(getHeaderState().isMenuOpen).toBe(true);

      /* Press Escape */
      const escapeEvent = new KeyboardEvent('keydown', {
        key: 'Escape',
        keyCode: 27,
        bubbles: true,
      });
      document.dispatchEvent(escapeEvent);

      expect(getHeaderState().isMenuOpen).toBe(false);
    });

    it('should not close menu for other keys', () => {
      const menuToggle = header.querySelector('[data-menu-toggle]');

      /* Open menu */
      menuToggle.click();
      expect(getHeaderState().isMenuOpen).toBe(true);

      /* Press other key */
      const otherKeyEvent = new KeyboardEvent('keydown', {
        key: 'Enter',
        bubbles: true,
      });
      document.dispatchEvent(otherKeyEvent);

      expect(getHeaderState().isMenuOpen).toBe(true);
    });
  });

  describe('Cleanup', () => {
    it('should remove all event listeners on cleanup', () => {
      cleanup = initHeader(header);
      const menuToggle = header.querySelector('[data-menu-toggle]');

      /* Open menu */
      menuToggle.click();
      expect(getHeaderState().isMenuOpen).toBe(true);

      /* Cleanup */
      cleanup();

      /* Try to toggle - should not work after cleanup */
      menuToggle.click();
      expect(getHeaderState().isMenuOpen).toBe(false);
    });

    it('should reset state on cleanup', () => {
      cleanup = initHeader(header);
      const menuToggle = header.querySelector('[data-menu-toggle]');

      /* Open menu */
      menuToggle.click();

      /* Cleanup */
      cleanup();

      const state = getHeaderState();
      expect(state.isMenuOpen).toBe(false);
      expect(state.hasElements.header).toBe(false);
      expect(state.hasElements.menuToggle).toBe(false);
    });

    it('should restore body scroll on cleanup', () => {
      cleanup = initHeader(header);
      const menuToggle = header.querySelector('[data-menu-toggle]');

      /* Open menu */
      menuToggle.click();
      expect(document.body.style.overflow).toBe('hidden');

      /* Cleanup */
      cleanup();
      expect(document.body.style.overflow).toBe('');
    });
  });
});