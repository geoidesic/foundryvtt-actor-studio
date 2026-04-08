import { describe, it, expect, vi } from 'vitest';

// Mock the necessary globals
global.window = global;
global.window.GAS = { 
  log: { d: vi.fn(), w: vi.fn(), e: vi.fn() },
  dnd5eRules: '2014'
};

// Import the JSON data
import spellsKnownData from '../stores/spellsKnown.json';

describe('Ranger Level 2→3 Spell Limits Calculation Bug', () => {
  it('should demonstrate the exact bug with Ranger 2→3 spell limits', () => {
    console.log('\n🐛 DEBUGGING RANGER 2→3 SPELL LIMITS BUG\n');
    console.log('Expected UI: Cantrips: 0/0, Spells: 0/1');
    console.log('Actual UI:   Cantrips: 0/2, Spells: 0/0');
    console.log('');
    
    // Simulate the exact scenario
    const oldLevel = 2;
    const newLevel = 3;
    const classNameLower = 'ranger';
    const rulesVersion = '2014';
    
    // Get spell data for both levels
    const oldLevelData = spellsKnownData.levels.find(l => l.level === oldLevel);
    const newLevelData = spellsKnownData.levels.find(l => l.level === newLevel);
    
    console.log('📊 Raw data from spellsKnown.json:');
    console.log(`  Level ${oldLevel}: ${oldLevelData[classNameLower][rulesVersion]}`);
    console.log(`  Level ${newLevel}: ${newLevelData[classNameLower][rulesVersion]}`);
    console.log('');
    
    // Get version-specific data
    const oldClassData = oldLevelData[classNameLower][rulesVersion];
    const newClassData = newLevelData[classNameLower][rulesVersion];
    
    console.log('🔍 Parsing the data:');
    console.log(`  oldClassData: "${oldClassData}"`);
    console.log(`  newClassData: "${newClassData}"`);
    console.log('');
    
    const parseSpellsOnly = (rawValue) => {
      if (typeof rawValue !== 'string') return 0;
      const compact = rawValue.replace(/\s+/g, '');
      const spellsToken = compact.includes('/') ? compact.split('/')[1] : compact;
      return Number.parseInt(spellsToken, 10) || 0;
    };

    // Parse old level limits (spellsKnown now stores spells-only values)
    const oldCantripCount = 0;
    const oldSpellCount = parseSpellsOnly(oldClassData);
    
    console.log('📝 Old level (2) parsed values:');
    console.log(`  oldCantripCount: ${oldCantripCount}`);
    console.log(`  oldSpellCount: ${oldSpellCount}`);
    console.log('');
    
    // Parse new level limits
    const newCantripCount = 0;
    const newSpellCount = parseSpellsOnly(newClassData);
    
    console.log('📝 New level (3) parsed values:');
    console.log(`  newCantripCount: ${newCantripCount}`);
    console.log(`  newSpellCount: ${newSpellCount}`);
    console.log('');
    
    // Calculate the difference (new spells gained on level up)
    const cantripDifference = Math.max(0, newCantripCount - oldCantripCount);
    const spellDifference = Math.max(0, newSpellCount - oldSpellCount);
    
    console.log('🧮 Calculated differences (what UI should show):');
    console.log(`  Cantrip difference: ${newCantripCount} - ${oldCantripCount} = ${cantripDifference}`);
    console.log(`  Spell difference: ${newSpellCount} - ${oldSpellCount} = ${spellDifference}`);
    console.log('');
    
    console.log('✅ CORRECT VALUES:');
    console.log(`  Cantrips: 0/${cantripDifference} (should be 0/0)`);
    console.log(`  Spells: 0/${spellDifference} (should be 0/1)`);
    console.log('');
    
    // Verify expectations
    expect(cantripDifference).toBe(0);
    expect(spellDifference).toBe(1);
    
    console.log('🔴 BUG: If UI shows Cantrips: 0/2, it means:');
    console.log('  - The code is using newSpellCount (2) instead of cantripDifference (0)');
    console.log('  - OR the cantrips/spells values are being assigned incorrectly');
    console.log('');
    
    console.log('💡 HYPOTHESIS:');
    console.log('  The return value { cantrips, spells } might be getting');
    console.log('  the TOTAL counts instead of the DIFFERENCE counts.');
    console.log('  OR there\'s a separate code path not using this calculation.');
    console.log('');
  });
});
