import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock FoundryVTT globals
global.game = {
  settings: { get: vi.fn((module, key) => true) },
  i18n: { localize: vi.fn((key) => key) }
};
global.ui = { notifications: { error: vi.fn(), warn: vi.fn(), info: vi.fn() } };
global.Hooks = { call: vi.fn(), on: vi.fn(), once: vi.fn() };
global.window = {
  ...global,
  GAS: { 
    log: { d: vi.fn(), w: vi.fn(), e: vi.fn() },
    dnd5eVersion: 4,
    dnd5eRules: "2024"
  }
};

// Mock svelte stores
const mockWritable = (value) => ({ 
  set: vi.fn(), 
  update: vi.fn(), 
  subscribe: vi.fn((callback) => {
    callback(value);
    return () => {};
  })
});
const mockDerived = (stores, fn) => ({ 
  set: vi.fn(), 
  update: vi.fn(), 
  subscribe: vi.fn((callback) => {
    if (Array.isArray(stores)) {
      callback(stores.map(() => ({})));
    } else {
      callback({});
    }
    return () => {};
  })
});
vi.mock('svelte/store', () => ({ writable: mockWritable, derived: mockDerived, get: vi.fn() }));
vi.mock('~/src/stores/storeDefinitions', () => ({
  goldRoll: mockWritable(0),
  characterClass: mockWritable(null),
  background: mockWritable(null)
}));

describe('Background Gold Amount Debug', () => {
  it('should show the exact values being parsed from Artisan background', async () => {
    // This is the exact content from D&D 5e 2024 Artisan background as shown in screenshot
    const artisanBackground = {
      system: {
        description: {
          value: `<p><strong>Equipment:</strong> Choose A or B: (A) <em>Artisan's Tools</em> (same as above), 2 <em>Pouches</em>, <em>Traveler's Clothes</em>, 32 GP; or (B) 50 GP</p>`
        },
        wealth: 15 // Standard starting wealth
      }
    };

    const { parseEquipmentGoldOptions } = await import('~/src/stores/equipmentGold');
    
    const result = parseEquipmentGoldOptions(artisanBackground);
    
    console.log('Artisan parsing result:', result);
    
    // Should detect standard equipment (not variable) with choices A=32 GP, B=50 GP
    expect(result.hasVariableGold).toBe(false);
    expect(result.goldOptions).toHaveLength(2);
    expect(result.standardEquipmentGold).toBe(32); // Uses first option as standard
    
    // Find choice A and B
    const choiceA = result.goldOptions.find(opt => opt.choice === 'A');
    const choiceB = result.goldOptions.find(opt => opt.choice === 'B');
    
    expect(choiceA?.goldAmount).toBe(32);
    expect(choiceB?.goldAmount).toBe(50);
    
    // The UI is showing 50 GP, which suggests it's using choice B amount or some fallback
    // Let's verify what the StartingGold component should use
  });

  it('should show what happens when user selects equipment choice for Artisan', async () => {
    const artisanBackground = {
      system: {
        description: {
          value: `<p><strong>Equipment:</strong> Choose A or B: (A) <em>Artisan's Tools</em> (same as above), 2 <em>Pouches</em>, <em>Traveler's Clothes</em>, 32 GP; or (B) 50 GP</p>`
        },
        wealth: 15
      }
    };

    // Mock the parsed result as it would be in the store
    const parsedEquipmentGold = {
      fromBackground: {
        hasVariableGold: true,
        goldOptions: [
          { choice: 'A', goldAmount: 32, description: 'A: Artisan\'s Tools, 2 Pouches, Traveler\'s Clothes, 32 GP' },
          { choice: 'B', goldAmount: 50, description: 'B: 50 GP' }
        ],
        standardEquipmentGold: 0
      }
    };

    // When user chooses "equipment" for background with variable gold:
    // - The gold amount should be set to 'variable' initially
    // - The backgroundGoldWithEquipment should be 0 (since it's variable)
    // - User then needs to select specific option A or B
    
    // Current logic in StartingGold.svelte line 70-74 might be using wrong value
    const backgroundGold = parsedEquipmentGold.fromBackground;
    let backgroundGoldWithEquipment;
    
    if (backgroundGold.goldOptions.length > 0 && !backgroundGold.hasVariableGold) {
      backgroundGoldWithEquipment = backgroundGold.goldOptions[0].goldAmount;
    } else if (backgroundGold.hasVariableGold) {
      // This should be 0 for variable gold (user must select)
      backgroundGoldWithEquipment = 0;
    } else {
      // This is the potential bug - falling back to scraping
      backgroundGoldWithEquipment = 15; // system.wealth fallback
    }
    
    expect(backgroundGoldWithEquipment).toBe(0); // Should be 0 for variable gold
  });
});
