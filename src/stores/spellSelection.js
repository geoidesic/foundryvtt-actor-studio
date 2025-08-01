import { writable, derived, get } from 'svelte/store';
import { MODULE_ID } from '~/src/helpers/constants';
import { getPacksFromSettings, extractItemsFromPacksAsync } from '~/src/helpers/Utility';
import { readOnlyTabs, characterClass, isLevelUp, newLevelValueForExistingClass } from '~/src/stores/index';

// Import spellsKnown data for determining spell limits
import spellsKnownData from './spellsKnown.json';

// Store for managing the state of spell selection

// List of spells available for selection, fetched from selected compendiums
export const availableSpells = writable([]);

// Spells currently selected (Map<spellId, { itemData }>)
export const selectedSpells = writable(new Map());

// Current character for spellcasting detection
export const currentCharacter = writable(null);

// Derived store to check if character is a spellcaster
export const isSpellcaster = derived(
  [currentCharacter],
  ([$currentCharacter]) => {
    if (!$currentCharacter) return false;

    const actorData = $currentCharacter.system || $currentCharacter.data?.data;
    if (!actorData) return false;

    // Check for spellcasting in the actor system
    return actorData.spellcasting && Object.keys(actorData.spellcasting).length > 0;
  }
);

// Derived store to get maximum spell level character can cast
export const maxSpellLevel = derived(
  [currentCharacter, isLevelUp, newLevelValueForExistingClass],
  ([$currentCharacter, $isLevelUp, $newLevelValueForExistingClass]) => {
    if (!$currentCharacter) return 0;

    const actorData = $currentCharacter.system || $currentCharacter.data?.data;
    if (!actorData?.spellcasting) return 0;

    // Find the highest spell level available based on spellcasting progression
    let maxLevel = 0;
    Object.values(actorData.spellcasting).forEach(spellcastingData => {
      if (spellcastingData.slots) {
        Object.keys(spellcastingData.slots).forEach(slot => {
          const slotLevel = parseInt(slot.replace('spell', ''));
          if (slotLevel > maxLevel && spellcastingData.slots[slot].max > 0) {
            maxLevel = slotLevel;
          }
        });
      }
    });

    return maxLevel;
  }
);

// Derived store for spell limits based on character class and level
export const spellLimits = derived(
  [characterClass, isLevelUp, newLevelValueForExistingClass],
  ([$characterClass, $isLevelUp, $newLevelValueForExistingClass]) => {
    // Calculate the effective character level for spell selection
    // For character creation: Always use level 1
    // For level-up: Use the new level value
    const effectiveCharacterLevel = $isLevelUp && $newLevelValueForExistingClass 
      ? $newLevelValueForExistingClass 
      : 1; // Character creation is always level 1
      
    if (!$characterClass || !effectiveCharacterLevel) {
      return { cantrips: 0, spells: 0 };
    }

    const className = $characterClass.name || $characterClass.label || $characterClass;
    
    // For level-up scenarios, calculate the difference between old and new levels
    if ($isLevelUp && $newLevelValueForExistingClass) {
      const oldLevel = $newLevelValueForExistingClass - 1; // Current level is new level - 1
      const newLevel = $newLevelValueForExistingClass;
      
      // Get spell data for both levels
      const oldLevelData = spellsKnownData.levels.find(l => l.level === oldLevel);
      const newLevelData = spellsKnownData.levels.find(l => l.level === newLevel);
      
      if (!oldLevelData || !newLevelData || !oldLevelData[className] || !newLevelData[className]) {
        return { cantrips: 0, spells: 0 };
      }
      
      // Parse old level limits
      const [oldCantrips, oldSpells] = oldLevelData[className].split(' / ');
      const oldCantripCount = parseInt(oldCantrips) || 0;
      const oldSpellCount = parseInt(oldSpells) || 0;
      const oldHasAllSpells = oldSpells === 'All';
      
      // Parse new level limits
      const [newCantrips, newSpells] = newLevelData[className].split(' / ');
      const newCantripCount = parseInt(newCantrips) || 0;
      const newSpellCount = parseInt(newSpells) || 0;
      const newHasAllSpells = newSpells === 'All';
      
      // Calculate the difference (new spells gained on level up)
      const cantripDifference = Math.max(0, newCantripCount - oldCantripCount);
      const spellDifference = oldHasAllSpells || newHasAllSpells ? 0 : Math.max(0, newSpellCount - oldSpellCount);
      
      return {
        cantrips: cantripDifference,
        spells: spellDifference,
        hasAllSpells: newHasAllSpells
      };
    } else {
      // Character creation scenario - use total spells for level 1
      const levelData = spellsKnownData.levels.find(l => l.level === 1);
      if (!levelData || !levelData[className]) {
        return { cantrips: 0, spells: 0 };
      }

      const [cantrips, spells] = levelData[className].split(' / ');
      return {
        cantrips: parseInt(cantrips) || 0,
        spells: parseInt(spells) || 0,
        hasAllSpells: spells === 'All'
      };
    }
  }
);

