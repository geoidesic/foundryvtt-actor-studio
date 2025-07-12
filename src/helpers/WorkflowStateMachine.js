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
    
    // DETAILED LOGGING - Log the attempted transition with full context
    console.log(`🔄 [WORKFLOW] ========== TRANSITION ATTEMPT ==========`);
    console.log(`🔄 [WORKFLOW] Event: '${event}'`);
    console.log(`🔄 [WORKFLOW] Current State: '${currentState}'`);
    console.log(`🔄 [WORKFLOW] Context Data:`, JSON.stringify(contextData, null, 2));
    console.log(`🔄 [WORKFLOW] Actor in context:`, contextData?.actor);
    console.log(`🔄 [WORKFLOW] Actor classes:`, contextData?.actor?.classes);
    window.GAS?.log?.d?.(`[WORKFLOW] Attempting transition: event='${event}' from state='${currentState}' with context:`, contextData);

    if (!transitions || !transitions[event]) {
      console.error(`❌ [WORKFLOW] Invalid transition: ${event} from state ${currentState}`);
      window.GAS.log.w(`[WORKFLOW] Invalid transition: ${event} from state ${currentState}`);
      return false;
    }

    // Update context with new data, preserving both pre-creation and post-creation actors
    this.context.update(ctx => {
      const updated = { ...ctx, ...contextData };
      
      // If we receive a new actor, determine if it's pre-creation or post-creation
      if (contextData.actor) {
        if (contextData.actor.id) {
          // This is a post-creation actor (has Foundry ID)
          console.log(`🔄 [WORKFLOW] Received post-creation actor:`, contextData.actor.name);
          updated.postCreationActor = contextData.actor;
          updated.actor = contextData.actor; // Keep current behavior for compatibility
          
          // Preserve the original pre-creation actor if we have it
          if (ctx.preCreationActor) {
            console.log(`🔄 [WORKFLOW] Preserving pre-creation actor:`, ctx.preCreationActor.name);
            updated.preCreationActor = ctx.preCreationActor;
          }
        } else {
          // This is a pre-creation actor (no ID yet)
          console.log(`🔄 [WORKFLOW] Received pre-creation actor:`, contextData.actor.name);
          updated.preCreationActor = contextData.actor;
          updated.actor = contextData.actor; // Keep current behavior for compatibility
        }
      }
      
      return updated;
    });
    const fullContext = get(this.context);
    console.log(`🔄 [WORKFLOW] Full context after update:`, JSON.stringify(fullContext, null, 2));

    let nextState = transitions[event];
    
    // If transition is a function, call it to determine next state
    if (typeof nextState === 'function') {
      console.log(`🔄 [WORKFLOW] Transition is a function, calling with context:`, fullContext);
      nextState = await nextState(fullContext);
      console.log(`🔄 [WORKFLOW] Function returned next state: '${nextState}'`);
    }

    // Log the state change
    console.log(`✅ [WORKFLOW] TRANSITIONING: '${currentState}' -> '${nextState}' via '${event}'`);
    window.GAS?.log?.d?.(`[WORKFLOW] Transitioning from '${currentState}' to '${nextState}' via event='${event}'`);
    
    this.currentState.set(nextState);
    
    // Execute state action
    if (this.stateActions[nextState]) {
      console.log(`🎯 [WORKFLOW] Executing state action for: '${nextState}'`);
      await this.stateActions[nextState](fullContext);
      console.log(`🎯 [WORKFLOW] State action completed for: '${nextState}'`);
    }

    console.log(`🔄 [WORKFLOW] ========== TRANSITION COMPLETE ==========`);
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
    // Pass the in-game actor and full context
    if (this._shouldShowSpellSelection(actor, context)) {
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
    // Pass the in-game actor and full context
    if (this._shouldShowSpellSelection(actor, context)) {
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
    console.log(`🛒 [WORKFLOW] ========== _determineNextAfterShopping ==========`);
    console.log(`🛒 [WORKFLOW] Full context received:`, JSON.stringify(context, null, 2));
    
    const { actor } = context;
    console.log(`🛒 [WORKFLOW] Extracted actor:`, actor);
    console.log(`🛒 [WORKFLOW] Actor type:`, typeof actor);
    console.log(`🛒 [WORKFLOW] Actor constructor:`, actor?.constructor?.name);
    console.log(`🛒 [WORKFLOW] Actor name:`, actor?.name);
    console.log(`🛒 [WORKFLOW] Actor classes:`, actor?.classes);
    console.log(`🛒 [WORKFLOW] Actor classes type:`, typeof actor?.classes);
    console.log(`🛒 [WORKFLOW] Actor classes keys:`, actor?.classes ? Object.keys(actor.classes) : 'N/A');
    
    if (actor?.classes) {
      for (const [className, classData] of Object.entries(actor.classes)) {
        console.log(`🛒 [WORKFLOW] Class '${className}':`, classData);
        console.log(`🛒 [WORKFLOW] Class '${className}' system:`, classData?.system);
        console.log(`🛒 [WORKFLOW] Class '${className}' spellcasting:`, classData?.system?.spellcasting);
        console.log(`🛒 [WORKFLOW] Class '${className}' progression:`, classData?.system?.spellcasting?.progression);
      }
    }
    
    window.GAS?.log?.d?.('[WORKFLOW] _determineNextAfterShopping called with context:', context);
    window.GAS?.log?.d?.('[WORKFLOW] Actor object:', actor);
    window.GAS?.log?.d?.('[WORKFLOW] Actor classes:', actor?.classes);
    
    // After shopping, check spell selection
    console.log(`🛒 [WORKFLOW] About to call _shouldShowSpellSelection...`);
    const shouldShowSpells = this._shouldShowSpellSelection(actor, context);
    console.log(`🛒 [WORKFLOW] _shouldShowSpellSelection returned:`, shouldShowSpells);
    
    window.GAS?.log?.d?.('[WORKFLOW] Should show spells after shopping:', shouldShowSpells);
    
    if (shouldShowSpells) {
      console.log(`✅ [WORKFLOW] SPELL SELECTION ENABLED - Going to SELECTING_SPELLS`);
      window.GAS?.log?.d?.('[WORKFLOW] Transitioning from shopping to spells');
      return WORKFLOW_STATES.SELECTING_SPELLS;
    }
    
    // If no spells, complete
    console.log(`❌ [WORKFLOW] SPELL SELECTION DISABLED - Going to COMPLETED`);
    window.GAS?.log?.d?.('[WORKFLOW] No spells needed, completing workflow');
    console.log(`🛒 [WORKFLOW] ========== _determineNextAfterShopping END ==========`);
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
   * @param {Object} inGameActor - The actual Foundry actor (post-creation, for operations)
   * @param {Object} context - Workflow context containing both pre/post creation actors
   */
  _shouldShowSpellSelection(inGameActor, context = null) {
    console.log(`🎯 [WORKFLOW] _shouldShowSpellSelection called`);
    console.log(`🎯 [WORKFLOW] In-game actor:`, inGameActor?.name, inGameActor?.id);
    console.log(`🎯 [WORKFLOW] Context pre-creation actor:`, context?.preCreationActor?.name);
    console.log(`🎯 [WORKFLOW] Context post-creation actor:`, context?.postCreationActor?.name);
    
    window.GAS?.log?.d?.('[WORKFLOW] _shouldShowSpellSelection called with in-game actor:', inGameActor);
    
    const enableSpellSelection = game.settings.get(MODULE_ID, 'enableSpellSelection');
    window.GAS?.log?.d?.('[WORKFLOW] Spell selection setting enabled:', enableSpellSelection);
    
    if (!enableSpellSelection) {
      window.GAS?.log?.d?.('[WORKFLOW] Spell selection disabled in settings');
      return false;
    }
    
    // CONTEXT-AWARE DECISION: Use pre-creation actor for spell decision if available
    // but keep in-game actor for any operations that need the real Foundry object
    let actorForDecision = inGameActor;
    
    if (context?.preCreationActor) {
      console.log(`🎯 [WORKFLOW] Using pre-creation actor for spell decision logic`);
      console.log(`🎯 [WORKFLOW] Pre-creation actor classes:`, Object.keys(context.preCreationActor.classes || {}));
      actorForDecision = context.preCreationActor;
      window.GAS?.log?.d?.('[WORKFLOW] Using pre-creation actor for spell decision:', actorForDecision);
    } else {
      console.log(`🎯 [WORKFLOW] No pre-creation actor, using in-game actor for decision`);
      window.GAS?.log?.d?.('[WORKFLOW] Falling back to in-game actor for decision:', actorForDecision);
    }
    
    if (!actorForDecision) {
      window.GAS?.log?.w?.('[WORKFLOW] No actor available for spell selection check');
      return false;
    }
    
    console.log(`🎯 [WORKFLOW] Final actor for spell decision:`, actorForDecision.name);
    console.log(`🎯 [WORKFLOW] Decision actor classes:`, Object.keys(actorForDecision.classes || {}));
    
    // Check if actor is a spellcaster using the same logic as workflow.js
    const classes = actorForDecision.classes || {};
    const classKeys = Object.keys(classes);
    window.GAS?.log?.d?.('[WORKFLOW] Actor classes found:', classKeys);
    
    if (!classKeys.length) {
      window.GAS?.log?.d?.('[WORKFLOW] No classes found on actor');
      
      // FALLBACK: If we're checking a post-creation actor and it has no classes,
      // try to check the pre-creation actor instead
      if (actorForDecision === context?.postCreationActor && context?.preCreationActor) {
        console.log(`🔄 [WORKFLOW] Post-creation actor has no classes, falling back to pre-creation actor`);
        return this._shouldShowSpellSelection(context.preCreationActor);
      }
      
      return false;
    }
    
    // Check each class for spellcasting capability
    const spellcastingInfo = Object.entries(classes).map(([className, classData]) => {
      const progression = classData?.system?.spellcasting?.progression;
      window.GAS?.log?.d?.(`[WORKFLOW] Class ${className} spellcasting progression:`, progression);
      return { className, progression, isSpellcaster: progression && progression !== "none" };
    });
    
    const isSpellcaster = spellcastingInfo.some(info => info.isSpellcaster);
    
    window.GAS?.log?.d?.('[WORKFLOW] Spellcasting analysis:', spellcastingInfo);
    
    // FAILSAFE: Check for known spellcasting classes by name if progression check fails
    if (!isSpellcaster) {
      const knownSpellcastingClasses = [
        'bard', 'cleric', 'druid', 'paladin', 'ranger', 'sorcerer', 'warlock', 'wizard',
        'artificer', 'aberrantmind', 'arcanetrickster', 'eldritchknight'
      ];
      
      const hasKnownSpellcastingClass = classKeys.some(className => 
        knownSpellcastingClasses.includes(className.toLowerCase())
      );
      
      if (hasKnownSpellcastingClass) {
        window.GAS?.log?.w?.('[WORKFLOW] FAILSAFE: Found known spellcasting class, showing spells despite progression check failure');
        window.GAS?.log?.w?.('[WORKFLOW] Known spellcasting class found in:', classKeys);
        return true;
      }
    }
    
    window.GAS?.log?.d?.('[WORKFLOW] Actor is spellcaster:', isSpellcaster);
    window.GAS?.log?.d?.('[WORKFLOW] Spell selection check complete. Result:', isSpellcaster);
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
