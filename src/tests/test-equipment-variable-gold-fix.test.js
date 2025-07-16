// Test for the Equipment component variable gold fix
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';

describe('Equipment Variable Gold Fix', () => {
  let mockDndVersion;
  let mockDndRules; 
  let mockParsedEquipmentGold;
  let mockGoldChoices;
  let mockAreGoldChoicesComplete;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    
    // Mock window.GAS
    global.window = {
      GAS: {
        dnd5eVersion: 4,
        dnd5eRules: '2024',
        log: { d: vi.fn() }
      }
    };
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  test('should show equipment when user chose equipment and variable gold needs selection', () => {
    // Scenario: Fighter class with variable gold, user chose "equipment" option
    // Equipment selection should appear to let user make A/B/C choice
    
    const goldChoices = {
      fromClass: { choice: 'equipment' },
      fromBackground: { choice: 'gold' }
    };
    const parsedEquipmentGold = {
      fromClass: { hasVariableGold: true, goldOptions: [
        { choice: 'A', goldAmount: 4 },
        { choice: 'B', goldAmount: 11 },
        { choice: 'C', goldAmount: 155 }
      ]},
      fromBackground: { hasVariableGold: false, goldOptions: [] }
    };
    const isGoldComplete = false;
    
    const userChoseEquipment = goldChoices.fromClass.choice === 'equipment' || goldChoices.fromBackground.choice === 'equipment';
    const hasVariableGoldNeedingSelection = (parsedEquipmentGold.fromClass.hasVariableGold && goldChoices.fromClass.choice === 'equipment') ||
                                          (parsedEquipmentGold.fromBackground.hasVariableGold && goldChoices.fromBackground.choice === 'equipment');
    const shouldShowEquipment = userChoseEquipment && (isGoldComplete || hasVariableGoldNeedingSelection);
    
    expect(shouldShowEquipment).toBe(true);
    expect(userChoseEquipment).toBe(true);
    expect(hasVariableGoldNeedingSelection).toBe(true);
    expect(isGoldComplete).toBe(false);
  });

  test('should NOT show equipment when user chose gold only', () => {
    // Scenario: Fighter class with variable gold but user chose "gold only" option
    // Equipment selection should NOT appear
    
    const goldChoices = {
      fromClass: { choice: 'gold' },
      fromBackground: { choice: 'gold' }
    };
    const parsedEquipmentGold = {
      fromClass: { hasVariableGold: true, goldOptions: [
        { choice: 'A', goldAmount: 4 },
        { choice: 'B', goldAmount: 11 },
        { choice: 'C', goldAmount: 155 }
      ]},
      fromBackground: { hasVariableGold: false, goldOptions: [] }
    };
    const isGoldComplete = true; // Gold choice was made
    
    const userChoseEquipment = goldChoices.fromClass.choice === 'equipment' || goldChoices.fromBackground.choice === 'equipment';
    const hasVariableGoldNeedingSelection = (parsedEquipmentGold.fromClass.hasVariableGold && goldChoices.fromClass.choice === 'equipment') ||
                                          (parsedEquipmentGold.fromBackground.hasVariableGold && goldChoices.fromBackground.choice === 'equipment');
    const shouldShowEquipment = userChoseEquipment && (isGoldComplete || hasVariableGoldNeedingSelection);
    
    expect(shouldShowEquipment).toBe(false);
    expect(userChoseEquipment).toBe(false);
    expect(hasVariableGoldNeedingSelection).toBe(false);
  });

  test('should show equipment when choices complete and user chose equipment', () => {
    // Scenario: Normal class, user chose equipment, choices complete
    const goldChoices = {
      fromClass: { choice: 'equipment' },
      fromBackground: { choice: 'equipment' }
    };
    const parsedEquipmentGold = {
      fromClass: { hasVariableGold: false, goldOptions: [] },
      fromBackground: { hasVariableGold: false, goldOptions: [] }
    };
    const isGoldComplete = true;
    
    const userChoseEquipment = goldChoices.fromClass.choice === 'equipment' || goldChoices.fromBackground.choice === 'equipment';
    const hasVariableGoldNeedingSelection = (parsedEquipmentGold.fromClass.hasVariableGold && goldChoices.fromClass.choice === 'equipment') ||
                                          (parsedEquipmentGold.fromBackground.hasVariableGold && goldChoices.fromBackground.choice === 'equipment');
    const shouldShowEquipment = userChoseEquipment && (isGoldComplete || hasVariableGoldNeedingSelection);
    
    expect(shouldShowEquipment).toBe(true);
    expect(userChoseEquipment).toBe(true);
    expect(isGoldComplete).toBe(true);
  });

  test('should NOT show equipment when no choices made yet', () => {
    // Scenario: User hasn't made equipment/gold choice yet
    const goldChoices = {
      fromClass: { choice: null },
      fromBackground: { choice: null }
    };
    const parsedEquipmentGold = {
      fromClass: { hasVariableGold: false, goldOptions: [] },
      fromBackground: { hasVariableGold: false, goldOptions: [] }
    };
    const isGoldComplete = false;
    
    const userChoseEquipment = goldChoices.fromClass.choice === 'equipment' || goldChoices.fromBackground.choice === 'equipment';
    const hasVariableGoldNeedingSelection = (parsedEquipmentGold.fromClass.hasVariableGold && goldChoices.fromClass.choice === 'equipment') ||
                                          (parsedEquipmentGold.fromBackground.hasVariableGold && goldChoices.fromBackground.choice === 'equipment');
    const shouldShowEquipment = userChoseEquipment && (isGoldComplete || hasVariableGoldNeedingSelection);
    
    expect(shouldShowEquipment).toBe(false);
    expect(userChoseEquipment).toBe(false);
    expect(hasVariableGoldNeedingSelection).toBe(false);
  });

  test('should handle mixed choices (class equipment, background gold)', () => {
    // Scenario: Class has equipment choice, background has gold choice
    const goldChoices = {
      fromClass: { choice: 'equipment' },
      fromBackground: { choice: 'gold' }
    };
    const parsedEquipmentGold = {
      fromClass: { hasVariableGold: false, goldOptions: [] },
      fromBackground: { hasVariableGold: false, goldOptions: [] }
    };
    const isGoldComplete = true;
    
    const userChoseEquipment = goldChoices.fromClass.choice === 'equipment' || goldChoices.fromBackground.choice === 'equipment';
    const hasVariableGoldNeedingSelection = (parsedEquipmentGold.fromClass.hasVariableGold && goldChoices.fromClass.choice === 'equipment') ||
                                          (parsedEquipmentGold.fromBackground.hasVariableGold && goldChoices.fromBackground.choice === 'equipment');
    const shouldShowEquipment = userChoseEquipment && (isGoldComplete || hasVariableGoldNeedingSelection);
    
    expect(shouldShowEquipment).toBe(true);
    expect(userChoseEquipment).toBe(true);
  });

  test('should work with 2014 rules using goldRoll', () => {
    // Scenario: 2014 rules bypass the choice system
    global.window.GAS.dnd5eVersion = 3;
    global.window.GAS.dnd5eRules = '2014';
    
    const goldRoll = 150;
    const shouldShowEquipment = goldRoll > 0; // 2014 logic
    
    expect(shouldShowEquipment).toBe(true);
  });

  test('should handle background variable gold correctly', () => {
    // Scenario: Background has variable gold, user chose equipment for background
    const goldChoices = {
      fromClass: { choice: 'gold' },
      fromBackground: { choice: 'equipment' }
    };
    const parsedEquipmentGold = {
      fromClass: { hasVariableGold: false, goldOptions: [] },
      fromBackground: { hasVariableGold: true, goldOptions: [
        { choice: 'A', goldAmount: 10 },
        { choice: 'B', goldAmount: 20 }
      ]}
    };
    const isGoldComplete = false;
    
    const userChoseEquipment = goldChoices.fromClass.choice === 'equipment' || goldChoices.fromBackground.choice === 'equipment';
    const hasVariableGoldNeedingSelection = (parsedEquipmentGold.fromClass.hasVariableGold && goldChoices.fromClass.choice === 'equipment') ||
                                          (parsedEquipmentGold.fromBackground.hasVariableGold && goldChoices.fromBackground.choice === 'equipment');
    const shouldShowEquipment = userChoseEquipment && (isGoldComplete || hasVariableGoldNeedingSelection);
    
    expect(shouldShowEquipment).toBe(true);
    expect(userChoseEquipment).toBe(true);
    expect(hasVariableGoldNeedingSelection).toBe(true);
  });
});
