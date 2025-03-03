import { derived, get, writable } from 'svelte/store';
import { characterClass, background } from './index';

// Base store for starting equipment
const startingEquipment = writable({
  fromClass: [],
  fromBackground: []
});

// Derived store that automatically updates when class/background change
const derivedStartingEquipment = derived(
  [characterClass, background],
  ([$class, $background], set) => {
    startingEquipment.update(current => ({
      fromClass: $class?.system?.startingEquipment || [],
      fromBackground: $background?.system?.startingEquipment || []
    }));
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
const combinedStartingEquipment = derived(startingEquipment, ($startingEquipment) => {
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
  combinedStartingEquipment,
  clearStartingEquipment
};
