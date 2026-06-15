import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { safeGetSetting, getLevelByDropType, extractMapIteratorObjectProperties, itemHasProperty } from '../helpers/Utility.js';

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

  it('returns level 1 for a newly added multiclass when the actor does not already have that class', () => {
    const actor = {
      classes: {},
      system: { details: { level: 2 } }
    };

    const droppedItem = {
      type: 'class',
      system: { identifier: 'wizard' }
    };

    expect(getLevelByDropType(actor, droppedItem)).toBe(1);
  });

  it('returns level 1 for a subclass when its parent class is not yet on the actor', () => {
    const actor = {
      classes: {},
      system: { details: { level: 2 } }
    };

    const droppedItem = {
      type: 'subclass',
      system: { classIdentifier: 'wizard' }
    };

    expect(getLevelByDropType(actor, droppedItem)).toBe(1);
  });
});

describe('extractMapIteratorObjectProperties', () => {
  it('normalizes flattened dotted fields into nested objects', () => {
    const entries = new Map([
      ['abc123', {
        name: 'Rations',
        'system.price.value': 5,
        'system.price.denomination': 'sp'
      }]
    ]).entries();

    const result = extractMapIteratorObjectProperties(entries, [
      'name',
      'system.price.value',
      'system.price.denomination'
    ]);

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Rations');
    expect(result[0].system?.price?.value).toBe(5);
    expect(result[0].system?.price?.denomination).toBe('sp');
  });
});

describe('itemHasProperty', () => {
  it('returns true for Set containing the key (modern dnd5e shape)', () => {
    const item = { system: { properties: new Set(['foc', 'mgc']) } };
    expect(itemHasProperty(item, 'foc')).toBe(true);
    expect(itemHasProperty(item, 'mgc')).toBe(true);
  });

  it('returns false for Set not containing the key', () => {
    const item = { system: { properties: new Set(['foc']) } };
    expect(itemHasProperty(item, 'mgc')).toBe(false);
  });

  it('returns true for Array containing the key (legacy shape)', () => {
    const item = { system: { properties: ['foc', 'amm'] } };
    expect(itemHasProperty(item, 'foc')).toBe(true);
  });

  it('returns false for Array not containing the key', () => {
    const item = { system: { properties: ['foc'] } };
    expect(itemHasProperty(item, 'mgc')).toBe(false);
  });

  it('returns false when properties is missing or falsy', () => {
    expect(itemHasProperty({}, 'foc')).toBe(false);
    expect(itemHasProperty({ system: {} }, 'foc')).toBe(false);
    expect(itemHasProperty({ system: { properties: null } }, 'foc')).toBe(false);
    expect(itemHasProperty({ system: { properties: undefined } }, 'foc')).toBe(false);
  });

  it('accepts raw properties collection directly (Set or Array)', () => {
    expect(itemHasProperty(new Set(['foc']), 'foc')).toBe(true);
    expect(itemHasProperty(['mgc'], 'mgc')).toBe(true);
    expect(itemHasProperty(new Set(['foc']), 'mgc')).toBe(false);
  });

  it('returns false for null/undefined inputs', () => {
    expect(itemHasProperty(null, 'foc')).toBe(false);
    expect(itemHasProperty(undefined, 'foc')).toBe(false);
    expect(itemHasProperty({ system: { properties: new Set(['foc']) } }, null)).toBe(false);
  });
});