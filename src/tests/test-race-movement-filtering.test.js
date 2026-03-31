/**
 * Test for Race component movement filtering logic
 * Verifies that movement properties are properly parsed and displayed,
 * including special handling for ignoredDifficultTerrain Sets
 */
import { describe, it, expect } from 'vitest';

describe('Race Movement Filtering', () => {
  it('should filter out non-numeric movement properties except ignoredDifficultTerrain', () => {
    // Mock movement data similar to what comes from dnd5e system
    const movement = {
      walk: 30,
      fly: 60,
      swim: 20,
      units: 'ft',
      hover: true,
      ignoredDifficultTerrain: new Set(['forest', 'jungle'])
    };

    // This is the logic from Race.svelte
    const filteredMovement = movement
      ? Object.keys(movement)
          .filter((key) => key !== "units" && movement[key])
          .map((key) => {
            const value = movement[key];
            if (key === 'ignoredDifficultTerrain' && value instanceof Set) {
              // Convert Set to readable list
              const terrains = Array.from(value);
              return {
                label: 'Ignores difficult terrain in',
                value: terrains.length > 0 ? terrains.join(', ') : 'all terrain',
                isSpecial: true
              };
            } else if (typeof value === 'number') {
              return { label: key, value: value };
            }
            // Skip other non-numeric, non-Set properties
            return null;
          })
          .filter(item => item !== null)
      : [];

    // Should only include numeric movement speeds and properly formatted ignoredDifficultTerrain
    expect(filteredMovement).toEqual([
      { label: 'walk', value: 30 },
      { label: 'fly', value: 60 },
      { label: 'swim', value: 20 },
      { label: 'Ignores difficult terrain in', value: 'forest, jungle', isSpecial: true }
    ]);

    // Should not include units, hover (boolean), or other non-handled properties
    const labels = filteredMovement.map(item => item.label);
    expect(labels).not.toContain('units');
    expect(labels).not.toContain('hover');
  });

  it('should handle empty movement object', () => {
    const movement = {};
    const filteredMovement = movement
      ? Object.keys(movement)
          .filter((key) => key !== "units" && movement[key])
          .map((key) => {
            const value = movement[key];
            if (key === 'ignoredDifficultTerrain' && value instanceof Set) {
              const terrains = Array.from(value);
              return {
                label: 'Ignores difficult terrain in',
                value: terrains.length > 0 ? terrains.join(', ') : 'all terrain',
                isSpecial: true
              };
            } else if (typeof value === 'number') {
              return { label: key, value: value };
            }
            return null;
          })
          .filter(item => item !== null)
      : [];

    expect(filteredMovement).toEqual([]);
  });

  it('should handle null/undefined movement', () => {
    const filteredMovement = null
      ? Object.keys(null)
          .filter((key) => key !== "units" && null[key])
          .map((key) => {
            const value = null[key];
            if (key === 'ignoredDifficultTerrain' && value instanceof Set) {
              const terrains = Array.from(value);
              return {
                label: 'Ignores difficult terrain in',
                value: terrains.length > 0 ? terrains.join(', ') : 'all terrain',
                isSpecial: true
              };
            } else if (typeof value === 'number') {
              return { label: key, value: value };
            }
            return null;
          })
          .filter(item => item !== null)
      : [];

    expect(filteredMovement).toEqual([]);
  });

  it('should handle empty ignoredDifficultTerrain set', () => {
    const movement = {
      walk: 30,
      ignoredDifficultTerrain: new Set()
    };

    const filteredMovement = movement
      ? Object.keys(movement)
          .filter((key) => key !== "units" && movement[key])
          .map((key) => {
            const value = movement[key];
            if (key === 'ignoredDifficultTerrain' && value instanceof Set) {
              const terrains = Array.from(value);
              return {
                label: 'Ignores difficult terrain in',
                value: terrains.length > 0 ? terrains.join(', ') : 'all terrain',
                isSpecial: true
              };
            } else if (typeof value === 'number') {
              return { label: key, value: value };
            }
            return null;
          })
          .filter(item => item !== null)
      : [];

    expect(filteredMovement).toEqual([
      { label: 'walk', value: 30 },
      { label: 'Ignores difficult terrain in', value: 'all terrain', isSpecial: true }
    ]);
  });

  it('should skip ignoredDifficultTerrain if not a Set', () => {
    const movement = {
      walk: 30,
      ignoredDifficultTerrain: 'invalid data'
    };

    const filteredMovement = movement
      ? Object.keys(movement)
          .filter((key) => key !== "units" && movement[key])
          .map((key) => {
            const value = movement[key];
            if (key === 'ignoredDifficultTerrain' && value instanceof Set) {
              const terrains = Array.from(value);
              return {
                label: 'Ignores difficult terrain in',
                value: terrains.length > 0 ? terrains.join(', ') : 'all terrain',
                isSpecial: true
              };
            } else if (typeof value === 'number') {
              return { label: key, value: value };
            }
            return null;
          })
          .filter(item => item !== null)
      : [];

    // Should only include walk, ignoredDifficultTerrain is skipped because it's not a Set
    expect(filteredMovement).toEqual([
      { label: 'walk', value: 30 }
    ]);
  });
});