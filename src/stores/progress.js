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
} from './index';
import { getDnd5eVersion } from '~/src/helpers/Utility';
import { MODULE_ID } from '~/src/helpers/constants';


// Sample helper function to process abilityGenerationMethod
function isAbilityGenerationMethodReady(method) {
  if (!method) {
    return false;
  }

  switch (method) {
    case 2:
      // Check if points are allocated correctly
      return get(pointBuy).scoreTotal === get(pointBuy).pointBuyLimit;
    case 3:
      // Check if all abilities are assigned
      return Object.keys(get(abilityRolls)).length === 6;
    case 4:
      // Check if all rolls are assigned
      return get(isStandardArrayValues);
    default:
      return true;
  }
}

/**
 * @why: some classes don't have subclasses until later levels
 * @param characterClass
 * @param characterSubClass
 */
function isSubclassForThisCharacterLevel(characterClass, characterSubClass) {
  const dnd5eVersion = getDnd5eVersion();
  let subClassLevel = false;
  if (dnd5eVersion === 3) {
    subClassLevel = characterClass?.getFlag
    ? characterClass.getFlag(MODULE_ID, "subclassLevel")
    : false;
  }
  window.GAS.log.d("[PROGRESS] characterClass", characterClass);
  if (dnd5eVersion >= 4) {
    subClassLevel = characterClass.system.advancement
      .filter(advancement => advancement.type === "Subclass")
      .map(advancement => advancement.level);
  }

  const actorLevel = game.actor?.system?.details?.level
    ? game.actor.system.details.level + 1
    : 1;
  window.GAS.log.d("[PROGRESS] subClassLevel", subClassLevel);
  window.GAS.log.d("[PROGRESS] level", actorLevel);
  window.GAS.log.d(
    "[PROGRESS] subClassLevel === level",
    subClassLevel === actorLevel,
  );
  return subClassLevel && parseInt(actorLevel) !== parseInt(subClassLevel);
}

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
      $subClassesForClass.length > 0 &&
      isSubclassForThisCharacterLevel($characterClass, $characterSubClass)
    ) {
      length = length - 1;
    }
    window.GAS.log.d("[PROGRESS] totalSteps", length);
    return length;
  }
);

// Derive the progress value from the store states
export const progress = derived(
  [...stores, totalSteps],
  ([$race, $characterClass, $characterSubClass, $background, $abilityGenerationMethod, , , , $totalSteps]) => {
    const completed = [$race, $background, $characterClass, $characterSubClass, $abilityGenerationMethod].filter((value, index) => {
      if (index === 4) { // Index of abilityGenerationMethod
        window.GAS.log.d(`[PROGRESS] val, idx, name`, value, index, stores[index]?.name);
        return isAbilityGenerationMethodReady($abilityGenerationMethod);
      }
      window.GAS.log.d(`[PROGRESS] val, idx, name`, value, index, stores[index]?.name);
      return !!value;
    }).length;

    window.GAS.log.d("[PROGRESS] completed", completed);
    window.GAS.log.d("[PROGRESS] total", $totalSteps);
    return (completed / $totalSteps) * 100;
  }
);
