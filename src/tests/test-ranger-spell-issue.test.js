import { describe, it, expect, vi, beforeEach } from 'vitest';
import { get } from 'svelte/store';
import { writable } from 'svelte/store';

// Mock the necessary globals
global.game = {
  settings: { get: vi.fn() },
  i18n: { localize: vi.fn((key) => key) }
};
global.ui = { notifications: { error: vi.fn(), warn: vi.fn(), info: vi.fn() } };
global.Hooks = { call: vi.fn(), on: vi.fn(), once: vi.fn() };
global.Actor = { create: vi.fn() };
global.window = global;
global.window.GAS = { log: { d: vi.fn(), w: vi.fn(), e: vi.fn() } };

// Mock svelte/store
vi.mock('svelte/store', () => ({
  writable: vi.fn((value) => ({
    set: vi.fn(),
    update: vi.fn(),
    subscribe: vi.fn((callback) => {
      callback(value);
      return () => {};
    })
  })),
  derived: vi.fn((stores, fn) => {
    const store = writable();
    if (Array.isArray(stores)) {
      fn(stores.map(s => get(s)));
    } else {
      fn(get(stores));
    }
    return store;
  }),
  get: vi.fn((store) => {
    // Return the initial value for our mock
    if (store && store.subscribe) {
      let value;
      store.subscribe(v => value = v)();
      return value;
    }
    return undefined;
  })
}));

describe('Ranger Spell Selection Issue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should demonstrate the Ranger spell filtering issue and fix', () => {
    // Mock the spellsKnown data
    const spellsKnownData = {
      levels: [
        {
          level: 1,
          ranger: {
            "2014": "0 / 0",
            "2024": "0 / 2"
          }
        }
      ]
    };

    // Test the spell limits calculation
    const rulesVersion = '2024';
    const characterClass = 'ranger';
    const effectiveCharacterLevel = 1;
    const isLevelUp = false;

    // Get spell limits for level 1 Ranger in 2024 rules
    const levelData = spellsKnownData.levels.find(l => l.level === 1);
    const classData = levelData[characterClass][rulesVersion] || levelData[characterClass];
    const [cantrips, spells] = classData.split(' / ');

    console.log('2024 Ranger level 1 limits:', { cantrips: parseInt(cantrips), spells: parseInt(spells) });

    // This should be 2 spells for 2024 Ranger
    expect(parseInt(spells)).toBe(2);

    // Now test the max spell level calculation
    function getMaxSpellLevelForClass(level, className) {
      const halfCasters = ['Paladin', 'Ranger'];
      if (halfCasters.includes(className)) {
        return Math.min(5, Math.ceil((level - 1) / 4));
      }
      return 0;
    }

    const maxSpellLevel = getMaxSpellLevelForClass(effectiveCharacterLevel, characterClass);
    console.log('Max spell level for level 1 Ranger:', maxSpellLevel);

    // This is 0 for level 1 Ranger
    expect(maxSpellLevel).toBe(0);

    // Test the OLD filtering logic (problematic)
    const mockSpells = [
      { name: 'Cure Wounds', system: { level: 1 } },
      { name: 'Magic Missile', system: { level: 1 } },
      { name: 'Fireball', system: { level: 3 } }
    ];

    const oldFilteredSpells = mockSpells.filter(spell => {
      const spellLevel = spell.system?.level || 0;
      const withinCharacterLevel = spellLevel <= maxSpellLevel; // OLD logic
      return withinCharacterLevel;
    });

    console.log('Spells after OLD filtering with maxSpellLevel =', maxSpellLevel, ':', oldFilteredSpells.map(s => s.name));

    // No spells pass the old filter because maxSpellLevel is 0
    expect(oldFilteredSpells.length).toBe(0);

    // Test the NEW filtering logic (fixed)
    const spellLimits = { cantrips: 0, spells: 2 }; // 2024 Ranger gets 2 spells

    const newFilteredSpells = mockSpells.filter(spell => {
      const spellLevel = spell.system?.level || 0;
      // NEW logic: Allow cantrips always, and allow spells up to the character's max spell level
      // OR allow level 1 spells if the character has spell slots available
      const withinCharacterLevel = spellLevel === 0 || 
        spellLevel <= maxSpellLevel || 
        (spellLevel === 1 && spellLimits.spells > 0);
      return withinCharacterLevel;
    });

    console.log('Spells after NEW filtering:', newFilteredSpells.map(s => s.name));

    // Now level 1 spells should pass the filter for Rangers with spell slots
    expect(newFilteredSpells.length).toBe(2);
    expect(newFilteredSpells.map(s => s.name)).toEqual(['Cure Wounds', 'Magic Missile']);
  });
});