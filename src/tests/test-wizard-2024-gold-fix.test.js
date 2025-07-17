import { describe, it, expect, beforeEach } from 'vitest';
import { parseEquipmentGoldOptions } from '../stores/equipmentGold.js';

describe('Wizard 2024 Gold Choice Fix', () => {
  let mockWizard2024;

  beforeEach(() => {
    // Mock D&D 2024 Wizard class with the typical equipment vs wealth choice
    mockWizard2024 = {
      system: {
        description: {
          value: '<p><strong>Equipment:</strong> Choose A or B: (A) <em>Dagger</em> (2), <em>Staff</em>, <em>Robe</em>, <em>Scholar\'s Pack</em>, 5 GP; or (B) 110 GP</p>'
        },
        wealth: 110
      }
    };
  });

  it('should correctly identify Wizard as NOT having variable gold (only 2 choices)', () => {
    const result = parseEquipmentGoldOptions(mockWizard2024);

    console.log('🧙‍♂️ WIZARD 2024 GOLD FIX TEST');
    console.log('===============================');
    console.log('Wizard parsing result:', {
      hasVariableGold: result.hasVariableGold,
      optionCount: result.goldOptions?.length,
      standardEquipmentGold: result.standardEquipmentGold,
      options: result.goldOptions?.map(opt => `${opt.choice}: ${opt.goldAmount} GP`)
    });

    // Should have exactly 2 choices
    expect(result.goldOptions).toHaveLength(2);
    
    // Should NOT be marked as variable gold (because only 2 choices)
    expect(result.hasVariableGold).toBe(false);
    
    // Should have standard equipment gold from first choice (Equipment + 5 GP)
    expect(result.standardEquipmentGold).toBe(5);
    
    // Should have both equipment and wealth options
    expect(result.goldOptions[0]).toEqual({
      choice: 'A',
      goldAmount: 5,
      description: expect.stringContaining('A:')
    });
    
    expect(result.goldOptions[1]).toEqual({
      choice: 'B', 
      goldAmount: 110,
      description: expect.stringContaining('B:')
    });

    console.log('✅ Wizard correctly identified as standard Equipment vs Wealth choice');
    console.log('✅ Should display "Equipment + 5 gp" instead of "Equipment + variable gp"');
  });

  it('should contrast with Fighter which DOES have variable gold (3+ choices)', () => {
    const mockFighter = {
      system: {
        description: {
          value: '<p><strong>Equipment:</strong> Choose A, B, or C: (A) <em>Chain Mail</em>, <em>Shield</em>, 5 <em>Javelins</em>, <em>Dungeoneer\'s Pack</em>, 4 GP; or (B) <em>Leather Armor</em>, <em>Shield</em>, 5 <em>Javelins</em>, <em>Dungeoneer\'s Pack</em>, 11 GP; or (C) 155 GP</p>'
        }
      }
    };

    const wizardResult = parseEquipmentGoldOptions(mockWizard2024);
    const fighterResult = parseEquipmentGoldOptions(mockFighter);

    console.log('⚔️ FIGHTER vs WIZARD COMPARISON');
    console.log('================================');
    console.log('Wizard (2 choices):', {
      hasVariableGold: wizardResult.hasVariableGold,
      choiceCount: wizardResult.goldOptions?.length
    });
    console.log('Fighter (3 choices):', {
      hasVariableGold: fighterResult.hasVariableGold,
      choiceCount: fighterResult.goldOptions?.length
    });

    // Wizard: 2 choices = NOT variable gold
    expect(wizardResult.hasVariableGold).toBe(false);
    expect(wizardResult.goldOptions).toHaveLength(2);
    
    // Fighter: 3 choices = IS variable gold  
    expect(fighterResult.hasVariableGold).toBe(true);
    expect(fighterResult.goldOptions).toHaveLength(3);

    console.log('✅ Wizard: Equipment vs Wealth (not variable)');
    console.log('✅ Fighter: Multiple equipment options (variable)');
  });
});
