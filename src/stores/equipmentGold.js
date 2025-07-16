import { derived, writable } from 'svelte/store';
import { characterClass, background } from './storeDefinitions';

// Simple store for equipment gold tracking (minimal implementation)
const equipmentGoldOptions = writable({
  fromClass: {
    hasVariableGold: false,
    goldOptions: [],
    selectedChoice: null,
    currentGoldAmount: 0
  },
  fromBackground: {
    hasVariableGold: false,
    goldOptions: [],
    selectedChoice: null,
    currentGoldAmount: 0
  }
});

/**
 * Function to detect variable gold and extract standard equipment gold amounts
 */
function parseEquipmentGoldOptions(item) {
  if (!item?.system?.description?.value) return { hasVariableGold: false, goldOptions: [], standardEquipmentGold: 0 };
  
  const description = item.system.description.value;
  
  // Look for data-award-command patterns (FoundryVTT's award system)
  const awardMatches = [...description.matchAll(/data-award-command="([^"]*)"/g)];
  
  if (awardMatches.length > 1) {
    // Multiple award commands - parse each and build goldOptions
    const goldOptions = awardMatches.map((match, index) => {
      const commandValue = match[1];
      const goldMatch = commandValue.match(/(\d+)/);
      const goldAmount = goldMatch ? parseInt(goldMatch[1], 10) : 0;
      
      // Try to find choice letter by looking backward from the match position
      const beforeMatch = description.substring(0, match.index);
      const choiceMatch = beforeMatch.match(/\(([A-Z])\)[^(]*$/);
      const choice = choiceMatch ? choiceMatch[1] : String.fromCharCode(65 + index); // A, B, C...
      
      // Extract description around the choice
      const choiceStart = choiceMatch ? beforeMatch.lastIndexOf(`(${choice})`) : match.index - 50;
      const choiceEnd = match.index + match[0].length + 50;
      const rawDescription = description.substring(Math.max(0, choiceStart), Math.min(description.length, choiceEnd));
      const cleanDescription = rawDescription.replace(/<[^>]*>/g, '').trim();
      
      return {
        choice,
        goldAmount,
        description: `${choice}: ${cleanDescription.substring(0, 100)}...`
      };
    });
    
    return { hasVariableGold: true, goldOptions, standardEquipmentGold: 0 };
  } else if (awardMatches.length === 1) {
    // Single award command - this is standard equipment gold
    const commandValue = awardMatches[0][1];
    const goldMatch = commandValue.match(/(\d+)/);
    const goldAmount = goldMatch ? parseInt(goldMatch[1], 10) : 0;
    return { 
      hasVariableGold: false, 
      goldOptions: [{ choice: 'default', goldAmount, description: `Standard equipment: ${goldAmount} GP` }], 
      standardEquipmentGold: goldAmount 
    };
  }
  
  // Look for choice patterns in text like "(A)" with GP amounts
  const choicePattern = /\(([A-Z])\).*?(\d+)\s*(?:GP|gp)/gi;
  const choiceMatches = [...description.matchAll(choicePattern)];
  
  if (choiceMatches.length > 1) {
    // Multiple choices found - build gold options
    const goldOptions = choiceMatches.map(match => {
      const choice = match[1];
      const goldAmount = parseInt(match[2], 10);
      const choiceStart = match.index;
      const nextChoice = description.indexOf('(', choiceStart + 1);
      const choiceEnd = nextChoice !== -1 ? nextChoice : description.length;
      const rawDescription = description.substring(choiceStart, choiceEnd);
      const cleanDescription = rawDescription.replace(/<[^>]*>/g, '').trim();
      
      return {
        choice,
        goldAmount,
        description: `${choice}: ${cleanDescription.substring(0, 100)}...`
      };
    });
    
    // Check if this looks like Fighter-style variable gold (very different amounts like 4, 11, 155)
    const goldAmounts = goldOptions.map(opt => opt.goldAmount);
    const maxAmount = Math.max(...goldAmounts);
    const minAmount = Math.min(...goldAmounts);
    const hasLargeVariation = maxAmount > minAmount * 10; // 155 is much larger than 4 or 11
    
    if (hasLargeVariation) {
      // This is true variable gold (like Fighter: 4, 11, 155)
      return { hasVariableGold: true, goldOptions, standardEquipmentGold: 0 };
    } else {
      // This is standard equipment with multiple fixed options (like Artisan: 32, 50)
      // Use the first option as the standard amount for calculation purposes
      return { hasVariableGold: false, goldOptions, standardEquipmentGold: goldAmounts[0] };
    }
  } else if (choiceMatches.length === 1) {
    // Single choice with gold amount
    const match = choiceMatches[0];
    const goldAmount = parseInt(match[2], 10);
    const choice = match[1];
    return { 
      hasVariableGold: false, 
      goldOptions: [{ choice, goldAmount, description: `${choice}: Single choice ${goldAmount} GP` }], 
      standardEquipmentGold: goldAmount 
    };
  }
  
  // Look for any GP mentions as fallback
  const anyGoldMatch = description.match(/(\d+)\s*(?:GP|gp)/i);
  if (anyGoldMatch) {
    const goldAmount = parseInt(anyGoldMatch[1], 10);
    return { 
      hasVariableGold: false, 
      goldOptions: [{ choice: 'default', goldAmount, description: `Standard: ${goldAmount} GP` }], 
      standardEquipmentGold: goldAmount 
    };
  }
  
  return { hasVariableGold: false, goldOptions: [], standardEquipmentGold: 0 };
}

// Derived store that parses equipment gold options when class/background changes
const parsedEquipmentGold = derived(
  [characterClass, background],
  ([$characterClass, $background]) => {
    const classOptions = $characterClass ? parseEquipmentGoldOptions($characterClass) : { hasVariableGold: false, goldOptions: [], standardEquipmentGold: 0 };
    const backgroundOptions = $background ? parseEquipmentGoldOptions($background) : { hasVariableGold: false, goldOptions: [], standardEquipmentGold: 0 };
    
    return {
      fromClass: classOptions,
      fromBackground: backgroundOptions
    };
  }
);

// Helper functions to manage equipment gold selections
const setEquipmentGoldChoice = (source, choice, goldAmount) => {
  equipmentGoldOptions.update(current => ({
    ...current,
    [source]: {
      ...current[source],
      selectedChoice: choice,
      currentGoldAmount: goldAmount || 0
    }
  }));
};

const updateGoldFromEquipmentChoice = (source, choiceId, goldAmount) => {
  equipmentGoldOptions.update(current => ({
    ...current,
    [source]: {
      ...current[source],
      selectedChoice: choiceId,
      currentGoldAmount: goldAmount || 0
    }
  }));
};

const clearEquipmentGoldChoices = () => {
  equipmentGoldOptions.set({
    fromClass: {
      hasVariableGold: false,
      goldOptions: [],
      selectedChoice: null,
      currentGoldAmount: 0
    },
    fromBackground: {
      hasVariableGold: false,
      goldOptions: [],
      selectedChoice: null,
      currentGoldAmount: 0
    }
  });
};

// Derived store for total gold from equipment choices
const totalEquipmentGold = derived(
  equipmentGoldOptions,
  ($equipmentGoldOptions) => {
    return $equipmentGoldOptions.fromClass.currentGoldAmount + 
           $equipmentGoldOptions.fromBackground.currentGoldAmount;
  }
);

// Check if equipment gold choices are complete
// Note: This will be called from goldChoices.js with the goldChoices data to avoid circular dependency
const areEquipmentGoldChoicesComplete = derived(
  [parsedEquipmentGold, equipmentGoldOptions],
  ([$parsedEquipmentGold, $equipmentGoldOptions]) => {
    // This function will be enhanced by goldChoices.js to include user choice context
    // For now, return completion based on variable gold selections only
    
    // Check if class has variable gold and needs a choice
    const classNeedsChoice = $parsedEquipmentGold.fromClass.hasVariableGold;
    const classChoiceComplete = !classNeedsChoice || $equipmentGoldOptions.fromClass.selectedChoice !== null;
    
    // Check if background has variable gold and needs a choice  
    const backgroundNeedsChoice = $parsedEquipmentGold.fromBackground.hasVariableGold;
    const backgroundChoiceComplete = !backgroundNeedsChoice || $equipmentGoldOptions.fromBackground.selectedChoice !== null;
    
    return classChoiceComplete && backgroundChoiceComplete;
  }
);

export {
  equipmentGoldOptions,
  parsedEquipmentGold,
  totalEquipmentGold,
  areEquipmentGoldChoicesComplete,
  updateGoldFromEquipmentChoice,
  setEquipmentGoldChoice,
  clearEquipmentGoldChoices,
  parseEquipmentGoldOptions
};
