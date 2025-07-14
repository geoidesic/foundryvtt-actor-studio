import { derived, get, writable } from 'svelte/store';
import {
  race,
  characterClass,
  characterSubClass,
  background,
  abilityGenerationMethod,
  pointBuyScoreTotal, 
  pointBuyLimit,
  abilityRolls,
  isStandardArrayValues,
  subClassesForClass,
  activeTab,
} from './index';
import { goldRoll } from './storeDefinitions';
import { equipmentSelections } from './equipmentSelections';
import { areGoldChoicesComplete } from './goldChoices';
import { spellProgress } from './spellSelection';
import { getDnd5eVersion, getSubclassLevel } from '~/src/helpers/Utility';
import { MODULE_ID } from '~/src/helpers/constants';


// Convert to derived store
const isAbilityGenerationMethodReady = derived(
  [abilityGenerationMethod, abilityRolls, pointBuyScoreTotal, pointBuyLimit, isStandardArrayValues],
  ([$abilityGenerationMethod, $abilityRolls, $pointBuyScoreTotal, $pointBuyLimit, $isStandardArrayValues]) => {
    // window.GAS.log.d('[PROGRESS] isAbilityGenerationMethodReady called', {
    //   method: $abilityGenerationMethod,
    //   rolls: $abilityRolls,
    //   scoreTotal: $pointBuyScoreTotal,
    //   pointBuyLimit: $pointBuyLimit,
    //   standardArray: $isStandardArrayValues
    // });

    if (!$abilityGenerationMethod) {
      return false;
    }

    const result = (() => {
      switch ($abilityGenerationMethod) {
        case 2: // Point Buy
          const isComplete = Number($pointBuyScoreTotal) === Number($pointBuyLimit);
          
          return isComplete;
        case 3:
          // Check if all abilities are assigned
          return Object.keys($abilityRolls).length === 6;
        case 4:
          // Check if all rolls are assigned
          return $isStandardArrayValues;
        case 1: default: // Manual Entry is always complete
          return true;
      }
    })();

    // window.GAS.log.d('[PROGRESS] isAbilityGenerationMethodReady result', result);
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
  // window.GAS.log.d('[PROGRESS] subClassLevel determined to be: ', subClassLevel);

  if (!subClassLevel) return false;

  const newActorLevel = game.actor?.system?.details?.level
    ? game.actor.system.details.level + 1
    : 1;
  // window.GAS.log.d("[PROGRESS] subClassLevel", subClassLevel);
  // window.GAS.log.d("[PROGRESS] level", newActorLevel);
  // window.GAS.log.d(
  //   "[PROGRESS] subClassLevel === level",
  //   subClassLevel === newActorLevel,
  // );
  return subClassLevel && parseInt(newActorLevel) === parseInt(subClassLevel);
}

// Define progress calculation functions for different modes
const progressCalculators = {
  characterCreation: ({ 
    race, 
    background, 
    characterClass, 
    characterSubClass, 
    abilityGenerationMethod, 
    totalSteps,
    pointBuyScoreTotal,
    pointBuyLimit,
    abilityRolls,
    isStandardArrayValues
  }) => {
    // window.GAS.log.d('[PROGRESS] characterCreation calculator called', {
    //   race,
    //   background,
    //   characterClass,
    //   characterSubClass,
    //   abilityGenerationMethod,
    //   totalSteps,
    //   pointBuyScoreTotal,
    //   pointBuyLimit
    // });

    const completed = [race, background, characterClass, characterSubClass, abilityGenerationMethod]
      .filter((value, index) => {
        if (index === 4) {
          // Check ability generation method completion directly
          let result = false;
          
          if (!abilityGenerationMethod) {
            result = false;
          } else {
            switch (abilityGenerationMethod) {
              case 2: // Point Buy
                result = Number(pointBuyScoreTotal) === Number(pointBuyLimit);
                break;
              case 3: // Ability Rolls
                result = Object.keys(abilityRolls).length === 6;
                break;
              case 4: // Standard Array
                result = isStandardArrayValues;
                break;
              case 1: default: // Manual Entry is always complete
                result = true;
                break;
            }
          }
          
          // window.GAS.log.d('[PROGRESS] abilityGenerationMethod check result', result);
          return result;
        }
        return !!value;
      }).length;

    const progress = (completed / totalSteps) * 100;
    // window.GAS.log.d('[PROGRESS] characterCreation progress calculated', {
    //   completed,
    //   totalSteps,
    //   progress
    // });
    return progress;
  },

  equipment: ({ equipmentSelections, goldRoll, areGoldChoicesComplete }) => {
    const groups = Object.values(equipmentSelections);
    window.GAS.log.d("[PROGRESS] goldRoll", goldRoll);
    window.GAS.log.d("[PROGRESS] equipmentSelections", equipmentSelections);
    
    // Handle v4 gold choices
    if (window.GAS.dnd5eVersion >= 4  && window.GAS.dnd5eRules === "2024") {
      if (!areGoldChoicesComplete) return 0; // Choices not made
      if (groups.length === 0) return 100; // No equipment to select, but choices made
      
      // Equipment is complete when all groups are complete AND choices are made
      const completedGroups = groups.filter(group => group.completed).length;
      // Force 100% if all groups are completed
      if (completedGroups === groups.length) return 100;
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
    // Force 100% if all groups are completed and gold is rolled
    if (goldRoll > 0 && completedGroups === groups.length + 1) return 100;
    return goldRoll > 0 ? equipmentProgress : Math.min(equipmentProgress, 99);
  },

  spells: ({ spellProgress }) => {
    if (!spellProgress) return 0;
    
    // If no spells are required (non-spellcasting class), show 100%
    if (spellProgress.totalRequired === 0) return 100;
    
    // Return the calculated percentage from spellProgress
    return Math.min(100, spellProgress.progressPercentage);
  }
};

const stores = [
  race,
  characterClass,
  characterSubClass,
  background,
  abilityGenerationMethod,
  pointBuyScoreTotal,
  pointBuyLimit,
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
    // window.GAS.log.d("[PROGRESS] totalSteps", length);
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
    abilityRolls,
    pointBuyScoreTotal,
    pointBuyLimit,
    isStandardArrayValues,
    spellProgress
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
    $abilityRolls,
    $pointBuyScoreTotal,
    $pointBuyLimit,
    $isStandardArrayValues,
    $spellProgress
  ]) => {
    // window.GAS.log.d('[PROGRESS] progress store update triggered', {
    //   activeTab: $activeTab,
    //   abilityGenerationMethod: $abilityGenerationMethod,
    //   abilityRolls: $abilityRolls,
    //   pointBuyScoreTotal: $pointBuyScoreTotal,
    //   pointBuyLimit: $pointBuyLimit
    // });

    // Select the appropriate calculator based on the active tab
    let calculator;
    if ($activeTab === 'equipment') {
      calculator = progressCalculators.equipment;
    } else if ($activeTab === 'spells') {
      calculator = progressCalculators.spells;
    } else {
      calculator = progressCalculators.characterCreation;
    }

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
      areGoldChoicesComplete: $areGoldChoicesComplete,
      pointBuyScoreTotal: $pointBuyScoreTotal,
      pointBuyLimit: $pointBuyLimit,
      abilityRolls: $abilityRolls,
      isStandardArrayValues: $isStandardArrayValues,
      spellProgress: $spellProgress
    });

    // window.GAS.log.d('[PROGRESS] progress store result', result);
    return result;
  }
);
