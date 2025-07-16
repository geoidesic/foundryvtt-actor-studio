import { describe, it, expect } from 'vitest';

describe('Equipment Gold Total Fix', () => {
  it('should verify Artisan equipment selection contributes to total gold', async () => {
    console.log('🔧 TESTING: Artisan Equipment Gold Contribution');
    console.log('===============================================');
    
    // Artisan background with two equipment options
    const artisanBackground = {
      system: {
        description: {
          value: `<p><strong>Equipment:</strong> Choose A or B: (A) <em>Artisan's Tools</em> (same as above), 2 <em>Pouches</em>, <em>Traveler's Clothes</em>, 32 GP; or (B) 50 GP</p>`
        },
        wealth: 15
      }
    };

    const { parseEquipmentGoldOptions } = await import('~/src/stores/equipmentGold');
    
    // Parse Artisan background
    const artisanParsed = parseEquipmentGoldOptions(artisanBackground);
    
    console.log('Artisan parsing result:');
    console.log('- hasVariableGold:', artisanParsed.hasVariableGold);
    console.log('- standardEquipmentGold:', artisanParsed.standardEquipmentGold);
    console.log('- goldOptions:', artisanParsed.goldOptions.map(o => `${o.choice}: ${o.goldAmount} GP`));
    
    // Verify Artisan is NOT variable gold
    expect(artisanParsed.hasVariableGold).toBe(false);
    expect(artisanParsed.standardEquipmentGold).toBe(32); // First option amount
    expect(artisanParsed.goldOptions).toHaveLength(2);
    expect(artisanParsed.goldOptions[0].goldAmount).toBe(32); // Option A
    expect(artisanParsed.goldOptions[1].goldAmount).toBe(50); // Option B
    
    console.log('✅ Artisan correctly parsed as standard equipment (not variable)');
    console.log('✅ Standard equipment gold amount is 32 GP (from option A)');
    console.log('✅ When user selects equipment, should contribute 32 GP to total');
  });
});
