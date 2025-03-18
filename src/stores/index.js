import { writable, get, derived } from 'svelte/store';
// Import all store definitions
import * as storeDefinitions from './storeDefinitions';
// Re-export all store definitions
export * from './storeDefinitions';

import { advancementQueueStore } from "~/src/stores/advancements";
import { clearGoldChoices } from "~/src/stores/goldChoices";
import { MODULE_ID } from "~/src/helpers/constants";
import { getSubclassLevel } from '~/src/helpers/Utility';

const initialTabs = [
  { label: "Abilities", id: "abilities", component: "Abilities" },
  { label: "Race", id: "race", component: "Race" },
  { label: "Background", id: "background", component: "Background" },
  { label: "Class", id: "class", component: "Class" },
]

// Tabs for level up
const upTabs = [
  { label: "Level Up", id: "level-up", component: "LevelUp" }
]

// Set initial values for tabs
storeDefinitions.tabs.set(initialTabs);
storeDefinitions.levelUpTabs.set(upTabs);
storeDefinitions.pointBuyLimit.set(27);

// Set names for debugging
storeDefinitions.race.name = "race";
storeDefinitions.subRace.name = "subRace";
storeDefinitions.characterClass.name = "characterClass";
storeDefinitions.characterSubClass.name = "characterSubClass";
storeDefinitions.background.name = "background";
storeDefinitions.abilities.name = "abilities";
storeDefinitions.spells.name = "spells";
storeDefinitions.isLevelUp.name = "isLevelUp";
storeDefinitions.pointBuyScoreTotal.name = "pointBuyScoreTotal";
storeDefinitions.pointBuyLimit.name = "pointBuyLimit";
storeDefinitions.abilityRolls.name = "abilityRolls";
storeDefinitions.isStandardArrayValues.name = "isStandardArrayValues";
storeDefinitions.newLevelValueForExistingClass.name = "newLevelValueForExistingClass";
storeDefinitions.classUuidForLevelUp.name = "classUuidForLevelUp";
storeDefinitions.level.name = "level";
storeDefinitions.activeTab.name = "activeTab";
storeDefinitions.selectedMultiClassUUID.name = "selectedMultiClassUUID";
storeDefinitions.isActorCreated.name = "isActorCreated";
storeDefinitions.tabs.name = "tabs";
storeDefinitions.levelUpTabs.name = "levelUpTabs";
storeDefinitions.actorInGame.name = "actorInGame";
storeDefinitions.abilityGenerationMethod.name = "abilityGenerationMethod";
storeDefinitions.subClassesForClass.name = "subClassesForClass";
storeDefinitions.levelUpClassObject.name = "levelUpClassObject";
storeDefinitions.activeRowClassKey.name = "activeRowClassKey";
storeDefinitions.levelUpSubClassObject.name = "levelUpSubClassObject";
// Export the advancement queue store
export const dropItemRegistry = advancementQueueStore(); 
dropItemRegistry.name = "dropItemRegistry";

export const isNewMultiClass = derived(
  [storeDefinitions.characterClass,  storeDefinitions.newLevelValueForExistingClass], 
  ([$characterClass, $newLevelValueForExistingClass]) => {
    if ($newLevelValueForExistingClass) return false;
    if ($characterClass && !$newLevelValueForExistingClass) return true;
  }
);

export const subclassLevel = derived([storeDefinitions.classUuidForLevelUp, storeDefinitions.levelUpClassObject], ([$classUuidForLevelUp, $levelUpClassObject]) => {
  if (!$classUuidForLevelUp || !$levelUpClassObject) return false;
  const result = $classUuidForLevelUp ? getSubclassLevel($levelUpClassObject, MODULE_ID) : false;
  window.GAS.log.d('[subclassLevel] classUuidForLevelUp', $classUuidForLevelUp)
  window.GAS.log.d('[subclassLevel] levelUpClassObject', $levelUpClassObject)
  window.GAS.log.d('[subclassLevel] getSubclassLevel($levelUpClassObject, MODULE_ID)', getSubclassLevel($levelUpClassObject, MODULE_ID))
  window.GAS.log.d('[subclassLevel] result', result)
  return result;
});

// Derived store to check if the class gets a subclass at the current level up level
export const classGetsSubclassThisLevel = derived(
  [storeDefinitions.classUuidForLevelUp, subclassLevel, storeDefinitions.newLevelValueForExistingClass, storeDefinitions.levelUpClassObject], 
  ([$classUuidForLevelUp, $subClassLevel, $newLevelValueForExistingClass, $levelUpClassObject]) => {
    window.GAS.log.d('[classGetsSubclassThisLevel] classUuidForLevelUp', $classUuidForLevelUp)
    window.GAS.log.d('[classGetsSubclassThisLevel] newLevelValueForExistingClass', $newLevelValueForExistingClass)
    window.GAS.log.d('[classGetsSubclassThisLevel] levelUpClassObject', $levelUpClassObject)
    if (!$classUuidForLevelUp || !$levelUpClassObject) return false;
    
    window.GAS.log.d('[classGetsSubclassThisLevel] subClassLevel', $subClassLevel)
    window.GAS.log.d('[classGetsSubclassThisLevel] newLevelValueForExistingClass', $newLevelValueForExistingClass)
    const result = $subClassLevel && $subClassLevel === $newLevelValueForExistingClass;
    window.GAS.log.d('[classGetsSubclassThisLevel] result', result)
    return result;
  }
);

