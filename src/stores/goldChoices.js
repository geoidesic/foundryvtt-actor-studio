import { derived, writable } from 'svelte/store';
import { goldRoll } from './storeDefinitions';

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

export const minMaxGold2024 = writable({})

// Derived store for total gold from choices
const totalGoldFromChoices = derived(goldChoices, ($goldChoices) => {
  return parseInt($goldChoices.fromClass.goldValue) + parseInt($goldChoices.fromBackground.goldValue);
});

// Derived store that updates goldRoll for backwards compatibility
const goldChoicesCompat = derived(totalGoldFromChoices, ($totalGoldFromChoices) => {
  goldRoll.set($totalGoldFromChoices);
  return $totalGoldFromChoices;
});

// Derived store to check if choices are complete
const areGoldChoicesComplete = derived([goldChoices, goldRoll], ([$goldChoices, $goldRoll]) => {
  const isDnd2014 = window.GAS.dnd5eVersion < 4 || window.GAS.dnd5eRules === '2014';
  let complete = false;
  if (isDnd2014) {
    complete = $goldRoll > 0;
  } else {
    complete = $goldChoices.fromClass.choice !== null && 
           $goldChoices.fromBackground.choice !== null;
  }
  return complete;
  
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