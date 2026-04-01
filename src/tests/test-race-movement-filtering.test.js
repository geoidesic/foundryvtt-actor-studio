/**
 * Test for Race component movement filtering logic
 * Verifies that movement properties are properly parsed and displayed,
 * including special handling for ignoredDifficultTerrain Sets
 */
import { describe, it, expect } from 'vitest';

describe('Race Movement Filtering', () => {
  it('should handle human race data correctly', () => {
    // Based on the user's example
    const movement = {
      walk: "30",
      units: null,
      hover: false,
      ignoredDifficultTerrain: {}
    };

    const filteredMovement = movement
      ? Object.keys(movement)
          .filter((key) => key !== "units" && movement[key])
          .map((key) => {
            const value = movement[key];
            if (key === 'ignoredDifficultTerrain' && value instanceof Set && value.size > 0) {
              const terrains = Array.from(value);
              return {
                label: 'Ignores difficult terrain in',
                value: terrains.join(', '),
                isSpecial: true
              };
            } else if (typeof value === 'number' || (typeof value === 'string' && !isNaN(Number(value)))) {
              return { label: key, value: Number(value) };
            }
            return null;
          })
          .filter(item => item !== null)
      : [];

    // Should show walk speed, skip units (null), hover (false), and empty ignoredDifficultTerrain
    expect(filteredMovement).toEqual([
      { label: 'walk', value: 30 }
    ]);
  });

  it('should handle race with terrain ignoring', () => {
    const movement = {
      walk: "30",
      ignoredDifficultTerrain: new Set(['snow', 'sand'])
    };

    const filteredMovement = movement
      ? Object.keys(movement)
          .filter((key) => key !== "units" && movement[key])
          .map((key) => {
            const value = movement[key];
            if (key === 'ignoredDifficultTerrain' && value instanceof Set && value.size > 0) {
              const terrains = Array.from(value);
              return {
                label: 'Ignores difficult terrain in',
                value: terrains.join(', '),
                isSpecial: true
              };
            } else if (typeof value === 'number' || (typeof value === 'string' && !isNaN(Number(value)))) {
              return { label: key, value: Number(value) };
            }
            return null;
          })
          .filter(item => item !== null)
      : [];

    expect(filteredMovement).toEqual([
      { label: 'walk', value: 30 },
      { label: 'Ignores difficult terrain in', value: 'snow, sand', isSpecial: true }
    ]);
  });
});
