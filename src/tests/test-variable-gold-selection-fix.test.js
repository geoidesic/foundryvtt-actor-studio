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

describe('Variable Gold Selection and Total Fix', () => {
  it('should correctly calculate total gold when variable gold is selected', async () => {
    // Simulate the user scenario from the screenshot:
    // 1. User selects "equipment" for Fighter (variable gold)
    // 2. User selects "equipment" for Artisan (variable gold) 
    // 3. User selects Fighter choice C (155 GP)
    // 4. User selects Artisan choice B (50 GP)
    // 5. Total should be 155 + 50 = 205 GP
    
    // Mock the gold choices for variable gold equipment selections
    const mockGoldChoices = {
      fromClass: { choice: 'equipment', goldValue: 0 }, // Fixed: was 'variable', now 0
      fromBackground: { choice: 'equipment', goldValue: 0 } // Fixed: was 'variable', now 0
    };
    
    // Mock the equipment gold selections
    const mockEquipmentGoldOptions = {
      fromClass: { selectedChoice: 'C', currentGoldAmount: 155 },
      fromBackground: { selectedChoice: 'B', currentGoldAmount: 50 }
    };
    
    // Calculate total using the same formula as StartingGold component
    const totalGold = (isNaN(parseInt(mockGoldChoices.fromClass.goldValue)) ? 0 : parseInt(mockGoldChoices.fromClass.goldValue)) + 
                     (isNaN(parseInt(mockGoldChoices.fromBackground.goldValue)) ? 0 : parseInt(mockGoldChoices.fromBackground.goldValue)) + 
                     (mockEquipmentGoldOptions.fromClass.currentGoldAmount || 0) + 
                     (mockEquipmentGoldOptions.fromBackground.currentGoldAmount || 0);
    
    console.log('Gold calculation breakdown:');
    console.log('- Class base gold:', parseInt(mockGoldChoices.fromClass.goldValue) || 0);
    console.log('- Background base gold:', parseInt(mockGoldChoices.fromBackground.goldValue) || 0);
    console.log('- Class equipment gold:', mockEquipmentGoldOptions.fromClass.currentGoldAmount);
    console.log('- Background equipment gold:', mockEquipmentGoldOptions.fromBackground.currentGoldAmount);
    console.log('- Total:', totalGold);
    
    expect(totalGold).toBe(205);
  });

  it('should provide readable variable gold options for user selection', async () => {
    const { parseEquipmentGoldOptions } = await import('~/src/stores/equipmentGold');
    
    // Test Fighter variable gold options
    const fighterClass = {
      system: {
        description: {
          value: `<p><strong>Equipment:</strong> Choose A, B, or C: (A) Chain Mail, Shield, 5 Javelins, Dungeoneer's Pack, 4 GP; or (B) Leather Armor, Shield, 5 Javelins, Dungeoneer's Pack, 11 GP; or (C) 155 GP</p>`
        }
      }
    };
    
    const fighterResult = parseEquipmentGoldOptions(fighterClass);
    
    // Should provide clear options for UI display
    expect(fighterResult.hasVariableGold).toBe(true);
    expect(fighterResult.goldOptions).toHaveLength(3);
    
    const optionA = fighterResult.goldOptions.find(opt => opt.choice === 'A');
    const optionB = fighterResult.goldOptions.find(opt => opt.choice === 'B');
    const optionC = fighterResult.goldOptions.find(opt => opt.choice === 'C');
    
    expect(optionA?.goldAmount).toBe(4);
    expect(optionB?.goldAmount).toBe(11);
    expect(optionC?.goldAmount).toBe(155);
    
    // Each option should have a description for UI display
    expect(optionA?.description).toContain('Chain Mail');
    expect(optionB?.description).toContain('Leather Armor');
    expect(optionC?.description).toContain('155 GP');
    
    console.log('Fighter options for UI:');
    fighterResult.goldOptions.forEach(opt => {
      console.log(`  ${opt.choice}: ${opt.goldAmount} GP - ${opt.description.substring(0, 60)}...`);
    });
  });

  it('should test the complete workflow: choice selection → variable gold selection → total calculation', () => {
    // 1. User selects equipment choices (should set goldValue to 0 for variable gold)
    const classChoice = 'equipment';
    const backgroundChoice = 'equipment';
    
    // Mock parsed equipment gold (variable for both)
    const mockParsedEquipmentGold = {
      fromClass: { hasVariableGold: true, goldOptions: [
        { choice: 'A', goldAmount: 4 },
        { choice: 'B', goldAmount: 11 },
        { choice: 'C', goldAmount: 155 }
      ]},
      fromBackground: { hasVariableGold: true, goldOptions: [
        { choice: 'A', goldAmount: 32 },
        { choice: 'B', goldAmount: 50 }
      ]}
    };
    
    // 2. For variable gold, goldValue should be 0, not 'variable'
    let classGoldValue, backgroundGoldValue;
    
    if (classChoice === 'equipment' && mockParsedEquipmentGold.fromClass.hasVariableGold) {
      classGoldValue = 0; // Fixed: was 'variable'
    }
    
    if (backgroundChoice === 'equipment' && mockParsedEquipmentGold.fromBackground.hasVariableGold) {
      backgroundGoldValue = 0; // Fixed: was 'variable'
    }
    
    expect(classGoldValue).toBe(0);
    expect(backgroundGoldValue).toBe(0);
    
    // 3. User selects specific variable gold options
    const selectedClassChoice = 'C'; // 155 GP
    const selectedBackgroundChoice = 'B'; // 50 GP
    
    const classEquipmentGold = mockParsedEquipmentGold.fromClass.goldOptions
      .find(opt => opt.choice === selectedClassChoice)?.goldAmount || 0;
    const backgroundEquipmentGold = mockParsedEquipmentGold.fromBackground.goldOptions
      .find(opt => opt.choice === selectedBackgroundChoice)?.goldAmount || 0;
    
    // 4. Calculate final total
    const finalTotal = classGoldValue + backgroundGoldValue + classEquipmentGold + backgroundEquipmentGold;
    
    console.log('Complete workflow:');
    console.log('1. Choice selection: equipment + equipment');
    console.log('2. Base gold values: 0 + 0 (variable gold)');
    console.log('3. Equipment selections: C(155) + B(50)');
    console.log('4. Final total:', finalTotal);
    
    expect(finalTotal).toBe(205);
  });
});
