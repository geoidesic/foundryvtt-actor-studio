import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { JSDOM } from 'jsdom';
import {
  resolveFoundryTheme,
  applyAppTheme,
  observeFoundryBodyTheme,
} from '~/src/helpers/syncAppThemeFromFoundryBody';

describe('syncAppThemeFromFoundryBody', () => {
  /** @type {import('jsdom').JSDOM} */
  let dom;

  beforeEach(() => {
    dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    global.document = dom.window.document;
    global.window = dom.window;
    global.MutationObserver = dom.window.MutationObserver;
    global.window.GAS = global.GAS || { log: { d: vi.fn(), i: vi.fn(), w: vi.fn(), e: vi.fn() } };
    global.game = { version: 12 };
    const defaultMatchMedia = vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
    dom.window.matchMedia = defaultMatchMedia;
    vi.stubGlobal('matchMedia', defaultMatchMedia);
  });

  afterEach(() => {
    dom?.window?.close();
    vi.unstubAllGlobals();
  });

  describe('resolveFoundryTheme', () => {
    it('returns dark when body has theme-dark', () => {
      document.body.classList.add('theme-dark');
      expect(resolveFoundryTheme()).toBe('dark');
    });

    it('returns light when body has theme-light', () => {
      document.body.classList.add('theme-light');
      expect(resolveFoundryTheme()).toBe('light');
    });

    it('returns dark from prefers-color-scheme when body has no theme class', () => {
      const darkMedia = vi.fn().mockImplementation(() => ({
        matches: true,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }));
      dom.window.matchMedia = darkMedia;
      expect(resolveFoundryTheme()).toBe('dark');
    });

    it('returns light when body has no theme class and prefers light', () => {
      expect(resolveFoundryTheme()).toBe('light');
    });

    it('returns dark when documentElement has theme-dark', () => {
      document.documentElement.classList.add('theme-dark');
      expect(resolveFoundryTheme()).toBe('dark');
    });
  });

  describe('applyAppTheme', () => {
    it('applies theme-dark and removes theme-light', () => {
      const el = document.createElement('div');
      el.classList.add('theme-light');
      applyAppTheme(el, 'dark');
      expect(el.classList.contains('theme-dark')).toBe(true);
      expect(el.classList.contains('theme-light')).toBe(false);
      expect(el.classList.contains('themed')).toBe(true);
    });

    it('applies theme-light and removes theme-dark', () => {
      const el = document.createElement('div');
      el.classList.add('theme-dark');
      applyAppTheme(el, 'light');
      expect(el.classList.contains('theme-light')).toBe(true);
      expect(el.classList.contains('theme-dark')).toBe(false);
    });

    it('no-ops for null element', () => {
      expect(() => applyAppTheme(null, 'dark')).not.toThrow();
    });
  });

  describe('observeFoundryBodyTheme', () => {
    it('syncs app root from body on v12', () => {
      document.body.classList.add('theme-dark');
      const el = document.createElement('div');
      const disconnect = observeFoundryBodyTheme(el);
      expect(el.classList.contains('theme-dark')).toBe(true);
      expect(el.classList.contains('themed')).toBe(true);
      disconnect();
    });

    it('re-syncs when body class changes', async () => {
      const flushMutationObserver = () =>
        new Promise((resolve) => {
          queueMicrotask(() => queueMicrotask(resolve));
        });

      const el = document.createElement('div');
      const disconnect = observeFoundryBodyTheme(el);
      document.body.classList.add('theme-dark');
      await flushMutationObserver();
      expect(el.classList.contains('theme-dark')).toBe(true);
      document.body.classList.remove('theme-dark');
      document.body.classList.add('theme-light');
      await flushMutationObserver();
      expect(el.classList.contains('theme-light')).toBe(true);
      disconnect();
    });

    it('syncs on Foundry v13+ (TJS 0.2 does not set app theme)', () => {
      global.game.version = 14;
      document.body.classList.add('theme-dark');
      const el = document.createElement('div');
      const disconnect = observeFoundryBodyTheme(el);
      expect(el.classList.contains('theme-dark')).toBe(true);
      expect(el.classList.contains('themed')).toBe(true);
      disconnect();
    });

    it('returns no-op disconnect when elementRoot is missing', () => {
      const disconnect = observeFoundryBodyTheme(null);
      expect(disconnect).toBeTypeOf('function');
      disconnect();
    });
  });
});
