import { get } from 'svelte/store';
import { activeTab, tabs } from '~/src/stores/index';
import { MODULE_ID } from '~/src/helpers/constants';
import { delay, prepareItemForDrop, dropItemOnCharacter } from '~/src/helpers/Utility';
import { compatibleStartingEquipment } from '~/src/stores/startingEquipment';
import { goldRoll } from '~/src/stores/storeDefinitions';
import { preAdvancementSelections, actorInGame } from '~/src/stores/index';
import { getWorkflowFSM, WORKFLOW_EVENTS } from '~/src/helpers/WorkflowStateMachine';

/**
 * Class responsible for monitoring and managing the advancement process
 */
export class AdvancementManager {
  constructor(store, inProcessStore, getPanel) {
    this.store = store;
    this.inProcessStore = inProcessStore;
    this.monitoringPromise = null;
    // Allow injection of a custom DOM query function for testability
    this._getPanel = getPanel || (() => {
      if (typeof $ !== 'function') return null;
      return $('#foundryvtt-actor-studio-pc-sheet .window-content main section.a .tab-content .container .content');
    });
  }

  /**
   * Checks if the advancement (or other tab) content is currently empty
   * @returns {boolean} Whether the content is empty
   */
  isTabContentEmpty(tabName = 'advancements') {
    // Guard: activeTab must be a Svelte store
    if (!activeTab || typeof get !== 'function') return false;
    let currentTab;
    try {
      currentTab = get(activeTab);
    } catch (e) {
      return false;
    }
    if (currentTab !== tabName) {
      return false;
    }
    // Use injected or default DOM query function
    const panel = this._getPanel();
    if (!panel || typeof panel.html !== 'function') {
      return false;
    }
    return !Boolean(panel.html()?.trim());
  }

  checkTabContent(resolve, tabName = 'advancements', timeout = 600) {
    if (this.isTabContentEmpty(tabName)) {
      resolve();
    } else {
      // Automated advancement clicking in debug mode
      if (window.GAS?.debug) {
        this.autoAdvanceSteps();
      }
      setTimeout(() => this.checkTabContent(resolve, tabName, timeout), timeout);
    }
  };

  /**
   * Automatically advance through advancement dialog steps when in debug mode
   * Finds and clicks "next" buttons, then "complete" buttons to speed up debug iteration
   */
  autoAdvanceSteps() {
    try {
      const panel = this._getPanel();
      if (!panel || !panel.length) return;

      // Look for advancement dialogs within the captured area
      const advancementDialogs = panel.find('.gas-advancements');
      
      advancementDialogs.each((index, dialog) => {
        const $dialog = $(dialog);
        
        // First, try to find and click "next" buttons
        const nextButton = $dialog.find('[data-action="next"]').first();
        if (nextButton.length && !nextButton.prop('disabled')) {
          window.GAS.log.d('[AUTO-ADVANCE] Clicking next button in dialog', index);
          nextButton.click();
          return; // Exit early after clicking next
        }
        
        // If no next button, look for "complete" button
        const completeButton = $dialog.find('[data-action="complete"]').first();
        if (completeButton.length && !completeButton.prop('disabled')) {
          window.GAS.log.d('[AUTO-ADVANCE] Clicking complete button in dialog', index);
          completeButton.click();
          return; // Exit early after clicking complete
        }
        
        // If no data-action buttons found, try common button text patterns
        const buttons = $dialog.find('button').filter(function() {
          const text = $(this).text().toLowerCase().trim();
          return text.includes('next') || text.includes('continue') || text.includes('complete') || text.includes('finish');
        });
        
        if (buttons.length) {
          const enabledButton = buttons.filter(':not(:disabled)').first();
          if (enabledButton.length) {
            window.GAS.log.d('[AUTO-ADVANCE] Clicking text-based button:', enabledButton.text().trim());
            enabledButton.click();
          }
        }
      });
    } catch (error) {
      window.GAS.log.e('[AUTO-ADVANCE] Error in autoAdvanceSteps:', error);
    }
  }

  /**
   * Waits for the advancement panel to become empty
   * @returns {Promise} A promise that resolves when the panel is empty
   */
  waitForEmptyTab(tabName = 'advancements') {
    // Return existing promise if already monitoring
    if (this.monitoringPromise) {
      return this.monitoringPromise;
    }

    // Create new monitoring promise
    this.monitoringPromise = new Promise(resolve => {
      this.checkTabContent(() => {
        resolve();
        // Reset promise after a brief delay to ensure all concurrent calls complete
        setTimeout(() => {
          this.monitoringPromise = null;
        }, 10);
      }, tabName);
    });

    return this.monitoringPromise;
  }

