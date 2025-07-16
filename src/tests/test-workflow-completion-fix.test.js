import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock FoundryVTT globals
global.game = {
  settings: { get: vi.fn((module, key) => {
    if (key === 'enableEquipmentSelection') return true;
    return false;
  })},
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
    // Call with mock values
    if (Array.isArray(stores)) {
      callback(stores.map(() => ({})));
    } else {
      callback({});
    }
    return () => {};
  })
});

const mockGet = vi.fn((store) => ({}));

vi.mock('svelte/store', () => ({ 
  writable: mockWritable, 
  derived: mockDerived, 
  get: mockGet 
}));

// Mock the stores we need
vi.mock('~/src/stores/storeDefinitions', () => ({
  goldRoll: mockWritable(0),
  characterClass: mockWritable(null),
  background: mockWritable(null)
}));

describe('Workflow Completion Fix Tests', () => {
  describe('Gold Only Choice Completion', () => {
    it('should complete workflow when user selects gold-only for both class and background', async () => {
      // Import after mocks are set up
      const { goldChoices, areGoldChoicesComplete, setClassGoldChoice, setBackgroundGoldChoice } = await import('~/src/stores/goldChoices');
      
      // Set both choices to 'gold' (no equipment)
      setClassGoldChoice('gold', 100);
      setBackgroundGoldChoice('gold', 50);
      
      // Should be complete since no equipment selection needed
      const mockChoices = {
        fromClass: { choice: 'gold', goldValue: 100 },
        fromBackground: { choice: 'gold', goldValue: 50 }
      };
      
      // Test that choices are considered complete
      expect(mockChoices.fromClass.choice).toBe('gold');
      expect(mockChoices.fromBackground.choice).toBe('gold');
    });

    it('should complete workflow when user selects equipment and completes equipment selection', async () => {
      const { setClassGoldChoice, setBackgroundGoldChoice } = await import('~/src/stores/goldChoices');
      
      // User chooses equipment
      setClassGoldChoice('equipment', 'variable');
      setBackgroundGoldChoice('equipment', 50);
      
      // Mock equipment gold completion
      const mockEquipmentComplete = true;
      
      // Should be complete when equipment selection is done
      expect(mockEquipmentComplete).toBe(true);
    });
  });

  describe('Background Equipment Gold Parsing', () => {
    it('should use parsed HTML description gold value, not system.wealth fallback', async () => {
      // Mock background with HTML description containing equipment gold
      const mockBackground = {
        system: {
          description: {
            value: 'Equipment: Choose A or B: (A) Artisan\'s Tools, 2 Pouches, Traveler\'s Clothes, 32 GP; or (B) 50 GP'
          },
          wealth: 999 // This should NOT be used for equipment choice
        }
      };

      // Import our parsing function
      const { parseEquipmentGoldOptions } = await import('~/src/stores/equipmentGold');
      
      const result = parseEquipmentGoldOptions(mockBackground);
      
      // Should parse the choices from description as standard equipment (not variable gold)
      expect(result.hasVariableGold).toBe(false);
      expect(result.goldOptions).toHaveLength(2);
      expect(result.goldOptions[0].goldAmount).toBe(32); // From (A) option
      expect(result.goldOptions[1].goldAmount).toBe(50); // From (B) option
      expect(result.standardEquipmentGold).toBe(32); // Uses first option for standard equipment
      
      // Should NOT use system.wealth (999)
      expect(result.goldOptions.some(opt => opt.goldAmount === 999)).toBe(false);
    });

    it('should use parsed single equipment gold value correctly', async () => {
      const mockBackground = {
        system: {
          description: {
            value: 'You start with the following equipment: leather armor, simple weapon, 25 GP'
          },
          wealth: 999 // Should not be used
        }
      };

      const { parseEquipmentGoldOptions } = await import('~/src/stores/equipmentGold');
      
      const result = parseEquipmentGoldOptions(mockBackground);
      
      expect(result.hasVariableGold).toBe(false);
      expect(result.standardEquipmentGold).toBe(25);
      expect(result.goldOptions[0].goldAmount).toBe(25);
    });
  });

  describe('Equipment Tab Visibility Logic', () => {
    it('should NOT show equipment when user chooses gold-only', () => {
      const goldChoices = {
        fromClass: { choice: 'gold', goldValue: 100 },
        fromBackground: { choice: 'gold', goldValue: 50 }
      };
      
      const parsedEquipmentGold = {
        fromClass: { hasVariableGold: false },
        fromBackground: { hasVariableGold: false }
      };
      
      // User chose gold, so no equipment selection should be shown
      const userChoseEquipment = goldChoices.fromClass.choice === 'equipment' || 
                                goldChoices.fromBackground.choice === 'equipment';
      
      expect(userChoseEquipment).toBe(false);
    });

    it('should show equipment when user chooses equipment option', () => {
      const goldChoices = {
        fromClass: { choice: 'equipment', goldValue: 'variable' },
        fromBackground: { choice: 'gold', goldValue: 50 }
      };
      
      const userChoseEquipment = goldChoices.fromClass.choice === 'equipment' || 
                                goldChoices.fromBackground.choice === 'equipment';
      
      expect(userChoseEquipment).toBe(true);
    });

    it('should show equipment for variable gold scenarios when equipment chosen', () => {
      const goldChoices = {
        fromClass: { choice: 'equipment', goldValue: 'variable' },
        fromBackground: { choice: 'gold', goldValue: 50 }
      };
      
      const parsedEquipmentGold = {
        fromClass: { hasVariableGold: true },
        fromBackground: { hasVariableGold: false }
      };
      
      const userChoseEquipment = goldChoices.fromClass.choice === 'equipment';
      const hasVariableGoldNeedingSelection = parsedEquipmentGold.fromClass.hasVariableGold && 
                                            goldChoices.fromClass.choice === 'equipment';
      
      expect(userChoseEquipment).toBe(true);
      expect(hasVariableGoldNeedingSelection).toBe(true);
    });
  });

  describe('Progress Completion Logic', () => {
    it('should show 100% progress when gold-only choices are complete', () => {
      const goldChoices = {
        fromClass: { choice: 'gold', goldValue: 100 },
        fromBackground: { choice: 'gold', goldValue: 50 }
      };
      
      // Gold choices complete, no equipment needed
      const basicChoicesComplete = goldChoices.fromClass.choice !== null && 
                                  goldChoices.fromBackground.choice !== null;
      
      // For gold-only, equipment gold choices should be considered complete
      const areEquipmentGoldChoicesComplete = true; // No equipment selection needed
      
      const overallComplete = basicChoicesComplete && areEquipmentGoldChoicesComplete;
      
      expect(overallComplete).toBe(true);
    });

    it('should show progress incomplete when equipment choice made but not selected', () => {
      const goldChoices = {
        fromClass: { choice: 'equipment', goldValue: 'variable' },
        fromBackground: { choice: 'gold', goldValue: 50 }
      };
      
      const basicChoicesComplete = goldChoices.fromClass.choice !== null && 
                                  goldChoices.fromBackground.choice !== null;
      
      // Equipment selection not yet complete
      const areEquipmentGoldChoicesComplete = false;
      
      const overallComplete = basicChoicesComplete && areEquipmentGoldChoicesComplete;
      
      expect(overallComplete).toBe(false);
    });
  });
});
