import { derived, get, writable } from 'svelte/store';
import { characterClass, background } from './index';

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
  clearStartingEquipment
};
