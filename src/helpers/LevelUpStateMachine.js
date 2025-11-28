import { writable, get } from 'svelte/store';
import { MODULE_ID } from '~/src/helpers/constants';
import { readOnlyTabs, tabs, activeTab, levelUpTabs } from '~/src/stores/index';
import { actorInGame } from '~/src/stores/storeDefinitions';
import { destroyAdvancementManagers } from '~/src/helpers/AdvancementManager';
import { dropItemRegistry } from '~/src/stores/index';
// Import PrivateSettingKeys from the TypeScript file
const PrivateSettingKeys = {
  LAST_MIGRATION: 'lastMigration',
  LEVEL_UP_IN_PROGRESS: 'levelUpInProgress',
};
import Finity from 'finity';

// Helper to safely get fromUuidSync
const fromUuidSync = (uuid) => {
  try {
    return foundry.utils?.fromUuidSync?.(uuid) || null;
  } catch (error) {
    window.GAS.log.w('[LEVELUP] Error in fromUuidSync:', error);
    return null;
  }
};

// Helper to suppress Tidy5e auto-reopen during level up
const suppressTidy5eAutoReopen = (suppress = true) => {
  try {
    const tidy5eModule = game.modules.get("tidy5e-sheet");
    if (tidy5eModule?.active) {
      // Set level up in progress flag
      game.settings.set(MODULE_ID, PrivateSettingKeys.LEVEL_UP_IN_PROGRESS, suppress);
      
      if (suppress) {
        window.GAS.log.d('[LEVELUP] Suppressing Tidy5e auto-reopen during level up');
        // Only suppress if we have a valid API method
        if (tidy5eModule.api?.setAutoReopen) {
          tidy5eModule.api.setAutoReopen(false);
        }
      } else {
        window.GAS.log.d('[LEVELUP] Restoring Tidy5e auto-reopen after level up');
        // Only restore if we have a valid API method
        if (tidy5eModule.api?.setAutoReopen) {
          tidy5eModule.api.setAutoReopen(true);
        }
      }
    } else {
      // Even if Tidy5e is not active, set the flag for the hook
      game.settings.set(MODULE_ID, PrivateSettingKeys.LEVEL_UP_IN_PROGRESS, suppress);
    }
  } catch (error) {
    window.GAS.log.w('[LEVELUP] Error managing Tidy5e auto-reopen:', error);
    // Still set the flag even if there's an error
    try {
      game.settings.set(MODULE_ID, PrivateSettingKeys.LEVEL_UP_IN_PROGRESS, suppress);
    } catch (e) {
      window.GAS.log.w('[LEVELUP] Error setting level up flag:', e);
    }
  }
};

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
 * Determines the correct spell list class for a character, handling subclasses
 * @param {Actor} actor - The actor to analyze
 * @returns {string|string[]|null} - The class name(s) to use for spell filtering, or null if no spellcasting
 *                                    Can return a string for single list or array for multiple lists (custom classes)
 */
