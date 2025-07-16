import { writable, get } from 'svelte/store';
import { MODULE_ID } from '~/src/helpers/constants';
import { activeTab, tabs, readOnlyTabs } from '~/src/stores/index';
import { compatibleStartingEquipment } from '~/src/stores/startingEquipment';
import { preAdvancementSelections, dropItemRegistry } from '~/src/stores/index';
import { actorInGame } from '~/src/stores/storeDefinitions';
import { handleAdvancementCompletion } from '~/src/lib/workflow.js';
import { destroyAdvancementManagers } from '~/src/helpers/AdvancementManager';
import Finity from 'finity';

/**
 * Character creation workflow states
 */
export const WORKFLOW_STATES = {
  IDLE: 'idle',
  CREATING_CHARACTER: 'creating_character',
  PROCESSING_ADVANCEMENTS: 'processing_advancements',
  SELECTING_EQUIPMENT: 'selecting_equipment',
  SELECTING_SPELLS: 'selecting_spells',
  SHOPPING: 'shopping',
  COMPLETED: 'completed',
  ERROR: 'error'
};

/**
 * Workflow events that can trigger state transitions
 */
export const WORKFLOW_EVENTS = {
  START_CHARACTER_CREATION: 'start_character_creation',
  CHARACTER_CREATED: 'character_created',
  ADVANCEMENTS_COMPLETE: 'advancements_complete',
  EQUIPMENT_COMPLETE: 'equipment_complete',
  SPELLS_COMPLETE: 'spells_complete',
  SHOPPING_COMPLETE: 'shopping_complete',
  SKIP_EQUIPMENT: 'skip_equipment',
  SKIP_SPELLS: 'skip_spells',
  SKIP_SHOPPING: 'skip_shopping',
  ERROR: 'error',
  RESET: 'reset',
  QUEUE_PROCESSED: 'queue_processed', // <-- Added new event for post-queue processing
};

/**
 * Shared workflow context for Finity FSM
 */
export const workflowFSMContext = {
  isProcessing: writable(false),
  _shouldShowEquipmentSelection: function () {
    const enableEquipmentSelection = game.settings.get(MODULE_ID, 'enableEquipmentSelection');
    if (!enableEquipmentSelection) return false;
    const preSelections = get(preAdvancementSelections);
    if (!preSelections || Object.keys(preSelections).length === 0 || !preSelections.class || !preSelections.class.system || !preSelections.class.system.startingEquipment || preSelections.class.system.startingEquipment.length === 0 || preSelections.class.system.wealth === undefined) return false;
    const compatibleEquipment = get(compatibleStartingEquipment);
    return compatibleEquipment.length > 0;
  },
  _shouldShowSpellSelection: function (inGameActor) {
    const enableSpellSelection = game.settings.get(MODULE_ID, 'enableSpellSelection');
    if (!enableSpellSelection) return false;
    
    // Always prioritize the passed inGameActor parameter if it's provided and valid
    let actorForDecision = inGameActor;
    
    // Only use context actors as fallback when inGameActor is not provided or is empty
    if (!actorForDecision || (typeof actorForDecision === 'object' && Object.keys(actorForDecision).length === 0)) {
      if (this?.preCreationActor) {
        actorForDecision = this.preCreationActor;
      } else if (this?.postCreationActor) {
        actorForDecision = this.postCreationActor;
      } else if (this?.actor) {
        actorForDecision = this.actor;
      }
    }
    
    if (!actorForDecision) return false;
    const classes = actorForDecision.classes || {};
    const classKeys = Object.keys(classes);
    if (!classKeys.length) {
      // Only fallback to preCreationActor if we have no classes and we're using postCreationActor
      if (actorForDecision === this?.postCreationActor && this?.preCreationActor) {
        return workflowFSMContext._shouldShowSpellSelection(this.preCreationActor);
      }
      return false;
    }
    const spellcastingInfo = Object.entries(classes).map(([className, classData]) => {
      const progression = classData?.system?.spellcasting?.progression;
      return { className, progression, isSpellcaster: progression && progression !== "none" };
    });
    const isSpellcaster = spellcastingInfo.some(info => info.isSpellcaster);
    if (!isSpellcaster) {
      const knownSpellcastingClasses = [
        'bard', 'cleric', 'druid', 'paladin', 'ranger', 'sorcerer', 'warlock', 'wizard',
        'artificer', 'aberrantmind', 'arcanetrickster', 'eldritchknight'
      ];
      const hasKnownSpellcastingClass = classKeys.some(className => knownSpellcastingClasses.includes(className.toLowerCase()));
      if (hasKnownSpellcastingClass) return true;
    }
    return isSpellcaster;
  },
  _shouldShowShopping: function () {
    const enableShopping = game.settings.get(MODULE_ID, 'enableEquipmentPurchase');
    return enableShopping;
  },
  actor: undefined,
};

