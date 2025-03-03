import { derived, get, writable } from 'svelte/store';
import { characterClass, background } from './index';
import { goldChoices } from './goldChoices';
// Base store for starting equipment

// Derived store that automatically updates when class/background change
const startingEquipment = derived(
  [characterClass, background],
  ([$class, $background]) => {
      return {
        fromClass: $class?.system?.startingEquipment || [],
        fromBackground: $background?.system?.startingEquipment || []
      }
  }
);

// Derived stores for specific sources
const classStartingEquipment = derived(startingEquipment, ($startingEquipment) => {
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
  return window.GAS.dnd5eVersion < 4 ? $classStartingEquipment 
  : $goldChoices.fromClass.choice !== 'gold' && $goldChoices.fromBackground.choice !== 'gold' ? [...$classStartingEquipment, ...$backgroundStartingEquipment]
  : $goldChoices.fromClass.choice !== 'gold' ? $classStartingEquipment
  : $goldChoices.fromBackground.choice !== 'gold' ? $backgroundStartingEquipment
  : [];
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
