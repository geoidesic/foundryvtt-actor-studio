import { derived, get } from 'svelte/store';
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

function calculateProgressStoreLength(characterClass, characterSubClass) {
  let length = 5;
  if (
    get(subClassesForClass).length > 0 &&
    isSubclassForThisCharacterLevel(characterClass, characterSubClass)
  ) {
    length = length - 1;
  }
  return length;
}

/**
 * @why: some classes don't have subclasses until later levels
 * @param characterClass
 * @param characterSubClass
 */
function isSubclassForThisCharacterLevel(characterClass, characterSubClass) {
  const subClassLevel = characterClass?.getFlag
    ? characterClass.getFlag(MODULE_ID, "subclassLevel")
    : false;
  const actorLevel = game.actor?.system?.details?.level
    ? game.actor.system.details.level + 1
    : 1;
  game.system.log.d("[PROGRESS - derived store] subClassLevel", subClassLevel);
  game.system.log.d("[PROGRESS - derived store] level", actorLevel);
  game.system.log.d(
    "[PROGRESS - derived store] subClassLevel === level",
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

// Derive the progress value from the store states
export const progress = derived(stores, ($stores) => {
  const [
    race,
    characterClass,
    characterSubClass,
    background,
    abilityGenerationMethod,
  ] = $stores;
  const length = calculateProgressStoreLength(
    characterClass,
    characterSubClass,
  );
  const total = $stores.slice(0, length).length; // Only count the main five stores for total
  const completed = $stores.slice(0, 5).filter((value, index) => {
    if (index === 4) {
      // Index of abilityGenerationMethod
      return isAbilityGenerationMethodReady(abilityGenerationMethod);
    }
    return !!value;
  }).length;
  game.system.log.d("[PROGRESS - derived store] completed", completed);
  game.system.log.d("[PROGRESS - derived store] total", total);
  return (completed / total) * 100;
});
