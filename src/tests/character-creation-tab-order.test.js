import { describe, it, expect } from 'vitest';
import {
  DEFAULT_CHARACTER_CREATION_TAB_ORDER,
  isValidCharacterCreationTabOrder,
  normalizeCharacterCreationTabOrder,
  getCharacterCreationTabsFromOrder,
  getCoreCreationReadOnlyTabs,
} from '../helpers/characterCreationTabOrder.js';

describe('character creation tab order helpers', () => {
  it('validates a complete, unique order', () => {
    const validOrder = ['race', 'abilities', 'class', 'background'];
    expect(isValidCharacterCreationTabOrder(validOrder)).toBe(true);
  });

  it('rejects invalid orders and normalizes to default', () => {
    const invalidDuplicate = ['abilities', 'race', 'race', 'class'];
    const invalidMissing = ['abilities', 'race', 'class'];
    const invalidType = 'abilities,race,background,class';

    expect(isValidCharacterCreationTabOrder(invalidDuplicate)).toBe(false);
    expect(isValidCharacterCreationTabOrder(invalidMissing)).toBe(false);
    expect(isValidCharacterCreationTabOrder(invalidType)).toBe(false);

    expect(normalizeCharacterCreationTabOrder(invalidDuplicate)).toEqual(DEFAULT_CHARACTER_CREATION_TAB_ORDER);
    expect(normalizeCharacterCreationTabOrder(invalidMissing)).toEqual(DEFAULT_CHARACTER_CREATION_TAB_ORDER);
    expect(normalizeCharacterCreationTabOrder(invalidType)).toEqual(DEFAULT_CHARACTER_CREATION_TAB_ORDER);
  });

  it('accepts object-like serialized arrays and normalizes correctly', () => {
    const serializedOrder = {
      0: 'class',
      1: 'race',
      2: 'background',
      3: 'abilities',
    };

    expect(isValidCharacterCreationTabOrder(serializedOrder)).toBe(true);
    expect(normalizeCharacterCreationTabOrder(serializedOrder)).toEqual(['class', 'race', 'background', 'abilities']);
  });

  it('builds tab definitions in configured order', () => {
    const customOrder = ['class', 'background', 'race', 'abilities'];
    const tabs = getCharacterCreationTabsFromOrder(customOrder);

    expect(tabs.map((tab) => tab.id)).toEqual(customOrder);
    expect(tabs.map((tab) => tab.label)).toEqual(['Class', 'Background', 'Race', 'Abilities']);
  });

  it('returns read-only core tab ids with optional biography', () => {
    expect(getCoreCreationReadOnlyTabs(false)).toEqual(DEFAULT_CHARACTER_CREATION_TAB_ORDER);
    expect(getCoreCreationReadOnlyTabs(true)).toEqual([...DEFAULT_CHARACTER_CREATION_TAB_ORDER, 'biography']);
  });
});