// Derived store for current spell counts
export const currentSpellCounts = derived(
  [selectedSpells],
  ([$selectedSpells]) => {
    const selectedSpellsList = Array.from($selectedSpells.values());
    const currentCantrips = selectedSpellsList.filter(s => (s.itemData.system?.level || 0) === 0).length;
    const currentSpells = selectedSpellsList.filter(s => (s.itemData.system?.level || 0) > 0).length;

    return {
      cantrips: currentCantrips,
      spells: currentSpells,
      total: currentCantrips + currentSpells
    };
  }
);

// Derived store for spell selection progress
export const spellProgress = derived(
  [spellLimits, currentSpellCounts, isLevelUp, characterClass, newLevelValueForExistingClass],
  ([$spellLimits, $currentSpellCounts, $isLevelUp, $characterClass, $newLevelValueForExistingClass]) => {
    // For classes that get "All" spells, only cantrips are required choices
    const hasAllSpells = $spellLimits.hasAllSpells;
    
    let totalRequired, totalSelected, progressPercentage, isComplete;
    
    // Special case: Level-up with no spell level increases for "All spells" classes
    if ($isLevelUp && hasAllSpells && $characterClass && $newLevelValueForExistingClass) {
      const className = $characterClass.name || $characterClass.label || $characterClass;
      
      // Calculate max spell levels for old and new levels
      const getMaxSpellLevelForClass = (level, className) => {
        const fullCasters = ['Bard', 'Cleric', 'Druid', 'Sorcerer', 'Wizard'];
        const halfCasters = ['Paladin', 'Ranger'];
        const thirdCasters = ['Arcane Trickster', 'Eldritch Knight'];
        const warlockProgression = ['Warlock'];
        
        if (fullCasters.includes(className)) {
          return Math.min(9, Math.ceil(level / 2));
        } else if (halfCasters.includes(className)) {
          return Math.min(5, Math.ceil((level - 1) / 4));
        } else if (thirdCasters.includes(className)) {
          return Math.min(4, Math.ceil((level - 2) / 6));
        } else if (warlockProgression.includes(className)) {
          if (level >= 17) return 5;
          if (level >= 11) return 3;
          if (level >= 7) return 2;
          if (level >= 1) return 1;
          return 0;
        } else if (className === 'Artificer') {
          if (level < 2) return 0;
          return Math.min(5, Math.ceil((level - 1) / 4));
        }
        return 0;
      };
      
      const oldMaxSpellLevel = getMaxSpellLevelForClass($newLevelValueForExistingClass - 1, className);
      const newMaxSpellLevel = getMaxSpellLevelForClass($newLevelValueForExistingClass, className);
      
      // If no new spell levels gained AND no new cantrips to select, mark as complete automatically
      if (newMaxSpellLevel <= oldMaxSpellLevel && $spellLimits.cantrips === 0) {
        return {
          totalRequired: 0,
          totalSelected: 0,
          progressPercentage: 100,
          isComplete: true,
          limits: $spellLimits,
          counts: $currentSpellCounts,
          hasAllSpells,
          noUpdatesNeeded: true
        };
      }
    }
    
    if (hasAllSpells) {
      // Classes with all spells: only count cantrips as required for progress
      // since they automatically get access to all other spells
      totalRequired = $spellLimits.cantrips;
      totalSelected = $currentSpellCounts.cantrips;
      
      if (totalRequired > 0) {
        progressPercentage = Math.round((totalSelected / totalRequired) * 100);
        isComplete = totalSelected >= totalRequired;
      } else {
        progressPercentage = 100;
        isComplete = true;
      }
    } else {
      // Regular spellcasters: count both cantrips and spells as required
      totalRequired = $spellLimits.cantrips + $spellLimits.spells;
      totalSelected = $currentSpellCounts.total;
      
      if (totalRequired > 0) {
        progressPercentage = Math.round((totalSelected / totalRequired) * 100);
        isComplete = totalSelected >= totalRequired;
      } else {
        progressPercentage = 100;
        isComplete = true;
      }
    }

    return {
      totalRequired,
      totalSelected,
      progressPercentage,
      isComplete,
      limits: $spellLimits,
      counts: $currentSpellCounts,
      hasAllSpells,
      noUpdatesNeeded: false
    };
  }
);

