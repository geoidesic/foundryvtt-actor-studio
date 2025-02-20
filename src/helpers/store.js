import { writable, get, derived } from 'svelte/store';
import { MODULE_ID } from '~/src/helpers/constants';
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
      
      if (!next) {
        inProcess.set(false);
        return false;
      }
      
      inProcess.set(next);
      remove(next.id);
      
      const item = await prepareItemForDrop(next);

      try {
        const result = await dropItemOnCharacter(next.actor, item);
        
        const skipDomMove = game.settings.get(MODULE_ID, 'devDisableAdvancementMove');
        if (skipDomMove) {
          game.system.log.d('Dev setting: Skipping advancement DOM movement');
          return true;
        }
      } catch (error) {
        console.error('Error dropping item:', error);
        return false;
      }
      
      // If this is a class or subclass with advancements, handle them
      if ((item.type === 'class' || item.type === 'subclass') && 
          itemHasAdvancementChoices(item)) {
        
        // For subclasses, we need to check the parent class identifier
        const classIdentifier = item.type === 'subclass' ? 
          item.system?.classIdentifier : 
          item.system?.identifier;
        
        // Add debug logging
        game.system.log.d('Checking advancements for:', {
          itemType: item.type,
          itemName: item.name,
          classIdentifier,
          hasClasses: !!next.actor.classes,
          classExists: next.actor.classes?.[classIdentifier],
          advancements: item.system?.advancement
        });

        // Check if we can process advancements
        if (next.actor.classes?.[classIdentifier]) {
          const levels = next.actor.classes[classIdentifier].system.levels;
          if (isAdvancementsForLevelInItem(levels, item)) {
            if (get(activeTab) !== 'advancements') {
              await tabs.update(t => [...t, { 
                label: "Advancements", 
                id: "advancements", 
                component: "Advancements" 
              }]);
              activeTab.set('advancements');
            }
            await new Promise(resolve => setTimeout(resolve, 200));
            return await Hooks.call('closeAdvancementManager');
          }
        }
      }

      // If there are more items in the queue, process the next one
      if (currentStore.length > 0) {
        return this.advanceQueue(initial);
      }

      return false;
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