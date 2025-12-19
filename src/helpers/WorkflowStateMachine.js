import { writable, get } from 'svelte/store';
import { MODULE_ID } from '~/src/helpers/constants';
import { activeTab, tabs, readOnlyTabs } from '~/src/stores/index';
import { compatibleStartingEquipment } from '~/src/stores/startingEquipment';
import { preAdvancementSelections, dropItemRegistry } from '~/src/stores/index';
import { actorInGame, startingWealthChoice } from '~/src/stores/storeDefinitions';
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
  BIOGRAPHY: 'biography',
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
  BIOGRAPHY_COMPLETE: 'biography_complete',
  WEALTH_CHOICE_MADE: 'wealth_choice_made',
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
    
    // Check for spellcasting in multiple ways:
    // 1. Class-based spellcasting (base classes like Wizard, Cleric)
    // 2. Actor system spellcasting (granted through advancements like Eldritch Knight)
    // 3. Known spellcasting subclasses (fallback for hardcoded detection)
    
    const classes = actorForDecision.classes || {};
    const preSelections = get(preAdvancementSelections);
    let classEntries = Object.entries(classes);
    
    // Fallback to the cached compendium class selection when the actor isn't created yet
    if (!classEntries.length && preSelections?.class) {
      classEntries = [[preSelections.class.system?.identifier || preSelections.class.name || 'selected-class', preSelections.class]];
    }
    
    if (!classEntries.length) {
      window.GAS.log.d('[WORKFLOW] No classes available (actor or pre-selection), returning false for spellcaster check');
      return false;
    }
    
    const classDataList = classEntries.map(([, classData]) => classData).filter(Boolean);
    const classNamesLower = classDataList
      .map((classData) => (classData?.system?.identifier || classData?.name || '').toLowerCase())
      .filter(Boolean);
    
    // Method 1: Check class-based spellcasting progression
    // This is the PRIMARY check - if any class has spellcasting progression, the actor is a spellcaster
    const spellcastingInfo = classDataList.map((classData) => {
      const progression = classData?.system?.spellcasting?.progression;
      return { 
        className: classData?.name || classData?.system?.identifier || 'unknown-class',
        identifier: classData?.system?.identifier,
        progression,
        isSpellcaster: progression && progression !== "none"
      };
    });
    
    const hasClassSpellcasting = spellcastingInfo.some(info => info.isSpellcaster);
    
    // Check if ANY class explicitly has progression: "none" - if so, skip actor-level checks entirely
    const hasExplicitNonSpellcaster = spellcastingInfo.some(info => info.progression === "none");
    
    // CRITICAL: Check if actor has subclass items that grant spellcasting (e.g., Eldritch Knight)
    // This must be checked BEFORE deciding to skip actor-level spellcasting checks
    const actorItems = actorForDecision.items || [];
    const hasSubclassWithSpellcasting = actorItems.some(item => {
      if (item.type === 'subclass' && item.system?.spellcasting) {
        const subclassProgression = item.system.spellcasting.progression;
        return subclassProgression && subclassProgression !== 'none';
      }
      return false;
    });
    
    // DEBUG: Log spellcasting info to understand what we're detecting
    window.GAS.log.d('[WORKFLOW] Spellcasting info check:', {
      spellcastingInfo,
      hasClassSpellcasting,
      hasExplicitNonSpellcaster,
      hasSubclassWithSpellcasting,
      classNamesLower
    });
    
    // Method 2: Check actor system spellcasting (granted through advancements)
    // Only check this if:
    // 1. NO class has spellcasting progression, AND
    // 2. Either: (a) NO class explicitly has progression: "none", OR (b) a subclass grants spellcasting
    const actorData = actorForDecision.system || actorForDecision.data?.data;
    
    let hasActorSpellcasting = false;
    let hasTraditionalSpellcasting = false;
    let hasSpellSlots = false;
    let hasPactMagic = false;
    
    // Check actor-level spellcasting if:
    // - No class has spellcasting AND no class explicitly says "none", OR
    // - A subclass grants spellcasting (overrides the "none" check)
    if (!hasClassSpellcasting && (!hasExplicitNonSpellcaster || hasSubclassWithSpellcasting)) {
      // Check for traditional spellcasting system
      hasTraditionalSpellcasting = actorData?.spellcasting && Object.keys(actorData.spellcasting).length > 0;
      
      // Check for spell slots added by advancements (like Eldritch Knight)
      hasSpellSlots = actorData?.spells && Object.values(actorData.spells || {}).some(slot => 
        slot && slot.type === 'spell' && slot.max > 0
      );
      
      // Check for pact magic slots (only count if they have max > 0 and actor has Warlock class)
      // DEBUG: Log what we're actually checking to understand why hasPactMagic might be true
      window.GAS.log.d('[WORKFLOW] Checking for pact magic:', {
        hasSpells: !!actorData?.spells,
        spellsType: typeof actorData?.spells,
        spellsIsArray: Array.isArray(actorData?.spells),
        spellsValue: actorData?.spells,
        spellsKeys: actorData?.spells && typeof actorData.spells === 'object' ? Object.keys(actorData.spells) : 'N/A',
        spellsValues: actorData?.spells && typeof actorData.spells === 'object' ? Object.values(actorData.spells) : 'N/A',
        classNamesLower,
        hasWarlock: classNamesLower.includes('warlock')
      });
      
      hasPactMagic = actorData?.spells && 
        typeof actorData.spells === 'object' && 
        !Array.isArray(actorData.spells) &&
        Object.values(actorData.spells).some(slot => 
          slot && typeof slot === 'object' && slot.type === 'pact' && slot.max > 0
        ) && 
        classNamesLower.includes('warlock');
      
      hasActorSpellcasting = hasTraditionalSpellcasting || hasSpellSlots || hasPactMagic;
    }
    
    // Method 3: Fallback check for known spellcasting classes/subclasses
    const knownSpellcastingClasses = [
      'bard', 'cleric', 'druid', 'paladin', 'ranger', 'sorcerer', 'warlock', 'wizard',
      'artificer', 'aberrantmind', 'arcanetrickster', 'eldritchknight'
    ];
    const hasKnownSpellcastingClass = classNamesLower.some(className => 
      knownSpellcastingClasses.includes(className)
    );
    
    // Method 4: Check for subclass spellcasting that might be granted through advancements
    // This is a more aggressive check for cases where the actor system hasn't been updated yet
    const hasSubclassSpellcasting = classNamesLower.some(lowerClassName => {
      // Check for known spellcasting subclasses
      return ['eldritchknight', 'arcanetrickster', 'aberrantmind'].includes(lowerClassName);
    });
    
    // Method 5: Check for subclass in the class data itself (e.g., fighter with eldritchknight subclass)
    const hasSubclassInClassData = classDataList.some(classData => {
      const subclass = classData?.system?.subclass;
      return subclass && ['eldritchknight', 'arcanetrickster', 'aberrantmind'].includes(subclass.toLowerCase());
    });
    
    const isSpellcaster = hasClassSpellcasting || hasActorSpellcasting || hasKnownSpellcastingClass || hasSubclassSpellcasting || hasSubclassInClassData;
    
    window.GAS.log.d('[WORKFLOW] Spellcasting detection:', {
      spellcastingInfo,
      classNamesLower,
      hasClassSpellcasting,
      hasExplicitNonSpellcaster,
      hasSubclassWithSpellcasting,
      hasTraditionalSpellcasting,
      hasSpellSlots,
      hasPactMagic,
      hasActorSpellcasting,
      hasKnownSpellcastingClass,
      hasSubclassSpellcasting,
      hasSubclassInClassData,
      isSpellcaster,
      actorName: actorForDecision.name,
      actorDataSpells: actorData?.spells,
      actorDataSpellsType: typeof actorData?.spells,
      actorDataSpellsExists: !!actorData?.spells
    });
    
    return isSpellcaster;
  },
  _shouldShowShopping: function () {
    const enableShopping = game.settings.get(MODULE_ID, 'enableEquipmentPurchase');
    return enableShopping;
  },
  _shouldShowBiography: function () {
    const enableLLM = game.settings.get(MODULE_ID, 'EnableLLMNameGeneration');
    return enableLLM;
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
    .on('character_created')
      .transitionTo('biography').withCondition((context) => workflowFSMContext._shouldShowBiography())
      .transitionTo('processing_advancements')
    .on('biography_complete')
      .transitionTo('processing_advancements') // Handle biography completion from creating_character state
    .on('start_character_creation').transitionTo('creating_character')
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
        
        // Mark previous tabs as read-only while processing advancements
        readOnlyTabs.set(['abilities', 'race', 'background', 'class']);
        
        // Ensure the actor sheet is rendered so drop handlers work properly
        if (workflowFSMContext.actor) {
          await workflowFSMContext.actor.sheet.render();
        }
        
        // Process advancement queue asynchronously
        await dropItemRegistry.advanceQueue(true);
        
        // After queue completes, restore the actor's original sheetClass
        try {
          const actor = workflowFSMContext.actor;
          if (actor) {
            const originalSheet = await actor.getFlag(MODULE_ID, 'originalSheetClass');
            if (originalSheet !== undefined) {
              await actor.setFlag('core', 'sheetClass', originalSheet);
              // Clear our module flag to avoid future confusion
              await actor.unsetFlag(MODULE_ID, 'originalSheetClass');
            }
          }
        } catch (e) {
          window.GAS?.log?.w?.('[WORKFLOW] Failed to restore original sheetClass after queue', e);
        }
      })
        .onSuccess()
          .transitionTo('choosing_starting_wealth').withCondition((context) => {
            // 2014 rules need to choose between equipment or gold
            const is2014Rules = window.GAS?.dnd5eRules === '2014';
            const shouldShowEquipment = workflowFSMContext._shouldShowEquipmentSelection();
            window.GAS.log.d('[FSM] Checking wealth choice transition:', { is2014Rules, shouldShowEquipment });
            return is2014Rules && shouldShowEquipment;
          })
          .transitionTo('selecting_equipment').withCondition((context) => workflowFSMContext._shouldShowEquipmentSelection())
          .transitionTo('shopping').withCondition((context) => !workflowFSMContext._shouldShowEquipmentSelection() && workflowFSMContext._shouldShowShopping())
          .transitionTo('selecting_spells').withCondition((context) => !workflowFSMContext._shouldShowEquipmentSelection() && !workflowFSMContext._shouldShowShopping() && workflowFSMContext._shouldShowSpellSelection(workflowFSMContext.actor))
          .transitionTo('completed') // Default fallback - no other features enabled
        .onFailure().transitionTo('error')
      .on('reset').transitionTo('idle')
      .on('error').transitionTo('error')
    .state('biography')
    .on('biography_complete')
      .transitionTo('processing_advancements') // Always go to processing_advancements after biography to handle advancement capture
    .on('reset').transitionTo('idle')
    .on('error').transitionTo('error')
    .onEnter((context) => {
      if (workflowFSMContext.isProcessing) workflowFSMContext.isProcessing.set(false);
      window.GAS.log.d('[WORKFLOW] Entered BIOGRAPHY state');
      
      // Mark previous tabs as read-only
      readOnlyTabs.set(['abilities', 'race', 'background', 'class']);
      
      // Add biography tab and switch to it
      const currentTabs = get(tabs);
      if (!currentTabs.find(t => t.id === "biography")) {
        tabs.update(t => [...t, { label: "Biography", id: "biography", component: "Biography" }]);
      }
      activeTab.set("biography");
    })
    .state('choosing_starting_wealth')
      .on('wealth_choice_made')
        .transitionTo('selecting_equipment').withCondition((context) => {
          const choice = get(startingWealthChoice);
          window.GAS.log.d('[FSM] Wealth choice made:', choice, '-> selecting_equipment (for gold roll or equipment selection)');
          // For 2014 rules, both 'equipment' and 'gold' choices go to equipment tab
          // Equipment tab will show either the gold roller or equipment selector based on the choice
          return true;
        })
      .on('reset').transitionTo('idle')
      .on('error').transitionTo('error')
      .onEnter((context) => {
        if (workflowFSMContext.isProcessing) workflowFSMContext.isProcessing.set(false);
        window.GAS.log.d('[WORKFLOW] Entered CHOOSING_STARTING_WEALTH state');
        startingWealthChoice.set(null); // Reset choice
        // Fire hook for UI to respond
        Hooks.call('gas.choosingStartingWealth');
      })
    .state('selecting_equipment')
    .on('wealth_choice_made')
      .transitionTo('selecting_equipment').withCondition((context) => {
        const choice = get(startingWealthChoice);
        window.GAS.log.d('[FSM] Wealth choice re-confirmed in selecting_equipment:', choice, '-> stay in selecting_equipment');
        // Stay in selecting_equipment; the UI will update based on the new choice
        return true;
      })
    .on('equipment_complete')
      .transitionTo('shopping').withCondition((context) => {
        // Always transition to shopping after equipment completion
        // The shopping UI will handle disabled functionality based on settings
        return true;
      })
      .transitionTo('selecting_spells').withCondition((context) => {
        // Don't go directly to spells from equipment - always go through shopping
        return false;
      })
      .transitionTo('completed') // Fallback if something goes wrong
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
      
      // Mark previous tabs as read-only
      readOnlyTabs.set(['abilities', 'race', 'background', 'class', 'biography']);
      
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
      
      // Note: Gold selection should fire equipment_complete when the user completes their selection
      // Equipment selection should also fire equipment_complete when completed
    })
    .state('shopping')
    .on('wealth_choice_made')
      .transitionTo('selecting_equipment').withCondition((context) => {
        const choice = get(startingWealthChoice);
        window.GAS.log.d('[FSM] Wealth choice re-confirmed from shopping:', choice, '-> back to selecting_equipment');
        // Go back to selecting_equipment to reset workflow from that point
        return true;
      })
    .on('shopping_complete')
      .transitionTo('selecting_spells').withCondition((context) => {
        // Always transition to spells after shopping completion
        // The spells UI will handle disabled functionality based on settings
        return true;
      })
      .transitionTo('completed') // Fallback if something goes wrong
    .on('skip_shopping')
      .transitionTo('selecting_spells').withCondition((context) => {
        // Always transition to spells when skipping shopping
        return true;
      })
      .transitionTo('completed') // Fallback
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
      // Check both version AND rules - only use new system for D&D 2024 rules
      if (window.GAS.dnd5eVersion >= 4 && window.GAS.dnd5eRules === "2024") {
        goldValue = totalGoldFromChoices ? get(totalGoldFromChoices) : 0;
        window.GAS.log.d('[WORKFLOW] Using D&D 2024 rules - totalGoldFromChoices:', goldValue);
      } else {
        goldValue = goldRoll ? get(goldRoll) : 0;
        window.GAS.log.d('[WORKFLOW] Using D&D 2014 rules - goldRoll:', goldValue);
      }
      const goldValueInCopper = goldValue * 100;
      if (window.GAS && window.GAS.availableGold && typeof window.GAS.availableGold.set === 'function') {
        window.GAS.availableGold.set(goldValueInCopper);
      }
    })
    .state('selecting_spells')
    .on('wealth_choice_made')
      .transitionTo('selecting_equipment').withCondition((context) => {
        const choice = get(startingWealthChoice);
        window.GAS.log.d('[FSM] Wealth choice re-confirmed from selecting_spells:', choice, '-> back to selecting_equipment');
        // Go back to selecting_equipment to reset workflow from that point
        return true;
      })
    .on('spells_complete').transitionTo('completed')
    .on('skip_spells').transitionTo('completed')
    .on('error').transitionTo('error')
    .on('reset').transitionTo('idle')
    .onEnter((context) => {
      if (workflowFSMContext.isProcessing) workflowFSMContext.isProcessing.set(false);
      window.GAS.log.d('[WORKFLOW] Entered SELECTING_SPELLS state');
      
      // Double-check that actor is actually a spellcaster before adding spell tab
      const actor = workflowFSMContext.actor || get(actorInGame);
      const isSpellcaster = workflowFSMContext._shouldShowSpellSelection(actor);
      window.GAS.log.d('[WORKFLOW] Verifying spellcaster status in onEnter:', { isSpellcaster, actorName: actor?.name });
      
      if (isSpellcaster) {
        const currentTabs = get(tabs);
        if (!currentTabs.find(t => t.id === "spells")) {
          tabs.update(t => [...t, { label: "Spells", id: "spells", component: "Spells" }]);
        }
        activeTab.set("spells");
      } else {
        window.GAS.log.w('[WORKFLOW] Actor is not a spellcaster but entered selecting_spells state - transitioning to completed');
        // If we somehow entered this state for a non-spellcaster, immediately skip to completed
        const fsm = getWorkflowFSM();
        fsm.handle(WORKFLOW_EVENTS.SKIP_SPELLS);
      }
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
    .on('biography_complete').transitionTo('processing_advancements')
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
