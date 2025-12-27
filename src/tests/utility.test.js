import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { safeGetSetting } from '../helpers/Utility.js';

describe('safeGetSetting', () => {
  let origGame;

  beforeEach(() => {
    origGame = global.game;
  });

  afterEach(() => {
    global.game = origGame;
    vi.restoreAllMocks();
  });

  it('returns default when game is undefined', () => {
    delete global.game;
    const val = safeGetSetting('mod', 'key', 'default');
    expect(val).toBe('default');
  });

  it('returns default when settings map does not have key', () => {
    global.game = { settings: { settings: { has: () => false }, get: vi.fn(() => 'should-not-be-called') } };
    const val = safeGetSetting('mod', 'missingKey', 42);
    expect(val).toBe(42);
  });

  it('returns actual value when settings map has the key', () => {
    global.game = { settings: { settings: { has: () => true }, get: (m, k) => 'actual-value' } };
    const val = safeGetSetting('mod', 'someKey', 'fallback');
    expect(val).toBe('actual-value');
  });

  it('catches thrown errors from game.settings.get and returns default', () => {
    global.game = { settings: { get: () => { throw new Error('assert'); } } };
    const val = safeGetSetting('mod', 'key', 'fallback');
    expect(val).toBe('fallback');
  });
});