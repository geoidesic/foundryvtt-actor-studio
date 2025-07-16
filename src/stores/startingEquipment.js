import { derived, get, writable } from 'svelte/store';
// Import directly from storeDefinitions instead of index
import { characterClass, background } from './storeDefinitions';
import { goldChoices } from './goldChoices';

// Function to clean equipment structure by removing unnecessary OR wrappers
// Currently disabled - implementing fix at component level instead
function cleanEquipmentStructure(equipment) {
  if (!Array.isArray(equipment)) return equipment;
  
  // For now, just return the equipment as-is
  // The cleaning will be handled in the component
  return equipment;
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
