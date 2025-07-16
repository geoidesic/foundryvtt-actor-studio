#!/usr/bin/env node

/**
 * Debug script to test spell loading outside of FoundryVTT
 * This will help us understand what's happening in the spell loading process
 */

console.log('🔍 DEBUG: Testing spell loading...');

// Mock FoundryVTT globals that the code expects
global.game = {
  settings: {
    get: (module, key) => {
      if (key === 'spells') {
        console.log('[DEBUG] Mock game.settings.get called for spells');
        return 'dnd5e.spells'; // Return a mock compendium name
      }
      return null;
    }
  },
  packs: new Map([
    ['dnd5e.spells', {
      collection: 'dnd5e.spells',
      getDocuments: async () => {
        console.log('[DEBUG] Mock pack.getDocuments() called');
        return [
          {
            id: 'spell1',
            name: 'Fireball',
            type: 'spell',
            uuid: 'Compendium.dnd5e.spells.Item.spell1',
            img: 'icons/magic/fire/projectile-fireball-orange-red.webp',
            labels: { classes: 'Wizard, Sorcerer' },
            system: { level: 3, school: 'evocation' }
          },
          {
            id: 'spell2', 
            name: 'Cure Wounds',
            type: 'spell',
            uuid: 'Compendium.dnd5e.spells.Item.spell2',
            img: 'icons/magic/life/heart-cross-strong-red.webp',
            labels: { classes: 'Cleric, Bard, Druid' },
            system: { level: 1, school: 'evocation' }
          },
          {
            id: 'spell3',
            name: 'Magic Missile',
            type: 'spell', 
            uuid: 'Compendium.dnd5e.spells.Item.spell3',
            img: 'icons/magic/air/projectile-missile-gray.webp',
            labels: { classes: 'Wizard, Sorcerer' },
            system: { level: 1, school: 'evocation' }
          }
        ];
      },
      getIndex: async (options) => {
        console.log('[DEBUG] Mock pack.getIndex() called with:', options);
        return new Map([
          ['spell1', { _id: 'spell1', name: 'Fireball', type: 'spell', uuid: 'spell1', system: { level: 3, school: 'evocation' }}],
          ['spell2', { _id: 'spell2', name: 'Cure Wounds', type: 'spell', uuid: 'spell2', system: { level: 1, school: 'evocation' }}],
          ['spell3', { _id: 'spell3', name: 'Magic Missile', type: 'spell', uuid: 'spell3', system: { level: 1, school: 'evocation' }}]
        ]);
      }
    }]
  ])
};

global.window = {
  GAS: {
    log: {
      d: (...args) => console.log('[GAS.log.d]', ...args)
    }
  }
};

// Mock the getPacksFromSettings function
function mockGetPacksFromSettings(settingKey) {
  console.log('[DEBUG] mockGetPacksFromSettings called with:', settingKey);
  if (settingKey === 'spells') {
    return [global.game.packs.get('dnd5e.spells')];
  }
  return [];
}

// Mock the availableSpells store
const mockAvailableSpells = {
  set: (spells) => {
    console.log('[DEBUG] availableSpells.set() called with', spells.length, 'spells');
    console.log('[DEBUG] First 3 spells:', spells.slice(0, 3).map(s => ({ name: s.name, level: s.system?.level })));
  }
};

