/**
 * Header Component Tests
 *
 * Basic tests for header component initialization and exports
 *
 * @module components/header.test
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { initHeader, getHeaderState } from './header.js';

// Mock DOM setup
function setupDOM() {
  document.body.innerHTML = `
    <header>
      <button data-menu-toggle aria-label="Toggle menu">Menu</button>
      <nav id="primary-navigation">
        <a href="#home">Home</a>
        <a href="#about">About</a>
        <a href="#contact">Contact</a>
      </nav>
    </header>
  `;
}

function cleanupDOM() {
  document.body.innerHTML = '';
}

describe('Header Component', () => {
  describe('Module Exports', () => {
    it('should export initHeader function', () => {
      expect(initHeader).toBeDefined();
      expect(typeof initHeader).toBe('function');
    });

    it('should export getHeaderState function', () => {
      expect(getHeaderState).toBeDefined();
      expect(typeof getHeaderState).toBe('function');
    });
  });

  describe('Initialization', () => {
    beforeEach(() => {
      setupDOM();
    });

    afterEach(() => {
      cleanupDOM();
    });

    it('should initialize without errors when header element exists', () => {
      expect(() => {
        const cleanup = initHeader('header');
        cleanup();
      }).not.toThrow();
    });

    it('should return a cleanup function', () => {
      const cleanup = initHeader('header');
      expect(typeof cleanup).toBe('function');
      cleanup();
    });

    it('should throw error when header element is not found', () => {
      cleanupDOM();
      expect(() => {
        initHeader('.non-existent-header');
      }).toThrow();
    });

    it('should throw error when menu toggle button is missing', () => {
      document.body.innerHTML = `
        <header>
          <nav><a href="#">Link</a></nav>
        </header>
      `;

      expect(() => {
        initHeader('header');
      }).toThrow(/menu toggle/i);
    });

    it('should throw error when nav element is missing', () => {
      document.body.innerHTML = `
        <header>
          <button data-menu-toggle>Menu</button>
        </header>
      `;

      expect(() => {
        initHeader('header');
      }).toThrow(/navigation element/i);
    });
  });

  describe('State Management', () => {
    let cleanup;

    beforeEach(() => {
      setupDOM();
      cleanup = initHeader('header');
    });

    afterEach(() => {
      if (cleanup) cleanup();
      cleanupDOM();
    });

    it('should return initial state', () => {
      const state = getHeaderState();

      expect(state).toBeDefined();
      expect(state.isMenuOpen).toBe(false);
      expect(state.isStickyEnabled).toBe(true);
      expect(state.hasElements).toBeDefined();
      expect(state.hasElements.header).toBe(true);
      expect(state.hasElements.menuToggle).toBe(true);
      expect(state.hasElements.nav).toBe(true);
    });

    it('should have cached navigation links', () => {
      const state = getHeaderState();
      expect(state.hasElements.navLinks).toBeGreaterThan(0);
    });
  });

  describe('Accessibility', () => {
    let cleanup;

    beforeEach(() => {
      setupDOM();
      cleanup = initHeader('header');
    });

    afterEach(() => {
      if (cleanup) cleanup();
      cleanupDOM();
    });

    it('should set ARIA attributes on menu toggle', () => {
      const menuToggle = document.querySelector('[data-menu-toggle]');
      expect(menuToggle.getAttribute('aria-expanded')).toBe('false');
      expect(menuToggle.getAttribute('aria-controls')).toBeTruthy();
      expect(menuToggle.getAttribute('aria-label')).toBeTruthy();
    });

    it('should set ARIA attributes on navigation', () => {
      const nav = document.querySelector('nav');
      expect(nav.getAttribute('aria-hidden')).toBe('true');
      expect(nav.id).toBeTruthy();
    });
  });

  describe('Cleanup', () => {
    beforeEach(() => {
      setupDOM();
    });

    afterEach(() => {
      cleanupDOM();
    });

    it('should cleanup without errors', () => {
      const cleanup = initHeader('header');
      expect(() => cleanup()).not.toThrow();
    });

    it('should reset state after cleanup', () => {
      const cleanup = initHeader('header');
      cleanup();

      const state = getHeaderState();
      expect(state.isMenuOpen).toBe(false);
      expect(state.hasElements.header).toBe(false);
      expect(state.hasElements.menuToggle).toBe(false);
      expect(state.hasElements.nav).toBe(false);
    });
  });
});