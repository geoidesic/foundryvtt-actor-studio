import { writable, derived, get } from 'svelte/store';
import { MODULE_ID } from '~/src/helpers/constants';
import { getPacksFromSettings, extractItemsFromPacksAsync } from '~/src/helpers/Utility';
import { readOnlyTabs, characterClass, level as characterLevel } from '~/src/stores/index';

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
  [currentCharacter, characterLevel],
  ([$currentCharacter, $characterLevel]) => {
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
  [characterClass, characterLevel],
  ([$characterClass, $characterLevel]) => {
    if (!$characterClass || !$characterLevel) {
      return { cantrips: 0, spells: 0 };
    }

    const className = $characterClass.name || $characterClass.label || $characterClass;
    const level = $characterLevel;

    const levelData = spellsKnownData.levels.find(l => l.level === level);
    if (!levelData || !levelData[className]) {
      return { cantrips: 0, spells: 0 };
    }

    const [cantrips, spells] = levelData[className].split(' / ');
    return {
      cantrips: parseInt(cantrips) || 0,
      spells: spells === 'All' ? 999 : parseInt(spells) || 0
    };
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
  [spellLimits, currentSpellCounts],
  ([$spellLimits, $currentSpellCounts]) => {
    const totalRequired = $spellLimits.cantrips + ($spellLimits.spells === 999 ? 0 : $spellLimits.spells);
    const totalSelected = $currentSpellCounts.total;
    const progressPercentage = totalRequired > 0 ? Math.round((totalSelected / totalRequired) * 100) : 0;
    const isComplete = totalRequired > 0 && totalSelected >= totalRequired;

    return {
      totalRequired,
      totalSelected,
      progressPercentage,
      isComplete,
      limits: $spellLimits,
      counts: $currentSpellCounts
    };
  }
);

// Function to initialize character data for spell selection
export function initializeSpellSelection(actor) {
  try {
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

// Function to fetch spells from compendiums
export async function loadAvailableSpells() {
  try {
    // Get spell compendium sources from settings
    const packs = getPacksFromSettings("spells");

    if (!packs || packs.length === 0) {
      availableSpells.set([]);
      console.warn("No spell compendiums configured");
      return;
    }

    // Define the basic keys available in the default index
    const indexKeys = [
      "_id",
      "name",
      "img",
      "type",
      "uuid"
    ];

    // Define keys that are likely NOT in the index and need async loading
    const nonIndexKeys = [
      "system.level",
      "system.school",
      "system.preparation",
      "system.components",
      "system.description",
      "system.activation"
    ];

    // Extract spell data using extractItemsFromPacksAsync
    let spells = await extractItemsFromPacksAsync(packs, indexKeys, nonIndexKeys);

    // Filter for spells only
    spells = spells.filter(item => item.type === "spell");

    // Handle duplicates - keep only the first instance of each spell name
    const seenSpells = new Map();
    const uniqueSpells = [];
    for (const spell of spells) {
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
    window.GAS.log.d('[SPELLS] Loaded spells:', uniqueSpells.length);

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

    ui.notifications?.info(`Added ${itemsToCreate.length} spells to character`);
    return true;

  } catch (error) {
    console.error("Error finalizing spell selection:", error);
    ui.notifications?.error("Error adding spells to character: " + error.message);
    return false;
  }
}

// Make the stores globally available for other components to access
if (typeof window !== 'undefined') {
  if (!window.GAS) window.GAS = {};
  window.GAS.availableSpells = availableSpells;
  window.GAS.selectedSpells = selectedSpells;
  window.GAS.characterLevel = characterLevel;
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
}
