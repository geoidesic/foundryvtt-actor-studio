import { writable, get, derived } from 'svelte/store';;
import { addItemToCharacter, isAdvancementsForLevelInItem, log } from "~/src/helpers/Utility";
const initialTabs = [
  { label: "Abilities", id: "abilities", component: "Abilities" },
  { label: "Race", id: "race", component: "Race" },
  { label: "Background", id: "background", component: "Background" },
  { label: "Class", id: "class", component: "Class" },
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
      update(apps => [...apps, app]);
    },
    remove,
    removeAll: () => set([]),
    advanceQueue: async (initial) => {
      log.d('advanceQueue')
      log.d('advanceQueue initial', initial || false)

      const currentStore = get(store);

      log.d('advanceQueue currentStore.length', currentStore.length)
      
      const next = currentStore[0] || false;
      // log.d('current item to advance: ', next.id)
      if (!next) {
        inProcess.set(false);
        // log.d('end of queue')
        return false;
      }
      inProcess.set(next);
      remove(next.id);
      log.d('advanceQueue currentStore.length', currentStore.length)
      // log.d('dropping item to character', next)
      // log.d(next.itemData);
      addItemToCharacter(next);
      // await addItemToCharacter(next);
      return currentStore.length > 1
    },
    currentProcess: derived(inProcess, $inProcess => $inProcess),
    updateCurrentProcess: (obj) => inProcess.update(p => ({...p, ...obj})),
  };
}

export const race = writable(false); 
export const subRace = writable(false); 
export const characterClass = writable(false); 
export const characterSubClass = writable(false); 
export const background = writable(false); 
export const abilities = writable(false); 
export const spells = writable(false); 
export const level = writable(1); 
export const activeTab = writable(''); 
export const isActorCreated = writable(false);
export const dropItemRegistry = arrayOfObjectsStore();
export const tabs = writable(initialTabs);
export const actorInGame = writable(false);
export const abilityGenerationMethod = writable(null);

// Function to reset all stores
export function resetStores() {
  race.set(false);
  subRace.set(false);
  characterClass.set(false);
  characterSubClass.set(false);
  background.set(false);
  abilities.set(false);
  spells.set(false);
  level.set(1);
  activeTab.set('');
  tabs.set(initialTabs);
  dropItemRegistry.removeAll();
  isActorCreated.set(false);
  actorInGame.set(false);
  abilityGenerationMethod.set(null);
}