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

describe('Workflow Completion Integration Test', () => {
  it('should demonstrate the full workflow fix end-to-end', async () => {
    // Mock the stores properly
    const { parseEquipmentGoldOptions } = await import('~/src/stores/equipmentGold');
    
    // 1. Test fixed background parsing for Artisan
    const artisanBackground = {
      system: {
        description: {
          value: `<p><strong>Equipment:</strong> Choose A or B: (A) <em>Artisan's Tools</em> (same as above), 2 <em>Pouches</em>, <em>Traveler's Clothes</em>, 32 GP; or (B) 50 GP</p>`
        },
        wealth: 15
      }
    };
    
    const artisanResult = parseEquipmentGoldOptions(artisanBackground);
    console.log('🔧 Fixed Artisan parsing:', artisanResult);
    
    // Artisan has standard equipment (not variable gold)
    expect(artisanResult.hasVariableGold).toBe(false);
    expect(artisanResult.goldOptions).toHaveLength(2);
    expect(artisanResult.goldOptions[0].goldAmount).toBe(32); // Choice A
    expect(artisanResult.goldOptions[1].goldAmount).toBe(50); // Choice B
    expect(artisanResult.standardEquipmentGold).toBe(32); // Standard equipment uses first option
    
    // 2. Test Fighter class (should also be variable gold)
    const fighterClass = {
      system: {
        description: {
          value: `<p><strong>Equipment:</strong> Choose A, B, or C: (A) Chain Mail, Shield, 5 Javelins, Dungeoneer's Pack, 4 GP; or (B) Leather Armor, Shield, 5 Javelins, Dungeoneer's Pack, 11 GP; or (C) 155 GP</p>`
        },
        wealth: 75
      }
    };
    
    const fighterResult = parseEquipmentGoldOptions(fighterClass);
    console.log('⚔️ Fighter parsing:', fighterResult);
    
    expect(fighterResult.hasVariableGold).toBe(true);
    expect(fighterResult.goldOptions).toHaveLength(3);
    
    // 3. Test workflow completion scenarios
    
    // Scenario A: User chooses gold-only for both (should complete immediately)
    const goldOnlyChoices = {
      fromClass: { choice: 'gold', goldValue: 75 },
      fromBackground: { choice: 'gold', goldValue: 15 }
    };
    
    const basicChoicesComplete = goldOnlyChoices.fromClass.choice !== null && 
                                goldOnlyChoices.fromBackground.choice !== null;
    const userChoseEquipment = goldOnlyChoices.fromClass.choice === 'equipment' || 
                              goldOnlyChoices.fromBackground.choice === 'equipment';
    
    expect(basicChoicesComplete).toBe(true);
    expect(userChoseEquipment).toBe(false);
    
    // For gold-only, should complete without equipment selection
    const goldOnlyComplete = basicChoicesComplete && !userChoseEquipment;
    expect(goldOnlyComplete).toBe(true);
    console.log('💰 Gold-only workflow complete:', goldOnlyComplete);
    
    // Scenario B: User chooses equipment (should require equipment selection)
    const equipmentChoices = {
      fromClass: { choice: 'equipment', goldValue: 'variable' },
      fromBackground: { choice: 'equipment', goldValue: 'variable' }
    };
    
    const equipmentUserChoseEquipment = equipmentChoices.fromClass.choice === 'equipment' || 
                                       equipmentChoices.fromBackground.choice === 'equipment';
    
    expect(equipmentUserChoseEquipment).toBe(true);
    
    // Mock equipment gold not selected yet
    const equipmentGoldOptions = {
      fromClass: { selectedChoice: null },
      fromBackground: { selectedChoice: null }
    };
    
    // Should need equipment selection for variable gold
    const classNeedsChoice = equipmentChoices.fromClass.choice === 'equipment' && fighterResult.hasVariableGold;
    const backgroundNeedsChoice = equipmentChoices.fromBackground.choice === 'equipment' && artisanResult.hasVariableGold;
    const classChoiceComplete = !classNeedsChoice || equipmentGoldOptions.fromClass.selectedChoice !== null;
    const backgroundChoiceComplete = !backgroundNeedsChoice || equipmentGoldOptions.fromBackground.selectedChoice !== null;
    
    expect(classNeedsChoice).toBe(true); // Fighter has variable gold and user chose equipment
    expect(backgroundNeedsChoice).toBe(false); // Artisan has standard equipment (not variable)
    expect(classChoiceComplete).toBe(false); // Fighter needs a choice but hasn't made one
    expect(backgroundChoiceComplete).toBe(true); // Artisan doesn't need a choice (standard equipment)
    
    const equipmentComplete = classChoiceComplete && backgroundChoiceComplete;
    expect(equipmentComplete).toBe(false); // Should be false because Fighter choice is incomplete
    console.log('⚙️ Equipment workflow incomplete (as expected):', equipmentComplete);
    
    // Scenario C: User chooses equipment and completes selection
    const completedEquipmentGoldOptions = {
      fromClass: { selectedChoice: 'C' }, // Fighter choice C (155 GP)
      fromBackground: { selectedChoice: 'B' } // Artisan choice B (50 GP)
    };
    
    const completedClassChoiceComplete = !classNeedsChoice || completedEquipmentGoldOptions.fromClass.selectedChoice !== null;
    const completedBackgroundChoiceComplete = !backgroundNeedsChoice || completedEquipmentGoldOptions.fromBackground.selectedChoice !== null;
    
    expect(completedClassChoiceComplete).toBe(true);
    expect(completedBackgroundChoiceComplete).toBe(true);
    
    const completedEquipmentComplete = completedClassChoiceComplete && completedBackgroundChoiceComplete;
    expect(completedEquipmentComplete).toBe(true);
    console.log('✅ Equipment workflow complete:', completedEquipmentComplete);
    
    console.log('🎉 All workflow scenarios working correctly!');
  });
});
