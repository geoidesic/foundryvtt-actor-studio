import { describe, it, expect } from 'vitest';
import { getAdvancementEntryCount, advancementEntriesToArray } from '~/src/helpers/Utility.js';

describe('getAdvancementEntryCount', () => {
  it('returns 0 for nullish', () => {
    expect(getAdvancementEntryCount(null)).toBe(0);
    expect(getAdvancementEntryCount(undefined)).toBe(0);
  });

  it('uses .size for non-array collection-like objects', () => {
    const col = { size: 3, values: () => [].values() };
    expect(getAdvancementEntryCount(col)).toBe(3);
  });

  it('uses .length for arrays even if size is present', () => {
    expect(getAdvancementEntryCount([1, 2])).toBe(2);
  });
});

describe('advancementEntriesToArray', () => {
  it('returns [] for nullish', () => {
    expect(advancementEntriesToArray(null)).toEqual([]);
  });

  it('returns arrays as-is', () => {
    const a = [{ level: 1 }];
    expect(advancementEntriesToArray(a)).toBe(a);
  });

  it('materializes from .values()', () => {
    const col = new Map([
      ['a', { id: 'a' }],
      ['b', { id: 'b' }],
    ]);
    expect(advancementEntriesToArray(col)).toEqual([{ id: 'a' }, { id: 'b' }]);
  });
});
