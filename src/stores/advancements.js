import { writable, get, derived } from 'svelte/store';
import { prepareItemForDrop, dropItemOnCharacter, delay } from '~/src/helpers/Utility';
import { MODULE_ID } from '~/src/helpers/constants';
import { tabs, activeTab } from '~/src/stores/index';

export const advancementQueueStore = () => {
  const store = writable([]);
  const inProcess = writable(false);
  const currentActor = derived(inProcess, $inProcess => $inProcess?.actor);
  const { subscribe, set, update } = store;

  const remove = (id) => update(apps => apps.filter(app => app.id !== id));
  const expectedOrder = ['race', 'background', 'characterClass', 'characterSubClass'];

  // Create the store object first
  const storeObj = {
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
    currentProcess: derived(inProcess, $inProcess => $inProcess),
    updateCurrentProcess: (obj) => inProcess.update(p => ({ ...p, ...obj })),
  };


  const isPanelEmpty = () => {
    if (get(activeTab) !== 'advancements') return false;
    const panel = $('#foundryvtt-actor-studio-pc-sheet .window-content main section.a .tab-content .container .content');
    return !Boolean(panel.html()?.trim());
  }

  const waitForPanelEmpty = async () => {
    if (monitoringPromise) return monitoringPromise;

    monitoringPromise = new Promise(resolve => {
      const checkPanel = () => {
        if (isPanelEmpty()) {
          resolve();
        } else {
          setTimeout(checkPanel, 600);
        }
      };
      checkPanel();
    });

    return monitoringPromise;
  };

  /**
   * Monitors the queue for advancements and closes the advancement manager when the queue is empty
   * Also starts the equipment selection process when the queue is empty if that's enabled, passing 
   * off the close responsibility to the equipment selection process
   * @returns {Promise<boolean>}
   */
  async function watchAdvancementManager() {
    await delay(200); //- delay to allow for the items to be dropped

    let monitoringPromise = null;

    await waitForPanelEmpty();
    monitoringPromise = null;

    const queue = await storeObj.advanceQueue();

    if (!queue) {
      const actor = get(inProcess)?.actor;

      if (game.settings.get(MODULE_ID, 'enableEquipmentSelection')) {
        Hooks.call("gas.equipmentSelection", actor);
      } else {
        Hooks.call("gas.close");
      }
      if (actor) {
        actor.sheet.render(true);
      }
    }

    return queue;
  }

  /**
   * Opens equipment tab if enabled, otherwise closes the advancement manager
   */
  function closeOrEquip() {
    if (game.settings.get(MODULE_ID, 'enableEquipmentSelection')) {
      window.GAS.log.d('Equipment selection enabled for currentActor', currentActor);
      if (currentActor.system.startingEquipment && currentActor.system.startingEquipment.length && currentActor.system.wealth) {
        Hooks.call("gas.equipmentSelection", currentActor);
        return;
      }
    }
    Hooks.call("gas.close");
  }

  function handleEmptyQueue() {
    inProcess.set(false);
    closeOrEquip(currentActor);
  }

  async function handleNextItem(next) {
    inProcess.set(next);
    remove(next.id);
    const item = await prepareItemForDrop(next);
    const result = await dropItemOnCharacter(currentActor, item);
    return result;
  }

  /**
   * Advances the queue to the next item
   * Will open the Advancements tab if it's required and not already open
   * @param {boolean} initial - Whether this is the initial call to the queue
   * @returns {Promise<boolean>}
   */
  storeObj.advanceQueue = async function (initial) {
    //- get current state
    const currentStore = get(store);
    const next = currentStore[0] || false;

    //- handle empty queue
    if (!next) {
      handleEmptyQueue();
      return false;
    }

    //- handle next item
    const result = await handleNextItem(next);
    window.GAS.log.d('handleNextItem result', result);

    //- set the advancement manager watcher
    return await watchAdvancementManager();
  };

  return storeObj;
};

// Create the store instance
export const dropItemRegistry = advancementQueueStore();