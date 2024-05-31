import { writable, get, derived } from 'svelte/store';;
import { addItemToCharacter, isAdvancementsForLevelInItem, log } from "~/src/helpers/Utility";
const initialTabs = [
  { label: "Abilities", id: "abilities", component: "Abilities" },
  { label: "Race", id: "race", component: "Race" },
  { label: "Background", id: "background", component: "Background" },
  { label: "Class", id: "class", component: "Class" },
]

const arrayOfObjectsStore = () => {
  const store = writable([]);
  const inProcess = writable(false);
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
      const next = get(store)[0] || false;
      log.d('next', next)
      if (!next) {
        inProcess.set(false);
        return false;
      }
      inProcess.set(next);
      remove(next.id);
      log.d('queue', get(store))
      const itemData = await addItemToCharacter(next);
      log.d('itemData', itemData)
      return isAdvancementsForLevelInItem(1, itemData) //- hard-coded to level 1 because this module only currently supports level 1 advancements
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
}