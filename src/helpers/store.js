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
  { label: "Level Up", id: "level-up", component: "LevelUp" },

]

let lastDrop = writable(false);

const arrayOfObjectsStore = () => {
  const store = writable([]); // stores an object with signature {actorId, itemData, id}  
  const inProcess = writable(false); // stores the advancement application that's in process
  const { subscribe, set, update } = store;

  const remove = (id) => update(apps => apps.filter(app => app.id !== id));

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


    remove,
    removeAll: () => set([]),
    advanceQueue: async function (initial) {
      console.log('QUEUE START STATE:', {
        store: get(store),
        storeLength: get(store).length,
        currentProcess: get(inProcess)
      });

      const currentStore = get(store);
      const next = currentStore[0] || false;

      console.log('NEXT ITEM PRE-PROCESSING:', {
        next,
        nextId: next?.id,
        itemData: next?.itemData,
        hasSystem: next?.itemData?.system !== undefined,
        systemKeys: next?.itemData?.system ? Object.keys(next.itemData.system) : null
      });

      if (!next) {
        inProcess.set(false);
        await Hooks.call('closeAdvancementManager');
        return false;
      }

      inProcess.set(next);
      remove(next.id);

      console.log('PRE-PREPARE ITEM:', {
        nextBeforePrepare: next,
        itemDataBeforePrepare: next.itemData
      });

      const item = await prepareItemForDrop(next);

      console.log('POST-PREPARE ITEM:', {
        preparedItem: item,
        hasSystem: item?.system !== undefined,
        systemKeys: item?.system ? Object.keys(item.system) : null
      });

      try {
        const result = await dropItemOnCharacter(next.actor, item);
        console.log('POST-DROP RESULT:', {
          result,
          itemAfterDrop: item
        });

        const skipDomMove = game.settings.get(MODULE_ID, 'devDisableAdvancementMove');
        if (skipDomMove) {
          game.system.log.d('Dev setting: Skipping advancement DOM movement');
          return true;
        }
      } catch (error) {
        // error handling...
      }

      if (currentStore.length > 1) {
        game.system.log.d('next.itemData', next.itemData)
        game.system.log.d('Multiple items but no advancement choices, state:', {
          currentLength: get(store).length,
          nextItem: next,
          activeTab: get(activeTab)
        });
        if (get(activeTab) != 'advancements') {
          await tabs.update(t => [...t, { label: "Advancements", id: "advancements", component: "Advancements" }]);
          activeTab.set('advancements');
        }
        await new Promise(resolve => setTimeout(resolve, 200));
        game.system.log.d('Calling closeAdvancementManager but returning true');
        return await Hooks.call('closeAdvancementManager');
      }
      if (currentStore.length == 1) {
        game.system.log.d('Single item in queue:', {
          item: next.itemData,
          hasAdvancementChoices: itemHasAdvancementChoices(next.itemData),
          advancementData: next.itemData.system?.advancement,
          version: game.system.version
        });
        if (!itemHasAdvancementChoices(next.itemData)) {
          game.system.log.d('Item has no advancement choices, returning false');
          return false
        }
        //- @why: without this check, the queue will continue to run even if the item has no advancements for the current level
        if (!isAdvancementsForLevelInItem(next.actor.classes[next.itemData.system.classIdentifier].system.levels, next.itemData)) {
          game.system.log.d('Item has no advancements for level, returning false');
          return false
        }
        game.system.log.d('Item has advancement choices, continuing queue');
      }
      if (currentStore.length == 0) {
        return false
      }
      return true;
    },
    currentProcess: derived(inProcess, $inProcess => $inProcess),
    updateCurrentProcess: (obj) => inProcess.update(p => ({ ...p, ...obj })),
  };
}

export const race = writable(false);
export const subRace = writable(false);
export const characterClass = writable(false);
export const characterSubClass = writable(false);
export const background = writable(false);
export const abilities = writable(false);
export const spells = writable(false);
export const isLevelUp = writable(false);
export const pointBuy = writable(false);
export const abilityRolls = writable(false);
export const isStandardArrayValues = writable(false);
export const newClassLevel = writable(false);
export const level = writable(1);
export const activeTab = writable('');
export const activeClass = writable(false);
export const isActorCreated = writable(false);
export const dropItemRegistry = arrayOfObjectsStore();
export const tabs = writable(initialTabs);
export const levelUpTabs = writable(upTabs);
export const actorInGame = writable(false);
export const abilityGenerationMethod = writable(null);
export const subClassesForClass = writable([]);

export const isMultiClass = derived([characterClass, activeClass, newClassLevel], ([$characterClass, $characterSubClass, $newClassLevel]) => {
  if ($newClassLevel) return false;
  if ($characterClass && !$newClassLevel) return true;
});

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

}