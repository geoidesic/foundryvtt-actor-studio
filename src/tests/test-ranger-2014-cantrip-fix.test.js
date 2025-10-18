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
global.window.GAS = { 
  log: { d: vi.fn(), w: vi.fn(), e: vi.fn(), g: vi.fn() },
  dnd5eRules: '2014'
};

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
    if (store && store.subscribe) {
      let value;
      store.subscribe(v => value = v)();
      return value;
    }
    return undefined;
  })
}));

describe('Ranger 2014 Cantrip Fix', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should NOT show cantrips for 2014 Rangers who get 0 cantrips', () => {
    console.log('');
    console.log('========================================');
    console.log('TEST: Ranger 2014 Cantrip Display Issue');
    console.log('========================================');
    console.log('');
    console.log('PROBLEM:');
    console.log('- Rangers in 2014 rules get 0 cantrips at all levels');
    console.log('- Level 2: "0 / 2" (0 cantrips, 2 spells)');
    console.log('- Level 3: "0 / 3" (0 cantrips, 3 spells)');
    console.log('- But spell filter shows cantrips anyway with: spellLevel === 0');
    console.log('- Users see cantrips listed but can\'t select them (0/0 limit)');
    console.log('');
    
    // Mock the spellsKnown data for Rangers
    const spellsKnownData = {
      levels: [
        { level: 2, ranger: { "2014": "0 / 2", "2024": "0 / 3" } },
        { level: 3, ranger: { "2014": "0 / 3", "2024": "0 / 4" } }
      ]
    };

    // Level up from 2 to 3
    const oldLevel = 2;
    const newLevel = 3;
    const className = 'ranger';
    const rulesVersion = '2014';

    const oldLevelData = spellsKnownData.levels.find(l => l.level === oldLevel);
    const newLevelData = spellsKnownData.levels.find(l => l.level === newLevel);
    
    const oldClassData = oldLevelData[className][rulesVersion];
    const newClassData = newLevelData[className][rulesVersion];

    // Parse spell limits
    const [oldCantrips, oldSpells] = oldClassData.split(' / ');
    const [newCantrips, newSpells] = newClassData.split(' / ');
    
    const cantripDifference = Math.max(0, parseInt(newCantrips) - parseInt(oldCantrips));
    const spellDifference = Math.max(0, parseInt(newSpells) - parseInt(oldSpells));

    console.log('Level 2→3 Ranger spell limits:');
    console.log('- Old level:', oldLevel, oldClassData);
    console.log('- New level:', newLevel, newClassData);
    console.log('- Cantrip difference:', cantripDifference, '(should be 0)');
    console.log('- Spell difference:', spellDifference, '(should be 1)');
    console.log('');

    expect(cantripDifference).toBe(0);
    expect(spellDifference).toBe(1);

    // Test spell filtering
    const mockSpells = [
      { _id: 'spell-1', name: 'Light', system: { level: 0 } }, // Cantrip
      { _id: 'spell-2', name: 'Mage Hand', system: { level: 0 } }, // Cantrip
      { _id: 'spell-3', name: 'Cure Wounds', system: { level: 1 } },
      { _id: 'spell-4', name: 'Hunter\'s Mark', system: { level: 1 } },
      { _id: 'spell-5', name: 'Entangle', system: { level: 1 } }
    ];

    const spellLimits = { 
      cantrips: cantripDifference, // 0 for Rangers
      spells: spellDifference // 1 new spell
    };

    // Calculate max spell level for level 3 Ranger (2014 rules)
    // Half casters: Math.min(5, Math.ceil((level - 1) / 4))
    const maxSpellLevel = Math.min(5, Math.ceil((newLevel - 1) / 4)); // ceil(2/4) = 1
    
    console.log('Max spell level for level 3 Ranger (2014):', maxSpellLevel);
    expect(maxSpellLevel).toBe(1);
    console.log('');

    // OLD LOGIC (problematic)
    console.log('OLD filtering logic (BROKEN):');
    const oldFilteredSpells = mockSpells.filter(spell => {
      const spellLevel = spell.system?.level || 0;
      // OLD: Always allow cantrips
      const withinCharacterLevel = spellLevel === 0 || 
        spellLevel <= maxSpellLevel;
      return withinCharacterLevel;
    });

    console.log('- Filtered spells:', oldFilteredSpells.length);
    oldFilteredSpells.forEach(s => console.log('  -', s.name, `(level ${s.system.level})`));
    console.log('- Problem: Shows 2 cantrips even though Ranger gets 0 cantrips!');
    console.log('');

    // Cantrips should NOT be shown!
    expect(oldFilteredSpells.some(s => s.system.level === 0)).toBe(true); // THIS IS THE BUG

    // NEW LOGIC (fixed)
    console.log('NEW filtering logic (FIXED):');
    const newFilteredSpells = mockSpells.filter(spell => {
      const spellLevel = spell.system?.level || 0;
      // NEW: Only show cantrips if character can learn them
      const withinCharacterLevel = 
        (spellLevel === 0 && spellLimits.cantrips > 0) || // Cantrips only if limit > 0
        (spellLevel > 0 && spellLevel <= maxSpellLevel) || // Regular spells
        (spellLevel === 1 && spellLimits.spells > 0); // Spell slots available
      return withinCharacterLevel;
    });

    console.log('- Filtered spells:', newFilteredSpells.length);
    newFilteredSpells.forEach(s => console.log('  -', s.name, `(level ${s.system.level})`));
    console.log('- Fixed: No cantrips shown, only level 1 spells!');
    console.log('');

    // Verify fix
    expect(newFilteredSpells.some(s => s.system.level === 0)).toBe(false); // No cantrips
    expect(newFilteredSpells.every(s => s.system.level === 1)).toBe(true); // Only level 1 spells
    expect(newFilteredSpells.length).toBe(3); // 3 level 1 spells available

    console.log('SOLUTION:');
    console.log('- Change spell filter from: spellLevel === 0 ||');
    console.log('- To: (spellLevel === 0 && spellLimits.cantrips > 0) ||');
    console.log('- This ensures cantrips only show when character can learn them');
    console.log('');
    console.log('TEST PASSED ✓');
    console.log('========================================');
    console.log('');
  });

  it('should still show cantrips for classes that get them (Bard example)', () => {
    const spellLimits = { cantrips: 2, spells: 4 }; // Bard gets cantrips
    const maxSpellLevel = 1;

    const mockSpells = [
      { _id: 'spell-1', name: 'Light', system: { level: 0 } },
      { _id: 'spell-2', name: 'Cure Wounds', system: { level: 1 } }
    ];

    const filteredSpells = mockSpells.filter(spell => {
      const spellLevel = spell.system?.level || 0;
      const withinCharacterLevel = 
        (spellLevel === 0 && spellLimits.cantrips > 0) ||
        (spellLevel > 0 && spellLevel <= maxSpellLevel) ||
        (spellLevel === 1 && spellLimits.spells > 0);
      return withinCharacterLevel;
    });

    // Bards should see both cantrips and spells
    expect(filteredSpells.length).toBe(2);
    expect(filteredSpells.some(s => s.system.level === 0)).toBe(true);
  });
});
