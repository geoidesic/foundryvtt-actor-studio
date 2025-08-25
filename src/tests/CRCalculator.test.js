// Test file for CRCalculator
// Run with: bun src/tests/CRCalculator.test.js

import { CRCalculator } from '../helpers/CRCalculator.js';

// Mock NPC data for testing
const mockNPCs = {
  // CR 1/4 NPC (Goblin-like)
  goblin: {
    system: {
      attributes: {
        hp: { max: 7, value: 7 },
        ac: { value: 15 }
      },
      details: {
        cr: 0.25
      },
      items: [
        {
          type: 'weapon',
          system: {
            attack: { bonus: 4 },
            damage: { parts: [['1d6+2']] }
          }
        }
      ]
    }
  },
  
  // CR 1 NPC (Orc-like)
  orc: {
    system: {
      attributes: {
        hp: { max: 15, value: 15 },
        ac: { value: 13 }
      },
      details: {
        cr: 1
      },
      items: [
        {
          type: 'weapon',
          system: {
            attack: { bonus: 5 },
            damage: { parts: [['1d12+3']] }
          }
        }
      ]
    }
  },
  
  // CR 3 NPC (Hobgoblin-like)
  hobgoblin: {
    system: {
      attributes: {
        hp: { max: 27, value: 27 },
        ac: { value: 18 }
      },
      details: {
        cr: 3
      },
      items: [
        {
          type: 'weapon',
          system: {
            attack: { bonus: 6 },
            damage: { parts: [['1d8+3']] }
          }
        }
      ]
    }
  }
};

// Simple test runner
function runTests() {
  console.log('🧪 Running CRCalculator tests...\n');
  
  let passed = 0;
  let total = 0;
  
  // Test 1: CR calculation for goblin
  total++;
  try {
    console.log('Test 1: CR calculation for goblin...');
    const result = CRCalculator.calculateCurrentCR(mockNPCs.goblin);
    console.log('  Result:', result);
    
    if (result.defensiveCR > 0 && result.offensiveCR > 0 && result.finalCR > 0) {
      console.log('  ✅ Passed');
      passed++;
    } else {
      console.log('  ❌ Failed');
    }
  } catch (error) {
    console.log('  ❌ Error:', error.message);
  }
  
  // Test 2: Damage formula calculation
  total++;
  try {
    console.log('\nTest 2: Damage formula calculation...');
    const damage = CRCalculator.calculateDamageFormula('2d6+3');
    console.log('  2d6+3 average damage:', damage);
    
    if (damage === 10) {
      console.log('  ✅ Passed');
      passed++;
    } else {
      console.log('  ❌ Failed - expected 10, got', damage);
    }
  } catch (error) {
    console.log('  ❌ Error:', error.message);
  }
  
  // Test 3: CR tables validation
  total++;
  try {
    console.log('\nTest 3: CR tables validation...');
    const hasTables = CRCalculator.CR_TABLES.defensive && CRCalculator.CR_TABLES.offensive;
    const hasXP = CRCalculator.XP_VALUES && Object.keys(CRCalculator.XP_VALUES).length > 0;
    const hasPB = CRCalculator.PROFICIENCY_BONUS && Object.keys(CRCalculator.PROFICIENCY_BONUS).length > 0;
    
    console.log('  Tables exist:', hasTables);
    console.log('  XP values exist:', hasXP);
    console.log('  Proficiency bonus exists:', hasPB);
    
    if (hasTables && hasXP && hasPB) {
      console.log('  ✅ Passed');
      passed++;
    } else {
      console.log('  ❌ Failed');
    }
  } catch (error) {
    console.log('  ❌ Error:', error.message);
  }
  
  // Test 4: CR adjustment
  total++;
  try {
    console.log('\nTest 4: CR adjustment...');
    const updates = CRCalculator.adjustActorToCR(mockNPCs.goblin, 1);
    console.log('  Updates generated:', Object.keys(updates).length);
    
    if (updates && typeof updates === 'object' && updates['system.details.cr'] === 1) {
      console.log('  ✅ Passed');
      passed++;
    } else {
      console.log('  ❌ Failed');
    }
  } catch (error) {
    console.log('  ❌ Error:', error.message);
  }
  
  // Test 5: Invalid CR handling
  total++;
  try {
    console.log('\nTest 5: Invalid CR handling...');
    const updates = CRCalculator.adjustActorToCR(mockNPCs.goblin, 999);
    console.log('  Invalid CR result:', updates === mockNPCs.goblin ? 'Original actor returned' : 'Unexpected result');
    
    if (updates === mockNPCs.goblin) {
      console.log('  ✅ Passed');
      passed++;
    } else {
      console.log('  ❌ Failed');
    }
  } catch (error) {
    console.log('  ❌ Error:', error.message);
  }
  
  // Summary
  console.log('\n📊 Test Summary');
  console.log('===============');
  console.log(`Tests passed: ${passed}/${total}`);
  console.log(`Success rate: ${Math.round((passed / total) * 100)}%`);
  
  if (passed === total) {
    console.log('\n🎉 All tests passed! The CR calculator is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the implementation.');
  }
  
  return passed === total;
}

// Run tests if this file is executed directly
if (import.meta.main) {
  runTests();
}
