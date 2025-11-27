import { derived, writable, get } from 'svelte/store';
import { dropItemRegistry } from './advancements.js';
import { actorInGame } from './storeDefinitions.js';
import { SpellGrantDetection } from '../helpers/SpellGrantDetection.js';

/**
 * Store for tracking spell selections made for each grant
 * Map<advancementId, { grantInfo: SpellGrantInfo, selections: Item5e[] }>
 */
export const spellGrantSelections = writable(new Map());

/**
 * Derived store that detects spell grants from the actor's items AND queued advancements
 * This checks both:
 * 1. Items already on the actor (e.g., fighting styles, feats with pending spell selections)
 * 2. Items in the queue (e.g., newly added feats not yet applied)
 */
export const activeSpellGrants = derived(
  [actorInGame, dropItemRegistry],
  ([$actorInGame, $dropItemRegistry]) => {
    const grants = [];
    
    // Check actor's current items for spell grants
    // This catches fighting styles and feats that have been applied but have incomplete spell selections
    if ($actorInGame?.items) {
      if (typeof window !== 'undefined' && window.GAS?.log) {
        window.GAS.log.d('[spellGrants] Checking actor items for spell grants:', {
          actorName: $actorInGame.name,
          itemCount: $actorInGame.items.size
        });
      }
      
      for (const item of $actorInGame.items) {
        // Log each item being checked if it's a feat or fighting style
        if (typeof window !== 'undefined' && window.GAS?.log && (item.type === 'feat' || item.name.toLowerCase().includes('magic'))) {
          window.GAS.log.d('[spellGrants] Checking item:', {
            itemName: item.name,
            itemType: item.type,
            identifier: item.system?.identifier
          });
        }
        
        const itemGrants = SpellGrantDetection.detectSpellGrant(item);
        if (itemGrants) {
          if (typeof window !== 'undefined' && window.GAS?.log) {
            window.GAS.log.d('[spellGrants] Found spell grants in item:', {
              itemName: item.name,
              itemType: item.type,
              grantsCount: itemGrants.length
            });
          }
          
          // Check if this grant still needs spell selections
          // (i.e., the advancement hasn't been completed yet)
          for (const grant of itemGrants) {
            // Only include grants that haven't been fulfilled yet
            // We check if the item has the advancement but no spells granted from it
            const hasSpellsGranted = _checkIfSpellsAlreadyGranted(item, grant);
            if (!hasSpellsGranted) {
              grants.push(grant);
            }
          }
        }
      }
    }
    
    // Also check items in the queue (for items not yet applied)
    const queueArray = Array.isArray($dropItemRegistry) ? $dropItemRegistry : [];
    const queueGrants = SpellGrantDetection.getSpellGrantsFromQueue(queueArray);
    grants.push(...queueGrants);
    
    return grants;
  }
);

/**
 * Check if spells have already been granted from this advancement
 * @private
 */
function _checkIfSpellsAlreadyGranted(item, grant) {
  // For now, we'll assume if the item exists on the actor,
  // we should show the spell selection UI
  // TODO: Implement proper check for completed spell grants
  return false;
}

/**
 * Add spell selection for a grant
 * @param {string} advancementId - The advancement ID
 * @param {SpellGrantInfo} grantInfo - The grant information
 * @param {Item5e[]} spells - Selected spells
 */
export function addSpellGrantSelection(advancementId, grantInfo, spells) {
  spellGrantSelections.update(map => {
    const newMap = new Map(map);
    newMap.set(advancementId, {
      grantInfo,
      selections: spells
    });
    return newMap;
  });
}

/**
 * Remove spell selection for a grant
 * @param {string} advancementId - The advancement ID
 */
export function removeSpellGrantSelection(advancementId) {
  spellGrantSelections.update(map => {
    const newMap = new Map(map);
    newMap.delete(advancementId);
    return newMap;
  });
}

/**
 * Clear all spell grant selections
 */
export function clearSpellGrantSelections() {
  spellGrantSelections.set(new Map());
}

/**
 * Get selections for a specific grant
 * @param {string} advancementId - The advancement ID
 * @returns {Item5e[]} Array of selected spells
 */
export function getSelectionsForGrant(advancementId) {
  const selections = get(spellGrantSelections);
  return selections.get(advancementId)?.selections || [];
}

/**
 * Check if all active spell grants have valid selections
 */
export const spellGrantsComplete = derived(
  [activeSpellGrants, spellGrantSelections],
  ([$activeGrants, $selections]) => {
    if ($activeGrants.length === 0) return true;

    for (const grant of $activeGrants) {
      const selection = $selections.get(grant.advancementId);
      
      // No selection made yet
      if (!selection) return false;

      // Validate the selection
      const validation = SpellGrantDetection.validateSpellSelection(
        grant,
        selection.selections
      );
      
      if (!validation.valid) return false;
    }

    return true;
  }
);

/**
 * Get validation errors for all spell grants
 * @returns {Map<string, string[]>} Map of advancement ID to error messages
 */
export const spellGrantValidationErrors = derived(
  [activeSpellGrants, spellGrantSelections],
  ([$activeGrants, $selections]) => {
    const errorMap = new Map();

    for (const grant of $activeGrants) {
      const selection = $selections.get(grant.advancementId);
      
      if (selection) {
        const validation = SpellGrantDetection.validateSpellSelection(
          grant,
          selection.selections
        );
        
        if (!validation.valid) {
          errorMap.set(grant.advancementId, validation.errors);
        }
      }
    }

    return errorMap;
  }
);

/**
 * Get progress information for spell grants
 * @returns {{ total: number, completed: number, percentage: number }}
 */
export const spellGrantProgress = derived(
  [activeSpellGrants, spellGrantSelections],
  ([$activeGrants, $selections]) => {
    const total = $activeGrants.length;
    
    if (total === 0) {
      return { total: 0, completed: 0, percentage: 100 };
    }

    let completed = 0;
    for (const grant of $activeGrants) {
      const selection = $selections.get(grant.advancementId);
      
      if (selection) {
        const validation = SpellGrantDetection.validateSpellSelection(
          grant,
          selection.selections
        );
        
        if (validation.valid) {
          completed++;
        }
      }
    }

    return {
      total,
      completed,
      percentage: Math.round((completed / total) * 100)
    };
  }
);