function determineSpellListClass(actor) {
  if (!actor) return null;
  
  const actorData = actor.system || actor.data?.data;
  if (!actorData) return null;
  
  window.GAS.log.d('[LEVELUP] determineSpellListClass called for actor:', actor.name);
  
  // ============================================================================
  // Method 0: Check for CUSTOM spell lists advancement flag
  // This is ONLY for custom/homebrew classes that have been explicitly configured
  // Standard D&D classes will NOT have this flag and will use existing logic below
  // ============================================================================
  const droppedItems = actor.getFlag(MODULE_ID, 'droppedItems');
  
  if (droppedItems) {
    // Check subclass first (subclass spell lists override class spell lists)
    let subclassItems = [];
    if (Array.isArray(droppedItems)) {
      subclassItems = droppedItems.filter(item => item.type === 'subclass');
    } else if (typeof droppedItems === 'object' && droppedItems.subclass) {
      subclassItems = Array.isArray(droppedItems.subclass) ? droppedItems.subclass : [droppedItems.subclass];
    }
    
    for (const item of subclassItems) {
      const subclassUuid = item.uuid;
      if (subclassUuid) {
        try {
          const subclassItem = fromUuidSync(subclassUuid);
          if (subclassItem) {
            const customSpellLists = subclassItem.getFlag(MODULE_ID, 'spellLists');
            if (customSpellLists && Array.isArray(customSpellLists) && customSpellLists.length > 0) {
              window.GAS.log.d('[LEVELUP] Found CUSTOM spell lists flag on subclass:', subclassItem.name, '->', customSpellLists);
              return customSpellLists; // Return array of spell lists for custom subclasses
            }
          }
        } catch (error) {
          window.GAS.log.w('[LEVELUP] Error checking custom spell lists on subclass:', error);
        }
      }
    }
    
    // Check class
    let classItems = [];
    if (Array.isArray(droppedItems)) {
      classItems = droppedItems.filter(item => item.type === 'class');
    } else if (typeof droppedItems === 'object' && droppedItems.class) {
      classItems = Array.isArray(droppedItems.class) ? droppedItems.class : [droppedItems.class];
    }
    
    for (const item of classItems) {
      const classUuid = item.uuid;
      if (classUuid) {
        try {
          const classItem = fromUuidSync(classUuid);
          if (classItem) {
            const customSpellLists = classItem.getFlag(MODULE_ID, 'spellLists');
            if (customSpellLists && Array.isArray(customSpellLists) && customSpellLists.length > 0) {
              window.GAS.log.d('[LEVELUP] Found CUSTOM spell lists flag on class:', classItem.name, '->', customSpellLists);
              return customSpellLists; // Return array of spell lists for custom classes
            }
          }
        } catch (error) {
          window.GAS.log.w('[LEVELUP] Error checking custom spell lists on class:', error);
        }
      }
    }
  }
  
  // ============================================================================
  // EXISTING LOGIC FOR STANDARD D&D CLASSES - UNCHANGED
  // Method 1: Check for subclass spellcasting via module flags (dropped items)
  // ============================================================================
  window.GAS.log.d('[LEVELUP] droppedItems flag:', droppedItems, 'isArray:', Array.isArray(droppedItems));
  window.GAS.log.d('[LEVELUP] droppedItems flag:', droppedItems, 'isArray:', Array.isArray(droppedItems));
  
  // Handle both array and object formats
  let subclassItems = [];
  if (Array.isArray(droppedItems)) {
    subclassItems = droppedItems.filter(item => item.type === 'subclass');
  } else if (droppedItems && typeof droppedItems === 'object' && droppedItems.subclass) {
    subclassItems = Array.isArray(droppedItems.subclass) ? droppedItems.subclass : [droppedItems.subclass];
  }
  
  for (const item of subclassItems) {
    const subclassUuid = item.uuid;
    if (subclassUuid) {
      try {
        // Try to get the subclass item to parse its description
        const subclassItem = fromUuidSync(subclassUuid);
        if (subclassItem) {
          const spellListClass = parseSpellcastingFromDescription(subclassItem);
          if (spellListClass) {
            window.GAS.log.d('[LEVELUP] Found subclass spellcasting via droppedItems:', subclassItem.name, '->', spellListClass);
            return spellListClass;
          }
        }
      } catch (error) {
        window.GAS.log.w('[LEVELUP] Error parsing subclass from droppedItems:', error);
      }
    }
  }
  
  // Method 2: Check for subclass items on the actor
  const actorItems = actor.items || [];
  window.GAS.log.d('[LEVELUP] Checking actor items:', actorItems.map(i => ({ name: i.name, type: i.type })));
  for (const item of actorItems) {
    if (item.type === 'subclass') {
      window.GAS.log.d('[LEVELUP] Found subclass item:', item.name, 'identifier:', item.system?.identifier);
      const spellListClass = parseSpellcastingFromDescription(item);
      if (spellListClass) {
        window.GAS.log.d('[LEVELUP] Found subclass spellcasting via actor items:', item.name, '->', spellListClass);
        return spellListClass;
      }
      
      // Also check by identifier for known subclasses
      const identifier = item.system?.identifier?.toLowerCase();
      if (identifier === 'eldritch-knight' || identifier === 'eldritchknight') {
        window.GAS.log.d('[LEVELUP] Found Eldritch Knight by identifier -> Wizard');
        return 'Wizard';
      } else if (identifier === 'arcane-trickster' || identifier === 'arcanetrickster') {
        window.GAS.log.d('[LEVELUP] Found Arcane Trickster by identifier -> Wizard');
        return 'Wizard';
      } else if (identifier === 'aberrant-mind' || identifier === 'aberrantmind') {
        window.GAS.log.d('[LEVELUP] Found Aberrant Mind by identifier -> Sorcerer');
        return 'Sorcerer';
      }
    }
  }
  
  // Method 3: Check for subclass in class data
  const classes = actorData.classes || {};
  window.GAS.log.d('[LEVELUP] actor classes:', Object.keys(classes));
  window.GAS.log.d('[LEVELUP] actorData structure:', {
    classes: classes,
    hasClasses: !!classes,
    classesKeys: Object.keys(classes),
    actorItems: actor.items?.map(i => ({ name: i.name, type: i.type })) || []
  });
  
  for (const [className, classData] of Object.entries(classes)) {
    const subclass = classData?.system?.subclass;
    window.GAS.log.d('[LEVELUP] class', className, 'subclass:', subclass);
    if (subclass) {
      // Check if this is a known spellcasting subclass
      const subclassLower = subclass.toLowerCase();
      if (['eldritchknight', 'arcanetrickster', 'aberrantmind'].includes(subclassLower)) {
        // These subclasses use specific spell lists
        if (subclassLower === 'eldritchknight' || subclassLower === 'arcanetrickster') {
          window.GAS.log.d('[LEVELUP] Found subclass in class data:', subclass, '-> Wizard');
          return 'Wizard';
        } else if (subclassLower === 'aberrantmind') {
          window.GAS.log.d('[LEVELUP] Found subclass in class data:', subclass, '-> Sorcerer');
          return 'Sorcerer';
        }
      }
    }
  }
  
  // Method 4: Fallback to base class spellcasting
  const classKeys = Object.keys(classes);
  if (classKeys.length > 0) {
    const baseClass = classKeys[0];
    window.GAS.log.d('[LEVELUP] Using base class for spell list:', baseClass);
    return baseClass;
  }
  
  window.GAS.log.d('[LEVELUP] No spellcasting class found, returning null');
  return null;
}

