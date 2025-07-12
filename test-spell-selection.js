// Minimal test to reproduce the spell selection bug
// This extracts just the critical logic without complex imports

console.log('=== Minimal Spell Selection Bug Test ===');

// Mock globals
global.game = {
  settings: {
    get: (module, key) => {
      if (key === 'enableSpellSelection') return true;
      return false;
    }
  }
};

global.window = {
  GAS: {
    log: {
      d: (...args) => console.log('[DEBUG]', ...args),
      w: (...args) => console.warn('[WARN]', ...args),
      e: (...args) => console.error('[ERROR]', ...args)
    }
  }
};

// Extract the critical _shouldShowSpellSelection logic
function shouldShowSpellSelection(actor) {
  console.log('\n🔍 === SPELL SELECTION CHECK ===');
  console.log('Actor received:', JSON.stringify(actor, null, 2));
  
  window.GAS?.log?.d?.('[WORKFLOW] _shouldShowSpellSelection called with actor:', actor);
  
  const enableSpellSelection = game.settings.get('foundryvtt-actor-studio', 'enableSpellSelection');
  window.GAS?.log?.d?.('[WORKFLOW] Spell selection setting enabled:', enableSpellSelection);
  
  if (!enableSpellSelection) {
    window.GAS?.log?.d?.('[WORKFLOW] Spell selection disabled in settings');
    return false;
  }
  
  if (!actor) {
    window.GAS?.log?.w?.('[WORKFLOW] No actor provided for spell selection check');
    return false;
  }
  
  // Check if actor is a spellcaster using the same logic as workflow.js
  const classes = actor.classes || {};
  const classKeys = Object.keys(classes);
  window.GAS?.log?.d?.('[WORKFLOW] Actor classes found:', classKeys);
  
  if (!classKeys.length) {
    window.GAS?.log?.d?.('[WORKFLOW] No classes found on actor');
    return false;
  }
  
  // Check each class for spellcasting capability
  const spellcastingInfo = Object.entries(classes).map(([className, classData]) => {
    const progression = classData?.system?.spellcasting?.progression;
    window.GAS?.log?.d?.(`[WORKFLOW] Class ${className} spellcasting progression:`, progression);
    return { className, progression, isSpellcaster: progression && progression !== "none" };
  });
  
  const isSpellcaster = spellcastingInfo.some(info => info.isSpellcaster);
  
  window.GAS?.log?.d?.('[WORKFLOW] Spellcasting analysis:', spellcastingInfo);
  
  // FAILSAFE: Check for known spellcasting classes by name if progression check fails
  if (!isSpellcaster) {
    const knownSpellcastingClasses = [
      'bard', 'cleric', 'druid', 'paladin', 'ranger', 'sorcerer', 'warlock', 'wizard',
      'artificer', 'aberrantmind', 'arcanetrickster', 'eldritchknight'
    ];
    
    const hasKnownSpellcastingClass = classKeys.some(className => 
      knownSpellcastingClasses.includes(className.toLowerCase())
    );
    
    if (hasKnownSpellcastingClass) {
      window.GAS?.log?.w?.('[WORKFLOW] FAILSAFE: Found known spellcasting class, showing spells despite progression check failure');
      window.GAS?.log?.w?.('[WORKFLOW] Known spellcasting class found in:', classKeys);
      return true;
    }
  }
  
  window.GAS?.log?.d?.('[WORKFLOW] Actor is spellcaster:', isSpellcaster);
  window.GAS?.log?.d?.('[WORKFLOW] Spell selection check complete. Result:', isSpellcaster);
  console.log(`\n✅ SPELL SELECTION RESULT: ${isSpellcaster}`);
  return isSpellcaster;
}

// Test various bard actor structures that might be causing the bug
console.log('\n🧪 Testing different actor structures...\n');

// Test 1: Perfect bard structure (should work)
console.log('TEST 1: Perfect bard structure');
const perfectBard = {
  name: 'Perfect Bard',
  classes: {
    bard: {
      system: {
        spellcasting: {
          progression: 'full'
        }
      }
    }
  }
};
const result1 = shouldShowSpellSelection(perfectBard);
console.log(`Result: ${result1 ? 'PASS ✅' : 'FAIL ❌'}\n`);

// Test 2: Bard with missing progression (should trigger failsafe)
console.log('TEST 2: Bard with missing progression');
const bardMissingProgression = {
  name: 'Bard Missing Progression',
  classes: {
    bard: {
      system: {
        spellcasting: {}
      }
    }
  }
};
const result2 = shouldShowSpellSelection(bardMissingProgression);
console.log(`Result: ${result2 ? 'PASS ✅' : 'FAIL ❌'}\n`);

// Test 3: Bard with null progression
console.log('TEST 3: Bard with null progression');
const bardNullProgression = {
  name: 'Bard Null Progression',
  classes: {
    bard: {
      system: {
        spellcasting: {
          progression: null
        }
      }
    }
  }
};
const result3 = shouldShowSpellSelection(bardNullProgression);
console.log(`Result: ${result3 ? 'PASS ✅' : 'FAIL ❌'}\n`);

// Test 4: Bard with "none" progression
console.log('TEST 4: Bard with "none" progression');
const bardNoneProgression = {
  name: 'Bard None Progression',
  classes: {
    bard: {
      system: {
        spellcasting: {
          progression: 'none'
        }
      }
    }
  }
};
const result4 = shouldShowSpellSelection(bardNoneProgression);
console.log(`Result: ${result4 ? 'PASS ✅' : 'FAIL ❌'}\n`);

// Test 5: Bard with missing system
console.log('TEST 5: Bard with missing system');
const bardMissingSystem = {
  name: 'Bard Missing System',
  classes: {
    bard: {}
  }
};
const result5 = shouldShowSpellSelection(bardMissingSystem);
console.log(`Result: ${result5 ? 'PASS ✅' : 'FAIL ❌'}\n`);

// Test 6: Bard with empty classes
console.log('TEST 6: Actor with empty classes');
const emptyClasses = {
  name: 'Empty Classes',
  classes: {}
};
const result6 = shouldShowSpellSelection(emptyClasses);
console.log(`Result: ${result6 ? 'PASS ✅' : 'FAIL ❌'}\n`);

// Test 7: Actor with no classes property
console.log('TEST 7: Actor with no classes property');
const noClasses = {
  name: 'No Classes'
};
const result7 = shouldShowSpellSelection(noClasses);
console.log(`Result: ${result7 ? 'PASS ✅' : 'FAIL ❌'}\n`);

// Summary
console.log('='.repeat(50));
console.log('📊 SUMMARY:');
console.log(`Perfect structure: ${result1 ? 'PASS' : 'FAIL'}`);
console.log(`Missing progression: ${result2 ? 'PASS' : 'FAIL'}`);
console.log(`Null progression: ${result3 ? 'PASS' : 'FAIL'}`);
console.log(`"none" progression: ${result4 ? 'PASS' : 'FAIL'}`);
console.log(`Missing system: ${result5 ? 'PASS' : 'FAIL'}`);
console.log(`Empty classes: ${result6 ? 'PASS' : 'FAIL'}`);
console.log(`No classes: ${result7 ? 'PASS' : 'FAIL'}`);
console.log('='.repeat(50));

console.log('\n🔍 ANALYSIS:');
console.log('Tests 1-5 should pass due to failsafe logic (bard class name detected)');
console.log('Tests 6-7 should fail (no classes to detect)');
console.log('If any of tests 1-5 fail, we found a bug in the logic!');
