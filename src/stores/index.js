import { writable, get, derived } from 'svelte/store';
// Import all store definitions
import * as storeDefinitions from './storeDefinitions.js';
// Re-export all store definitions
export * from './storeDefinitions.js';

import { advancementQueueStore } from '~/src/stores/advancements';
import { clearGoldChoices } from '~/src/stores/goldChoices';
import { clearEquipmentSelections } from '~/src/stores/equipmentSelections';
import { clearStartingEquipment } from '~/src/stores/startingEquipment';
// Import and re-export equipment gold stores
import { 
  equipmentGoldOptions, 
  parsedEquipmentGold, 
  totalEquipmentGold, 
  areEquipmentGoldChoicesComplete,
  clearEquipmentGoldChoices 
} from '~/src/stores/equipmentGold';
export { 
  equipmentGoldOptions, 
  parsedEquipmentGold, 
  totalEquipmentGold, 
  areEquipmentGoldChoicesComplete 
} from '~/src/stores/equipmentGold';
// Import spell selection store to ensure it gets loaded
import '~/src/stores/spellSelection';
// Initialize NPC stores (persistence, progress)
import '~/src/stores/npc';
import { clearNpcSelection, magicItemsState, resetMagicItemsToDefault } from '~/src/stores/npc';
import { MODULE_ID } from '~/src/helpers/constants';
import { getSubclassLevel } from '~/src/helpers/Utility';

const initialTabs = [
  { label: 'Abilities', id: 'abilities', component: 'Abilities' },
  { label: 'Race', id: 'race', component: 'Race' },
  { label: 'Background', id: 'background', component: 'Background' },
  { label: 'Class', id: 'class', component: 'Class' },
];

const npcTabs = [
  { label: 'NpcSelect', id: 'npc-select', component: 'NpcSelect' },
  { label: 'Features', id: 'npc-features', component: 'NpcFeatures' },
  { label: 'Stats', id: 'npc-create', component: 'NpcCreate' },
  { label: 'Equipment', id: 'npc-equipment-shop', component: 'NpcEquipmentShop' },
  { label: 'Treasure', id: 'magic-items', component: 'MagicItems' },
  { label: 'Biography', id: 'npc-biography', component: 'NpcBiography' },
];

// Tabs for level up
const upTabs = [
  { label: 'Level Up', id: 'level-up', component: 'LevelUp' },
];

// Set initial values for tabs
storeDefinitions.tabs.set(initialTabs);
storeDefinitions.levelUpTabs.set(upTabs);
storeDefinitions.npcTabs.set(npcTabs);
// Initialize NPC-specific stores
storeDefinitions.selectedNpcBase.set(null);
storeDefinitions.pointBuyLimit.set(27);

// Set names for debugging
storeDefinitions.race.name = 'race';
storeDefinitions.subRace.name = 'subRace';
storeDefinitions.characterClass.name = 'characterClass';
storeDefinitions.characterSubClass.name = 'characterSubClass';
storeDefinitions.background.name = 'background';
storeDefinitions.abilities.name = 'abilities';
storeDefinitions.spells.name = 'spells';
storeDefinitions.isLevelUp.name = 'isLevelUp';
storeDefinitions.pointBuyScoreTotal.name = 'pointBuyScoreTotal';
storeDefinitions.pointBuyLimit.name = 'pointBuyLimit';
storeDefinitions.abilityRolls.name = 'abilityRolls';
storeDefinitions.isStandardArrayValues.name = 'isStandardArrayValues';
storeDefinitions.newLevelValueForExistingClass.name = 'newLevelValueForExistingClass';
storeDefinitions.classUuidForLevelUp.name = 'classUuidForLevelUp';
storeDefinitions.level.name = 'level';
storeDefinitions.activeTab.name = 'activeTab';
storeDefinitions.selectedMultiClassUUID.name = 'selectedMultiClassUUID';
storeDefinitions.isActorCreated.name = 'isActorCreated';
storeDefinitions.tabs.name = 'tabs';
storeDefinitions.levelUpTabs.name = 'levelUpTabs';
storeDefinitions.npcTabs.name = 'npcTabs';
storeDefinitions.actorInGame.name = 'actorInGame';
storeDefinitions.abilityGenerationMethod.name = 'abilityGenerationMethod';
storeDefinitions.subClassesForClass.name = 'subClassesForClass';
storeDefinitions.levelUpClassObject.name = 'levelUpClassObject';
storeDefinitions.activeRowClassKey.name = 'activeRowClassKey';
storeDefinitions.levelUpSubClassObject.name = 'levelUpSubClassObject';
storeDefinitions.levelUpCombinedHtml.name = 'levelUpCombinedHtml';
storeDefinitions.itemsFromActor.name = 'itemsFromActor';
storeDefinitions.selectedNpcBase.name = 'selectedNpcBase';
storeDefinitions.npcCurrency.name = 'npcCurrency';



