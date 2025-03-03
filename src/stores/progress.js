import { derived, get, writable } from 'svelte/store';
import {
  race,
  characterClass,
  characterSubClass,
  background,
  abilityGenerationMethod,
  pointBuy,
  abilityRolls,
  isStandardArrayValues,
  subClassesForClass,
  activeTab,
  tabs
} from './index';
import { goldRoll } from './goldRoll';
import { equipmentSelections } from './equipmentSelections';
import { areGoldChoicesComplete } from './goldChoices';
import { getDnd5eVersion, getSubclassLevel } from '~/src/helpers/Utility';
import { MODULE_ID } from '~/src/helpers/constants';


// Convert to derived store
const isAbilityGenerationMethodReady = derived(
  [abilityGenerationMethod, abilityRolls, pointBuy, isStandardArrayValues],
  ([$abilityGenerationMethod, $abilityRolls, $pointBuy, $isStandardArrayValues]) => {
    window.GAS.log.d('[PROGRESS] isAbilityGenerationMethodReady called', {
      method: $abilityGenerationMethod,
      rolls: $abilityRolls,
      pointBuy: $pointBuy,
      standardArray: $isStandardArrayValues
    });

    if (!$abilityGenerationMethod) {
      return false;
    }

    const result = (() => {
      switch ($abilityGenerationMethod) {
        case 2:
          // Check if points are allocated correctly
          return $pointBuy.scoreTotal === $pointBuy.pointBuyLimit;
        case 3:
          // Check if all abilities are assigned
          return Object.keys($abilityRolls).length === 6;
        case 4:
          // Check if all rolls are assigned
          return $isStandardArrayValues;
        default:
          return true;
      }
    })();

    window.GAS.log.d('[PROGRESS] isAbilityGenerationMethodReady result', result);
    return result;
  }
);

/**
 * @why: some classes don't have subclasses until later levels
 * @param characterClass
 * @param characterSubClass
 */
function isSubclassForThisCharacterLevel(characterClass) {
  if (!characterClass) return false;

  const subClassLevel = getSubclassLevel(characterClass, MODULE_ID);
  window.GAS.log.d('[PROGRESS] subClassLevel determined to be: ', subClassLevel);

  if (!subClassLevel) return false;

  const newActorLevel = game.actor?.system?.details?.level
    ? game.actor.system.details.level + 1
    : 1;
  window.GAS.log.d("[PROGRESS] subClassLevel", subClassLevel);
  window.GAS.log.d("[PROGRESS] level", newActorLevel);
  window.GAS.log.d(
    "[PROGRESS] subClassLevel === level",
    subClassLevel === newActorLevel,
  );
  return subClassLevel && parseInt(newActorLevel) === parseInt(subClassLevel);
}

// Define progress calculation functions for different modes
const progressCalculators = {
  characterCreation: ({ race, background, characterClass, characterSubClass, abilityGenerationMethod, totalSteps }) => {
    window.GAS.log.d('[PROGRESS] characterCreation calculator called', {
      race,
      background,
      characterClass,
      characterSubClass,
      abilityGenerationMethod,
      totalSteps
    });

    const completed = [race, background, characterClass, characterSubClass, abilityGenerationMethod]
      .filter((value, index) => {
        if (index === 4) {
          const result = get(isAbilityGenerationMethodReady);
          window.GAS.log.d('[PROGRESS] abilityGenerationMethod check result', result);
          return result;
        }
        return !!value;
      }).length;

    const progress = (completed / totalSteps) * 100;
    window.GAS.log.d('[PROGRESS] characterCreation progress calculated', {
      completed,
      totalSteps,
      progress
    });
    return progress;
  },

  equipment: ({ equipmentSelections, goldRoll, areGoldChoicesComplete }) => {
    const groups = Object.values(equipmentSelections);
    window.GAS.log.d("[PROGRESS] goldRoll", goldRoll);
    
    // Handle v4 gold choices
    if (window.GAS.dnd5eVersion === 4) {
      if (!areGoldChoicesComplete) return 0; // Choices not made
      if (groups.length === 0) return 100; // No equipment to select, but choices made
      
      // Equipment is complete when all groups are complete AND choices are made
      const completedGroups = groups.filter(group => group.completed).length;
      return Math.round((completedGroups / groups.length) * 100);
    }
    
    // Handle v3 gold roll
    if (!goldRoll) return 0; // Nothing selected and no gold rolled
    if (groups.length === 0) return 100; // No equipment to select, but gold is rolled
    
    // Equipment is complete when all groups are complete AND gold is rolled
    let completedGroups = groups.filter(group => group.completed).length;
    if(goldRoll > 0) {
      completedGroups += 1;
    }
    const equipmentProgress = Math.round((completedGroups / (groups.length + 1)) * 100);
    
    // Only return 100 if both equipment and gold are done
    return goldRoll > 0 ? equipmentProgress : Math.min(equipmentProgress, 99);
  }
};

const stores = [
  race,
  characterClass,
  characterSubClass,
  background,
  abilityGenerationMethod,
  pointBuy,
  abilityRolls,
  isStandardArrayValues,
];

// Create a derived store for the total length
export const totalSteps = derived(
  [characterClass, characterSubClass, subClassesForClass],
  ([$characterClass, $characterSubClass, $subClassesForClass]) => {
    let length = 5;
    if (
      //- @why: if there are no subclasses for this class, or the subclass is not available for this level, reduce the total steps
      !$subClassesForClass.length > 0 ||
      !isSubclassForThisCharacterLevel($characterClass, $characterSubClass)
    ) {
      length = length - 1;
    }
    window.GAS.log.d("[PROGRESS] totalSteps", length);
    return length;
  }
);

// Derive the progress value based on the current tab/mode
export const progress = derived(
  [
    race,
    characterClass,
    characterSubClass,
    background,
    abilityGenerationMethod,
    totalSteps,
    activeTab,
    equipmentSelections,
    goldRoll,
    areGoldChoicesComplete,
    abilityRolls
  ],
  ([
    $race,
    $characterClass,
    $characterSubClass,
    $background,
    $abilityGenerationMethod,
    $totalSteps,
    $activeTab,
    $equipmentSelections,
    $goldRoll,
    $areGoldChoicesComplete,
    $abilityRolls
  ]) => {
    window.GAS.log.d('[PROGRESS] progress store update triggered', {
      activeTab: $activeTab,
      abilityGenerationMethod: $abilityGenerationMethod,
      abilityRolls: $abilityRolls
    });

    // Select the appropriate calculator based on the active tab
    const calculator = $activeTab === 'equipment' 
      ? progressCalculators.equipment 
      : progressCalculators.characterCreation;

    // Pass relevant data to the calculator
    const result = calculator({
      race: $race,
      background: $background,
      characterClass: $characterClass,
      characterSubClass: $characterSubClass,
      abilityGenerationMethod: $abilityGenerationMethod,
      totalSteps: $totalSteps,
      equipmentSelections: $equipmentSelections,
      goldRoll: $goldRoll,
      areGoldChoicesComplete: $areGoldChoicesComplete
    });

    window.GAS.log.d('[PROGRESS] progress store result', result);
    return result;
  }
);
