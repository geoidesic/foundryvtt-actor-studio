import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('Fighter Variable Gold Debug', () => {
  it('should show Fighter variable gold parsing correctly', async () => {
    // This is the Fighter class data with variable gold
    const fighterClass = {
      system: {
        description: {
          value: `<p><strong>Equipment:</strong> Choose A, B, or C: (A) Chain Mail, Shield, 5 Javelins, Dungeoneer's Pack, 4 GP; or (B) Leather Armor, Shield, 5 Javelins, Dungeoneer's Pack, 11 GP; or (C) 155 GP</p>`
        },
        wealth: 15
      }
    };

    const { parseEquipmentGoldOptions } = await import('~/src/stores/equipmentGold');
    
    // Step 1: Parse Fighter class
    const fighterParsed = parseEquipmentGoldOptions(fighterClass);
    console.log('Fighter parsing result:', fighterParsed);
    
    // Should be variable gold with three options
    expect(fighterParsed.hasVariableGold).toBe(true);
    expect(fighterParsed.goldOptions).toHaveLength(3);
    expect(fighterParsed.goldOptions[0].goldAmount).toBe(4);   // Choice A
    expect(fighterParsed.goldOptions[1].goldAmount).toBe(11);  // Choice B
    expect(fighterParsed.goldOptions[2].goldAmount).toBe(155); // Choice C
    
    console.log('✅ Fighter variable gold parsing working correctly');
    console.log('Choice A:', fighterParsed.goldOptions[0]);
    console.log('Choice B:', fighterParsed.goldOptions[1]);
    console.log('Choice C:', fighterParsed.goldOptions[2]);
  });
});