// Derived store to determine if a new multiclass is selected
export const isNewMultiClassSelected = derived(
  [storeDefinitions.classUuidForLevelUp, storeDefinitions.newLevelValueForExistingClass, storeDefinitions.selectedMultiClassUUID], 
  ([$classUuidForLevelUp, $newLevelValueForExistingClass, $selectedMultiClassUUID]) => {
    return $classUuidForLevelUp && !$newLevelValueForExistingClass && $selectedMultiClassUUID;
  }
);

// Cache store for initial character selection state
export const preAdvancementSelections = writable({});
preAdvancementSelections.name = "preAdvancementSelections";

// Derived store to track changes from initial state
export const hasCharacterCreationChanges = derived(
  [storeDefinitions.race, storeDefinitions.background, storeDefinitions.characterClass, storeDefinitions.characterSubClass, preAdvancementSelections],
  ([$race, $background, $characterClass, $characterSubClass, $preAdvancementSelections]) => {
    // window.GAS.log.d("hasCharacterCreationChanges preAdvancementSelections", $preAdvancementSelections);
    if (Object.keys($preAdvancementSelections).length === 0) return false;
    
    return (
      $race?.id !== $preAdvancementSelections.race?.id ||
      $background?.id !== $preAdvancementSelections.background?.id ||
      $characterClass?.id !== $preAdvancementSelections.class?.id ||
      $characterSubClass?.id !== $preAdvancementSelections.subclass?.id
    );
  }
);

// Derived store to check if advancements are in progress
export const isAdvancementInProgress = derived(
  [storeDefinitions.tabs],
  ([$tabs]) => {
    window.GAS.log.d('[isAdvancementInProgress] tabs', $tabs)
    return $tabs.find(tab => tab.id === 'advancements') ? true : false;
  }
);
export const isLevelUpAdvancementInProgress = derived(
  [storeDefinitions.levelUpTabs],
  ([$levelUpTabs]) => {
    window.GAS.log.d('[isLevelUpAdvancementInProgress] tabs', $levelUpTabs)
    return $levelUpTabs.find(tab => tab.id === 'advancements') ? true : false;
  }
);

//- Derived store to get the changed items
export const changedCharacterCreationItems = derived(
  [storeDefinitions.race, storeDefinitions.background, storeDefinitions.characterClass, storeDefinitions.characterSubClass, preAdvancementSelections], 
  ([$race, $background, $characterClass, $characterSubClass, $preAdvancementSelections]) => {
    if (Object.keys($preAdvancementSelections).length === 0) return [];
    
    const changes = [];
    if ($race?.id !== $preAdvancementSelections.race?.id) {
      changes.push({ type: 'race', item: $preAdvancementSelections.race });
    }
    if ($background?.id !== $preAdvancementSelections.background?.id) {
      changes.push({ type: 'background', item: $preAdvancementSelections.background });
    }
    if ($characterClass?.id !== $preAdvancementSelections.class?.id) {
      changes.push({ type: 'class', item: $preAdvancementSelections.class });
    }
    if ($characterSubClass?.id !== $preAdvancementSelections.subclass?.id) {
      changes.push({ type: 'subclass', item: $preAdvancementSelections.subclass });
    }
    return changes;
  }
);

export const resetLevelUpStores = () => {
  storeDefinitions.classUuidForLevelUp.set(null); //- tracks the class uuid for level up
  storeDefinitions.newLevelValueForExistingClass.set(false); //- tracks new level value for existing class
  storeDefinitions.selectedMultiClassUUID.set(false); //- tracks the selected multi class
  storeDefinitions.levelUpClassObject.set(null); //- tracks the new multi class object
  storeDefinitions.levelUpSubClassObject.set(null); //- tracks the new multi class object
}

// Function to reset all stores
export function resetStores() {
  window.GAS.log.d('[resetStores]')
  storeDefinitions.race.set(null); //- null | object
  storeDefinitions.background.set(null); //- null | object
  storeDefinitions.characterClass.set(null); //- null | object
  storeDefinitions.characterSubClass.set(null); //- null | object
  storeDefinitions.abilityRolls.set(false); //- boolean
  storeDefinitions.level.set(1); //- number
  storeDefinitions.tabs.set(initialTabs); //- array
  storeDefinitions.pointBuyScoreTotal.set(12); //- number
  storeDefinitions.pointBuyLimit.set(game.settings.get(MODULE_ID, "pointBuyLimit")); //- number
  storeDefinitions.activeTab.set(initialTabs[0].id); //- string
  storeDefinitions.isActorCreated.set(false); //- boolean
  storeDefinitions.actorInGame.set(null); //- null | object
  storeDefinitions.abilityGenerationMethod.set(null); //- null | string
  storeDefinitions.subClassesForClass.set([]); //- array
  storeDefinitions.goldRoll.set(0); //- number
  storeDefinitions.readOnlyTabs.set([]); //- array
  storeDefinitions.levelUpTabs.set(upTabs); //- array
  storeDefinitions.levelUpClassObject.set(null); //- null | object
  storeDefinitions.newLevelValueForExistingClass.set(false); //- boolean
  storeDefinitions.selectedMultiClassUUID.set(null); //- null | uuid string
  storeDefinitions.activeRowClassKey.set(null); //- null | string
  storeDefinitions.classUuidForLevelUp.set(null); //- null | uuid string
  storeDefinitions.levelUpSubClassObject.set(null); //- null | object
  preAdvancementSelections.set({}); //- void
  dropItemRegistry.removeAll(); //- void
  clearGoldChoices(); //- void
}