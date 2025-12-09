import { derived, get, writable } from 'svelte/store';
// Import directly from storeDefinitions instead of index
import { characterClass, background } from './storeDefinitions';
import { goldChoices } from './goldChoices';

/**
 * Generate a label for an equipment entry using DND5e config.
 * Mimics the logic from dnd5e.mjs EquipmentEntryData#generateLabel()
 * @param {object} entry - The equipment entry
 * @param {object[]} allEquipment - All equipment entries (for finding children)
 * @returns {string} Generated label
 */
function generateEquipmentLabel(entry, allEquipment) {
  if (!entry) return '';
  
  // If entry already has a label, return it
  if (entry.label) return entry.label;
  
  const count = entry.count || 1;
  const type = entry.type;
  const key = entry.key;
  
  let label = '';
  
  switch (type) {
    case 'AND':
    case 'OR':
      // For containers, don't generate a label here - they'll be processed recursively
      return '';
      
    case 'currency':
      const currencyConfig = CONFIG?.DND5E?.currencies?.[key];
      if (count && currencyConfig) {
        label = `${count} ${currencyConfig.abbreviation.toUpperCase()}`;
      }
      break;
      
    case 'linked':
      // For linked items, we'd need to fetch from UUID - leave empty for now
      // The component will handle linked item display
      label = '';
      break;
      
    case 'weapon':
      // Get weapon type label from config
      const weaponTypes = CONFIG?.DND5E?.weaponTypes || {};
      const weaponProficiencies = CONFIG?.DND5E?.weaponProficiencies || {};
      
      // Check both weaponTypes and weaponProficiencies
      let weaponLabel = weaponTypes[key] || weaponProficiencies[key];
      
      // Handle object-style config entries
      if (weaponLabel && typeof weaponLabel === 'object') {
        weaponLabel = weaponLabel.label || weaponLabel;
      }
      
      if (weaponLabel) {
        label = weaponLabel;
      } else {
        label = key; // Fallback to key
      }
      break;
      
    case 'armor':
      const armorTypes = CONFIG?.DND5E?.armorTypes || {};
      const armorProficiencies = CONFIG?.DND5E?.armorProficiencies || {};
      let armorLabel = armorTypes[key] || armorProficiencies[key];
      
      if (armorLabel && typeof armorLabel === 'object') {
        armorLabel = armorLabel.label || armorLabel;
      }
      
      if (armorLabel) {
        label = armorLabel;
      } else {
        label = key;
      }
      break;
      
    case 'tool':
      const toolTypes = CONFIG?.DND5E?.toolTypes || {};
      const toolProficiencies = CONFIG?.DND5E?.toolProficiencies || {};
      let toolLabel = toolTypes[key] || toolProficiencies[key];
      
      if (toolLabel && typeof toolLabel === 'object') {
        toolLabel = toolLabel.label || toolLabel;
      }
      
      if (toolLabel) {
        label = toolLabel;
      } else {
        label = key;
      }
      break;
      
    case 'focus':
      const focusTypes = CONFIG?.DND5E?.focusTypes || {};
      let focusLabel = focusTypes[key];
      
      if (focusLabel && typeof focusLabel === 'object') {
        focusLabel = focusLabel.label || focusLabel;
      }
      
      if (focusLabel) {
        label = focusLabel;
      } else {
        label = key;
      }
      break;
      
    default:
      label = key || type;
      break;
  }
  
  // Format label with count if applicable
  if (label && type !== 'currency' && type !== 'linked') {
    if (count > 1) {
      label = `${count}× ${label}`;
    } else {
      // For single items of category types (not linked), wrap in "any" language
      label = game.i18n.format("DND5E.TraitConfigChooseAnyUncounted", { type: label });
    }
  }
  
  // Add proficiency note if needed
  if (type === 'linked' && entry.requiresProficiency && label) {
    label += ` (${game.i18n.localize("DND5E.StartingEquipment.IfProficient").toLowerCase()})`;
  }
  
  return label;
}

/**
 * Enrich equipment array with generated labels.
 * @param {object[]} equipment - Array of equipment entries
 * @returns {object[]} Equipment with labels added
 */
function enrichEquipmentWithLabels(equipment) {
  if (!Array.isArray(equipment)) return equipment;
  
  return equipment.map(entry => {
    // Generate label if not present
    if (!entry.label && entry.type !== 'AND' && entry.type !== 'OR') {
      const label = generateEquipmentLabel(entry, equipment);
      return { ...entry, label };
    }
    return entry;
  });
}

/**
 * Flatten redundant single-child AND/OR containers.
 * If an AND/OR container has only one child that is also an AND/OR, remove the parent wrapper.
 * @param {object[]} equipment - Array of equipment entries
 * @returns {object[]} Flattened equipment structure
 */
