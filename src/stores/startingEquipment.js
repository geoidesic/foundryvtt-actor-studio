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
  window.GAS.log.d('[StartingEquipment] classStartingEquipment', $classStartingEquipment);
  if (window.GAS.dnd5eVersion < 4 || window.GAS.dnd5eRules === "2014") {
    return $classStartingEquipment;
  } 
  if ($goldChoices.fromClass.choice !== 'gold' && $goldChoices.fromBackground.choice !== 'gold') {
    return [...$classStartingEquipment, ...$backgroundStartingEquipment];
  } 
  if ($goldChoices.fromClass.choice !== 'gold') {
    return $classStartingEquipment;
  } 
  if ($goldChoices.fromBackground.choice !== 'gold') {
    return $backgroundStartingEquipment;
  }   
  return [];
});

// Reset function
const clearStartingEquipment = () => {
  startingEquipment.set({
    fromClass: [],
    fromBackground: []
  });
};

export {
  startingEquipment,
  classStartingEquipment,
  backgroundStartingEquipment,
  flattenedStartingEquipment,
  compatibleStartingEquipment,
  clearStartingEquipment
};
