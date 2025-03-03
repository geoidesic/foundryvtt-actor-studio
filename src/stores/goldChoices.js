import { derived, writable } from 'svelte/store';
import { goldRoll } from './goldRoll';

// Base store for gold choices
const goldChoices = writable({
  fromClass: {
    choice: null, // 'equipment' or 'gold'
    goldValue: 0
  },
  fromBackground: {
    choice: null, // 'equipment' or 'gold'
    goldValue: 0
  }
});

// Derived store for total gold from choices
const totalGoldFromChoices = derived(goldChoices, ($goldChoices) => {
  return $goldChoices.fromClass.goldValue + $goldChoices.fromBackground.goldValue;
});

// Derived store that updates goldRoll for backwards compatibility
const goldChoicesCompat = derived(totalGoldFromChoices, ($totalGoldFromChoices) => {
  goldRoll.set($totalGoldFromChoices);
  return $totalGoldFromChoices;
});

// Derived store to check if choices are complete
const areGoldChoicesComplete = derived(goldChoices, ($goldChoices) => {
  return $goldChoices.fromClass.choice !== null && 
         $goldChoices.fromBackground.choice !== null;
});

// Helper functions
const setClassGoldChoice = (choice, value) => {
  goldChoices.update(current => ({
    ...current,
    fromClass: {
      choice,
      goldValue: value
    }
  }));
};

const setBackgroundGoldChoice = (choice, value) => {
  goldChoices.update(current => ({
    ...current,
    fromBackground: {
      choice,
      goldValue: value
    }
  }));
};

const clearGoldChoices = () => {
  goldChoices.set({
    fromClass: {
      choice: null,
      goldValue: 0
    },
    fromBackground: {
      choice: null,
      goldValue: 0
    }
  });
};

export {
  goldChoices,
  totalGoldFromChoices,
  areGoldChoicesComplete,
  setClassGoldChoice,
  setBackgroundGoldChoice,
  clearGoldChoices
}; 