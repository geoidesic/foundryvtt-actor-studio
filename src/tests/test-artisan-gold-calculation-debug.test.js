import { describe, it, expect } from 'vitest';

describe('Artisan Gold Calculation Debug', () => {
  it('should debug the backgroundGoldWithEquipment calculation', async () => {
    console.log('🔍 DEBUG: backgroundGoldWithEquipment Calculation');
    console.log('==============================================');
    
    const { parseEquipmentGoldOptions } = await import('~/src/stores/equipmentGold');
    
    // Artisan background data
    const artisanBackground = {
      system: {
        description: {
          value: `<p><strong>Equipment:</strong> Choose A or B: (A) <em>Artisan's Tools</em> (same as above), 2 <em>Pouches</em>, <em>Traveler's Clothes</em>, 32 GP; or (B) 50 GP</p>`
        },
        wealth: 15 // backgroundGoldOnly
      }
    };
    
    // Parse the background
    const backgroundGold = parseEquipmentGoldOptions(artisanBackground);
    console.log('backgroundGold parsed:', backgroundGold);
    
    // Simulate the logic from StartingGold component
    let backgroundGoldWithEquipment;
    let backgroundGoldOnly = artisanBackground.system.wealth || 0;
    
    console.log('backgroundGoldOnly:', backgroundGoldOnly);
    console.log('backgroundGold.goldOptions.length:', backgroundGold.goldOptions.length);
    console.log('backgroundGold.hasVariableGold:', backgroundGold.hasVariableGold);
    
    if (backgroundGold.goldOptions.length > 0 && !backgroundGold.hasVariableGold) {
      backgroundGoldWithEquipment = backgroundGold.goldOptions[0].goldAmount;
      console.log('Setting backgroundGoldWithEquipment to first option:', backgroundGoldWithEquipment);
    } else {
      console.log('Would fall back to scraping logic');
      backgroundGoldWithEquipment = 0; // fallback
    }
    
    console.log('Final backgroundGoldWithEquipment:', backgroundGoldWithEquipment);
    
    // Test equipment choice logic
    console.log('\n--- Equipment Choice Logic ---');
    const choice = 'equipment';
    const goldValue = choice === 'equipment' ? backgroundGoldWithEquipment : backgroundGoldOnly;
    const equipmentGoldAmount = backgroundGold.standardEquipmentGold || backgroundGoldWithEquipment || 0;
    
    console.log('choice:', choice);
    console.log('goldValue (for setBackgroundGoldChoice):', goldValue);
    console.log('equipmentGoldAmount (for setEquipmentGoldChoice):', equipmentGoldAmount);
    
    // Verify expectations
    expect(backgroundGoldWithEquipment).toBe(32);
    expect(equipmentGoldAmount).toBe(32);
    expect(goldValue).toBe(32);
    
    console.log('✅ All values should be 32 GP');
  });
});
