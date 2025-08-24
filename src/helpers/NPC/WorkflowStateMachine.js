import { writable, get } from 'svelte/store';
import { MODULE_ID } from '~/src/helpers/constants';
import { activeTab, npcTabs } from '~/src/stores/index';
import { selectedNpcBase } from '~/src/stores/storeDefinitions';
import Finity from 'finity';

/**
 * NPC creation workflow states
 */
export const NPC_WORKFLOW_STATES = {
  IDLE: 'idle',
  SELECTING_NPC: 'selecting_npc',
  CONFIGURING_FEATURES: 'configuring_features',
  CONFIGURING_STATS: 'configuring_stats',
  CONFIGURING_EQUIPMENT: 'configuring_equipment',
  CONFIGURING_MAGIC_ITEMS: 'configuring_magic_items',
  CONFIGURING_BIOGRAPHY: 'configuring_biography',
  CREATING_NPC: 'creating_npc',
  COMPLETED: 'completed',
  ERROR: 'error'
};

/**
 * NPC workflow events that can trigger state transitions
 */
export const NPC_WORKFLOW_EVENTS = {
  START_NPC_SELECTION: 'start_npc_selection',
  NPC_SELECTED: 'npc_selected',
  FEATURES_CONFIGURED: 'features_configured',
  STATS_CONFIGURED: 'stats_configured',
  EQUIPMENT_CONFIGURED: 'equipment_configured',
  MAGIC_ITEMS_CONFIGURED: 'magic_items_configured',
  BIOGRAPHY_CONFIGURED: 'biography_configured',
  NPC_CREATED: 'npc_created',
  ERROR: 'error',
  RESET: 'reset',
  BACK_TO_SELECTION: 'back_to_selection',
  BACK_TO_FEATURES: 'back_to_features',
  BACK_TO_STATS: 'back_to_stats',
  BACK_TO_EQUIPMENT: 'back_to_equipment',
  BACK_TO_MAGIC_ITEMS: 'back_to_magic_items',
  BACK_TO_BIOGRAPHY: 'back_to_biography'
};

/**
 * Shared NPC workflow context for Finity FSM
 */
export const npcWorkflowFSMContext = {
  isProcessing: writable(false),
  selectedNpcBase: undefined,
  createdActor: undefined,
  _shouldShowFeaturesTab: function () {
    // Always show features tab after NPC selection
    return true;
  },
  _shouldShowStatsTab: function () {
    // Show stats tab after features are configured
    return true;
  },
  _shouldShowEquipmentTab: function () {
    // Show equipment tab after stats are configured
    return true;
  },
  _shouldShowMagicItemsTab: function () {
    // Show magic items tab after equipment is configured
    return true;
  },
  _shouldShowBiographyTab: function () {
    // Show biography tab after magic items are configured
    return true;
  },
  _shouldShowCreateTab: function () {
    // Show create tab after biography is configured
    return true;
  }
};

/**
 * Finity-based state machine for NPC creation workflow
 */