  /**
   * Monitors the queue for advancements and closes the advancement manager when the queue is empty
   * Also starts the equipment selection process when the queue is empty if that's enabled, passing 
   * off the close responsibility to the equipment selection process
   * @returns {Promise<void>}
   */
  async watchAdvancementManager() {
    await delay(game.settings.get(MODULE_ID, 'advancementCaptureTimerThreshold')); //- delay to allow for the items to be dropped

    //- if advancements are enabled handle advancement capture
    if (!game.settings.get(MODULE_ID, 'disableAdvancementCapture')) {
      window.GAS.log.d('[ADVANCEMENT MANAGER] waiting for advancements tab to be empty');
      await this.waitForEmptyTab('advancements');
      window.GAS.log.d('[ADVANCEMENT MANAGER] advancements tab is empty');
      
      // Remove the advancement tab after it becomes empty
      this.removeAdvancementTab();
      
      this.monitoringPromise = null;
    }
    // Just return after monitoring - the advanceQueue loop will handle the next item
    return;
  }

  /**
   * Removes the advancement tab from the UI after advancement processing is complete
   */
  removeAdvancementTab() {
    try {
      const currentTabs = get(tabs);
      const advancementTabIndex = currentTabs.findIndex(tab => tab.id === 'advancements');
      
      if (advancementTabIndex !== -1) {
        window.GAS.log.d('[ADVANCEMENT MANAGER] removing advancement tab');
        
        // Remove the advancement tab
        tabs.update(tabArray => tabArray.filter(tab => tab.id !== 'advancements'));
        
        // If advancement tab was active, switch to the first available tab
        const currentActiveTab = get(activeTab);
        if (currentActiveTab === 'advancements') {
          const updatedTabs = get(tabs);
          if (updatedTabs.length > 0) {
            activeTab.set(updatedTabs[0].id);
            window.GAS.log.d('[ADVANCEMENT MANAGER] switched active tab to', updatedTabs[0].id);
          }
        }
      }
    } catch (error) {
      window.GAS.log.e('[ADVANCEMENT MANAGER] error removing advancement tab:', error);
    }
  }


  /**
   * Handles the case when the queue is empty
   */
  handleEmptyQueue() {
    window.GAS.log.d('[ADVANCEMENT MANAGER] handleEmptyQueue')
    const inGameActor = get(actorInGame);
    const currentActor = inGameActor ? inGameActor : get(this.inProcessStore)?.actor;
    this.inProcessStore.set(false);
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
    
    //- Drop Item on Actor
    const result = await dropItemOnCharacter(currentActor, item);
    return result;
  }

  /**
   * Advances the queue to process all items
   * Will open the Advancements tab if it's required and not already open
   * @returns {Promise<boolean>}
   */
  async advanceQueue() {
    window.GAS.log.d('[ADVANCEMENT MANAGER] advancing queue of length', get(this.store).length);
    try {
      
      // Process all items in the queue
      while (get(this.store).length > 0) {
        const currentStore = get(this.store);
        const next = currentStore[0];
        
        if (!next) {
          break;
        }
  
        //- handle next item
        window.GAS.log.d('[ADVANCEMENT MANAGER] handling next item', next);
        const result = await this.handleNextItem(next);
  
        //- set the advancement manager watcher for this item
        window.GAS.log.d('[ADVANCEMENT MANAGER] setting advancement manager watcher');
        await this.watchAdvancementManager();
      }
  
      //- handle empty queue after processing all items
      window.GAS.log.d('[ADVANCEMENT MANAGER] queue is empty, handling empty queue');
      this.handleEmptyQueue();
      return true;
    } catch (error) {
      return false
    }
  }
} 


// Function to remove all elements with the specified class
export const destroyAdvancementManagers = () => {
    // Select all elements with the class 'application dnd5e2 advancement manager'
    const elements = document.querySelectorAll('.application.dnd5e2.advancement.manager');
    console.log('destroyAdvancementManagers advancement managers', elements);
    // Iterate over the NodeList and remove each element
    elements.forEach(element => {
        element.remove(); // Remove the element from the DOM
    });
}

// Patch for test: always use injected getPanel if present, else fallback to global.$
// This ensures test mocks are always respected
export function createTestAdvancementManager(store, inProcessStore, panelHtml = '', customGetPanel = null) {
  if (customGetPanel) {
    // Use the custom getPanel function directly
    return new AdvancementManager(store, inProcessStore, customGetPanel);
  }
  
  // Mock panel object with static content
  const mockPanel = { html: () => panelHtml };
  // Return AdvancementManager with injected getPanel
  return new AdvancementManager(store, inProcessStore, () => mockPanel);
}

export default {
  AdvancementManager,
  destroyAdvancementManagers
};