import { writable, get } from 'svelte/store';
import { MODULE_ID } from '~/src/helpers/constants';
import { activeTab, tabs, readOnlyTabs } from '~/src/stores/index';
import { compatibleStartingEquipment } from '~/src/stores/startingEquipment';
import { preAdvancementSelections } from '~/src/stores/index';

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
  RESET: 'reset'
};

/**
 * State machine for character creation workflow
 */
export class WorkflowStateMachine {
  constructor() {
    this.currentState = writable(WORKFLOW_STATES.IDLE);
    this.context = writable({});
    this.isProcessing = writable(false);
    
    // Define state transitions
    this.transitions = {
      [WORKFLOW_STATES.IDLE]: {
        [WORKFLOW_EVENTS.START_CHARACTER_CREATION]: WORKFLOW_STATES.CREATING_CHARACTER
      },
      [WORKFLOW_STATES.CREATING_CHARACTER]: {
        [WORKFLOW_EVENTS.CHARACTER_CREATED]: WORKFLOW_STATES.PROCESSING_ADVANCEMENTS,
        [WORKFLOW_EVENTS.ERROR]: WORKFLOW_STATES.ERROR
      },
      [WORKFLOW_STATES.PROCESSING_ADVANCEMENTS]: {
        [WORKFLOW_EVENTS.ADVANCEMENTS_COMPLETE]: this._determineNextAfterAdvancements.bind(this),
        [WORKFLOW_EVENTS.ERROR]: WORKFLOW_STATES.ERROR
      },
      [WORKFLOW_STATES.SELECTING_EQUIPMENT]: {
        [WORKFLOW_EVENTS.EQUIPMENT_COMPLETE]: this._determineNextAfterEquipment.bind(this),
        [WORKFLOW_EVENTS.SKIP_EQUIPMENT]: this._determineNextAfterEquipment.bind(this),
        [WORKFLOW_EVENTS.ERROR]: WORKFLOW_STATES.ERROR
      },
      [WORKFLOW_STATES.SELECTING_SPELLS]: {
        [WORKFLOW_EVENTS.SPELLS_COMPLETE]: this._determineNextAfterSpells.bind(this),
        [WORKFLOW_EVENTS.SKIP_SPELLS]: this._determineNextAfterSpells.bind(this),
        [WORKFLOW_EVENTS.ERROR]: WORKFLOW_STATES.ERROR
      },
      [WORKFLOW_STATES.SHOPPING]: {
        [WORKFLOW_EVENTS.SHOPPING_COMPLETE]: this._determineNextAfterShopping.bind(this),
        [WORKFLOW_EVENTS.SKIP_SHOPPING]: this._determineNextAfterShopping.bind(this),
        [WORKFLOW_EVENTS.ERROR]: WORKFLOW_STATES.ERROR
      },
      [WORKFLOW_STATES.COMPLETED]: {
        [WORKFLOW_EVENTS.RESET]: WORKFLOW_STATES.IDLE
      },
      [WORKFLOW_STATES.ERROR]: {
        [WORKFLOW_EVENTS.RESET]: WORKFLOW_STATES.IDLE
      }
    };

    // State actions - what to do when entering each state
    this.stateActions = {
      [WORKFLOW_STATES.IDLE]: this._onEnterIdle.bind(this),
      [WORKFLOW_STATES.CREATING_CHARACTER]: this._onEnterCreatingCharacter.bind(this),
      [WORKFLOW_STATES.PROCESSING_ADVANCEMENTS]: this._onEnterProcessingAdvancements.bind(this),
      [WORKFLOW_STATES.SELECTING_EQUIPMENT]: this._onEnterSelectingEquipment.bind(this),
      [WORKFLOW_STATES.SELECTING_SPELLS]: this._onEnterSelectingSpells.bind(this),
      [WORKFLOW_STATES.SHOPPING]: this._onEnterShopping.bind(this),
      [WORKFLOW_STATES.COMPLETED]: this._onEnterCompleted.bind(this),
      [WORKFLOW_STATES.ERROR]: this._onEnterError.bind(this)
    };
  }

  /**
   * Transition to a new state based on an event
   */
  async transition(event, contextData = {}) {
    const currentState = get(this.currentState);
    const transitions = this.transitions[currentState];
    
    // Log the attempted transition
    window.GAS?.log?.d?.(`[WORKFLOW] Attempting transition: event='${event}' from state='${currentState}' with context:`, contextData);

    if (!transitions || !transitions[event]) {
      window.GAS.log.w(`[WORKFLOW] Invalid transition: ${event} from state ${currentState}`);
      return false;
    }

    // Update context with new data
    this.context.update(ctx => ({ ...ctx, ...contextData }));

    let nextState = transitions[event];
    
    // If transition is a function, call it to determine next state
    if (typeof nextState === 'function') {
      nextState = await nextState(get(this.context));
    }

    // Log the state change
    window.GAS?.log?.d?.(`[WORKFLOW] Transitioning from '${currentState}' to '${nextState}' via event='${event}'`);
    
    this.currentState.set(nextState);
    
    // Execute state action
    if (this.stateActions[nextState]) {
      await this.stateActions[nextState](get(this.context));
    }

    return true;
  }