/**
 * Parses spellcasting feature description to determine spell list class
 * @param {Item} item - The subclass item to analyze
 * @returns {string|null} - The spell list class, or null if not found
 */
function parseSpellcastingFromDescription(item) {
  if (!item) return null;
  
  const description = item.system?.description?.value || item.description?.value || '';
  if (!description) return null;
  
  // Look for patterns like "Wizard spell list" in the description
  const wizardMatch = description.match(/wizard\s+spell\s+list/i);
  if (wizardMatch) {
    return 'Wizard';
  }
  
  const sorcererMatch = description.match(/sorcerer\s+spell\s+list/i);
  if (sorcererMatch) {
    return 'Sorcerer';
  }
  
  const bardMatch = description.match(/bard\s+spell\s+list/i);
  if (bardMatch) {
    return 'Bard';
  }
  
  const clericMatch = description.match(/cleric\s+spell\s+list/i);
  if (clericMatch) {
    return 'Cleric';
  }
  
  const druidMatch = description.match(/druid\s+spell\s+list/i);
  if (druidMatch) {
    return 'Druid';
  }
  
  const paladinMatch = description.match(/paladin\s+spell\s+list/i);
  if (paladinMatch) {
    return 'Paladin';
  }
  
  const rangerMatch = description.match(/ranger\s+spell\s+list/i);
  if (rangerMatch) {
    return 'Ranger';
  }
  
  const warlockMatch = description.match(/warlock\s+spell\s+list/i);
  if (warlockMatch) {
    return 'Warlock';
  }
  
  return null;
}

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
    
    // Check for spellcasting in multiple ways:
    // 1. Class-based spellcasting (base classes like Wizard, Cleric)
    // 2. Actor system spellcasting (granted through advancements like Eldritch Knight)
    // 3. Known spellcasting subclasses (fallback for hardcoded detection)
    
    const classes = actor.classes || {};
    const preSelections = get(levelUpPreAdvancementSelections);
    let classEntries = Object.entries(classes);
    
    if (!classEntries.length && preSelections?.characterClass) {
      classEntries = [[preSelections.characterClass.system?.identifier || preSelections.characterClass.name || 'selected-class', preSelections.characterClass]];
    }
    
    if (!classEntries.length) {
      window.GAS.log.d('[LEVELUP] No classes found (actor or pre-selection), returning false for spellcaster check');
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
    
    // Method 2: Check actor system spellcasting (granted through advancements)
    // Only check this if:
    // 1. NO class has spellcasting progression, AND
    // 2. NO class explicitly has progression: "none" (for cases like Eldritch Knight where Fighter has no progression but subclass grants it)
    const actorData = actor.system || actor.data?.data;
    
    let hasActorSpellcasting = false;
    let hasTraditionalSpellcasting = false;
    let hasSpellSlots = false;
    let hasPactMagic = false;
    
    // Only check actor-level spellcasting if no class has spellcasting AND no class explicitly says "none"
    // This prevents false positives where non-spellcasters have empty/default spell slot structures
    if (!hasClassSpellcasting && !hasExplicitNonSpellcaster) {
      // Check for traditional spellcasting system
      hasTraditionalSpellcasting = actorData?.spellcasting && Object.keys(actorData.spellcasting).length > 0;
      
      // Check for spell slots added by advancements (like Eldritch Knight)
      hasSpellSlots = actorData?.spells && Object.values(actorData.spells || {}).some(slot => 
        slot && slot.type === 'spell' && slot.max > 0
      );
      
      // Check for pact magic slots (only count if they have max > 0 and actor has Warlock class)
      // DEBUG: Log what we're actually checking
      window.GAS.log.d('[LEVELUP] Checking for pact magic:', {
        hasSpells: !!actorData?.spells,
        spellsType: typeof actorData?.spells,
        spellsValue: actorData?.spells,
        spellsKeys: actorData?.spells ? Object.keys(actorData.spells) : [],
        spellsValues: actorData?.spells ? Object.values(actorData.spells) : [],
        classNamesLower
      });
      
      hasPactMagic = actorData?.spells && 
        typeof actorData.spells === 'object' && 
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
    
    window.GAS.log.d('[LEVELUP] Spellcasting detection:', {
      spellcastingInfo,
      classNamesLower,
      hasClassSpellcasting,
      hasExplicitNonSpellcaster,
      hasTraditionalSpellcasting,
      hasSpellSlots,
      hasPactMagic,
      hasActorSpellcasting,
      hasKnownSpellcastingClass,
      hasSubclassSpellcasting,
      hasSubclassInClassData,
      isSpellcaster,
      actorName: actor.name,
      actorSpellcasting: actorData?.spellcasting,
      actorSpells: actorData?.spells,
      actorSpellcastingKeys: actorData?.spellcasting ? Object.keys(actorData.spellcasting) : [],
      classSpellcastingInfo: spellcastingInfo
    });
    
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
        
        // Restore Tidy5e auto-reopen when returning to idle
        suppressTidy5eAutoReopen(false);
      })
    
    // SELECTING CLASS/LEVEL STATE
    .state('selecting_class_level')
      .on('class_level_selected').transitionTo('processing_advancements')
      .on('error').transitionTo('error')
      .on('reset').transitionTo('idle')
      .onEnter((context) => {
        if (levelUpFSMContext.isProcessing) levelUpFSMContext.isProcessing.set(false);
        window.GAS.log.d('[LEVELUP] Entered SELECTING_CLASS_LEVEL state');
        
        // Suppress Tidy5e auto-reopen during level up
        suppressTidy5eAutoReopen(true);
        
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
        
        // Add a longer delay to ensure actor is fully updated after advancements
        // Advancements might update the actor's spellcasting system asynchronously
        await new Promise(resolve => setTimeout(resolve, 500));
        
        window.GAS.log.d('[LEVELUP] Advancement queue completed, checking for spellcasting...');
      })
        .onSuccess()
          .transitionTo('selecting_spells').withCondition((context) => {
            const actor = levelUpFSMContext.actor || get(actorInGame);
            const shouldShow = levelUpFSMContext._shouldShowSpellSelection(actor);
            window.GAS.log.d('[LEVELUP] advancements_complete -> selecting_spells condition:', shouldShow);
            window.GAS.log.d('[LEVELUP] Actor spellcasting data:', {
              actorName: actor?.name,
              classes: Object.keys(actor?.classes || {}),
              actorSpellcasting: actor?.system?.spellcasting,
              actorSpells: actor?.system?.spells,
              hasActorSpellcasting: actor?.system?.spellcasting && Object.keys(actor.system.spellcasting).length > 0,
              hasSpellSlots: actor?.system?.spells && Object.values(actor.system.spells).some(slot => 
                slot.type === 'spell' && slot.max > 0
              )
            });
            return shouldShow;
          })
          .transitionTo('completed') // Default fallback - no spell selection needed
        .onFailure().transitionTo('error')
      .on('reset').transitionTo('idle')
      .on('error').transitionTo('error')
    
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

        // Freeze the Level Up tab to prevent further changes after advancements
        try {
          const currentReadOnly = get(readOnlyTabs) || [];
          if (!currentReadOnly.includes('level-up')) {
            readOnlyTabs.update(t => [...t, 'level-up']);
            window.GAS.log.d('[LEVELUP] Marked level-up tab as read-only');
          }
        } catch (e) {
          window.GAS.log.w('[LEVELUP] Unable to set level-up tab read-only:', e);
        }
        
        // Initialize spell selection for the level-up actor
        const actor = levelUpFSMContext.actor || get(actorInGame);
        if (actor) {
          try {
            // Import spell selection functions
            import('~/src/stores/spellSelection').then(({ initializeSpellSelection, loadAvailableSpells }) => {
              window.GAS.log.d('[LEVELUP] Initializing spell selection for actor:', actor.name);
              initializeSpellSelection(actor);
              
              // Determine the correct spell list for this character
              const spellListClass = determineSpellListClass(actor);
              if (spellListClass) {
                loadAvailableSpells(spellListClass);
                window.GAS.log.d('[LEVELUP] Loading spells for spell list class:', spellListClass);
              }
            });
          } catch (error) {
            window.GAS.log.e('[LEVELUP] Error initializing spell selection:', error);
          }
        }
        
        // Double-check that actor is actually a spellcaster before adding spell tab
        const isSpellcaster = levelUpFSMContext._shouldShowSpellSelection(actor);
        window.GAS.log.d('[LEVELUP] Verifying spellcaster status in onEnter:', { isSpellcaster, actorName: actor?.name });
        
        if (isSpellcaster) {
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
        } else {
          window.GAS.log.w('[LEVELUP] Actor is not a spellcaster but entered selecting_spells state - transitioning to completed');
          // If we somehow entered this state for a non-spellcaster, immediately skip to completed
          const levelUpFSM = getLevelUpFSM();
          levelUpFSM.handle(LEVELUP_EVENTS.SKIP_SPELLS);
        }
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
        
        // Restore Tidy5e auto-reopen before opening actor sheet
        suppressTidy5eAutoReopen(false);
        
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

// Export the helper functions for use in other components
export { determineSpellListClass, parseSpellcastingFromDescription };
