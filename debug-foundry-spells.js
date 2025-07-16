// Test script to check spell loading in actual FoundryVTT environment
// This should be run in the browser console within FoundryVTT

console.log('🔍 SPELL DEBUG: Checking configuration...');

// Check module settings
const settings = game.settings.get('foundryvtt-actor-studio', 'compendiumSources');
console.log('Module settings:', settings);

if (settings && settings.spells) {
  console.log('Spell compendiums configured:', settings.spells);
  
  // Check if the packs actually exist
  settings.spells.forEach((packName, index) => {
    const pack = game.packs.get(packName);
    console.log(`Pack ${index + 1} (${packName}):`, pack ? '✅ Found' : '❌ Missing');
    if (pack) {
      console.log(`  - Collection: ${pack.collection}`);
      console.log(`  - Title: ${pack.title}`);
      console.log(`  - Entity: ${pack.entity || pack.documentName}`);
    }
  });
} else {
  console.log('❌ No spell compendiums configured in settings');
}

// Test getPacksFromSettings function
console.log('\n🧪 Testing getPacksFromSettings...');
const packs = window.GAS?.getPacksFromSettings ? 
  window.GAS.getPacksFromSettings('spells') : 
  'getPacksFromSettings not available';
console.log('getPacksFromSettings result:', packs);

if (Array.isArray(packs)) {
  console.log(`Found ${packs.length} spell packs`);
  packs.forEach((pack, index) => {
    console.log(`  Pack ${index + 1}: ${pack.collection} (${pack.title})`);
  });
} else {
  console.log('❌ getPacksFromSettings did not return an array');
}

// Test loadAvailableSpells function
console.log('\n🪄 Testing loadAvailableSpells...');
if (window.GAS?.loadAvailableSpells) {
  console.log('Calling loadAvailableSpells with "Wizard"...');
  window.GAS.loadAvailableSpells('Wizard').then(() => {
    console.log('loadAvailableSpells completed');
    
    // Check the store
    if (window.GAS?.availableSpells) {
      const subscription = window.GAS.availableSpells.subscribe((spells) => {
        console.log(`Available spells in store: ${spells.length}`);
        if (spells.length > 0) {
          console.log('First 5 spells:', spells.slice(0, 5).map(s => ({
            name: s.name,
            level: s.system?.level,
            classes: s.labels?.classes
          })));
        }
      });
      
      // Unsubscribe after logging
      setTimeout(() => subscription(), 1000);
    } else {
      console.log('❌ availableSpells store not available');
    }
  }).catch(error => {
    console.error('❌ loadAvailableSpells failed:', error);
  });
} else {
  console.log('❌ loadAvailableSpells function not available');
}