/**
 * Finity-based state machine for character creation workflow
 */
export function createWorkflowStateMachine() {
  const fsm = Finity
    .configure()
    .initialState('idle')
    .state('idle')
    .on('start_character_creation').transitionTo('creating_character')
    .on('reset').transitionTo('idle')
    .onEnter((context) => {
      if (workflowFSMContext.isProcessing) workflowFSMContext.isProcessing.set(false);
      
      // Destroy advancement managers when returning to idle
      try {
        destroyAdvancementManagers();
      } catch (error) {
        window.GAS.log.e('[WORKFLOW] Error destroying advancement managers on idle:', error);
      }
    })
    .state('creating_character')
    .on('character_created').transitionTo('processing_advancements')
    .on('error').transitionTo('error')
    .on('reset').transitionTo('idle')
    .onEnter((context) => {
      if (workflowFSMContext.isProcessing) workflowFSMContext.isProcessing.set(true);
      window.GAS.log.d('[WORKFLOW] Entered CREATING_CHARACTER state');
    })
    .state('processing_advancements')
      .do(async (state, context) => {
        if (workflowFSMContext.isProcessing) workflowFSMContext.isProcessing.set(true);
        window.GAS.log.d('[WORKFLOW] Entered PROCESSING_ADVANCEMENTS state');
        // Process advancement queue asynchronously
        await dropItemRegistry.advanceQueue(true);
      })
        .onSuccess()
          .transitionTo('selecting_equipment').withCondition((context) => workflowFSMContext._shouldShowEquipmentSelection())
          .transitionTo('shopping').withCondition((context) => !workflowFSMContext._shouldShowEquipmentSelection() && workflowFSMContext._shouldShowShopping())
          .transitionTo('selecting_spells').withCondition((context) => !workflowFSMContext._shouldShowEquipmentSelection() && !workflowFSMContext._shouldShowShopping() && workflowFSMContext._shouldShowSpellSelection(workflowFSMContext.actor))
          .transitionTo('completed') // Default fallback - no other features enabled
        .onFailure().transitionTo('error')
    .state('selecting_equipment')
    .on('equipment_complete')
      .transitionTo('shopping').withCondition((context) => {
        const shouldShow = workflowFSMContext._shouldShowShopping();
        window.GAS.log.d('[FSM] equipment_complete -> shopping condition:', shouldShow);
        return shouldShow;
      })
      .transitionTo('selecting_spells').withCondition((context) => {
        const shouldShow = !workflowFSMContext._shouldShowShopping() && workflowFSMContext._shouldShowSpellSelection(workflowFSMContext.actor);
        window.GAS.log.d('[FSM] equipment_complete -> selecting_spells condition:', shouldShow);
        return shouldShow;
      })
      .transitionTo('completed') // Default fallback
    .on('shopping_complete')
      .transitionTo('selecting_spells').withCondition((context) => {
        // Use the persisted actor from actorInGame store instead of workflowFSMContext.actor
        const currentActor = get(actorInGame);
        // Fallback to context actor if store is empty (useful for tests and edge cases)
        const actorToCheck = currentActor || workflowFSMContext.actor;
        const shouldShow = workflowFSMContext._shouldShowSpellSelection(actorToCheck);
        window.GAS.log.d('[FSM] shopping_complete (from selecting_equipment) -> selecting_spells condition:', shouldShow);
        return shouldShow;
      })
      .transitionTo('completed') // Default fallback when spell selection is not needed
    .on('skip_equipment')
      .transitionTo('shopping').withCondition((context) => workflowFSMContext._shouldShowShopping())
      .transitionTo('selecting_spells').withCondition((context) => !workflowFSMContext._shouldShowShopping() && workflowFSMContext._shouldShowSpellSelection(workflowFSMContext.actor))
      .transitionTo('completed') // Default fallback
    .on('error').transitionTo('error')
    .on('reset').transitionTo('idle')
    .onEnter((context) => {
      if (workflowFSMContext.isProcessing) workflowFSMContext.isProcessing.set(false);
      window.GAS.log.d('[WORKFLOW] Entered SELECTING_EQUIPMENT state');
      
      // Destroy advancement managers if advancement capture is disabled
      const disableAdvancementCapture = game.settings.get(MODULE_ID, 'disableAdvancementCapture');
      if (disableAdvancementCapture) {
        try {
          destroyAdvancementManagers();
        } catch (error) {
          window.GAS.log.e('[WORKFLOW] Error destroying advancement managers:', error);
        }
      }
      
      Hooks.call('gas.equipmentSelection', workflowFSMContext.actor);
    })
    .state('shopping')
    .on('shopping_complete')
      .transitionTo('selecting_spells').withCondition((context) => {
        // Use the persisted actor from actorInGame store instead of workflowFSMContext.actor
        const currentActor = get(actorInGame);
        // Fallback to context actor if store is empty (useful for tests and edge cases)
        const actorToCheck = currentActor || workflowFSMContext.actor;
        const shouldShow = workflowFSMContext._shouldShowSpellSelection(actorToCheck);
        window.GAS.log.d('[FSM] shopping_complete -> selecting_spells condition (using actorInGame):', shouldShow);
        return shouldShow;
      })
      .transitionTo('completed') // Default fallback when spell selection is not needed
    .on('skip_shopping')
      .transitionTo('selecting_spells').withCondition((context) => {
        const currentActor = get(actorInGame);
        // Fallback to context actor if store is empty (useful for tests and edge cases)
        const actorToCheck = currentActor || workflowFSMContext.actor;
        const shouldShow = workflowFSMContext._shouldShowSpellSelection(actorToCheck);
        window.GAS.log.d('[FSM] skip_shopping -> selecting_spells condition (using actorInGame):', shouldShow);
        return shouldShow;
      })
      .transitionTo('completed') // Default fallback when spell selection is not needed
    .on('error').transitionTo('error')
    .on('reset').transitionTo('idle')
    .onEnter((context) => {
      if (workflowFSMContext.isProcessing) workflowFSMContext.isProcessing.set(false);
      window.GAS.log.d('[WORKFLOW] Entered SHOPPING state');
      // Add shop tab and switch to it
      const currentTabs = get(tabs);
      if (!currentTabs.find(t => t.id === "shop")) {
        tabs.update(t => [...t, { label: "Shop", id: "shop", component: "ShopTab" }]);
      }
      activeTab.set("shop");
      const currentReadOnlyTabs = get(readOnlyTabs);
      if (!currentReadOnlyTabs.includes("equipment")) {
        readOnlyTabs.update(current => [...current, "equipment"]);
      }
      const totalGoldFromChoices = window.GAS?.totalGoldFromChoices;
      const goldRoll = window.GAS?.goldRoll;
      let goldValue;
      if (window.GAS.dnd5eVersion >= 4) {
        goldValue = totalGoldFromChoices ? get(totalGoldFromChoices) : 0;
      } else {
        goldValue = goldRoll ? get(goldRoll) : 0;
      }
      const goldValueInCopper = goldValue * 100;
      if (window.GAS.availableGold) {
        window.GAS.availableGold.set(goldValueInCopper);
      }
    })
    .state('selecting_spells')
    .on('spells_complete').transitionTo('completed')
    .on('skip_spells').transitionTo('completed')
    .on('error').transitionTo('error')
    .on('reset').transitionTo('idle')
    .onEnter((context) => {
      if (workflowFSMContext.isProcessing) workflowFSMContext.isProcessing.set(false);
      window.GAS.log.d('[WORKFLOW] Entered SELECTING_SPELLS state');
      const currentTabs = get(tabs);
      if (!currentTabs.find(t => t.id === "spells")) {
        tabs.update(t => [...t, { label: "Spells", id: "spells", component: "Spells" }]);
      }
      activeTab.set("spells");
    })
    .state('completed')
    .on('reset').transitionTo('idle')
    .onEnter((context) => {
      if (workflowFSMContext.isProcessing) workflowFSMContext.isProcessing.set(false);
      window.GAS.log.d('[WORKFLOW] Entered COMPLETED state');
      
      // Destroy advancement managers
      try {
        destroyAdvancementManagers();
      } catch (error) {
        window.GAS.log.e('[WORKFLOW] Error destroying advancement managers on completed:', error);
      }
      
      const { actor } = workflowFSMContext;
      if (actor) {
        window.GAS.log.d('[WORKFLOW] Opening actor sheet for:', actor.name);
        actor.sheet.render(true);
      }
      setTimeout(() => {
        window.GAS.log.d('[WORKFLOW] Closing Actor Studio');
        Hooks.call("gas.close");
      }, 1500);
    })
    .state('error')
    .on('reset').transitionTo('idle')
    .onEnter((context) => {
      if (workflowFSMContext.isProcessing) workflowFSMContext.isProcessing.set(false);
      window.GAS.log.e('[WORKFLOW] Entered ERROR state:', context.error);
      if (context.error) ui.notifications.error(context.error);
    })
    .start();
  return fsm;
}

