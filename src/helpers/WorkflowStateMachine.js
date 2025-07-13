import { writable, get } from 'svelte/store';
import { MODULE_ID } from '~/src/helpers/constants';
import { activeTab, tabs, readOnlyTabs } from '~/src/stores/index';
import { compatibleStartingEquipment } from '~/src/stores/startingEquipment';
import { preAdvancementSelections, dropItemRegistry } from '~/src/stores/index';
import { handleAdvancementCompletion, postQueueProcessing } from '~/src/lib/workflow.js';
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
      if (context.isProcessing) context.isProcessing.set(false);
    })
    .state('creating_character')
    .on('character_created').transitionTo('processing_advancements')
    .on('error').transitionTo('error')
    .on('reset').transitionTo('idle')
    .onEnter((context) => {
      if (context.isProcessing) context.isProcessing.set(true);
      window.GAS.log.d('[WORKFLOW] Entered CREATING_CHARACTER state');
    })
    .state('processing_advancements')
    .on('advancements_complete').transitionTo(async (context) => {
      // handleAdvancementCompletion should return the next state as a string
      return await handleAdvancementCompletion(context);
    })
    .on('error').transitionTo('error')
    .on('reset').transitionTo('idle')
    .onEnter(async (context) => {
      // You can do any setup or queue processing here if needed
      // For example, if you want to start the queue automatically:
      // await dropItemRegistry.advanceQueue(true);
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
      if (context.isProcessing) context.isProcessing.set(false);
      window.GAS.log.d('[WORKFLOW] Entered SELECTING_EQUIPMENT state');
      Hooks.call('gas.equipmentSelection', context.actor);
    })
    .state('shopping')
    .on(['shopping_complete', 'skip_shopping']).transitionTo((context) => {
      if (context._shouldShowSpellSelection(context.actor, context)) return 'selecting_spells';
      return 'completed';
    })
    .on('error').transitionTo('error')
    .on('reset').transitionTo('idle')
    .onEnter((context) => {
      if (context.isProcessing) context.isProcessing.set(false);
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
    .on(['spells_complete', 'skip_spells']).transitionTo('completed')
    .on('error').transitionTo('error')
    .on('reset').transitionTo('idle')
    .onEnter((context) => {
      if (context.isProcessing) context.isProcessing.set(false);
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
      if (context.isProcessing) context.isProcessing.set(false);
      window.GAS.log.d('[WORKFLOW] Entered COMPLETED state');
      const { actor } = context;
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
      if (context.isProcessing) context.isProcessing.set(false);
      window.GAS.log.e('[WORKFLOW] Entered ERROR state:', context.error);
      if (context.error) ui.notifications.error(context.error);
    })
    .start();
  return fsm;
}

// Create and export a singleton FSM instance for the workflow
export const workflowFSM = createWorkflowStateMachine();

// Always expose the workflowFSM globally for debugging in the browser inspector
if (typeof window !== 'undefined') {
  window.GAS = window.GAS || {};
  window.GAS.workflowFSM = workflowFSM;
  console.log('window.GAS.workflowFSM assigned (module load):', window.GAS.workflowFSM);
}

// Provide a getter for the singleton FSM instance
export function getWorkflowFSM() {
  if (typeof window !== 'undefined') {
    window.GAS = window.GAS || {};
    window.GAS.workflowFSM = workflowFSM;
    console.log('window.GAS.workflowFSM assigned (getWorkflowFSM):', window.GAS.workflowFSM);
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