// Function to initialize character data for spell selection
export function initializeSpellSelection(actor) {
  try {
    // Clear previous spell selections to prevent persistence across characters
    selectedSpells.set(new Map());
    window.GAS.log.d('[SPELLS] Cleared previous spell selections');
    
    currentCharacter.set(actor);

    // Determine character level - check classes or use a default
    const actorData = actor.system || actor.data?.data;
    let level = 1;

    if (actorData.details?.level) {
      level = actorData.details.level;
    } else if (actorData.classes) {
      // Sum up class levels
      level = Object.values(actorData.classes).reduce((total, cls) => {
        return total + (cls.levels || cls.system?.levels || 0);
      }, 0);
    }

    window.GAS.log.d('[SPELLS] Initialized spell selection for level:', level);
    return level;
  } catch (error) {
    console.error('[SPELLS] Error initializing spell selection:', error);
    return 1;
  }
}

// Function to fetch spells from compendiums with hybrid approach for class filtering
export async function loadAvailableSpells(characterClassName = null) {
  try {
    // Get spell compendium sources from settings
    const packs = getPacksFromSettings("spells");

    console.log('[SPELLS DEBUG] loadAvailableSpells called:', {
      characterClassName,
      packsFound: packs?.length || 0,
      packs: packs?.map(p => p.collection) || 'No packs',
      dnd5eVersion: window.GAS?.dnd5eVersion,
      willUseClassFiltering: window.GAS?.dnd5eVersion >= 4 && characterClassName
    });

    if (!packs || packs.length === 0) {
      availableSpells.set([]);
      console.warn("[SPELLS] No spell compendiums configured in settings");
      window.GAS.log.d("[SPELLS] No spell compendiums configured");
      return;
    }

    window.GAS.log.d('[SPELLS] Loading spells, character class:', characterClassName);

    let allSpells = [];

    for (const pack of packs) {
      console.log('[SPELLS DEBUG] Processing pack:', pack.collection);
      
      if (characterClassName) {
        // VERSION-BASED APPROACH: D&D 5e v4+ has class data, v3.x does not
        if (window.GAS?.dnd5eVersion >= 4) {
          // D&D 5e v4+ - USE CLASS FILTERING (class data exists on spells)
          window.GAS.log.d('[SPELLS] Using class filtering for D&D 5e v4+ (class data available)');
          console.log(`[SPELLS DEBUG] Processing pack with class filtering: ${pack.collection}`);
          
          // Load all documents from the pack
          const allDocs = await pack.getDocuments();
          window.GAS.log.d(`[SPELLS DEBUG] Loaded ${allDocs.length} documents from pack`);
          console.log(`[SPELLS DEBUG] Loaded ${allDocs.length} documents from ${pack.collection}`);
          
          const filteredSpells = [];
          
          // Filter by class and convert to our format
          for (const doc of allDocs) {
            if (doc.type === "spell") {
              // Check multiple possible locations for class information
              let spellClasses = null;
              let availableToClass = false;
              
              // Check doc.labels.classes (2024 style)
              if (doc.labels?.classes) {
                spellClasses = doc.labels.classes;
                availableToClass = typeof spellClasses === 'string'
                  ? spellClasses.includes(characterClassName) ||
                    spellClasses.toLowerCase().includes(characterClassName.toLowerCase()) ||
                    spellClasses.trim().length === 0
                  : false;
              }
              
              // Check doc.system.classes (potential 2014 style)
              if (!availableToClass && doc.system?.classes) {
                const systemClasses = doc.system.classes;
                if (typeof systemClasses === 'object' && systemClasses.value) {
                  spellClasses = systemClasses.value;
                  availableToClass = typeof spellClasses === 'string'
                    ? spellClasses.includes(characterClassName) ||
                      spellClasses.toLowerCase().includes(characterClassName.toLowerCase()) ||
                      spellClasses.trim().length === 0
                    : false;
                }
              }
              
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
                    school: doc.system.school,
                    preparation: doc.system.preparation,
                    components: doc.system.components,
                    description: doc.system.description,
                    activation: doc.system.activation
                  },
                  labels: doc.labels
                };
                filteredSpells.push(spellObj);
              }
            }
          }
          
          allSpells.push(...filteredSpells);
          window.GAS.log.d(`[SPELLS] Loaded ${filteredSpells.length} spells for class ${characterClassName} from ${pack.collection}`);
          console.log(`[SPELLS DEBUG] Filtered ${filteredSpells.length} spells for class ${characterClassName} from ${pack.collection}`);
          
        } else {
          // D&D 5e v3.x - NO CLASS FILTERING (class data doesn't exist on spells)
          window.GAS.log.d('[SPELLS] Skipping class filtering for D&D 5e v3.x (class data not available on spells)');
          console.log(`[SPELLS DEBUG] Processing pack without class filtering: ${pack.collection}`);
          
          // Use index approach for better performance
          const index = await pack.getIndex({fields: ['system.level', 'system.school']});
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
                school: entry.system?.school || 'unknown',
                preparation: { mode: 'prepared' }, // Default for compatibility
                components: {},
                description: { value: '' },
                activation: {}
              },
              labels: {} // Empty labels for v3.x compatibility
            }));
            
          allSpells.push(...spells);
          window.GAS.log.d(`[SPELLS] Loaded ${spells.length} spells (no class filtering) from ${pack.collection}`);
          console.log(`[SPELLS DEBUG] Added ${spells.length} spells (no class filtering) from ${pack.collection}`);
        }
      } else {
        // NO CLASS FILTERING: Use index data only (much faster)
        window.GAS.log.d('[SPELLS] Using index-only approach (no class filtering)');
        
        // Get basic index with system properties (these ARE indexable)
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
        window.GAS.log.d(`[SPELLS] Loaded ${spells.length} spells (index only) from ${pack.collection}`);
        console.log(`[SPELLS DEBUG] Loaded ${spells.length} spells (index only) from ${pack.collection}`);
      }
    }

    // Handle duplicates - keep only the first instance of each spell name
    const seenSpells = new Map();
    const uniqueSpells = [];
    for (const spell of allSpells) {
      const uniqueKey = spell.name.toLowerCase();
      if (!seenSpells.has(uniqueKey)) {
        uniqueSpells.push(spell);
        seenSpells.set(uniqueKey, true);
      } else {
        window.GAS.log.d(`[SPELLS] Skipping duplicate spell: ${spell.name} (uuid: ${spell.uuid})`);
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
    availableSpells.set(uniqueSpells);
    window.GAS.log.d('[SPELLS] Final loaded spells:', uniqueSpells.length);
    console.log('[SPELLS DEBUG] FINAL RESULT: Set availableSpells store with', uniqueSpells.length, 'spells');

  } catch (error) {
    console.error("Error loading available spells:", error);
    availableSpells.set([]);
  }
}