// Provide a getter for the singleton FSM instance
let workflowFSM;
export function getWorkflowFSM() {
  if (!workflowFSM) {
    workflowFSM = createWorkflowStateMachine();
    // Expose the FSM on window.GAS for debugging
    if (typeof window !== 'undefined') {
      window.GAS = window.GAS || {};
      window.GAS.workflowFSM = workflowFSM;
      console.log('window.GAS.workflowFSM assigned:', window.GAS.workflowFSM);
    }
  }
  return workflowFSM;
}

// Only export the Finity-based FSM and context
export default {
  createWorkflowStateMachine,
  getWorkflowFSM,
  workflowFSMContext,
  WORKFLOW_STATES,
  WORKFLOW_EVENTS,
  getEquipmentCompletionEvent
};

// In AdvancementManager.js or wherever you use the FSM:
// import { workflowFSMContext } from '~/src/helpers/WorkflowStateMachine';
// import { createWorkflowStateMachine, WORKFLOW_EVENTS } from '~/src/helpers/WorkflowStateMachine';
// const workflowFSM = createWorkflowStateMachine();
//
// When handling an event, always pass the shared context and any new data:
// workflowFSM.handle(WORKFLOW_EVENTS.ADVANCEMENTS_COMPLETE, { ...workflowFSMContext, actor: currentActor });
//
// This ensures all state actions have access to the required context and stores.

/**
 * Determines the appropriate completion event for equipment selection
 * Based on the state machine logic in selecting_equipment state
 * @param {Object} context - The workflow context containing actor and other data
 * @param {boolean} skipCondition - Whether to skip equipment (not used currently)
 * @returns {string} The event name to trigger ('equipment_complete' or 'skip_equipment')
 */
export function getEquipmentCompletionEvent(context, skipCondition = false) {
  // For now, always return 'equipment_complete' since we're completing equipment selection
  // The state machine will handle the conditional transitions based on settings
  return skipCondition ? 'skip_equipment' : 'equipment_complete';
}
