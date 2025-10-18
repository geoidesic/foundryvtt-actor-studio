import { writable, get, derived } from 'svelte/store';
import { AdvancementManager } from '~/src/helpers/AdvancementManager';

export const advancementQueueStore = () => {
  const store = writable([]);
  const inProcess = writable(false);
  const { subscribe, set, update } = store;

  const remove = (id) => update(apps => apps.filter(app => app.id !== id));
  const expectedOrder = ['race', 'background', 'characterClass', 'characterSubClass'];

  // Create the store object first
  const storeObj = {
    subscribe,
    add: (app) => {
      update(apps => {
        const filteredApps = apps.filter(existingApp => existingApp.id !== app.id);
        const newApps = [...filteredApps, app];
        return newApps;
      });
    },
    splice: (app) => {
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
    currentProcess: derived(inProcess, $inProcess => $inProcess),
    updateCurrentProcess: (obj) => inProcess.update(p => ({ ...p, ...obj })),
  };

  // Create the advancement manager after storeObj is defined
  const advancementManager = new AdvancementManager(storeObj, inProcess);

  // Expose the advancement manager globally for hooks to access
  if (typeof window !== 'undefined') {
    window.GAS = window.GAS || {};
    window.GAS.advancementManager = advancementManager;
  }

  /**
   * Advances the queue to the next item
   * Will open the Advancements tab if it's required and not already open
   * @param {boolean} initial - Whether this is the initial call to the queue
   * @returns {Promise<boolean>}
   */
  storeObj.advanceQueue = async function (initial) {
    return await advancementManager.advanceQueue();
  };

  return storeObj;
};

// Create the store instance
export const dropItemRegistry = advancementQueueStore();