// Function to add a spell to selected spells
export async function addSpell(spell) {
  try {
    const spellId = spell.id || spell._id;

    if (!spellId) {
      console.error("Spell has no id:", spell);
      ui.notifications?.warn("Spell has no ID");
      return;
    }

    const fromUuid = foundry.utils?.fromUuid || globalThis.fromUuid;
    const fullSpellData = await fromUuid(spell.uuid);
    if (!fullSpellData) {
      console.error("Could not load full spell data for UUID:", spell.uuid);
      ui.notifications?.warn("Error loading spell data");
      return;
    }

    selectedSpells.update(spells => {
      const newSpells = new Map(spells);
      newSpells.set(spellId, { itemData: fullSpellData });
      return newSpells;
    });

  } catch (error) {
    console.error("Error adding spell:", error);
    ui.notifications?.warn("Error adding spell");
  }
}

// Function to remove a spell from selected spells
export function removeSpell(spellId) {
  try {
    selectedSpells.update(spells => {
      const newSpells = new Map(spells);
      newSpells.delete(spellId);
      return newSpells;
    });
  } catch (error) {
    console.error("Error removing spell:", error);
    ui.notifications?.warn("Error removing spell");
  }
}

// Function to finalize spell selection and add them to the character
export async function finalizeSpellSelection(actor) {
  window.GAS.log.d('[SPELLS] finalizeSpellSelection called with actor:', actor?.name);
  
  if (!actor) {
    ui.notifications.error("No active character");
    return false;
  }

  try {
    const spells = get(selectedSpells);

    if (spells.size === 0) {
      ui.notifications.warn("No spells selected");
      return false;
    }

    // Convert selected spells to items that can be added to the character
    const spellItems = Array.from(spells.values()).map(({ itemData }) => {
      const spellObject = typeof itemData.toObject === 'function' 
        ? itemData.toObject() 
        : foundry.utils.deepClone(itemData);
      return spellObject;
    });

    window.GAS.log.d('[SPELLS] Creating', spellItems.length, 'spell items');

    // Check for existing spells and handle duplicates similar to shop
    const itemsToCreate = [];
    const itemsToUpdate = [];

    for (const spellItem of spellItems) {
      // Check if actor already has this spell by name
      const existingSpell = actor.items.find(i => i.name === spellItem.name && i.type === "spell");
      
      if (existingSpell) {
        window.GAS.log.d('[SPELLS] Found existing spell, skipping:', spellItem.name);
        // For spells, we typically don't update quantities, just skip duplicates
        continue;
      } else {
        window.GAS.log.d('[SPELLS] New spell, will create:', spellItem.name);
        itemsToCreate.push(spellItem);
      }
    }

    // Create new spells in a single batch
    if (itemsToCreate.length > 0) {
      const createdSpells = await actor.createEmbeddedDocuments("Item", itemsToCreate);
      window.GAS.log.d('[SPELLS] Created spells:', createdSpells.length);
    }

    // Clear the selection
    selectedSpells.set(new Map());

    // Make the spells tab readonly
    readOnlyTabs.update(tabs => [...tabs, 'spells']);

    // Check if we're in level-up mode and handle workflow accordingly
    const isLevelUpMode = get(isLevelUp);
    if (isLevelUpMode) {
      window.GAS.log.d('[SPELLS] Level-up mode detected, triggering LevelUp workflow completion');
      // Import and trigger the LevelUp workflow completion
      const { handleSpellsCompleteLevelUp } = await import('~/src/lib/workflow');
      await handleSpellsCompleteLevelUp();
    }

    ui.notifications?.info(`Added ${itemsToCreate.length} spells to character`);
    return true;

  } catch (error) {
    console.error("Error finalizing spell selection:", error);
    ui.notifications?.error("Error adding spells to character: " + error.message);
    return false;
  }
}

