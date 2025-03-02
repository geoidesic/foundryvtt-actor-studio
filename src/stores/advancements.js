import { writable, get, derived } from 'svelte/store';
import { prepareItemForDrop, dropItemOnCharacter } from '~/src/helpers/Utility';
import { MODULE_ID } from '~/src/helpers/constants';
import { tabs, activeTab } from '~/src/stores/index';

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

  // Define closeAdvancementManager with access to storeObj
  async function closeAdvancementManager() {
    let monitoringPromise = null;

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

  // Add advanceQueue to storeObj
  storeObj.advanceQueue = async function (initial) {


    const currentStore = get(store);
    const next = currentStore[0] || false;

    if (!next) {
      inProcess.set(false);
      const actor = get(inProcess)?.actor;
      
      // Check if equipment selection is enabled
      if (game.settings.get(MODULE_ID, 'enableEquipmentSelection')) {
        Hooks.call("gas.equipmentSelection", actor);
      } else {
        Hooks.call("gas.close");
      }
      
      if (actor) {
        actor.sheet.render(true);
      }
      return false;
    }

    inProcess.set(next);
    remove(next.id);


    // @todo: temporary for debug - this causes the equipment selection happen before the advancements (and without the advancements tab)
    const actor = get(inProcess)?.actor;
    Hooks.call("gas.equipmentSelection", actor);
    return;

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
    return await closeAdvancementManager();
  };

  return storeObj;
};

// Create the store instance
export const dropItemRegistry = advancementQueueStore();