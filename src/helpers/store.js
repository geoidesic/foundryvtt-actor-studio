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
      const now = Date.now();
      game.system.log.d('Queue add operation:', {
        itemId: app.id,
        itemType: app.itemData?.type,
        queueLength: get(store).length,
        queueContents: get(store).map(i => ({id: i.id, type: i.itemData?.type})),
        timestamp: now
      });

      update(apps => {
        const filteredApps = apps.filter(existingApp => existingApp.id !== app.id);
        const newApps = [...filteredApps, app];
        
        game.system.log.d('Queue updated:', {
          itemId: app.id,
          elapsed: Date.now() - now,
          newLength: newApps.length,
          newContents: newApps.map(i => ({id: i.id, type: i.itemData?.type}))
        });
        
        return newApps;
      });
    },


    remove,
    removeAll: () => set([]),
    advanceQueue: async function (initial) {
      const currentStore = get(store);
      game.system.log.d('Queue state at start:', {
        currentStore,
        storeLength: currentStore.length,
        initial,
        currentProcess: get(inProcess)
      });

      const next = currentStore[0] || false;
      game.system.log.d('Next item:', {
        next,
        nextId: next?.id,
        nextType: next?.itemData?.type,
        remainingItems: currentStore.slice(1)
      });
      
      if (!next) {
        game.system.log.d('Queue empty, finishing');
        inProcess.set(false);
        return false;
      }
      
      inProcess.set(next);
      remove(next.id);
      
      const item = await prepareItemForDrop(next);
      game.system.log.d('Item prepared:', {
        item,
        type: item.type,
        hasAdvancement: itemHasAdvancementChoices(item),
        advancementDetails: item.advancement
      });

      try {
        const result = await dropItemOnCharacter(next.actor, item);
        game.system.log.d('Item dropped:', {
          result,
          remainingQueue: get(store),
          currentProcess: get(inProcess)
        });

        if (itemHasAdvancementChoices(item)) {
          game.system.log.d('Processing advancement:', {
            type: item.type,
            name: item.name,
            advancement: item.advancement,
            currentTab: get(activeTab),
            queueState: get(store)
          });
          
          if (get(activeTab) !== 'advancements') {
            await tabs.update(t => [...t, { 
              label: "Advancements", 
              id: "advancements", 
              component: "Advancements" 
            }]);
            activeTab.set('advancements');
          }
          await new Promise(resolve => setTimeout(resolve, 200));
          await Hooks.call('closeAdvancementManager');

          game.system.log.d('Advancement check details:', {
            itemType: item.type,
            advancementArray: Array.isArray(item.advancement) ? item.advancement : [],
            hasChoices: itemHasAdvancementChoices(item),
            advancementTypes: Array.isArray(item.advancement) ? item.advancement.map(a => a.type) : [],
            choices: Array.isArray(item.advancement) ? item.advancement.map(a => a.choices) : []
          });
        }

        game.system.log.d('Before next queue iteration:', {
          remainingQueue: get(store),
          currentProcess: get(inProcess),
          activeTab: get(activeTab)
        });

        return this.advanceQueue(initial);

      } catch (error) {
        game.system.log.d('Error in queue processing:', {
          error,
          item,
          remainingQueue: get(store)
        });
        return this.advanceQueue(initial);
      }
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