  /**
   * Determine next state after advancements based on settings and character
   * Flow: Equipment → Shopping → Spells → Completed
   */
  async _determineNextAfterAdvancements(context) {
    const { actor } = context;
    
    // First check equipment selection
    if (this._shouldShowEquipmentSelection(context)) {
      return WORKFLOW_STATES.SELECTING_EQUIPMENT;
    }
    
    // If no equipment, check shopping
    if (this._shouldShowShopping()) {
      return WORKFLOW_STATES.SHOPPING;
    }
    
    // If no shopping, check spell selection
    if (this._shouldShowSpellSelection(actor)) {
      return WORKFLOW_STATES.SELECTING_SPELLS;
    }
    
    // If none of the above, complete the workflow
    return WORKFLOW_STATES.COMPLETED;
  }

  /**
   * Determine next state after equipment selection
   * Flow: Equipment → Shopping → Spells → Completed
   */
  async _determineNextAfterEquipment(context) {
    const { actor } = context;
    
    // After equipment, check shopping
    if (this._shouldShowShopping()) {
      return WORKFLOW_STATES.SHOPPING;
    }
    
    // If no shopping, check spell selection
    if (this._shouldShowSpellSelection(actor)) {
      return WORKFLOW_STATES.SELECTING_SPELLS;
    }
    
    // If neither shopping nor spells, complete
    return WORKFLOW_STATES.COMPLETED;
  }

  /**
   * Determine next state after shopping
   * Flow: Shopping → Spells → Completed
   */
  async _determineNextAfterShopping(context) {
    const { actor } = context;
    
    // After shopping, check spell selection
    if (this._shouldShowSpellSelection(actor)) {
      return WORKFLOW_STATES.SELECTING_SPELLS;
    }
    
    // If no spells, complete
    return WORKFLOW_STATES.COMPLETED;
  }

  /**
   * Determine next state after spell selection
   * Flow: Spells → Completed (always, as spells are the last step)
   */
  async _determineNextAfterSpells(context) {
    // Spells are always the last step, so always complete
    return WORKFLOW_STATES.COMPLETED;
  }

  /**
   * Check if equipment selection should be shown
   */
  _shouldShowEquipmentSelection(context) {
    const enableEquipmentSelection = game.settings.get(MODULE_ID, 'enableEquipmentSelection');
    if (!enableEquipmentSelection) {
      window.GAS.log.d('[WORKFLOW] Equipment selection disabled in settings');
      return false;
    }
    
    // Get the pre-advancement selection data
    const preSelections = get(preAdvancementSelections);
    
    // Basic checks for required data
    if (Object.keys(preSelections).length === 0 || 
        !preSelections.class || 
        !preSelections.class.system || 
        !preSelections.class.system.startingEquipment || 
        preSelections.class.system.startingEquipment.length === 0 || 
        preSelections.class.system.wealth === undefined) {
      window.GAS.log.d('[WORKFLOW] Equipment not viable - missing required data');
      return false;
    }
    
    // Check for compatible equipment options
    const compatibleEquipment = get(compatibleStartingEquipment);
    const viable = compatibleEquipment.length > 0;
    
    window.GAS.log.d('[WORKFLOW] Equipment selection viable:', viable);
    return viable;
  }

  /**
   * Check if spell selection should be shown
   */
  _shouldShowSpellSelection(actor) {
    const enableSpellSelection = game.settings.get(MODULE_ID, 'enableSpellSelection');
    if (!enableSpellSelection) {
      window.GAS.log.d('[WORKFLOW] Spell selection disabled in settings');
      return false;
    }
    
    if (!actor) {
      window.GAS.log.d('[WORKFLOW] No actor provided for spell selection check');
      return false;
    }
    
    // Check if actor is a spellcaster using the same logic as workflow.js
    const classes = actor.classes || {};
    if (!Object.keys(classes).length) {
      window.GAS.log.d('[WORKFLOW] No classes found on actor');
      return false;
    }
    
    const isSpellcaster = Object.values(classes).some(cls => 
      cls.system?.spellcasting?.progression && 
      cls.system.spellcasting.progression !== "none"
    );
    
    window.GAS.log.d('[WORKFLOW] Actor is spellcaster:', isSpellcaster);
    return isSpellcaster;
  }

  /**
   * Check if shopping should be shown
   */
  _shouldShowShopping() {
    const enableShopping = game.settings.get(MODULE_ID, 'enableEquipmentPurchase');
    window.GAS.log.d('[WORKFLOW] Shopping enabled:', enableShopping);
    return enableShopping;
  }

  // State action methods
  async _onEnterIdle(context) {
    this.isProcessing.set(false);
    window.GAS.log.d('[WORKFLOW] Entered IDLE state');
  }

