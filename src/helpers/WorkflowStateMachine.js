// IMPORTANT: Do not overwrite window.GAS. Always extend it using window.GAS = window.GAS || {};
// This ensures global state is preserved and debuggable across modules.

import { writable, get } from 'svelte/store';
import { MODULE_ID } from '~/src/helpers/constants';
import { activeTab, tabs, readOnlyTabs } from '~/src/stores/index';
import { compatibleStartingEquipment } from '~/src/stores/startingEquipment';
import { preAdvancementSelections, dropItemRegistry } from '~/src/stores/index';
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
  actor: undefined,
  nextState: undefined,
  _shouldShowEquipmentSelection: function (context) {
    const enableEquipmentSelection = game.settings.get(MODULE_ID, 'enableEquipmentSelection');
    if (!enableEquipmentSelection) return false;
    const preSelections = get(preAdvancementSelections);
    if (Object.keys(preSelections).length === 0 || !preSelections.class || !preSelections.class.system || !preSelections.class.system.startingEquipment || preSelections.class.system.startingEquipment.length === 0 || preSelections.class.system.wealth === undefined) return false;
    const compatibleEquipment = get(compatibleStartingEquipment);
    return compatibleEquipment.length > 0;
  },
  _shouldShowSpellSelection: function (inGameActor, context = null) {
    const enableSpellSelection = game.settings.get(MODULE_ID, 'enableSpellSelection');
    if (!enableSpellSelection) return false;
    let actorForDecision = inGameActor;
    if (context?.preCreationActor) actorForDecision = context.preCreationActor;
    if (!actorForDecision) return false;
    const classes = actorForDecision.classes || {};
    const classKeys = Object.keys(classes);
    if (!classKeys.length) {
      if (actorForDecision === context?.postCreationActor && context?.preCreationActor) {
        return workflowFSMContext._shouldShowSpellSelection(context.preCreationActor);
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
  }
};

/**
 * Finity-based state machine for character creation workflow
 */
export function createWorkflowStateMachine() {
  // Store the next state in a closure variable accessible to both onEnter and transitionTo
  let advancementNextState = 'completed';
  
  const fsm = Finity
    .configure()
    .initialState('idle')
    .state('idle')
    .on('start_character_creation').transitionTo('creating_character')
    .on('reset').transitionTo('idle')
    .onEnter((context) => {
      if (context && context.isProcessing) context.isProcessing.set(false);
      if (window.GAS?.log?.d) window.GAS.log.d('[WORKFLOW] Entered IDLE state');
    })
    .state('creating_character')
    .on('character_created').transitionTo('processing_advancements')
    .on('error').transitionTo('error')
    .on('reset').transitionTo('idle')
    .onEnter((context) => {
      if (context && context.isProcessing) context.isProcessing.set(true);
      if (window.GAS?.log?.d) window.GAS.log.d('[WORKFLOW] Entered CREATING_CHARACTER state');
    })
    .state('processing_advancements')
    .on('advancements_complete').transitionTo(() => {
      if (window.GAS?.log?.d) window.GAS.log.d('[WORKFLOW] Transition handler called for advancements_complete, next state:', advancementNextState);
      const state = advancementNextState;
      if (window.GAS?.log?.d) window.GAS.log.d('[WORKFLOW] Returning state:', state);
      return state;
    })
    .on('error').transitionTo('error')
    .on('reset').transitionTo('idle')
    .onEnter(async function (context) {
      // The context parameter is sometimes a string in Finity, so we need to ensure it's an object
      if (typeof context === 'string') {
        context = { ...workflowFSMContext };
      } else {
        Object.assign(context, workflowFSMContext);
      }
      
      await dropItemRegistry.advanceQueue(true);
      if (window.GAS?.log?.d) window.GAS.log.d('[WORKFLOW] Queue processed, determining next state');
      
      // Import workflow function dynamically to avoid circular dependency
      const { handleAdvancementCompletion } = await import('~/src/lib/workflow.js');
      const nextState = await handleAdvancementCompletion(context);
      
      // Store the nextState in the closure variable
      advancementNextState = nextState;
      
      if (window.GAS?.log?.d) window.GAS.log.d('[WORKFLOW] About to trigger advancements_complete with nextState:', advancementNextState);
      
      // Use setTimeout to ensure FSM is ready for the transition
      setTimeout(() => {
        if (window.GAS?.log?.d) window.GAS.log.d('[WORKFLOW] Triggering advancements_complete event, current state:', fsm.getCurrentState());
        try {
          fsm.handle(WORKFLOW_EVENTS.ADVANCEMENTS_COMPLETE);
          if (window.GAS?.log?.d) window.GAS.log.d('[WORKFLOW] Event handled, new state:', fsm.getCurrentState());
        } catch (error) {
          console.error('[WORKFLOW] Error handling advancements_complete event:', error);
        }
      }, 100); // Increase delay to 100ms to ensure FSM state is stable
    })
    .state('selecting_equipment')
    .on(['equipment_complete', 'skip_equipment']).transitionTo((context) => {
      if (context._shouldShowShopping()) return 'shopping';
      if (context._shouldShowSpellSelection(context.actor, context)) return 'selecting_spells';
      return 'completed';
    })
    .on('error').transitionTo('error')
    .on('reset').transitionTo('idle')
    .onEnter((context) => {
      if (context && context.isProcessing) context.isProcessing.set(false);
      if (window.GAS?.log?.d) window.GAS.log.d('[WORKFLOW] Entered SELECTING_EQUIPMENT state');
      if (context && context.actor) Hooks.call('gas.equipmentSelection', context.actor);
    })
    .state('shopping')
    .on(['shopping_complete', 'skip_shopping']).transitionTo((context) => {
      if (context._shouldShowSpellSelection(context.actor, context)) return 'selecting_spells';
      return 'completed';
    })
    .on('error').transitionTo('error')
    .on('reset').transitionTo('idle')
    .onEnter((context) => {
      if (context && context.isProcessing) context.isProcessing.set(false);
      if (window.GAS?.log?.d) window.GAS.log.d('[WORKFLOW] Entered SHOPPING state');
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
    .on(['spells_complete', 'skip_spells']).transitionTo('completed')
    .on('error').transitionTo('error')
    .on('reset').transitionTo('idle')
    .onEnter((context) => {
      if (context && context.isProcessing) context.isProcessing.set(false);
      if (window.GAS?.log?.d) window.GAS.log.d('[WORKFLOW] Entered SELECTING_SPELLS state');
      console.log('[WORKFLOW] SELECTING_SPELLS onEnter called - adding spells tab');
      const currentTabs = get(tabs);
      if (!currentTabs.find(t => t.id === "spells")) {
        console.log('[WORKFLOW] Adding spells tab to tabs');
        tabs.update(t => [...t, { label: "Spells", id: "spells", component: "Spells" }]);
      } else {
        console.log('[WORKFLOW] Spells tab already exists');
      }
      console.log('[WORKFLOW] Setting active tab to spells');
      activeTab.set("spells");
      console.log('[WORKFLOW] Active tab set to spells, current tabs:', get(tabs));
    })
    .state('completed')
    .on('reset').transitionTo('idle')
    .onEnter((context) => {
      if (context && context.isProcessing) context.isProcessing.set(false);
      if (window.GAS?.log?.d) window.GAS.log.d('[WORKFLOW] Entered COMPLETED state');
      const { actor } = context;
      if (actor) {
        if (window.GAS?.log?.d) window.GAS.log.d('[WORKFLOW] Opening actor sheet for:', actor.name);
        actor.sheet.render(true);
      }
      setTimeout(() => {
        if (window.GAS?.log?.d) window.GAS.log.d('[WORKFLOW] Closing Actor Studio');
        Hooks.call("gas.close");
      }, 1500);
    })
    .state('error')
    .on('reset').transitionTo('idle')
    .onEnter((context) => {
      if (context && context.isProcessing) context.isProcessing.set(false);
      if (window.GAS?.log?.e) window.GAS.log.e('[WORKFLOW] Entered ERROR state:', context?.error);
      if (context && context.error) ui.notifications.error(context.error);
    })
    .start();
  return fsm;
}

// Create and export a singleton FSM instance for the workflow
let workflowFSM;
export function getWorkflowFSM() {
  if (!workflowFSM) {
    workflowFSM = createWorkflowStateMachine();
    if (typeof window !== 'undefined') {
      window.GAS = window.GAS || {};
      window.GAS.workflowFSM = workflowFSM;
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
  WORKFLOW_EVENTS
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
