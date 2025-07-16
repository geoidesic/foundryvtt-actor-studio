import { writable, get } from 'svelte/store';
import { MODULE_ID } from '~/src/helpers/constants';
import { readOnlyTabs, tabs, activeTab, levelUpTabs } from '~/src/stores/index';
import { actorInGame } from '~/src/stores/storeDefinitions';
import { destroyAdvancementManagers } from '~/src/helpers/AdvancementManager';
import { dropItemRegistry } from '~/src/stores/index';
import Finity from 'finity';

/**
 * LevelUp workflow states
 */
export const LEVELUP_STATES = {
  IDLE: 'idle',
  SELECTING_CLASS_LEVEL: 'selecting_class_level',
  PROCESSING_ADVANCEMENTS: 'processing_advancements',
  SELECTING_SPELLS: 'selecting_spells',
  COMPLETED: 'completed',
  ERROR: 'error'
};

/**
 * LevelUp workflow events
 */
export const LEVELUP_EVENTS = {
  START_LEVEL_UP: 'start_level_up',
  CLASS_LEVEL_SELECTED: 'class_level_selected',
  ADVANCEMENTS_COMPLETE: 'advancements_complete',
  SPELLS_COMPLETE: 'spells_complete',
  SKIP_SPELLS: 'skip_spells',
  ERROR: 'error',
  RESET: 'reset'
};

/**
 * LevelUp workflow context
 */
export const levelUpFSMContext = {
  isProcessing: writable(false),
  actor: undefined,
  
  /**
   * Determines if spell selection should be shown for level-up
   */
  _shouldShowSpellSelection: function (actor) {
    const enableSpellSelection = game.settings.get(MODULE_ID, 'enableSpellSelection');
    if (!enableSpellSelection) return false;
    
    if (!actor) {
      // Try to get actor from actorInGame store as fallback
      const storeActor = get(actorInGame);
      if (!storeActor) return false;
      actor = storeActor;
    }
    
    const classes = actor.classes || {};
    const classKeys = Object.keys(classes);
    if (!classKeys.length) return false;
    
    // Check for spellcasting progression
    const spellcastingInfo = Object.entries(classes).map(([className, classData]) => {
      const progression = classData?.system?.spellcasting?.progression;
      return { className, progression, isSpellcaster: progression && progression !== "none" };
    });
    
    const isSpellcaster = spellcastingInfo.some(info => info.isSpellcaster);
    
    if (!isSpellcaster) {
      // Fallback check for known spellcasting classes
      const knownSpellcastingClasses = [
        'bard', 'cleric', 'druid', 'paladin', 'ranger', 'sorcerer', 'warlock', 'wizard',
        'artificer', 'aberrantmind', 'arcanetrickster', 'eldritchknight'
      ];
      const hasKnownSpellcastingClass = classKeys.some(className => 
        knownSpellcastingClasses.includes(className.toLowerCase())
      );
      return hasKnownSpellcastingClass;
    }
    
    return isSpellcaster;
  }
};

/**
 * Creates the LevelUp-specific Finity state machine
 */
