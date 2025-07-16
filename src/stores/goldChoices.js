import { derived, writable } from 'svelte/store';
import { goldRoll } from './storeDefinitions';
import { totalEquipmentGold, areEquipmentGoldChoicesComplete, parsedEquipmentGold, equipmentGoldOptions } from './equipmentGold';

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

// Derived store for total gold from choices (includes equipment-dependent gold)
const totalGoldFromChoices = derived([
  goldChoices,
  parsedEquipmentGold,
  equipmentGoldOptions
], ([$goldChoices, $parsedEquipmentGold, $equipmentGoldOptions]) => {
  // Use the same calculation logic that was working in the Equipment tab
  const classGoldValue = $goldChoices?.fromClass?.goldValue;
  const backgroundGoldValue = $goldChoices?.fromBackground?.goldValue;
  const classEquipmentGold = $equipmentGoldOptions?.fromClass?.currentGoldAmount;
  const backgroundEquipmentGold = $equipmentGoldOptions?.fromBackground?.currentGoldAmount;
  const classHasVariableGold = $parsedEquipmentGold?.fromClass?.hasVariableGold;
  const backgroundHasVariableGold = $parsedEquipmentGold?.fromBackground?.hasVariableGold;
  
  const totalGold = (isNaN(parseInt(classGoldValue)) ? 0 : parseInt(classGoldValue)) + 
                   (isNaN(parseInt(backgroundGoldValue)) ? 0 : parseInt(backgroundGoldValue)) + 
                   // Only add equipment gold for sources with variable gold AND where user has chosen equipment AND made a selection
                   (classHasVariableGold && $goldChoices?.fromClass?.choice === 'equipment' && $equipmentGoldOptions?.fromClass?.selectedChoice ? (classEquipmentGold || 0) : 0) + 
                   (backgroundHasVariableGold && $goldChoices?.fromBackground?.choice === 'equipment' && $equipmentGoldOptions?.fromBackground?.selectedChoice ? (backgroundEquipmentGold || 0) : 0);
  
  console.log('🔧 totalGoldFromChoices calculation:', {
    classGoldValue, backgroundGoldValue, classEquipmentGold, backgroundEquipmentGold,
    classHasVariableGold, backgroundHasVariableGold, 
    classChoice: $goldChoices?.fromClass?.choice,
    backgroundChoice: $goldChoices?.fromBackground?.choice,
    classSelectedChoice: $equipmentGoldOptions?.fromClass?.selectedChoice,
    backgroundSelectedChoice: $equipmentGoldOptions?.fromBackground?.selectedChoice,
    totalGold
  });
  
  return totalGold;
});

// Derived store that updates goldRoll for backwards compatibility
const goldChoicesCompat = derived(totalGoldFromChoices, ($totalGoldFromChoices) => {
  goldRoll.set($totalGoldFromChoices);
  return $totalGoldFromChoices;
});

// Derived store to check if choices are complete (includes equipment gold completion)
const areGoldChoicesComplete = derived([goldChoices, goldRoll, areEquipmentGoldChoicesComplete, parsedEquipmentGold, equipmentGoldOptions], ([$goldChoices, $goldRoll, $areEquipmentGoldChoicesComplete, $parsedEquipmentGold, $equipmentGoldOptions]) => {
  const isDnd2014 = window.GAS.dnd5eVersion < 4 || window.GAS.dnd5eRules === '2014';
  let complete = false;
  if (isDnd2014) {
    complete = $goldRoll > 0;
  } else {
    const basicChoicesComplete = $goldChoices.fromClass.choice !== null && 
                                $goldChoices.fromBackground.choice !== null;
    
    if (!basicChoicesComplete) {
      complete = false;
    } else {
      // Check if user chose equipment for either class or background
      const userChoseClassEquipment = $goldChoices.fromClass.choice === 'equipment';
      const userChoseBackgroundEquipment = $goldChoices.fromBackground.choice === 'equipment';
      const userChoseEquipment = userChoseClassEquipment || userChoseBackgroundEquipment;
      
      if (!userChoseEquipment) {
        // User chose gold-only for both - no equipment selection needed
        complete = true;
      } else {
        // User chose equipment for at least one - check equipment gold completion with user choice context
        
        // Check if class has variable gold and needs a choice (only if user chose equipment)
        const classNeedsChoice = userChoseClassEquipment && $parsedEquipmentGold.fromClass.hasVariableGold;
        const classChoiceComplete = !classNeedsChoice || $equipmentGoldOptions.fromClass.selectedChoice !== null;
        
        // Check if background has variable gold and needs a choice (only if user chose equipment)
        const backgroundNeedsChoice = userChoseBackgroundEquipment && $parsedEquipmentGold.fromBackground.hasVariableGold;
        const backgroundChoiceComplete = !backgroundNeedsChoice || $equipmentGoldOptions.fromBackground.selectedChoice !== null;
        
        complete = classChoiceComplete && backgroundChoiceComplete;
      }
    }
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

// Make the stores globally available for the WorkflowStateMachine and other components
if (typeof window !== 'undefined') {
  window.GAS = window.GAS || {};
  window.GAS.totalGoldFromChoices = totalGoldFromChoices;
  window.GAS.goldRoll = goldRoll;
}