function flattenRedundantContainers(equipment) {
  if (!Array.isArray(equipment) || equipment.length === 0) return equipment;
  
  const result = [];
  const processedIds = new Set();
  
  equipment.forEach(entry => {
    // Skip if already processed
    if (processedIds.has(entry._id)) return;
    
    // Only process top-level AND/OR containers (no group)
    if ((entry.type === 'AND' || entry.type === 'OR') && !entry.group) {
      // Find all direct children
      const children = equipment.filter(item => item.group === entry._id);
      
      // If there's only one child and it's also an AND/OR container
      if (children.length === 1 && (children[0].type === 'AND' || children[0].type === 'OR')) {
        // Mark parent as processed - we're skipping it
        processedIds.add(entry._id);
        
        // Promote the child to top level by removing its group reference
        const promotedChild = { ...children[0], group: entry.group || '' };
        result.push(promotedChild);
        
        // Find all grandchildren and update their group to point to promoted child
        const grandchildren = equipment.filter(item => item.group === children[0]._id);
        grandchildren.forEach(grandchild => {
          processedIds.add(grandchild._id);
          // Grandchildren keep their group pointing to the promoted child
          result.push(grandchild);
        });
        
        window.GAS.log.d('[StartingEquipment] Flattened redundant container', {
          removedContainer: entry._id,
          promotedChild: children[0]._id,
          grandchildrenCount: grandchildren.length
        });
      } else {
        // Normal container with multiple children or non-container child
        result.push(entry);
        
        // Add all its children
        children.forEach(child => {
          processedIds.add(child._id);
          result.push(child);
          
          // Add grandchildren if any
          const grandchildren = equipment.filter(item => item.group === child._id);
          grandchildren.forEach(grandchild => {
            processedIds.add(grandchild._id);
            result.push(grandchild);
          });
        });
      }
    } else if (!processedIds.has(entry._id)) {
      // Regular entry - add it
      result.push(entry);
    }
  });
  
  return result;
}

// Function to clean equipment structure by removing unnecessary OR wrappers
// Currently disabled - implementing fix at component level instead
function cleanEquipmentStructure(equipment) {
  if (!Array.isArray(equipment)) return equipment;
  
  // Enrich with labels first
  let enriched = enrichEquipmentWithLabels(equipment);
  
  // Flatten redundant single-child containers
  enriched = flattenRedundantContainers(enriched);
  
  return enriched;
}

// Base store for starting equipment

// Derived store that automatically updates when class/background change
const startingEquipment = derived(
  [characterClass, background],
  ([$characterClass, $background]) => {
      return {
        fromClass: cleanEquipmentStructure($characterClass?.system?.startingEquipment || []),
        fromBackground: cleanEquipmentStructure($background?.system?.startingEquipment || [])
      }
  }
);

// Derived stores for specific sources
const classStartingEquipment = derived(startingEquipment, ($startingEquipment) => {
  window.GAS.log.d('[StartingEquipment] startingEquipment', $startingEquipment);
  return $startingEquipment.fromClass;
});

const backgroundStartingEquipment = derived(startingEquipment, ($startingEquipment) => {
  return $startingEquipment.fromBackground;
});

// Combined flattened equipment for components that don't need source separation
const flattenedStartingEquipment = derived(startingEquipment, ($startingEquipment) => {
  return [...$startingEquipment.fromClass, ...$startingEquipment.fromBackground];
});

const compatibleStartingEquipment = derived([classStartingEquipment, backgroundStartingEquipment, goldChoices], ([$classStartingEquipment, $backgroundStartingEquipment, $goldChoices]) => {
  window.GAS.log.d('[StartingEquipment] compatibleStartingEquipment inputs', {
    classStartingEquipment: $classStartingEquipment,
    goldChoices: $goldChoices
  });
  
  if (window.GAS.dnd5eVersion < 4 || window.GAS.dnd5eRules === "2014") {
    return $classStartingEquipment;
  } 
  
  // Check for equipment vs gold choices
  const classChoseGold = $goldChoices.fromClass.choice === 'gold';
  const backgroundChoseGold = $goldChoices.fromBackground.choice === 'gold';
  
  // If both chose equipment, return both
  if (!classChoseGold && !backgroundChoseGold) {
    return [...$classStartingEquipment, ...$backgroundStartingEquipment];
  } 
  
  // If only class chose equipment, return class equipment
  if (!classChoseGold && backgroundChoseGold) {
    return $classStartingEquipment;
  } 
  
  // If only background chose equipment, return background equipment
  if (classChoseGold && !backgroundChoseGold) {
    return $backgroundStartingEquipment;
  }   
  
  // Both chose gold, return empty
  return [];
});

// Reset function
const clearStartingEquipment = () => {
  // startingEquipment is a derived store, so it will automatically reset
  // when characterClass and background are reset. No action needed here.
};

export {
  startingEquipment,
  classStartingEquipment,
  backgroundStartingEquipment,
  flattenedStartingEquipment,
  compatibleStartingEquipment,
  clearStartingEquipment
};
