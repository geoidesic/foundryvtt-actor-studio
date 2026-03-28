import { get } from 'svelte/store';
import { activeTab, tabs } from '~/src/stores/index';
import { MODULE_ID } from '~/src/helpers/constants';
import { delay, prepareItemForDrop, dropItemOnCharacter, safeGetSetting, isAdvancementAutomationEnabled, getAdvancementAutomationConfig } from '~/src/helpers/Utility';
import { compatibleStartingEquipment } from '~/src/stores/startingEquipment';
import { goldRoll } from '~/src/stores/storeDefinitions';
import { preAdvancementSelections, actorInGame } from '~/src/stores/index';
import { getWorkflowFSM, WORKFLOW_EVENTS } from '~/src/helpers/WorkflowStateMachine';
import { getTestTimeouts } from '~/src/helpers/testTimeouts';

/**
 * Class responsible for monitoring and managing the advancement process
 */
export class AdvancementManager {
  constructor(store, inProcessStore, getPanel) {
    this.store = store;
    this.inProcessStore = inProcessStore;
    this.monitoringPromise = null;
    this.stopAutoAdvance = false;
    this.clickedLastTime = false; // Flag to prevent consecutive clicks that could trigger errors
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
      this.clickedLastTime = false; // Reset flag when tab becomes empty
      resolve();
    } else {
      // Automated advancement clicking in debug mode or test automation mode
      if (!this.clickedLastTime && isAdvancementAutomationEnabled()) {
        this.autoAdvanceSteps();
      }
      if (!this.stopAutoAdvance) {
        setTimeout(() => this.checkTabContent(resolve, tabName, timeout), timeout);
      }
    }
  };

  /**
  * Automatically advance through advancement dialog steps when automation is enabled
   * Finds and clicks "next" buttons, then "complete" buttons to speed up debug iteration
   */
  autoAdvanceSteps() {
    if (!isAdvancementAutomationEnabled()) {
      return;
    }
    
    let clickedThisPass = false;
    try {
      const panel = this._getPanel();
      if (!panel || !panel.length) return;

      // Look for advancement dialogs within the captured area
      const advancementDialogs = panel.find('.gas-advancements');
      const automationConfig = getAdvancementAutomationConfig();
      
      advancementDialogs.each((index, dialog) => {
        if (clickedThisPass) return;

        const $dialog = $(dialog);
        const idForm = $dialog.find('form[data-advancement-id], form[data-id]').first();
        const typeForm = $dialog.find('form[data-type]').first();

        const advancementId = (typeof idForm?.attr === 'function')
          ? (idForm.attr('data-advancement-id') || idForm.attr('data-id') || null)
          : null;

        const advancementType = (typeof typeForm?.attr === 'function')
          ? (typeForm.attr('data-type') || null)
          : null;

        const titleElement = $dialog.find('h3, h4, h2').first();
        const title = (typeof titleElement?.text === 'function')
          ? String(titleElement.text() || '').trim()
          : '';

        const context = {
          index,
          dialog,
          advancementId,
          advancementType,
          title
        };

        let overrideAction = null;
        if (typeof automationConfig?.resolveAction === 'function') {
          try {
            overrideAction = automationConfig.resolveAction(context);
          } catch (overrideError) {
            window.GAS?.log?.w?.('[AUTO-ADVANCE] resolveAction override failed:', overrideError);
          }
        }

        if (overrideAction === 'none' || overrideAction === false) {
          window.GAS.log.d('[AUTO-ADVANCE] Skipping dialog due to override', context);
          return;
        }

        const clickFirstEnabled = (selector) => {
          if (clickedThisPass) return false;
          const candidate = $dialog.find(selector).first();
          if (candidate.length && !candidate.prop('disabled')) {
            // Additional validation: check if the dialog still has valid advancement data
            // Skip clicking if the advancement ID was present but is now missing (indicating processing)
            const currentIdForm = $dialog.find('form[data-advancement-id], form[data-id]').first();
            const currentAdvancementId = (typeof currentIdForm?.attr === 'function')
              ? (currentIdForm.attr('data-advancement-id') || currentIdForm.attr('data-id') || null)
              : null;
            
            // Only skip if we had an advancement ID initially but it's now missing
            if (advancementId && !currentAdvancementId) {
              window.GAS.log.d('[AUTO-ADVANCE] Skipping click - dialog appears to be processing (ID disappeared)', index);
              return false;
            }
            
            candidate.click();
            clickedThisPass = true;
            return true;
          }
          return false;
        };

        if (overrideAction === 'next') {
          if (clickFirstEnabled('[data-action="next"]')) {
            window.GAS.log.d('[AUTO-ADVANCE] Override clicked next button in dialog', index);
            return;
          }
        }

        if (overrideAction === 'complete') {
          if (clickFirstEnabled('[data-action="complete"]')) {
            window.GAS.log.d('[AUTO-ADVANCE] Override clicked complete button in dialog', index);
            return;
          }
        }

        if (overrideAction && typeof overrideAction === 'object' && overrideAction.selector) {
          if (clickFirstEnabled(overrideAction.selector)) {
            window.GAS.log.d('[AUTO-ADVANCE] Override clicked selector', overrideAction.selector);
            return;
          }
        }

        if (typeof automationConfig?.beforeDefaultAdvance === 'function') {
          try {
            const consumed = automationConfig.beforeDefaultAdvance({ ...context, dialog: $dialog[0] });
            if (consumed === true) {
              return;
            }
          } catch (beforeError) {
            window.GAS?.log?.w?.('[AUTO-ADVANCE] beforeDefaultAdvance hook failed:', beforeError);
          }
        }
        
        // First, try to find and click "next" buttons
        const nextButton = $dialog.find('[data-action="next"]').first();
        if (nextButton.length && !nextButton.prop('disabled')) {
          // Additional validation: check if the dialog still has valid advancement data
          const currentIdForm = $dialog.find('form[data-advancement-id], form[data-id]').first();
          const currentAdvancementId = (typeof currentIdForm?.attr === 'function')
            ? (currentIdForm.attr('data-advancement-id') || currentIdForm.attr('data-id') || null)
            : null;
          
          // Only skip if we had an advancement ID initially but it's now missing
          if (advancementId && !currentAdvancementId) {
            window.GAS.log.d('[AUTO-ADVANCE] Skipping next button click - dialog appears to be processing (ID disappeared)', index);
            return;
          }
          
          window.GAS.log.d('[AUTO-ADVANCE] Clicking next button in dialog', index);
          nextButton.click();
          clickedThisPass = true;
          return; // Exit early after clicking next
        }
        
        // If no next button, look for "complete" button
        const completeButton = $dialog.find('[data-action="complete"]').first();
        if (completeButton.length && !completeButton.prop('disabled')) {
          // Additional validation: check if the dialog still has valid advancement data
          const currentIdForm = $dialog.find('form[data-advancement-id], form[data-id]').first();
          const currentAdvancementId = (typeof currentIdForm?.attr === 'function')
            ? (currentIdForm.attr('data-advancement-id') || currentIdForm.attr('data-id') || null)
            : null;
          
          // Only skip if we had an advancement ID initially but it's now missing
          if (advancementId && !currentAdvancementId) {
            window.GAS.log.d('[AUTO-ADVANCE] Skipping complete button click - dialog appears to be processing (ID disappeared)', index);
            return;
          }
          
          window.GAS.log.d('[AUTO-ADVANCE] Clicking complete button in dialog', index);
          completeButton.click();
          clickedThisPass = true;
          return; // Exit early after clicking complete
        }
        
        // Fall back to text-based button detection
        const buttons = $dialog.find('button');
        const textButton = buttons.filter((_, btn) => {
          const $btn = $(btn);
          const text = $btn.text().toLowerCase().trim();
          return text.includes('next') || text.includes('continue') || text.includes('complete') || text.includes('finish');
        }).first();
        
        if (textButton.length && !textButton.prop('disabled')) {
          // Additional validation: check if the dialog still has valid advancement data
          const currentIdForm = $dialog.find('form[data-advancement-id], form[data-id]').first();
          const currentAdvancementId = (typeof currentIdForm?.attr === 'function')
            ? (currentIdForm.attr('data-advancement-id') || currentIdForm.attr('data-id') || null)
            : null;
          
          // Only skip if we had an advancement ID initially but it's now missing
          if (advancementId && !currentAdvancementId) {
            window.GAS.log.d('[AUTO-ADVANCE] Skipping text button click - dialog appears to be processing (ID disappeared)', index);
            return;
          }
          
          window.GAS.log.d('[AUTO-ADVANCE] Clicking text-based button:', textButton.text().trim());
          textButton.click();
          clickedThisPass = true;
          return; // Exit early after clicking text button
        }
      });
    } catch (error) {
      window.GAS.log.e('[AUTO-ADVANCE] Error in autoAdvanceSteps:', error);
    }
    // Set flag to prevent consecutive clicks that could cause errors
    if (clickedThisPass) {
      this.clickedLastTime = true;
      // Reset the flag after a delay to allow subsequent clicks for multi-step dialogs
      setTimeout(() => {
        this.clickedLastTime = false;
      }, getTestTimeouts().advancementAutomation); // Allow next click after configured delay
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

    // Reset auto-advance flag when starting monitoring
    this.stopAutoAdvance = false;
    this.clickedLastTime = false;

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
    await delay(safeGetSetting(MODULE_ID, 'advancementCaptureTimerThreshold', 300)); //- delay to allow for the items to be dropped

    //- if advancements are enabled handle advancement capture
    if (!safeGetSetting(MODULE_ID, 'disableAdvancementCapture', false)) {
      window.GAS.log.d('[ADVANCEMENT MANAGER] waiting for advancements tab to be empty');
      await this.waitForEmptyTab('advancements');
      window.GAS.log.d('[ADVANCEMENT MANAGER] advancements tab is empty');
      
      // Stop auto-advance to prevent clicking on closing dialogs
      this.stopAutoAdvance = true;
      
      // Add a delay before removing the tab to allow dialogs to properly close
      await delay(500);
      
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
        
        // Don't change the active tab - let the workflow state machine handle it
        // The workflow will transition to the next appropriate state and set the correct active tab
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