// Function to auto-populate all spells for classes that get access to all spells
export async function autoPopulateAllSpells(characterClassName, maxSpellLevel, actor, isLevelUp = false, oldMaxSpellLevel = 0) {
  try {
    window.GAS.log.d('[SPELLS] Auto-populating spells for', characterClassName, 'up to level', maxSpellLevel, 'isLevelUp:', isLevelUp, 'oldMaxSpellLevel:', oldMaxSpellLevel);
    
    // Get current available spells
    const currentSpells = get(availableSpells);
    const currentLimits = get(spellLimits);
    
    if (currentSpells.length === 0) {
      ui.notifications?.warn("No spells available to auto-populate");
      return false;
    }
    
    // For level-up scenarios, only add spells of the NEW maximum level
    // For character creation, add all spells up to max level
    let spellsToAdd;
    if (isLevelUp && oldMaxSpellLevel > 0) {
      // Level-up: only add spells of the new maximum spell level
      spellsToAdd = currentSpells.filter(spell => {
        const spellLevel = spell.system?.level || 0;
        return spellLevel === maxSpellLevel && spellLevel > oldMaxSpellLevel;
      });
    } else {
      // Character creation: add all spells up to max level (excluding cantrips)
      spellsToAdd = currentSpells.filter(spell => {
        const spellLevel = spell.system?.level || 0;
        return spellLevel > 0 && spellLevel <= maxSpellLevel;
      });
    }
    
    if (spellsToAdd.length === 0) {
      if (isLevelUp) {
        ui.notifications?.info("No new spells available for this level up");
      } else {
        ui.notifications?.warn("No spells to auto-populate for this level");
      }
      return false;
    }
    
    // Create appropriate dialog content based on context
    let dialogContent;
    if (isLevelUp && oldMaxSpellLevel > 0) {
      dialogContent = `
        <p><strong>${characterClassName}s</strong> have access to all spells of appropriate level.</p>
        <p>Would you like to automatically add all ${spellsToAdd.length} new level ${maxSpellLevel} spells to your spellbook?</p>
        <p><em>Note: This will only add spells of the new maximum level (${maxSpellLevel}) that you gained access to.</em></p>
      `;
    } else {
      dialogContent = `
        <p><strong>${characterClassName}s</strong> have access to all spells of appropriate level.</p>
        <p>Would you like to automatically add all ${spellsToAdd.length} spells (levels 1-${maxSpellLevel}) to your spellbook?</p>
        <p><em>Note: You'll still need to select your cantrips manually, as those are limited and cannot be changed later.</em></p>
      `;
    }
    
    // Ask user for confirmation
    const confirmed = await Dialog.confirm({
      title: `Auto-populate ${characterClassName} Spells`,
      content: dialogContent,
      yes: () => true,
      no: () => false,
      defaultYes: true
    });
    
    if (!confirmed) {
      return false;
    }
    
    // Add all spells to selection
    let addedCount = 0;
    for (const spell of spellsToAdd) {
      try {
        await addSpell(spell);
        addedCount++;
      } catch (error) {
        console.warn(`Failed to add spell ${spell.name}:`, error);
      }
    }
    
    ui.notifications?.info(`Auto-populated ${addedCount} spells for ${characterClassName}`);
    window.GAS.log.d('[SPELLS] Auto-populated', addedCount, 'spells');
    
    return true;
    
  } catch (error) {
    console.error("Error auto-populating spells:", error);
    ui.notifications?.error("Error auto-populating spells: " + error.message);
    return false;
  }
}

// Make the stores globally available for other components to access
if (typeof window !== 'undefined') {
  if (!window.GAS) window.GAS = {};
  window.GAS.availableSpells = availableSpells;
  window.GAS.selectedSpells = selectedSpells;
  window.GAS.isSpellcaster = isSpellcaster;
  window.GAS.maxSpellLevel = maxSpellLevel;
  window.GAS.spellLimits = spellLimits;
  window.GAS.currentSpellCounts = currentSpellCounts;
  window.GAS.spellProgress = spellProgress;
  window.GAS.initializeSpellSelection = initializeSpellSelection;
  window.GAS.loadAvailableSpells = loadAvailableSpells;
  window.GAS.addSpell = addSpell;
  window.GAS.removeSpell = removeSpell;
  window.GAS.finalizeSpellSelection = finalizeSpellSelection;
  window.GAS.autoPopulateAllSpells = autoPopulateAllSpells;
}