// Create a simplified version of the loadAvailableSpells function
async function testLoadAvailableSpells(characterClassName = null) {
  try {
    // Get spell compendium sources from settings
    const packs = mockGetPacksFromSettings("spells");

    if (!packs || packs.length === 0) {
      mockAvailableSpells.set([]);
      console.warn("No spell compendiums configured");
      return;
    }

    console.log('[DEBUG] Loading spells, character class:', characterClassName);
    console.log('[DEBUG] Number of packs:', packs.length);

    let allSpells = [];

    for (const pack of packs) {
      console.log('[DEBUG] Processing pack:', pack.collection);
      
      if (characterClassName) {
        console.log('[DEBUG] Using class filtering for:', characterClassName);
        
        // Load all documents from the pack
        const allDocs = await pack.getDocuments();
        console.log('[DEBUG] Loaded documents count:', allDocs.length);
        
        const filteredSpells = [];
        
        // Debug: Check first few documents to see their structure
        console.log('[DEBUG] First 3 documents:', allDocs.slice(0, 3).map(doc => ({
          name: doc.name,
          type: doc.type,
          hasLabels: !!doc.labels,
          labelsClasses: doc.labels?.classes
        })));
        
        // Filter by class and convert to our format
        for (const doc of allDocs) {
          if (doc.type === "spell" && doc.labels && doc.labels.classes) {
            const spellClasses = doc.labels.classes;
            
            console.log(`[DEBUG] Checking spell ${doc.name}:`, {
              spellClasses,
              characterClassName,
              match: typeof spellClasses === 'string' ? 
                (spellClasses.includes(characterClassName) || 
                 spellClasses.toLowerCase().includes(characterClassName.toLowerCase()) ||
                 spellClasses.trim().length === 0) : false
            });
            
            // Check if the character class is in the spell's class string
            const availableToClass = typeof spellClasses === 'string'
              ? spellClasses.includes(characterClassName) ||
                spellClasses.toLowerCase().includes(characterClassName.toLowerCase()) ||
                spellClasses.trim().length === 0 // No restrictions (empty string)
              : false;
            
            if (availableToClass) {
              // Create spell object with enhanced data
              const spellObj = {
                _id: doc.id,
                name: doc.name,
                img: doc.img,
                type: doc.type,
                uuid: doc.uuid,
                system: {
                  level: doc.system.level,
                  school: doc.system.school
                },
                labels: doc.labels
              };
              filteredSpells.push(spellObj);
              console.log(`[DEBUG] ✅ Added spell: ${doc.name}`);
            } else {
              console.log(`[DEBUG] ❌ Skipped spell: ${doc.name}`);
            }
          }
        }
        
        allSpells.push(...filteredSpells);
        console.log(`[DEBUG] Filtered ${filteredSpells.length} spells for class ${characterClassName} from ${pack.collection}`);
        
      } else {
        console.log('[DEBUG] No class filtering - loading all spells');
        
        // Get basic index with system properties
        const index = await pack.getIndex({fields: ['system.level', 'system.school']});
        
        // Convert index to array for processing
        const indexEntries = Array.from(index.values());
        
        const spells = indexEntries
          .filter(entry => entry.type === "spell")
          .map(entry => ({
            _id: entry._id,
            name: entry.name,
            img: entry.img,
            type: entry.type,
            uuid: entry.uuid,
            system: {
              level: entry.system?.level || 0,
              school: entry.system?.school || 'unknown'
            }
          }));
          
        allSpells.push(...spells);
        console.log(`[DEBUG] Loaded ${spells.length} spells (index only) from ${pack.collection}`);
      }
    }

    // Handle duplicates
    const seenSpells = new Map();
    const uniqueSpells = [];
    for (const spell of allSpells) {
      const uniqueKey = spell.name.toLowerCase();
      if (!seenSpells.has(uniqueKey)) {
        uniqueSpells.push(spell);
        seenSpells.set(uniqueKey, true);
      }
    }

    // Sort spells by level, then by name
    uniqueSpells.sort((a, b) => {
      const levelA = a.system?.level || 0;
      const levelB = b.system?.level || 0;
      if (levelA !== levelB) {
        return levelA - levelB;
      }
      return a.name.localeCompare(b.name);
    });

    // Update the store with spells
    mockAvailableSpells.set(uniqueSpells);
    console.log('[DEBUG] FINAL RESULT: Set availableSpells store with', uniqueSpells.length, 'spells');

  } catch (error) {
    console.error("Error loading available spells:", error);
    mockAvailableSpells.set([]);
  }
}

// Test the function
async function runTests() {
  console.log('\n🧙‍♀️ Test 1: Loading spells for Wizard');
  await testLoadAvailableSpells('Wizard');
  
  console.log('\n🎵 Test 2: Loading spells for Bard');
  await testLoadAvailableSpells('Bard');
  
  console.log('\n📚 Test 3: Loading all spells (no filtering)');
  await testLoadAvailableSpells(null);
}

runTests().then(() => {
  console.log('\n✅ All tests completed!');
}).catch(error => {
  console.error('❌ Test failed:', error);
});