  async _onEnterCreatingCharacter(context) {
    this.isProcessing.set(true);
    window.GAS.log.d('[WORKFLOW] Entered CREATING_CHARACTER state');
  }

  async _onEnterProcessingAdvancements(context) {
    window.GAS.log.d('[WORKFLOW] Entered PROCESSING_ADVANCEMENTS state');
    // The advancement manager will handle this and call transition when done
  }

  async _onEnterSelectingEquipment(context) {
    this.isProcessing.set(false);
    console.log('[WORKFLOW] ====== ENTERING SELECTING_EQUIPMENT STATE ======');
    window.GAS.log.d('[WORKFLOW] Entered SELECTING_EQUIPMENT state');
    console.log('[WORKFLOW] About to call gas.equipmentSelection hook with actor:', context.actor);
    
    // Trigger the equipment selection hook
    Hooks.call("gas.equipmentSelection", context.actor);
    console.log('[WORKFLOW] gas.equipmentSelection hook called');
    console.log('[WORKFLOW] ====== SELECTING_EQUIPMENT STATE ENTRY COMPLETE ======');
  }

  async _onEnterSelectingSpells(context) {
    this.isProcessing.set(false);
    window.GAS.log.d('[WORKFLOW] Entered SELECTING_SPELLS state');
    
    // Add spells tab and switch to it
    const currentTabs = get(tabs);
    if (!currentTabs.find(t => t.id === "spells")) {
      tabs.update(t => [...t, { label: "Spells", id: "spells", component: "Spells" }]);
    }
    activeTab.set("spells");
  }

  async _onEnterShopping(context) {
    this.isProcessing.set(false);
    window.GAS.log.d('[WORKFLOW] Entered SHOPPING state');
    
    // Add shop tab and switch to it
    const currentTabs = get(tabs);
    if (!currentTabs.find(t => t.id === "shop")) {
      tabs.update(t => [...t, { label: "Shop", id: "shop", component: "ShopTab" }]);
    }
    activeTab.set("shop");
    
    // Make equipment tab readonly if it exists
    const currentReadOnlyTabs = get(readOnlyTabs);
    if (!currentReadOnlyTabs.includes("equipment")) {
      readOnlyTabs.update(current => [...current, "equipment"]);
    }
    
    // Set available gold in shop store based on DnD5e version
    // We'll need to access the stores from context or global state
    const totalGoldFromChoices = window.GAS?.totalGoldFromChoices;
    const goldRoll = window.GAS?.goldRoll;
    
    let goldValue;
    if (window.GAS.dnd5eVersion >= 4) {
      goldValue = totalGoldFromChoices ? get(totalGoldFromChoices) : 0;
      window.GAS.log.d('[WORKFLOW] Using totalGoldFromChoices for v4:', goldValue);
    } else {
      goldValue = goldRoll ? get(goldRoll) : 0;
      window.GAS.log.d('[WORKFLOW] Using goldRoll for v3:', goldValue);
    }
    
    // Convert gold to copper (1 gp = 100 cp)
    const goldValueInCopper = goldValue * 100;
    window.GAS.log.d('[WORKFLOW] Setting available gold for shop', goldValueInCopper);
    
    // Ensure we're updating both the local store and the global reference
    if (window.GAS.availableGold) {
      window.GAS.availableGold.set(goldValueInCopper);
    }
  }

  async _onEnterCompleted(context) {
    this.isProcessing.set(false);
    window.GAS.log.d('[WORKFLOW] Entered COMPLETED state');
    
    const { actor } = context;
    
    // Open the actor sheet if we have an actor
    if (actor) {
      window.GAS.log.d('[WORKFLOW] Opening actor sheet for:', actor.name);
      actor.sheet.render(true);
    }
    
    // Close the Actor Studio application after a short delay
    setTimeout(() => {
      window.GAS.log.d('[WORKFLOW] Closing Actor Studio');
      Hooks.call("gas.close");
    }, 1500);
  }

  async _onEnterError(context) {
    this.isProcessing.set(false);
    window.GAS.log.e('[WORKFLOW] Entered ERROR state:', context.error);
    
    if (context.error) {
      ui.notifications.error(context.error);
    }
  }

  /**
   * Get current state
   */
  getState() {
    return get(this.currentState);
  }

  /**
   * Get current context
   */
  getContext() {
    return get(this.context);
  }

  /**
   * Check if currently processing
   */
  getIsProcessing() {
    return get(this.isProcessing);
  }

  /**
   * Reset the state machine
   */
  reset() {
    this.currentState.set(WORKFLOW_STATES.IDLE);
    this.context.set({});
    this.isProcessing.set(false);
  }
}

// Export singleton instance
export const workflowStateMachine = new WorkflowStateMachine();

export default {
  WorkflowStateMachine,
  workflowStateMachine,
  WORKFLOW_STATES,
  WORKFLOW_EVENTS
};