export function createLevelUpStateMachine() {
  const fsm = Finity
    .configure()
    .initialState('idle')
    
    // IDLE STATE
    .state('idle')
      .on('start_level_up').transitionTo('selecting_class_level')
      .on('reset').transitionTo('idle')
      .on('error').transitionTo('idle')
      .onEnter((context) => {
        if (levelUpFSMContext.isProcessing) levelUpFSMContext.isProcessing.set(false);
        
        // Destroy advancement managers when returning to idle
        try {
          destroyAdvancementManagers();
        } catch (error) {
          window.GAS.log.e('[LEVELUP] Error destroying advancement managers on idle:', error);
        }
      })
    
    // SELECTING CLASS/LEVEL STATE
    .state('selecting_class_level')
      .on('class_level_selected').transitionTo('processing_advancements')
      .on('error').transitionTo('error')
      .on('reset').transitionTo('idle')
      .onEnter((context) => {
        if (levelUpFSMContext.isProcessing) levelUpFSMContext.isProcessing.set(false);
        window.GAS.log.d('[LEVELUP] Entered SELECTING_CLASS_LEVEL state');
        
        // Ensure we're on the level-up tab
        activeTab.set('level-up');
      })
    
    // PROCESSING ADVANCEMENTS STATE
    .state('processing_advancements')
      .do(async (state, context) => {
        if (levelUpFSMContext.isProcessing) levelUpFSMContext.isProcessing.set(true);
        window.GAS.log.d('[LEVELUP] Entered PROCESSING_ADVANCEMENTS state');
        
        // Process advancement queue asynchronously
        await dropItemRegistry.advanceQueue(true);
      })
        .onSuccess()
          .transitionTo('selecting_spells').withCondition((context) => {
            const actor = levelUpFSMContext.actor || get(actorInGame);
            const shouldShow = levelUpFSMContext._shouldShowSpellSelection(actor);
            window.GAS.log.d('[LEVELUP] advancements_complete -> selecting_spells condition:', shouldShow);
            return shouldShow;
          })
          .transitionTo('completed') // Default fallback - no spell selection needed
        .onFailure().transitionTo('error')
    
    // SELECTING SPELLS STATE
    .state('selecting_spells')
      .on('spells_complete').transitionTo('completed')
      .on('skip_spells').transitionTo('completed')
      .on('error').transitionTo('error')
      .on('reset').transitionTo('idle')
      .onEnter((context) => {
        if (levelUpFSMContext.isProcessing) levelUpFSMContext.isProcessing.set(false);
        window.GAS.log.d('[LEVELUP] Entered SELECTING_SPELLS state');
        
        // Always destroy advancement managers to prevent them from persisting
        try {
          destroyAdvancementManagers();
          window.GAS.log.d('[LEVELUP] Destroyed advancement managers before spell selection');
        } catch (error) {
          window.GAS.log.e('[LEVELUP] Error destroying advancement managers:', error);
        }
        
        // Initialize spell selection for the level-up actor
        const actor = levelUpFSMContext.actor || get(actorInGame);
        if (actor) {
          try {
            // Import spell selection functions
            import('~/src/stores/spellSelection').then(({ initializeSpellSelection, loadAvailableSpells }) => {
              window.GAS.log.d('[LEVELUP] Initializing spell selection for actor:', actor.name);
              initializeSpellSelection(actor);
              
              // Load available spells for the character's class
              const characterClass = Object.keys(actor.classes || {})[0];
              if (characterClass) {
                loadAvailableSpells(characterClass);
                window.GAS.log.d('[LEVELUP] Loading spells for class:', characterClass);
              }
            });
          } catch (error) {
            window.GAS.log.e('[LEVELUP] Error initializing spell selection:', error);
          }
        }
        
        // Force remove advancement tab and add spells tab
        levelUpTabs.update(t => {
          window.GAS.log.d('[LEVELUP] Current levelUpTabs before filtering:', t);
          
          // Remove advancement tab if present
          const filteredTabs = t.filter(tab => {
            const shouldKeep = tab.id !== "advancements";
            if (!shouldKeep) {
              window.GAS.log.d('[LEVELUP] Removing advancement tab:', tab);
            }
            return shouldKeep;
          });
          
          // Add spells tab if not present
          if (!filteredTabs.find(tab => tab.id === "spells")) {
            const spellsTab = { label: "Spells", id: "spells", component: "Spells" };
            filteredTabs.push(spellsTab);
            window.GAS.log.d('[LEVELUP] Added spells tab:', spellsTab);
          }
          
          window.GAS.log.d('[LEVELUP] Final levelUpTabs after filtering:', filteredTabs);
          return filteredTabs;
        });
        activeTab.set("spells");
        window.GAS.log.d('[LEVELUP] Set active tab to spells');
      })
    
    // COMPLETED STATE
    .state('completed')
      .on('reset').transitionTo('idle')
      .onEnter((context) => {
        if (levelUpFSMContext.isProcessing) levelUpFSMContext.isProcessing.set(false);
        window.GAS.log.d('[LEVELUP] Entered COMPLETED state');
        
        // Destroy advancement managers
        try {
          destroyAdvancementManagers();
        } catch (error) {
          window.GAS.log.e('[LEVELUP] Error destroying advancement managers on completed:', error);
        }
        
        const actor = levelUpFSMContext.actor || get(actorInGame);
        if (actor) {
          window.GAS.log.d('[LEVELUP] Opening actor sheet for:', actor.name);
          actor.sheet.render(true);
        }
        
        setTimeout(() => {
          window.GAS.log.d('[LEVELUP] Closing Actor Studio');
          Hooks.call("gas.close");
        }, 1500);
      })
    
    // ERROR STATE
    .state('error')
      .on('reset').transitionTo('idle')
      .onEnter((context) => {
        if (levelUpFSMContext.isProcessing) levelUpFSMContext.isProcessing.set(false);
        window.GAS.log.e('[LEVELUP] Entered ERROR state:', context.error);
        if (context.error) ui.notifications.error(context.error);
      })
    
    .start();
  
  return fsm;
}

// Provide a getter for the singleton LevelUp FSM instance
let levelUpFSM;
export function getLevelUpFSM() {
  if (!levelUpFSM) {
    levelUpFSM = createLevelUpStateMachine();
    // Expose the FSM on window.GAS for debugging
    if (typeof window !== 'undefined') {
      window.GAS = window.GAS || {};
      window.GAS.levelUpFSM = levelUpFSM;
      console.log('window.GAS.levelUpFSM assigned:', window.GAS.levelUpFSM);
    }
  }
  return levelUpFSM;
}

export default {
  createLevelUpStateMachine,
  getLevelUpFSM,
  levelUpFSMContext,
  LEVELUP_STATES,
  LEVELUP_EVENTS
};