// Export the advancement queue store
export const dropItemRegistry = advancementQueueStore();
dropItemRegistry.name = 'dropItemRegistry';

// Export NPC currency store
export const npcCurrency = storeDefinitions.npcCurrency;

// Export magic items state store and reset function
export { magicItemsState, resetMagicItemsToDefault };

export const isNewMultiClass = derived(
  [storeDefinitions.characterClass, storeDefinitions.newLevelValueForExistingClass],
  ([$characterClass, $newLevelValueForExistingClass]) => {
    if ($newLevelValueForExistingClass) return false;
    if ($characterClass && !$newLevelValueForExistingClass) return true;
  }
);

export const subclassLevelForLevelUp = derived(
  [storeDefinitions.classUuidForLevelUp, storeDefinitions.levelUpClassObject],
  ([$classUuidForLevelUp, $levelUpClassObject]) => {
    if (!$classUuidForLevelUp || !$levelUpClassObject) return false;
    const result = $classUuidForLevelUp ? getSubclassLevel($levelUpClassObject, MODULE_ID) : false;
    // window.GAS.log.d('[subclassLevel] classUuidForLevelUp', $classUuidForLevelUp)
    // window.GAS.log.d('[subclassLevel] levelUpClassObject', $levelUpClassObject)
    // window.GAS.log.d('[subclassLevel] getSubclassLevel($levelUpClassObject, MODULE_ID)', getSubclassLevel($levelUpClassObject, MODULE_ID))
    // window.GAS.log.d('[subclassLevel] result', result)
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

// Derived store to check if the class gets a subclass at the current level up level
export const levelUpClassGetsSubclassThisLevel = derived(
  [storeDefinitions.classUuidForLevelUp, subclassLevelForLevelUp, storeDefinitions.newLevelValueForExistingClass, storeDefinitions.levelUpClassObject, isNewMultiClassSelected],
  ([$classUuidForLevelUp, $subclassLevelForLevelUp, $newLevelValueForExistingClass, $levelUpClassObject, $isNewMultiClassSelected]) => {
    // window.GAS.log.d('[classGetsSubclassThisLevel] classUuidForLevelUp', $classUuidForLevelUp)
    // window.GAS.log.d('[classGetsSubclassThisLevel] newLevelValueForExistingClass', $newLevelValueForExistingClass)
    // window.GAS.log.d('[classGetsSubclassThisLevel] levelUpClassObject', $levelUpClassObject)
    // window.GAS.log.d('[classGetsSubclassThisLevel] isNewMultiClassSelected', $isNewMultiClassSelected)
    if (!$classUuidForLevelUp || !$levelUpClassObject) return false;

    // Determine the current level: 1 for new multiclass, existing level + 1 for existing class
    const currentLevel = $isNewMultiClassSelected ? 1 : $newLevelValueForExistingClass;

    // window.GAS.log.d('[classGetsSubclassThisLevel] subclassLevelForLevelUp', $subclassLevelForLevelUp)
    // window.GAS.log.d('[classGetsSubclassThisLevel] currentLevel', currentLevel)
    const result = $subclassLevelForLevelUp && $subclassLevelForLevelUp === currentLevel;
    // window.GAS.log.d('[classGetsSubclassThisLevel] result', result)
    return result;
  }
);

// Cache store for initial character selection state
export const preAdvancementSelections = writable({});
preAdvancementSelections.name = 'preAdvancementSelections';

// Cache store for initial character selection state
export const levelUpPreAdvancementSelections = writable({});
levelUpPreAdvancementSelections.name = 'levelUpPreAdvancementSelections';

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
    // window.GAS.log.d('[isAdvancementInProgress] tabs', $tabs)
    return $tabs.find((tab) => tab.id === 'advancements') ? true : false;
  }
);
export const isLevelUpAdvancementInProgress = derived(
  [storeDefinitions.levelUpTabs],
  ([$levelUpTabs]) => {
    // window.GAS.log.d('[isLevelUpAdvancementInProgress] tabs', $levelUpTabs)
    return $levelUpTabs.find((tab) => tab.id === 'advancements') ? true : false;
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
  storeDefinitions.levelUpCombinedHtml.set(''); //- string
  storeDefinitions.levelUpRichHTML.set(''); //- string
  storeDefinitions.levelUpRichSubClassHTML.set(''); //- string
  preAdvancementSelections.set({}); //- void
  levelUpPreAdvancementSelections.set({}); //- void
  dropItemRegistry.removeAll(); //- void
  storeDefinitions.itemsFromActor.set([]); //- void
  clearGoldChoices(); //- void
  clearEquipmentSelections(); //- void
  clearStartingEquipment(); //- void
  clearEquipmentGoldChoices(); //- void
  clearNpcSelection(); //- void
  // Don't reset NPC currency here - let it be properly rolled based on NPC CR
  
  // Clear magic items store
  try {
    import('~/src/stores/npc.js').then(({ magicItemsState }) => {
      magicItemsState.set({
        generationType: 'individual',
        partyLevel: 5,
        generatedMagicItems: [],
        manualNpcName: '',
        manualNpcCR: 0,
        manualNpcType: ''
      });
      window.GAS.log.d('[resetStores] Cleared magicItemsState store');
    }).catch(error => {
      window.GAS.log.w('[resetStores] Failed to clear magic items store:', error);
    });
  } catch (error) {
    window.GAS.log.w('[resetStores] Error importing magic items module:', error);
  }
  
  // Clear spell selection stores
  try {
    // Import and clear spell selection stores
    import('~/src/stores/spellSelection').then(({ selectedSpells }) => {
      selectedSpells.set(new Map());
      window.GAS.log.d('[resetStores] Cleared selectedSpells store');
    }).catch(error => {
      window.GAS.log.w('[resetStores] Failed to clear spell selection stores:', error);
    });
  } catch (error) {
    window.GAS.log.w('[resetStores] Error importing spell selection module:', error);
  }
}

// Auto-update levelUpTabs with level progression information
const levelUpTabUpdater = derived(
  [storeDefinitions.newLevelValueForExistingClass, isNewMultiClassSelected],
  ([$newLevelValueForExistingClass, $isNewMultiClassSelected]) => {
    let label = 'Level Up';
    
    if ($isNewMultiClassSelected) {
      // New multiclass: show "Level Up (MC)" for multiclass
      label = 'Level Up (MC)';
    } else if ($newLevelValueForExistingClass) {
      // Existing class level up: show progression like "Level Up (3 → 4)"
      const currentLevel = $newLevelValueForExistingClass - 1;
      const newLevel = $newLevelValueForExistingClass;
      label = `Level Up (${currentLevel} → ${newLevel})`;
    }
    
    // Update the levelUpTabs store with the new label
    storeDefinitions.levelUpTabs.update(tabs => 
      tabs.map(tab => 
        tab.id === 'level-up' 
          ? { ...tab, label } 
          : tab
      )
    );
    
    return label;
  }
);

// Auto-subscribe to activate the level progression updates (safely)
try {
  levelUpTabUpdater.subscribe(() => {});
} catch (error) {
  // Ignore initialization errors - the subscription will work when stores are ready
  console.debug('Level up tab updater subscription deferred');
}