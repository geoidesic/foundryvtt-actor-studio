import { writable, get, derived } from 'svelte/store';;
import { dropItemOnCharacter, prepareItemForDrop, itemHasAdvancementChoices } from "~/src/helpers/Utility";
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
      update(apps => {
        const filteredApps = apps.filter(existingApp => existingApp.id !== app.id); // Remove any app with the same id
        return [...filteredApps, app]; // Add the new app
      });
      game.system.log.d('currentStore.length', get(store).length);
    },


    remove,
    removeAll: () => set([]),
    advanceQueue: async function (initial) {
      // game.system.log.d('advanceQueue')
      // game.system.log.d('advanceQueue initial', initial || false)

      const currentStore = get(store);
      // game.system.log.d('currentStore.length', currentStore.length)
      // game.system.log.d('advanceQueue currentStore.length', currentStore.length)

      const next = currentStore[0] || false;
      // game.system.log.d("advanceQueue next", next);
      // game.system.log.d('current item to advance: ', next.id)

      if (!next) {
        inProcess.set(false);
        // game.system.log.d('end of queue')
        return false;
      }
      inProcess.set(next);
      remove(next.id);
      // game.system.log.d('advanceQueue currentStore.length', currentStore.length)
      // game.system.log.d('dropping item to character', next)
      // game.system.log.d(next.itemData);
      const item = await prepareItemForDrop(next)

      try {
        const result = await dropItemOnCharacter(next.actor, item);
        // game.system.log.d('dropItemOnCharacter result', result)
      } catch (error) {
        // game.system.log.e('dropItemOnCharacter error', error)
      }
      if (currentStore.length > 1) {

        if (!itemHasAdvancementChoices(next.itemData)) {
          // game.system.log.d('!itemHasAdvancementChoices');
          // game.system.log.d('get(activeTab)', get(activeTab));
          if (get(activeTab) != 'advancements') {
            // game.system.log.d('advanceQueue opening Advancements tab');
            await tabs.update(t => [...t, { label: "Advancements", id: "advancements", component: "Advancements" }]);
            activeTab.set('advancements');
            // game.system.log.d('advanceQueue Advancements tab opened');
          }
          // game.system.log.d('advanceQueue calling closeAdvancementManager');
          //- @why: allow other async functions to complete before closing the advancement manager
          await new Promise(resolve => setTimeout(resolve, 200));
          return await Hooks.call('closeAdvancementManager');

        }
      }
      if (currentStore.length == 1) {
        if (!itemHasAdvancementChoices(next.itemData)) {
          // game.system.log.d('advanceQueue no more items in queue');
          return false
        }
      }
      if (currentStore.length == 0) {
        // game.system.log.d('advanceQueue no more items in queue');
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