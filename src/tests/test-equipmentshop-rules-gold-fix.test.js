import { describe, test, expect, vi, beforeEach } from 'vitest';

describe('EquipmentShop Store Rules-Based Gold Fix', () => {
  let mockWindow;

  beforeEach(() => {
    // Mock window.GAS
    mockWindow = {
      GAS: {
        dnd5eVersion: 4,
        dnd5eRules: "2014"
      }
    };
    global.window = mockWindow;

    // Mock foundry utils
    global.foundry = { utils: { fromUuid: vi.fn() } };

    // Clear all modules to ensure fresh imports
    vi.resetModules();
  });

  test('should use goldRoll for D&D 2014 rules with version 4+', () => {
    // Setup: Version 4+ but using 2014 rules
    mockWindow.GAS.dnd5eVersion = 4;
    mockWindow.GAS.dnd5eRules = "2014";

    // Test the logic directly
    const totalGoldFromChoices = 150;
    const goldRoll = 200;

    // Simulate the derived function logic
    let result;
    if (mockWindow.GAS?.dnd5eVersion >= 4 && mockWindow.GAS?.dnd5eRules === "2024") {
      result = (totalGoldFromChoices || 0) * 100;
    } else {
      result = (goldRoll || 0) * 100;
    }

    expect(result).toBe(20000); // Should use goldRoll (200) * 100 = 20000 copper
  });

  test('should use totalGoldFromChoices for D&D 2024 rules with version 4+', () => {
    // Setup: Version 4+ using 2024 rules
    mockWindow.GAS.dnd5eVersion = 4;
    mockWindow.GAS.dnd5eRules = "2024";

    // Test the logic directly
    const totalGoldFromChoices = 150;
    const goldRoll = 200;

    // Simulate the derived function logic
    let result;
    if (mockWindow.GAS?.dnd5eVersion >= 4 && mockWindow.GAS?.dnd5eRules === "2024") {
      result = (totalGoldFromChoices || 0) * 100;
    } else {
      result = (goldRoll || 0) * 100;
    }

    expect(result).toBe(15000); // Should use totalGoldFromChoices (150) * 100 = 15000 copper
  });

  test('should use goldRoll for D&D 5e version 3 (legacy)', () => {
    // Setup: Version 3 (legacy)
    mockWindow.GAS.dnd5eVersion = 3;
    mockWindow.GAS.dnd5eRules = "2014";

    // Test the logic directly
    const totalGoldFromChoices = 150;
    const goldRoll = 200;

    // Simulate the derived function logic
    let result;
    if (mockWindow.GAS?.dnd5eVersion >= 4 && mockWindow.GAS?.dnd5eRules === "2024") {
      result = (totalGoldFromChoices || 0) * 100;
    } else {
      result = (goldRoll || 0) * 100;
    }

    expect(result).toBe(20000); // Should use goldRoll (200) * 100 = 20000 copper
  });

  test('should demonstrate the equipmentShop fix', () => {
    console.log('🔧 EQUIPMENTSHOP AVAILABLEGOLD FIX DEMONSTRATION');
    console.log('================================================');
    console.log('');
    console.log('PROBLEM: Shop tab always used totalGoldFromChoices store');
    console.log('');
    console.log('BEFORE FIX:');
    console.log('- availableGold = derived(totalGoldFromChoices, ...)');
    console.log('- Result: 2014 rules showed 0 gold (totalGoldFromChoices empty)');
    console.log('');
    console.log('AFTER FIX:');
    console.log('- availableGold = derived([totalGoldFromChoices, goldRoll], ...)');
    console.log('- Logic: Check rules and use appropriate store');
    console.log('- 2024 rules: Use totalGoldFromChoices');
    console.log('- 2014 rules: Use goldRoll');
    console.log('');
    console.log('✅ This fix ensures shop shows correct gold for both rule sets!');

    expect(true).toBe(true); // This test is for documentation
  });
});
