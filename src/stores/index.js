import { writable, get, derived } from 'svelte/store';;
import { dropItemOnCharacter, prepareItemForDrop, itemHasAdvancementChoices, isAdvancementsForLevelInItem } from "~/src/helpers/Utility";
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

async function closeAdvancementManager() {
  const isPanelEmpty = () => {
    // First check if we're on the advancements tab
    if (get(activeTab) !== 'advancements') return false;
    
    const panel = $('#foundryvtt-actor-studio-pc-sheet .window-content main section.a .tab-content .container .content');
    const panelNotEmpty = Boolean(panel.html()?.trim());
    return !panelNotEmpty;
  }
  
  const waitForPanelEmpty = async () => {
    while (!isPanelEmpty()) {
      await new Promise(resolve => setTimeout(resolve, 600));
    }
  };

  // Wait for the panel to become empty
  await waitForPanelEmpty();

  // Once the panel is empty, proceed with the queue
  const queue = await dropItemRegistry.advanceQueue();

  if (!queue) {
    const actor = get(dropItemRegistry.currentProcess)?.actor;
    Hooks.call("gas.close");
    if (actor) {
      actor.sheet.render(true);
    }
  }
}

let lastDrop = writable(false);

const arrayOfObjectsStore = () => {
  const store = writable([]); // stores an object with signature {actorId, itemData, id}  
  const inProcess = writable(false); // stores the advancement application that's in process
  const { subscribe, set, update } = store;

  const remove = (id) => update(apps => apps.filter(app => app.id !== id));

  // Define the expected order of items
  const expectedOrder = ['race', 'background', 'characterClass', 'characterSubClass'];

  return {
    subscribe,
    add: (app) => {
      console.log('ADDING TO QUEUE:', {
        app,
        currentStoreLength: get(store).length,
        currentStore: get(store)
      });

      update(apps => {
        const filteredApps = apps.filter(existingApp => existingApp.id !== app.id);
        const newApps = [...filteredApps, app];
        console.log('QUEUE UPDATED:', {
          filteredApps,
          newApps,
          newLength: newApps.length
        });
        return newApps;
      });
    },
    splice: (app) => {
      console.log('SPLICING INTO QUEUE:', {
        app,
        currentStore: get(store)
      });

      update(apps => {
        // Remove any existing instance of this item
        const filteredApps = apps.filter(existingApp => existingApp.id !== app.id);
        
        // Find the correct position based on expectedOrder
        const appIndex = expectedOrder.indexOf(app.id);
        if (appIndex === -1) {
          // If not in expected order, just append
          return [...filteredApps, app];
        }

        // Find the insertion point by looking at the next expected item
        let insertIndex = filteredApps.length;
        for (let i = appIndex + 1; i < expectedOrder.length; i++) {
          const nextExpectedId = expectedOrder[i];
          const nextItemIndex = filteredApps.findIndex(item => item.id === nextExpectedId);
          if (nextItemIndex !== -1) {
            insertIndex = nextItemIndex;
            break;
          }
        }

        // Insert the item at the correct position
        return [
          ...filteredApps.slice(0, insertIndex),
          app,
          ...filteredApps.slice(insertIndex)
        ];
      });
    },

    remove,
    removeAll: () => set([]),
    advanceQueue: async function (initial) {
      const currentStore = get(store);
      const next = currentStore[0] || false;

      if (!next) {
        inProcess.set(false);
        return false;
      }

      inProcess.set(next);
      remove(next.id);

      const item = await prepareItemForDrop(next);

      try {
        const result = await dropItemOnCharacter(next.actor, item);
        console.log('POST-DROP RESULT:', {
          result,
          itemAfterDrop: item
        });

        const skipDomMove = game.settings.get(MODULE_ID, 'devDisableAdvancementMove');
        if (skipDomMove) {
          window.GAS.log.d('Dev setting: Skipping advancement DOM movement');
          return true;
        }
      } catch (error) {
        // error handling...
      }

      if (get(activeTab) != 'advancements') {
        const currentTabs = get(tabs);
        const advancementTabExists = currentTabs.some(tab => tab.id === 'advancements');
        
        if (!advancementTabExists) {
          await tabs.update(t => [...t, { label: "Advancements", id: "advancements", component: "Advancements" }]);
        }
        activeTab.set('advancements');
      }

      await new Promise(resolve => setTimeout(resolve, 200));
      //- @why: this hook will recursively call advanceQueue until it returns false, it's a hook because it needs access to the jQuery DOM
      // return await Hooks.call('closeAdvancementManager');
      return await closeAdvancementManager()
    },
    currentProcess: derived(inProcess, $inProcess => $inProcess),
    updateCurrentProcess: (obj) => inProcess.update(p => ({ ...p, ...obj })),
  };
}


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
export const dropItemRegistry = arrayOfObjectsStore(); dropItemRegistry.name = "dropItemRegistry";
export const tabs = writable(initialTabs); tabs.name = "tabs";
export const levelUpTabs = writable(upTabs); levelUpTabs.name = "levelUpTabs";
export const actorInGame = writable(false); actorInGame.name = "actorInGame";
export const abilityGenerationMethod = writable(null); abilityGenerationMethod.name = "abilityGenerationMethod";
export const subClassesForClass = writable([]); subClassesForClass.name = "subClassesForClass";

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
  race.set(false);
  subRace.set(false);
  characterClass.set(false);
  characterSubClass.set(false);
  background.set(false);
  abilities.set(false);
  isLevelUp.set(false);
  pointBuy.set(false);
  isStandardArrayValues.set(false);
  abilityRolls.set({});
  newClassLevel.set(false);
  spells.set(false);
  level.set(1);
  activeTab.set('');
  activeClass.set(false);
  tabs.set(initialTabs);
  levelUpTabs.set(upTabs)
  dropItemRegistry.removeAll();
  isActorCreated.set(false);
  actorInGame.set(false);
  abilityGenerationMethod.set(null);
  subClassesForClass.set([]);
  preAdvancementSelections.set(null);
}