export function createNPCWorkflowStateMachine() {
  const fsm = Finity
    .configure()
    .initialState('idle')
    .state('idle')
    .on('start_npc_selection').transitionTo('selecting_npc')
    .on('reset').transitionTo('idle')
    .onEnter((context) => {
      if (npcWorkflowFSMContext.isProcessing) npcWorkflowFSMContext.isProcessing.set(false);
      window.GAS.log.d('[NPC WORKFLOW] Entered IDLE state');
    })
    .state('selecting_npc')
    .on('npc_selected').transitionTo('configuring_features')
    .on('npc_created').transitionTo('completed')
    .on('error').transitionTo('error')
    .on('reset').transitionTo('idle')
    .onEnter((context) => {
      if (npcWorkflowFSMContext.isProcessing) npcWorkflowFSMContext.isProcessing.set(false);
      window.GAS.log.d('[NPC WORKFLOW] Entered SELECTING_NPC state');
      
      // Set the active tab to npc-select
      activeTab.set('npc-select');
    })
    .state('configuring_features')
    .on('features_configured').transitionTo('configuring_stats')
    .on('back_to_selection').transitionTo('selecting_npc')
    .on('error').transitionTo('error')
    .on('reset').transitionTo('idle')
    .onEnter((context) => {
      if (npcWorkflowFSMContext.isProcessing) npcWorkflowFSMContext.isProcessing.set(false);
      window.GAS.log.d('[NPC WORKFLOW] Entered CONFIGURING_FEATURES state');
      
      // Set the active tab to npc-features
      activeTab.set('npc-features');
    })
    .state('configuring_stats')
    .on('stats_configured').transitionTo('configuring_equipment')
    .on('back_to_features').transitionTo('configuring_features')
    .on('error').transitionTo('error')
    .on('reset').transitionTo('idle')
    .onEnter((context) => {
      if (npcWorkflowFSMContext.isProcessing) npcWorkflowFSMContext.isProcessing.set(false);
      window.GAS.log.d('[NPC WORKFLOW] Entered CONFIGURING_STATS state');
      
      // Set the active tab to npc-create (which handles stats)
      activeTab.set('npc-create');
    })
    .state('configuring_equipment')
    .on('equipment_configured').transitionTo('configuring_magic_items')
    .on('back_to_stats').transitionTo('configuring_stats')
    .on('error').transitionTo('error')
    .on('reset').transitionTo('idle')
    .onEnter((context) => {
      if (npcWorkflowFSMContext.isProcessing) npcWorkflowFSMContext.isProcessing.set(false);
      window.GAS.log.d('[NPC WORKFLOW] Entered CONFIGURING_EQUIPMENT state');
      
      // Set the active tab to npc-equipment-shop
      activeTab.set('npc-equipment-shop');
    })
    .state('configuring_magic_items')
    .on('magic_items_configured').transitionTo('configuring_biography')
    .on('back_to_equipment').transitionTo('configuring_equipment')
    .on('error').transitionTo('error')
    .on('reset').transitionTo('idle')
    .onEnter((context) => {
      if (npcWorkflowFSMContext.isProcessing) npcWorkflowFSMContext.isProcessing.set(false);
      window.GAS.log.d('[NPC WORKFLOW] Entered CONFIGURING_MAGIC_ITEMS state');
      
      // Set the active tab to magic-items
      activeTab.set('magic-items');
    })
    .state('configuring_biography')
    .on('biography_configured').transitionTo('creating_npc')
    .on('npc_created').transitionTo('completed')
    .on('back_to_magic_items').transitionTo('configuring_magic_items')
    .on('error').transitionTo('error')
    .on('reset').transitionTo('idle')
    .onEnter((context) => {
      if (npcWorkflowFSMContext.isProcessing) npcWorkflowFSMContext.isProcessing.set(false);
      window.GAS.log.d('[NPC WORKFLOW] Entered CONFIGURING_BIOGRAPHY state');
      
      // Set the active tab to npc-biography
      activeTab.set('npc-biography');
    })
    .state('creating_npc')
    .on('npc_created').transitionTo('completed')
    .on('back_to_biography').transitionTo('configuring_biography')
    .on('error').transitionTo('error')
    .on('reset').transitionTo('idle')
    .onEnter((context) => {
      if (npcWorkflowFSMContext.isProcessing) npcWorkflowFSMContext.isProcessing.set(false);
      window.GAS.log.d('[NPC WORKFLOW] Entered CREATING_NPC state');
      
      // Set the active tab to npc-create (final review)
      activeTab.set('npc-create');
    })
    .state('completed')
    .on('reset').transitionTo('idle')
    .onEnter((context) => {
      if (npcWorkflowFSMContext.isProcessing) npcWorkflowFSMContext.isProcessing.set(false);
      window.GAS.log.d('[NPC WORKFLOW] Entered COMPLETED state');
      
      // Access the createdActor from the context passed to the event
      const { createdActor } = context;
      if (createdActor) {
        window.GAS.log.d('[NPC WORKFLOW] Opening actor sheet for:', createdActor.name);
        createdActor.sheet.render(true);
      }
      
      // Close the application after a short delay
      setTimeout(() => {
        window.GAS.log.d('[NPC WORKFLOW] Triggering gas.close event to close application');
        Hooks.call("gas.close");
      }, 1500);
    })
    .state('error')
    .on('reset').transitionTo('idle')
    .onEnter((context) => {
      if (npcWorkflowFSMContext.isProcessing) npcWorkflowFSMContext.isProcessing.set(false);
      window.GAS.log.e('[NPC WORKFLOW] Error entered ERROR state:', context.error);
      if (context.error) ui.notifications.error(context.error);
    })
    .start();
  return fsm;
}

// Provide a getter for the singleton NPC FSM instance
let npcWorkflowFSM;
export function getNPCWorkflowFSM() {
  if (!npcWorkflowFSM) {
    npcWorkflowFSM = createNPCWorkflowStateMachine();
    // Expose the FSM on window.GAS for debugging
    if (typeof window !== 'undefined') {
      window.GAS = window.GAS || {};
      window.GAS.npcWorkflowFSM = npcWorkflowFSM;
      console.log('window.GAS.npcWorkflowFSM assigned:', window.GAS.npcWorkflowFSM);
    }
  }
  return npcWorkflowFSM;
}

// Export the NPC FSM and context
export default {
  createNPCWorkflowStateMachine,
  getNPCWorkflowFSM,
  npcWorkflowFSMContext,
  NPC_WORKFLOW_STATES,
  NPC_WORKFLOW_EVENTS
};
