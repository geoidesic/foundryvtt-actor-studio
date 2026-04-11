import { describe, it, expect } from 'vitest';
import {
  getSpellLimitsForClassLevel,
  getSpellDeltaForClassLevel
} from '~/src/helpers/spellProgression';

describe('spellProgression helper', () => {
  it('ignores Max Prepared Spells for Actor Studio limits', () => {
    const classItem = {
      system: {
        advancement: [
          { type: 'ScaleValue', title: 'Cantrips Known', level: 1, value: 3 },
          { type: 'ScaleValue', title: 'Max Prepared Spells', level: 1, value: 6 }
        ]
      }
    };

    const limits = getSpellLimitsForClassLevel({
      classIdentifier: 'wizard',
      classItem,
      level: 1,
      rulesVersion: '2014'
    });

    expect(limits).toEqual({
      cantrips: 3,
      spells: 6,
      hasAllSpells: false
    });
  });

  it('uses ScaleValue advancements for non-core classes', () => {
    const classItem = {
      system: {
        advancement: [
          { type: 'ScaleValue', title: 'Cantrips Known', level: 1, levels: [2, 2, 3] },
          { type: 'ScaleValue', title: 'Spells Known', level: 1, levels: [4, 5, 6] }
        ]
      }
    };

    const level1 = getSpellLimitsForClassLevel({
      classIdentifier: 'my-homebrew-mage',
      classItem,
      level: 1,
      rulesVersion: '2014'
    });
    const level3 = getSpellLimitsForClassLevel({
      classIdentifier: 'my-homebrew-mage',
      classItem,
      level: 3,
      rulesVersion: '2014'
    });

    expect(level1).toEqual({
      cantrips: 2,
      spells: 4,
      hasAllSpells: false
    });
    expect(level3).toEqual({
      cantrips: 3,
      spells: 6,
      hasAllSpells: false
    });
  });

  it('calculates level-up deltas from ScaleValue progression', () => {
    const classItem = {
      system: {
        advancement: [
          { type: 'ScaleValue', title: 'Cantrips Known', level: 1, levels: [2, 3] },
          { type: 'ScaleValue', title: 'Spells Known', level: 1, levels: [3, 4] }
        ]
      }
    };

    const delta = getSpellDeltaForClassLevel({
      classIdentifier: 'my-homebrew-mage',
      classItem,
      oldLevel: 1,
      newLevel: 2,
      rulesVersion: '2014'
    });

    expect(delta).toEqual({
      cantrips: 1,
      spells: 1,
      hasAllSpells: false
    });
  });

  it('returns null when no recognized spell limit advancements exist', () => {
    const classItem = {
      system: {
        advancement: [
          { type: 'ScaleValue', title: 'Fighting Style Choices', level: 1, value: 1 }
        ]
      }
    };

    const limits = getSpellLimitsForClassLevel({
      classIdentifier: 'fighter',
      classItem,
      level: 1,
      rulesVersion: '2014'
    });

    expect(limits).toBeNull();
  });

  it('falls back to spellsKnown.json for spells when Spells Known advancement is absent', () => {
    const classItem = {
      system: {
        advancement: [
          { type: 'ScaleValue', title: 'Cantrips Known', level: 1, value: 3 }
        ]
      }
    };

    const limits = getSpellLimitsForClassLevel({
      classIdentifier: 'wizard',
      classItem,
      level: 1,
      rulesVersion: '2014'
    });

    // Cantrips come from advancements, spells fall back to table (wizard L1 = 6)
    expect(limits).toEqual({
      cantrips: 3,
      spells: 6,
      hasAllSpells: false
    });
  });

  it('prefers ScaleValue levels array over direct value', () => {
    const classItem = {
      system: {
        advancement: [
          // direct value intentionally lower than level 1 array value
          { type: 'ScaleValue', title: 'Cantrips Known', level: 1, value: 1, levels: [3, 3, 3] }
        ]
      }
    };

    const limits = getSpellLimitsForClassLevel({
      classIdentifier: 'wizard',
      classItem,
      level: 1,
      rulesVersion: '2014'
    });

    expect(limits?.cantrips).toBe(3);
  });

  it('reads level-mapped ScaleValue objects before scalar value', () => {
    const classItem = {
      system: {
        advancement: [
          {
            type: 'ScaleValue',
            title: 'Cantrips Known',
            level: 1,
            value: { '1': 3, '4': 4 }
          }
        ]
      }
    };

    const limits = getSpellLimitsForClassLevel({
      classIdentifier: 'wizard',
      classItem,
      level: 1,
      rulesVersion: '2014'
    });

    expect(limits?.cantrips).toBe(3);
  });

  it('reads dnd5e configuration.scale level entries shaped as { value }', () => {
    const classItem = {
      system: {
        advancement: [
          {
            type: 'ScaleValue',
            title: 'Cantrips Known',
            configuration: {
              scale: {
                '1': { value: 3 },
                '4': { value: 4 },
                '10': { value: 5 }
              }
            }
          }
        ]
      }
    };

    const level1 = getSpellLimitsForClassLevel({
      classIdentifier: 'wizard',
      classItem,
      level: 1,
      rulesVersion: '2014'
    });
    const level4 = getSpellLimitsForClassLevel({
      classIdentifier: 'wizard',
      classItem,
      level: 4,
      rulesVersion: '2014'
    });

    expect(level1?.cantrips).toBe(3);
    expect(level4?.cantrips).toBe(4);
  });

  it('reads dnd5e 5.3+ embedded advancements from Collection-like system.advancement (not an array)', () => {
    const embedded = [
      { type: 'ScaleValue', title: 'Cantrips Known', level: 1, value: 3 },
      { type: 'ScaleValue', title: 'Max Prepared Spells', level: 1, value: 6 }
    ];
    const classItem = {
      system: {
        advancement: {
          size: embedded.length,
          values: () => embedded.values()
        }
      }
    };

    const limits = getSpellLimitsForClassLevel({
      classIdentifier: 'wizard',
      classItem,
      level: 1,
      rulesVersion: '2014'
    });

    expect(limits).toEqual({
      cantrips: 3,
      spells: 6,
      hasAllSpells: false
    });
  });

  it('reads configuration.scale when stored as a Map (dnd5e 5.3+)', () => {
    const scale = new Map([
      [1, { value: 3 }],
      [4, { value: 4 }]
    ]);
    const classItem = {
      system: {
        advancement: [
          {
            type: 'ScaleValue',
            title: 'Cantrips Known',
            level: 1,
            configuration: { scale }
          }
        ]
      }
    };

    const level1 = getSpellLimitsForClassLevel({
      classIdentifier: 'wizard',
      classItem,
      level: 1,
      rulesVersion: '2014'
    });
    const level4 = getSpellLimitsForClassLevel({
      classIdentifier: 'wizard',
      classItem,
      level: 4,
      rulesVersion: '2014'
    });

    expect(level1?.cantrips).toBe(3);
    expect(level4?.cantrips).toBe(4);
  });
});
