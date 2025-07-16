/**
 * Spell Configuration Diagnostic Tool
 * 
 * Run this in the FoundryVTT browser console to diagnose spell loading issues.
 * Copy and paste this entire function into the console and then call: diagnoseSpellIssues()
 */

window.diagnoseSpellIssues = function() {
  console.log('🔍 DIAGNOSING SPELL LOADING ISSUES...\n');
  
  // 1. Check if module is loaded
  console.log('1. Module Status:');
  const moduleActive = game.modules.get('foundryvtt-actor-studio')?.active;
  console.log(`   Actor Studio Module: ${moduleActive ? '✅ Active' : '❌ Inactive'}`);
  
  if (!moduleActive) {
    console.log('❌ PROBLEM: Actor Studio module is not active. Enable it and reload.');
    return;
  }
  
  // 2. Check compendium settings
  console.log('\n2. Compendium Settings:');
  try {
    const settings = game.settings.get('foundryvtt-actor-studio', 'compendiumSources');
    console.log('   Settings object:', settings);
    
    if (!settings) {
      console.log('❌ PROBLEM: No compendium settings found. Configure spell compendiums in module settings.');
      return;
    }
    
    if (!settings.spells || settings.spells.length === 0) {
      console.log('❌ PROBLEM: No spell compendiums configured.');
      console.log('   SOLUTION: Go to Module Settings → Actor Studio → Configure spell compendiums');
      return;
    }
    
    console.log(`   Configured spell compendiums: ${settings.spells.length}`);
    settings.spells.forEach((packName, i) => {
      console.log(`     ${i + 1}. ${packName}`);
    });
    
  } catch (error) {
    console.log('❌ ERROR: Could not read compendium settings:', error);
    return;
  }
  
  // 3. Check if spell packs exist
  console.log('\n3. Spell Pack Validation:');
  const settings = game.settings.get('foundryvtt-actor-studio', 'compendiumSources');
  const validPacks = [];
  
  settings.spells.forEach((packName, i) => {
    const pack = game.packs.get(packName);
    if (pack) {
      console.log(`   ${i + 1}. ${packName}: ✅ Found (${pack.title})`);
      validPacks.push(pack);
    } else {
      console.log(`   ${i + 1}. ${packName}: ❌ Missing`);
    }
  });
  
  if (validPacks.length === 0) {
    console.log('❌ PROBLEM: No valid spell packs found. Check your compendium configuration.');
    return;
  }
  
  // 4. Check pack contents
  console.log('\n4. Pack Contents Check:');
  const testPack = validPacks[0];
  console.log(`   Testing first pack: ${testPack.collection}`);
  
  testPack.getDocuments().then(docs => {
    const spells = docs.filter(d => d.type === 'spell');
    console.log(`   Total documents: ${docs.length}`);
    console.log(`   Spell documents: ${spells.length}`);
    
    if (spells.length === 0) {
      console.log('❌ PROBLEM: Pack contains no spells');
      return;
    }
    
    // Check first few spells for labels.classes
    const spellsWithClasses = spells.filter(s => s.labels && s.labels.classes);
    console.log(`   Spells with class info: ${spellsWithClasses.length}`);
    
    if (spellsWithClasses.length > 0) {
      console.log('   Sample spells:');
      spellsWithClasses.slice(0, 3).forEach(spell => {
        console.log(`     - ${spell.name}: "${spell.labels.classes}"`);
      });
    }
    
    // 5. Test actual loading
    console.log('\n5. Testing loadAvailableSpells function:');
    if (window.GAS && window.GAS.loadAvailableSpells) {
      console.log('   Found loadAvailableSpells function, testing...');
      
      window.GAS.loadAvailableSpells('Wizard').then(() => {
        // Check store
        const storeValue = new Promise((resolve) => {
          const unsubscribe = window.GAS.availableSpells.subscribe(value => {
            unsubscribe();
            resolve(value);
          });
        });
        
        storeValue.then(spells => {
          console.log(`   ✅ SUCCESS: loadAvailableSpells loaded ${spells.length} spells for Wizard`);
          if (spells.length > 0) {
            console.log('   Sample loaded spells:');
            spells.slice(0, 3).forEach(spell => {
              console.log(`     - ${spell.name} (Level ${spell.system?.level})`);
            });
          }
          
          console.log('\n🎉 DIAGNOSIS COMPLETE!');
          if (spells.length > 0) {
            console.log('✅ Spell loading is working correctly.');
            console.log('   If you\'re still having issues, check the Spells tab UI component.');
          } else {
            console.log('❌ Spells loaded but none match the character class.');
            console.log('   This might be a class filtering issue.');
          }
        });
        
      }).catch(error => {
        console.log(`   ❌ ERROR: loadAvailableSpells failed:`, error);
      });
      
    } else {
      console.log('   ❌ PROBLEM: loadAvailableSpells function not found');
      console.log('   Make sure the module loaded correctly');
    }
    
  }).catch(error => {
    console.log(`   ❌ ERROR: Could not load pack documents:`, error);
  });
};

console.log('🛠️ Spell diagnostic tool loaded!');
console.log('Run: diagnoseSpellIssues()');
