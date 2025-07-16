import { describe, it, expect } from 'vitest';

describe('Variable Gold UI Integration', () => {
  it('should show Fighter variable gold choices correctly with Artisan standard equipment', async () => {
    console.log('🔍 INTEGRATION TEST: Variable Gold UI Logic');
    console.log('=====================================');
    
    // Fighter has variable gold (A: 4, B: 11, C: 155)
    const fighterClass = {
      system: {
        description: {
          value: `<p><strong>Equipment:</strong> Choose A, B, or C: (A) Chain Mail, Shield, 5 Javelins, Dungeoneer's Pack, 4 GP; or (B) Leather Armor, Shield, 5 Javelins, Dungeoneer's Pack, 11 GP; or (C) 155 GP</p>`
        },
        wealth: 15
      }
    };

    // Artisan has standard equipment choices (A: 32, B: 50) 
    const artisanBackground = {
      system: {
        description: {
          value: `<p><strong>Equipment:</strong> Choose A or B: (A) <em>Artisan's Tools</em> (same as above), 2 <em>Pouches</em>, <em>Traveler's Clothes</em>, 32 GP; or (B) 50 GP</p>`
        },
        wealth: 15
      }
    };

    const { parseEquipmentGoldOptions } = await import('~/src/stores/equipmentGold');
    
    // Parse both
    const fighterParsed = parseEquipmentGoldOptions(fighterClass);
    const artisanParsed = parseEquipmentGoldOptions(artisanBackground);
    
    console.log('Fighter parsed:', {
      hasVariableGold: fighterParsed.hasVariableGold,
      optionCount: fighterParsed.goldOptions.length,
      options: fighterParsed.goldOptions.map(o => `${o.choice}: ${o.goldAmount} GP`)
    });
    
    console.log('Artisan parsed:', {
      hasVariableGold: artisanParsed.hasVariableGold,
      optionCount: artisanParsed.goldOptions.length,
      standardGold: artisanParsed.standardEquipmentGold,
      options: artisanParsed.goldOptions.map(o => `${o.choice}: ${o.goldAmount} GP`)
    });

    // Validate expectations
    expect(fighterParsed.hasVariableGold).toBe(true);
    expect(fighterParsed.goldOptions).toHaveLength(3);
    expect(fighterParsed.standardEquipmentGold).toBe(0);
    
    expect(artisanParsed.hasVariableGold).toBe(false);
    expect(artisanParsed.goldOptions).toHaveLength(2);
    expect(artisanParsed.standardEquipmentGold).toBe(32);
    
    console.log('✅ Fighter: Variable gold correctly detected');
    console.log('✅ Artisan: Standard equipment correctly detected');
    console.log('✅ Integration test passed');
  });
});
