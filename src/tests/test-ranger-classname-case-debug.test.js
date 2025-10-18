import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the necessary globals
global.game = {
  settings: { get: vi.fn() },
  i18n: { localize: vi.fn((key) => key) }
};
global.ui = { notifications: { error: vi.fn(), warn: vi.fn(), info: vi.fn() } };
global.Hooks = { call: vi.fn(), on: vi.fn(), once: vi.fn() };
global.Actor = { create: vi.fn() };
global.window = global;
global.window.GAS = { 
  log: { d: vi.fn(), w: vi.fn(), e: vi.fn(), g: vi.fn() },
  dnd5eRules: '2014'
};

// Import the JSON data
import spellsKnownData from '../stores/spellsKnown.json';

describe('Ranger Class Name Case Sensitivity Debug', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should debug class name lookup with different cases', () => {
    console.log('\n=== CLASS NAME CASE SENSITIVITY DEBUG ===\n');
    
    const level2Data = spellsKnownData.levels.find(l => l.level === 2);
    const level3Data = spellsKnownData.levels.find(l => l.level === 3);
    
    console.log('Available classes in level 2 data:', Object.keys(level2Data));
    console.log('');
    
    // Test different class name variations
    const variations = ['ranger', 'Ranger', 'RANGER', 'RaNgEr'];
    
    for (const className of variations) {
      console.log(`Testing className: "${className}"`);
      console.log(`  level2Data["${className}"]:`, level2Data[className]);
      console.log(`  level2Data[className.toLowerCase()]:`, level2Data[className.toLowerCase()]);
      console.log('');
    }
    
    // Simulate what happens in spellLimits derived store
    const testCases = [
      { className: 'ranger', expected: { level2: '0 / 2', level3: '0 / 3' } },
      { className: 'Ranger', expected: { level2: '0 / 2', level3: '0 / 3' } }
    ];
    
    for (const testCase of testCases) {
      console.log(`\nTest Case: className = "${testCase.className}"`);
      
      const oldLevel = 2;
      const newLevel = 3;
      const rulesVersion = '2014';
      
      // Without normalization (current code)
      const oldClassData = level2Data[testCase.className]?.[rulesVersion];
      const newClassData = level3Data[testCase.className]?.[rulesVersion];
      
      console.log(`  Old class data (direct lookup): ${oldClassData}`);
      console.log(`  New class data (direct lookup): ${newClassData}`);
      
      if (!oldClassData || !newClassData) {
        console.log('  ❌ FAILED: Data not found with direct lookup');
        
        // Try with toLowerCase
        const oldClassDataLower = level2Data[testCase.className.toLowerCase()]?.[rulesVersion];
        const newClassDataLower = level3Data[testCase.className.toLowerCase()]?.[rulesVersion];
        
        console.log(`  Old class data (lowercase): ${oldClassDataLower}`);
        console.log(`  New class data (lowercase): ${newClassDataLower}`);
        
        if (oldClassDataLower && newClassDataLower) {
          console.log('  ✅ FIXED: Data found with toLowerCase()');
          
          // Calculate the spell limits
          const [oldCantrips, oldSpells] = oldClassDataLower.split(' / ');
          const [newCantrips, newSpells] = newClassDataLower.split(' / ');
          
          const cantripDiff = Math.max(0, parseInt(newCantrips) - parseInt(oldCantrips));
          const spellDiff = Math.max(0, parseInt(newSpells) - parseInt(oldSpells));
          
          console.log(`  Cantrip difference: ${cantripDiff} (should be 0)`);
          console.log(`  Spell difference: ${spellDiff} (should be 1)`);
        }
      } else {
        console.log('  ✅ SUCCESS: Data found with direct lookup');
        
        const [oldCantrips, oldSpells] = oldClassData.split(' / ');
        const [newCantrips, newSpells] = newClassData.split(' / ');
        
        const cantripDiff = Math.max(0, parseInt(newCantrips) - parseInt(oldCantrips));
        const spellDiff = Math.max(0, parseInt(newSpells) - parseInt(oldSpells));
        
        console.log(`  Cantrip difference: ${cantripDiff} (should be 0)`);
        console.log(`  Spell difference: ${spellDiff} (should be 1)`);
      }
    }
    
    console.log('\n=== END DEBUG ===\n');
  });
});
