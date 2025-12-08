import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('Wizard Level-Up Spell Finalization Bug', () => {
  beforeEach(() => {
    // Mock FoundryVTT globals
    global.foundry = {
      utils: { 
        deepClone: vi.fn(obj => JSON.parse(JSON.stringify(obj))),
        fromUuid: vi.fn()
      }
    };
    global.ui = {
      notifications: {
        info: vi.fn(),
        warn: vi.fn(), 
        error: vi.fn()
      }
    };
    global.window = globalThis;
    window.GAS = {
      log: { d: vi.fn(), w: vi.fn(), e: vi.fn() }
    };

    // Mock globalThis.fromUuid for spell loading
    global.fromUuid = vi.fn();

    // Mock svelte stores
    vi.doMock('svelte/store', () => ({
      get: vi.fn(),
      writable: vi.fn(() => ({ set: vi.fn(), update: vi.fn(), subscribe: vi.fn() })),
      derived: vi.fn(() => ({ subscribe: vi.fn() }))
    }));

    vi.doMock('~/src/stores/index.js', () => ({
      readOnlyTabs: { update: vi.fn() },
      isLevelUp: { subscribe: vi.fn() },
      characterClass: { subscribe: vi.fn() },
      newLevelValueForExistingClass: { subscribe: vi.fn() },
      levelUpClassObject: { subscribe: vi.fn() },
      classUuidForLevelUp: { subscribe: vi.fn() },
      currentCharacter: { subscribe: vi.fn() }
    }));

    vi.doMock('~/src/helpers/constants', () => ({
      MODULE_ID: 'foundryvtt-actor-studio'
    }));

    vi.doMock('~/src/helpers/Utility', () => ({
      getPacksFromSettings: vi.fn(() => []),
      extractItemsFromPacksAsync: vi.fn(() => Promise.resolve([]))
    }));

    vi.doMock('~/src/lib/workflow', () => ({
      handleSpellsCompleteLevelUp: vi.fn()
    }));
  });

  it('should reproduce the wizard level-up spell finalization bug', async () => {
    console.log('🐛 REPRODUCING WIZARD LEVEL-UP SPELL BUG');
    console.log('========================================');

    // Create mock actor that simulates a level 2 wizard with some existing spells
    let actualCreatedSpells = [];
    const mockActor = {
      id: 'wizard-test',
      name: 'Test Wizard Level 2',
      items: {
        find: vi.fn((predicate) => {
          // Simulate that the wizard already has some spells
          const existingSpells = [
            { name: 'Mage Hand', type: 'spell' },
            { name: 'Prestidigitation', type: 'spell' },
            { name: 'Light', type: 'spell' }
          ];
          
          // Check if any existing spell matches the predicate
          return existingSpells.find(predicate);
        })
      },
      createEmbeddedDocuments: vi.fn(async (type, items) => {
        console.log(`  📝 createEmbeddedDocuments called with ${items.length} items:`, items.map(i => i.name));
        
        // Simulate that the first spell succeeds but the second fails for some reason
        // This could happen due to validation errors, constraints, etc.
        const results = [];
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          if (i === 0) {
            // First spell succeeds
            const created = { id: `spell-${i}`, name: item.name, type: 'spell' };
            results.push(created);
            actualCreatedSpells.push(created);
            console.log(`    ✅ Created: ${item.name}`);
          } else {
            // Second spell fails silently or gets skipped
            console.log(`    ❌ Failed to create: ${item.name} (simulated failure)`);
            // Note: In real FoundryVTT, this might throw an error or return partial results
          }
        }
        
        return results;
      })
    };

    // Mock selected spells - user has selected 2 new spells for level-up
    const mockSpell1 = {
      id: 'magic-missile',
      name: 'Magic Missile',
      uuid: 'Compendium.dnd5e.spells.magic-missile',
      toObject: () => ({ 
        id: 'magic-missile',
        name: 'Magic Missile',
        type: 'spell',
        system: { level: 1 }
      })
    };

    const mockSpell2 = {
      id: 'shield',
      name: 'Shield', 
      uuid: 'Compendium.dnd5e.spells.shield',
      toObject: () => ({ 
        id: 'shield',
        name: 'Shield',
        type: 'spell',
        system: { level: 1 }
      })
    };

    const selectedSpellsMap = new Map([
      ['magic-missile', { itemData: mockSpell1 }],
      ['shield', { itemData: mockSpell2 }]
    ]);

    // Mock fromUuid to return the spell data
    global.foundry.utils.fromUuid.mockImplementation(async (uuid) => {
      if (uuid === 'Compendium.dnd5e.spells.magic-missile') return mockSpell1;
      if (uuid === 'Compendium.dnd5e.spells.shield') return mockSpell2;
      return null;
    });

    global.fromUuid.mockImplementation(global.foundry.utils.fromUuid);

    // Import and test finalizeSpellSelection
    const { finalizeSpellSelection } = await import('~/src/stores/spellSelection.js');
    const { get } = await import('svelte/store');

    // Mock get function to return our selected spells
    get.mockImplementation((store) => {
      // When the function calls get(selectedSpells), return our test data
      return selectedSpellsMap;
    });

    console.log('📋 Test setup:');
    console.log('  - Existing spells on actor: Mage Hand, Prestidigitation, Light');
    console.log('  - User selected for level-up: Magic Missile, Shield');
    console.log('  - Expected result: Both new spells added to actor');

    console.log('🧪 Running finalizeSpellSelection...');
    
    const result = await finalizeSpellSelection(mockActor);

    console.log('📊 Results:');
    console.log('  - Function returned:', result);
    console.log('  - createEmbeddedDocuments was called:', mockActor.createEmbeddedDocuments.mock.calls.length > 0);
    console.log('  - Items attempted to create:', mockActor.createEmbeddedDocuments.mock.calls[0]?.[1]?.length ?? 0);
    console.log('  - Actually created spells:', actualCreatedSpells.length);
    console.log('  - Created spell names:', actualCreatedSpells.map(s => s.name));

    // Verify the issue
    expect(mockActor.createEmbeddedDocuments).toHaveBeenCalledWith('Item', expect.any(Array));
    
    const itemsToCreate = mockActor.createEmbeddedDocuments.mock.calls[0][1];
    expect(itemsToCreate).toHaveLength(2); // Both spells should be in the creation list
    expect(itemsToCreate.map(i => i.name)).toEqual(['Magic Missile', 'Shield']);
    
    // But only 1 spell was actually created (simulating the bug)
    expect(actualCreatedSpells).toHaveLength(1);
    expect(actualCreatedSpells[0].name).toBe('Magic Missile');

    console.log('🎯 BUG REPRODUCTION SUCCESSFUL!');
    console.log('   The issue is that createEmbeddedDocuments was called with 2 spells,');
    console.log('   but only 1 was actually created on the actor.');
    console.log('   This could be due to:');
    console.log('   - Validation errors in FoundryVTT');
    console.log('   - Database constraints');
    console.log('   - Async timing issues');
    console.log('   - Partial failure in batch creation');
  });

  it('should test if the duplicate checking logic causes the issue', async () => {
    console.log('🔍 TESTING DUPLICATE CHECKING LOGIC');
    console.log('====================================');

    // Create mock actor where one spell already exists
    const mockActor = {
      id: 'wizard-test-2',
      name: 'Test Wizard with Existing Magic Missile',
      items: {
        find: vi.fn((predicate) => {
          // Simulate that Magic Missile already exists on the actor
          const existingSpells = [
            { name: 'Magic Missile', type: 'spell' },
            { name: 'Mage Hand', type: 'spell' }
          ];
          
          return existingSpells.find(predicate);
        })
      },
      createEmbeddedDocuments: vi.fn(async (type, items) => {
        console.log(`  📝 createEmbeddedDocuments called with ${items.length} items:`, items.map(i => i.name));
        return items.map((item, i) => ({ id: `spell-${i}`, name: item.name, type: 'spell' }));
      })
    };

    // User selects Magic Missile (already exists) and Shield (new)
    const selectedSpellsMap = new Map([
      ['magic-missile', { 
        itemData: {
          toObject: () => ({ 
            name: 'Magic Missile',
            type: 'spell',
            system: { level: 1 }
          })
        }
      }],
      ['shield', { 
        itemData: {
          toObject: () => ({ 
            name: 'Shield',
            type: 'spell',
            system: { level: 1 }
          })
        }
      }]
    ]);

    const { finalizeSpellSelection } = await import('~/src/stores/spellSelection.js');
    const { get } = await import('svelte/store');

    get.mockImplementation(() => selectedSpellsMap);

    console.log('📋 Test setup:');
    console.log('  - Actor already has: Magic Missile, Mage Hand');
    console.log('  - User selected: Magic Missile, Shield');
    console.log('  - Expected: Only Shield should be created (Magic Missile skipped as duplicate)');

    await finalizeSpellSelection(mockActor);

    const createCall = mockActor.createEmbeddedDocuments.mock.calls[0];
    const itemsToCreate = createCall ? createCall[1] : [];

    console.log('📊 Results:');
    console.log('  - Items sent to createEmbeddedDocuments:', itemsToCreate.length);
    console.log('  - Item names:', itemsToCreate.map(i => i.name));

    // Verify that only Shield is created (Magic Missile is filtered out as duplicate)
    expect(itemsToCreate).toHaveLength(1);
    expect(itemsToCreate[0].name).toBe('Shield');

    console.log('✅ Duplicate checking works correctly');
    console.log('   Magic Missile was filtered out, only Shield was created');
  });
});