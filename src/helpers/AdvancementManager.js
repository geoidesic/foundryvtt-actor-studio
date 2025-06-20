import { get } from 'svelte/store';
import { activeTab } from '~/src/stores/index';
import { MODULE_ID } from '~/src/helpers/constants';
import { delay, prepareItemForDrop, dropItemOnCharacter } from '~/src/helpers/Utility';
import { compatibleStartingEquipment } from '~/src/stores/startingEquipment';
import { goldRoll } from '~/src/stores/storeDefinitions';
import { preAdvancementSelections } from '~/src/stores/index';

/**
 * Class responsible for monitoring and managing the advancement process
 */
export class AdvancementManager {
  constructor(store, inProcessStore) {
    this.store = store;
    this.inProcessStore = inProcessStore;
    this.monitoringPromise = null;
  }

  /**
   * Checks if the advancement (or other tab) content is currently empty
   * @returns {boolean} Whether the content is empty
   */
  isTabContentEmpty(tabName = 'advancements') {
    if (get(activeTab) !== tabName) {
      return false;
    }
    const panel = $('#foundryvtt-actor-studio-pc-sheet .window-content main section.a .tab-content .container .content');
    if (!panel) {
      return false;
    }
    return !Boolean(panel.html()?.trim());
  }

  checkTabContent(resolve, tabName = 'advancements', timeout = 600) {
    if (this.isTabContentEmpty(tabName)) {
      resolve();
    } else {
      setTimeout(() => this.checkTabContent(resolve, tabName, timeout), timeout);
    }
  };

  /**
   * Waits for the advancement panel to become empty
   * @returns {Promise} A promise that resolves when the panel is empty
   */
  async waitForEmptyTab(tabName = 'advancements') {
    if (this.monitoringPromise) return this.monitoringPromise;

    this.monitoringPromise = new Promise(resolve => {
      this.checkTabContent(resolve, tabName);
    });

    return this.monitoringPromise;
  }

  /**
   * Monitors the queue for advancements and closes the advancement manager when the queue is empty
   * Also starts the equipment selection process when the queue is empty if that's enabled, passing 
   * off the close responsibility to the equipment selection process
   * @returns {Promise<boolean>}
   */
  async watchAdvancementManager() {
    await delay(game.settings.get(MODULE_ID, 'advancementCaptureTimerThreshold')); //- delay to allow for the items to be dropped

    //- if advancements are enabled handle advancement capture
    if (!game.settings.get(MODULE_ID, 'disableAdvancementCapture')) {
      window.GAS.log.d('[ADVANCEMENT MANAGER] waiting for advancements tab to be empty');
      await this.waitForEmptyTab('advancements');
      window.GAS.log.d('[ADVANCEMENT MANAGER] advancements tab is empty');
      this.monitoringPromise = null;
    }

    //- advance the queue
    const queue = await this.advanceQueue();
    return queue;
  }

  isEquipmentSelectionViable() {
    // Get the pre-advancement selection data
    const preSelections = get(preAdvancementSelections);
    
    // Basic checks for required data
    if (Object.keys(preSelections).length === 0 || 
        !preSelections.class || 
        !preSelections.class.system || 
        !preSelections.class.system.startingEquipment || 
        preSelections.class.system.startingEquipment.length === 0 || 
        preSelections.class.system.wealth === undefined) {
      window.GAS.log.d('[ADVANCEMENT MANAGER] Equipment not viable - missing required data');
      return false;
    }
    
    // Check for compatible equipment options
    const compatibleEquipment = get(compatibleStartingEquipment);
    const viable = compatibleEquipment.length > 0;
    
    window.GAS.log.d('[ADVANCEMENT MANAGER] isEquipmentSelectionViable result:', viable);
    return viable;
  }

  /**
   * Opens equipment tab if enabled, otherwise closes the advancement manager
   * @param {Actor} currentActor - The current actor being processed
   */
  closeOrEquip(currentActor) {
    const enableEquipmentSelection = game.settings.get(MODULE_ID, 'enableEquipmentSelection');
    window.GAS.log.d('[ADVANCEMENT MANAGER] enableEquipmentSelection', enableEquipmentSelection);
    if (enableEquipmentSelection) {
      window.GAS.log.d('[ADVANCEMENT MANAGER] opening equipment tab for ', currentActor);
      if (this.isEquipmentSelectionViable()) {
        Hooks.call("gas.equipmentSelection", currentActor);
        return;
      } else {
        // Show a simple localized notification
        ui.notifications.warn(game.i18n.localize('GAS.Error.EquipmentSelectionNotViable'));
        window.GAS.log.d('[ADVANCEMENT MANAGER] Equipment selection skipped - not viable');
      }
    }
    Hooks.call("gas.close");
  }

  /**
   * Handles the case when the queue is empty
   */
  handleEmptyQueue() {
    const currentActor = get(this.inProcessStore)?.actor;
    this.inProcessStore.set(false);
    this.closeOrEquip(currentActor);
  }

  /**
   * Handles processing the next item in the queue
   * @param {Object} next - The next item to process
   * @returns {Promise<Object>} The result of processing the item
   */
  async handleNextItem(next) {
    this.inProcessStore.set(next);
    this.store.remove(next.id);
    const item = await prepareItemForDrop(next);
    const currentActor = get(this.inProcessStore)?.actor;
    // window.GAS.log.d('[ADVANCEMENT MANAGER] handling next item', next);
    // window.GAS.log.d('[ADVANCEMENT MANAGER] currentActor', currentActor);
    const result = await dropItemOnCharacter(currentActor, item);
    return result;
  }

  /**
   * Advances the queue to the next item
   * Will open the Advancements tab if it's required and not already open
   * @returns {Promise<boolean>}
   */
  async advanceQueue() {
    window.GAS.log.d('[ADVANCEMENT MANAGER] advancing queue of length', get(this.store).length);
    //- get current state
    const currentStore = get(this.store);
    const next = currentStore[0] || false;

    //- handle empty queue
    if (!next) {
      window.GAS.log.d('[ADVANCEMENT MANAGER] queue is empty, handling empty queue');
      this.handleEmptyQueue();
      return false;
    }

    //- handle next item
    window.GAS.log.d('[ADVANCEMENT MANAGER] handling next item', next);
    const result = await this.handleNextItem(next);

    //- set the advancement manager watcher
    window.GAS.log.d('[ADVANCEMENT MANAGER] setting advancement manager watcher');
    return await this.watchAdvancementManager();
  }
} 


// Function to remove all elements with the specified class
export const destroyAdvancementManagers = () => {
    // Select all elements with the class 'application dnd5e2 advancement manager'
    const elements = document.querySelectorAll('.application.dnd5e2.advancement.manager');
    console.log('advancement managers', elements);
    // Iterate over the NodeList and remove each element
    elements.forEach(element => {
        element.remove(); // Remove the element from the DOM
    });
}

export default {
  AdvancementManager,
  destroyAdvancementManagers
};