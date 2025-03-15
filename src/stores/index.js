import { writable, get, derived } from 'svelte/store';
// Import all store definitions
import * as storeDefinitions from './storeDefinitions';
// Re-export all store definitions
export * from './storeDefinitions';

import { advancementQueueStore } from "~/src/stores/advancements";
import { clearGoldChoices } from "~/src/stores/goldChoices";
import { MODULE_ID } from "~/src/helpers/constants";


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
storeDefinitions.newClassLevel.name = "newClassLevel";
storeDefinitions.level.name = "level";
storeDefinitions.activeTab.name = "activeTab";
storeDefinitions.selectedMultiClass.name = "selectedMultiClass";
storeDefinitions.isActorCreated.name = "isActorCreated";
storeDefinitions.tabs.name = "tabs";
storeDefinitions.levelUpTabs.name = "levelUpTabs";
storeDefinitions.actorInGame.name = "actorInGame";
storeDefinitions.abilityGenerationMethod.name = "abilityGenerationMethod";
storeDefinitions.subClassesForClass.name = "subClassesForClass";

// Export the advancement queue store
export const dropItemRegistry = advancementQueueStore(); 
dropItemRegistry.name = "dropItemRegistry";

export const isNewMultiClass = derived(
  [storeDefinitions.characterClass,  storeDefinitions.newClassLevel], 
  ([$characterClass, $newClassLevel]) => {
    if ($newClassLevel) return false;
    if ($characterClass && !$newClassLevel) return true;
  }
);

// Cache store for initial character selection state
export const preAdvancementSelections = writable({});
preAdvancementSelections.name = "preAdvancementSelections";

// Derived store to track changes from initial state
export const hasCharacterCreationChanges = derived(
  [storeDefinitions.race, storeDefinitions.background, storeDefinitions.characterClass, storeDefinitions.characterSubClass, preAdvancementSelections],
  ([$race, $background, $characterClass, $characterSubClass, $preAdvancementSelections]) => {
    window.GAS.log.d("hasCharacterCreationChanges preAdvancementSelections", $preAdvancementSelections);
    if (Object.keys($preAdvancementSelections).length === 0) return false;
    
    return (
      $race?.id !== $preAdvancementSelections.race?.id ||
      $background?.id !== $preAdvancementSelections.background?.id ||
      $characterClass?.id !== $preAdvancementSelections.class?.id ||
      $characterSubClass?.id !== $preAdvancementSelections.subclass?.id
    );
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

// Function to reset all stores
export function resetStores() {
  storeDefinitions.race.set(null);
  storeDefinitions.background.set(null);
  storeDefinitions.characterClass.set(null);
  storeDefinitions.characterSubClass.set(null);
  storeDefinitions.abilityRolls.set(false);
  storeDefinitions.level.set(1);
  storeDefinitions.tabs.set(initialTabs);
  storeDefinitions.levelUpTabs.set(upTabs);
  storeDefinitions.pointBuyScoreTotal.set(12);
  storeDefinitions.pointBuyLimit.set(game.settings.get(MODULE_ID, "pointBuyLimit"));
  storeDefinitions.selectedMultiClass.set(false);
  storeDefinitions.activeTab.set(initialTabs[0].id);
  dropItemRegistry.removeAll();
  storeDefinitions.isActorCreated.set(false);
  storeDefinitions.actorInGame.set(null);
  storeDefinitions.abilityGenerationMethod.set(null);
  storeDefinitions.subClassesForClass.set([]);
  window.GAS.log.d("resetStores preAdvancementSelections", get(preAdvancementSelections));
  preAdvancementSelections.set({});
  storeDefinitions.goldRoll.set(0);
  storeDefinitions.readOnlyTabs.set([]);
  clearGoldChoices();
}