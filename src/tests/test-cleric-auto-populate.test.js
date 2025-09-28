import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('Cleric auto-populate spells', () => {
  let spellModule;

  beforeEach(async () => {
    // Minimal Foundry/Fake globals
    global.ui = { notifications: { info: vi.fn(), warn: vi.fn(), error: vi.fn() } };
    global.window = globalThis;
    window.GAS = { log: { d: vi.fn(), p: vi.fn(), e: vi.fn(), w: vi.fn() } };

    // Mock Dialog.confirm to always accept
    global.Dialog = { confirm: vi.fn(() => Promise.resolve(true)) };

    // Mock the svelte store get function
    vi.doMock('svelte/store', async () => {
      const actual = await vi.importActual('svelte/store');
      return {
        ...actual,
        get: vi.fn((store) => {
          // Return the current value from the store
          let value;
          const unsubscribe = store.subscribe((v) => { value = v; });
          unsubscribe();
          return value;
        })
      };
    });

    // Import the module fresh
    spellModule = await import('~/src/stores/spellSelection.js');
    
    // Clear the selectedSpells store between tests
    spellModule.selectedSpells.set(new Map());
  });

  it('should auto-populate all cleric spells at character creation (levels 1-2)', async () => {
    // Prepare a large set of cleric spells across levels 1 and 2
    const mockSpells = [];
    for (let i = 1; i <= 2; i++) {
      for (let j = 0; j < 5; j++) {
        const id = `cleric-l${i}-${j}`;
        mockSpells.push({ _id: id, id, uuid: `Compendium.dnd5e.spells.${id}`, name: `Cleric Spell L${i}-${j}`, system: { level: i }, toObject: () => ({ _id: id, name: `Cleric Spell L${i}-${j}`, type: 'spell', system: { level: i } }) });
      }
    }

    // Set the availableSpells store directly
    spellModule.availableSpells.set(mockSpells);

    // Mock fromUuid to return the full spell document
    global.foundry = { utils: { fromUuid: vi.fn(async (u) => mockSpells.find(s => s.uuid === u)) } };

    const result = await spellModule.autoPopulateAllSpells('Cleric', 2, null, false, 0);

    expect(result).toBe(true);
    // Verify selectedSpells store was populated with 10 entries
    const selected = (await import('svelte/store')).get(spellModule.selectedSpells);
    expect(selected.size).toBe(10);
  });

  it('should auto-populate all newly accessible spell levels on Cleric level-up', async () => {
    // Create spells for levels 1-3, simulating a level 3 Cleric who gains access to level 2 spells
    const mockSpells = [];
    for (let level = 1; level <= 3; level++) {
      for (let i = 0; i < 8; i++) { // 8 spells per level to ensure we have plenty
        const id = `cleric-l${level}-${i}`;
        mockSpells.push({ 
          _id: id, 
          id, 
          uuid: `Compendium.dnd5e.spells.${id}`, 
          name: `Cleric Spell L${level}-${i}`, 
          system: { level }, 
          toObject: () => ({ _id: id, name: `Cleric Spell L${level}-${i}`, type: 'spell', system: { level } }) 
        });
      }
    }

    // Set the availableSpells store directly
    spellModule.availableSpells.set(mockSpells);

    // Mock fromUuid to return the full spell document
    global.foundry = { utils: { fromUuid: vi.fn(async (u) => mockSpells.find(s => s.uuid === u)) } };

    // Test level-up scenario: Cleric goes from level 2 (max spell level 1) to level 3 (max spell level 2)
    // This should add all level 2 spells since oldMaxSpellLevel=1 and newMaxSpellLevel=2
    const result = await spellModule.autoPopulateAllSpells('Cleric', 2, null, true, 1);

    expect(result).toBe(true);
    
    // Verify selectedSpells store was populated with level 2 spells only
    const selected = (await import('svelte/store')).get(spellModule.selectedSpells);
    const addedSpells = Array.from(selected.values());
    
    console.log('Added spells count:', addedSpells.length);
    console.log('Added spell levels:', addedSpells.map(s => s.itemData.system?.level || s.itemData.toObject().system.level));
    
    // Should add all 8 level-2 spells (none from level 1 since oldMax=1, none from level 3 since newMax=2)
    expect(addedSpells.length).toBe(8);
    
    // All added spells should be level 2
    const allLevel2 = addedSpells.every(s => {
      const level = s.itemData.system?.level || s.itemData.toObject().system.level;
      return level === 2;
    });
    expect(allLevel2).toBe(true);
  });
});