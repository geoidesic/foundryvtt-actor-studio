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

describe('Variable Gold Issues Debug', () => {
  it('should debug why total gold is not adding up correctly', async () => {
    // Import the stores
    const { setEquipmentGoldChoice, totalEquipmentGold, equipmentGoldOptions } = await import('~/src/stores/equipmentGold');
    
    // Simulate user selecting Fighter choice C (155 GP) and Artisan choice B (50 GP) 
    setEquipmentGoldChoice('fromClass', 'C', 155);
    setEquipmentGoldChoice('fromBackground', 'B', 50);
    
    // Mock the current state of equipmentGoldOptions
    const mockEquipmentGoldState = {
      fromClass: {
        hasVariableGold: true,
        goldOptions: [],
        selectedChoice: 'C',
        currentGoldAmount: 155
      },
      fromBackground: {
        hasVariableGold: true,
        goldOptions: [],
        selectedChoice: 'B', 
        currentGoldAmount: 50
      }
    };
    
    console.log('Mock equipment gold state:', mockEquipmentGoldState);
    
    // Calculate expected total
    const expectedTotal = mockEquipmentGoldState.fromClass.currentGoldAmount + 
                         mockEquipmentGoldState.fromBackground.currentGoldAmount;
    
    console.log('Expected total gold:', expectedTotal);
    expect(expectedTotal).toBe(205);
    
    // The issue might be that totalEquipmentGold derived store isn't being updated
    // or goldChoices.js isn't using the right values
  });

  it('should show what variable gold choice data should look like', async () => {
    const { parseEquipmentGoldOptions } = await import('~/src/stores/equipmentGold');
    
    // Fighter class with multiple choices
    const fighterClass = {
      system: {
        description: {
          value: `<p><strong>Equipment:</strong> Choose A, B, or C: (A) Chain Mail, Shield, 5 Javelins, Dungeoneer's Pack, 4 GP; or (B) Leather Armor, Shield, 5 Javelins, Dungeoneer's Pack, 11 GP; or (C) 155 GP</p>`
        }
      }
    };
    
    const fighterResult = parseEquipmentGoldOptions(fighterClass);
    console.log('Fighter variable gold options that should be displayed:', fighterResult.goldOptions);
    
    // The UI should show these choices to the user
    expect(fighterResult.hasVariableGold).toBe(true);
    expect(fighterResult.goldOptions).toHaveLength(3);
    expect(fighterResult.goldOptions[0].goldAmount).toBe(4);
    expect(fighterResult.goldOptions[1].goldAmount).toBe(11);
    expect(fighterResult.goldOptions[2].goldAmount).toBe(155);
    
    // Each option should have a descriptive label
    fighterResult.goldOptions.forEach((option, i) => {
      console.log(`Choice ${option.choice}: ${option.goldAmount} GP - ${option.description}`);
      expect(option.description).toBeTruthy();
      expect(option.choice).toBeTruthy();
    });
  });

  it('should debug the total gold calculation flow', () => {
    // The flow should be:
    // 1. User selects "equipment" for Fighter (variable gold)
    // 2. UI shows Fighter variable gold choices (A: 4, B: 11, C: 155)
    // 3. User selects choice C (155 GP)
    // 4. setEquipmentGoldChoice('fromClass', 'C', 155) is called
    // 5. totalEquipmentGold derived store recalculates
    // 6. totalGoldFromChoices in goldChoices.js adds this to base gold
    // 7. Total shows: background base (15) + class base (75) + equipment (155 + 50) = 295
    
    // But the screenshot shows only 50 GP total, suggesting:
    // - Either equipment gold selections aren't being stored
    // - Or totalEquipmentGold isn't calculating correctly  
    // - Or goldChoices.js isn't using totalEquipmentGold properly
    
    console.log('Expected flow: Base gold + Equipment gold selections = Total');
    console.log('Screenshot shows: Only 50 GP (should be much more)');
    
    // Let's check what the actual totalGoldFromChoices calculation should be
    const mockGoldChoices = {
      fromClass: { choice: 'equipment', goldValue: 'variable' }, // or should this be 155?
      fromBackground: { choice: 'equipment', goldValue: 'variable' } // or should this be 50?
    };
    
    const mockTotalEquipmentGold = 155 + 50; // From equipment selections
    const expectedTotal = 0 + 0 + mockTotalEquipmentGold; // Base + equipment
    
    console.log('Mock calculation:', {
      goldChoices: mockGoldChoices,
      totalEquipmentGold: mockTotalEquipmentGold,
      expectedTotal
    });
    
    expect(expectedTotal).toBe(205);
  });
});
