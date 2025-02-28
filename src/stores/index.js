import { writable, get, derived } from 'svelte/store';;
import { advancementQueueStore } from "~/src/stores/advancments";


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


export const race = writable(false); race.name = "race";
export const subRace = writable(false); subRace.name = "subRace";
export const characterClass = writable(false); characterClass.name = "characterClass";
export const characterSubClass = writable(false); characterSubClass.name = "characterSubClass";
export const background = writable(false); background.name = "background";
export const abilities = writable(false); abilities.name = "abilities";
export const spells = writable(false); spells.name = "spells";
export const isLevelUp = writable(false); isLevelUp.name = "isLevelUp";
export const pointBuy = writable(false); pointBuy.name = "pointBuy";
export const abilityRolls = writable(false); abilityRolls.name = "abilityRolls";
export const isStandardArrayValues = writable(false); isStandardArrayValues.name = "isStandardArrayValues";
export const newClassLevel = writable(false); newClassLevel.name = "newClassLevel";
export const level = writable(1); level.name = "level";
export const activeTab = writable(''); activeTab.name = "activeTab";
export const activeClass = writable(false); activeClass.name = "activeClass";
export const isActorCreated = writable(false); isActorCreated.name = "isActorCreated";
export const dropItemRegistry = advancementQueueStore(); dropItemRegistry.name = "dropItemRegistry";
export const tabs = writable(initialTabs); tabs.name = "tabs";
export const levelUpTabs = writable(upTabs); levelUpTabs.name = "levelUpTabs";
export const actorInGame = writable(null); actorInGame.name = "actorInGame";
export const abilityGenerationMethod = writable(null); abilityGenerationMethod.name = "abilityGenerationMethod";
export const subClassesForClass = writable([]); subClassesForClass.name = "subClassesForClass";
export const goldRoll = writable(0);

// Store to track which tabs are in read-only mode
export const readOnlyTabs = writable([]);

export const isMultiClass = derived([characterClass, activeClass, newClassLevel], ([$characterClass, $characterSubClass, $newClassLevel]) => {
  if ($newClassLevel) return false;
  if ($characterClass && !$newClassLevel) return true;
});

// Cache store for initial character selection state
export const preAdvancementSelections = writable(null);

// Derived store to track changes from initial state
export const hasCharacterCreationChanges = derived(
  [race, background, characterClass, characterSubClass, preAdvancementSelections],
  ([$race, $background, $characterClass, $characterSubClass, $initialState]) => {
    window.GAS.log.d("hasCharacterCreationChanges initialState", $initialState);
    if (!$initialState) return false;
    
    return (
      $race?.id !== $initialState.race?.id ||
      $background?.id !== $initialState.background?.id ||
      $characterClass?.id !== $initialState.class?.id ||
      $characterSubClass?.id !== $initialState.subclass?.id
    );
  }
);

//- Derived store to get the changed items
export const changedCharacterCreationItems = derived([race, background, characterClass, characterSubClass, preAdvancementSelections], 
  ([$race, $background, $characterClass, $characterSubClass, $preAdvancementSelections]) => {
    if (!$preAdvancementSelections) return [];
    
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
  race.set(null);
  background.set(null);
  characterClass.set(null);
  characterSubClass.set(null);
  level.set(1);
  tabs.set(initialTabs);
  levelUpTabs.set(upTabs);
  activeTab.set(initialTabs[0].id);
  dropItemRegistry.removeAll();
  isActorCreated.set(false);
  actorInGame.set(null);
  abilityGenerationMethod.set(null);
  subClassesForClass.set([]);
  preAdvancementSelections.set(null);
  goldRoll.set(0);
  readOnlyTabs.set([]);
}