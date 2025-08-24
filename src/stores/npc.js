import { writable, get, derived } from 'svelte/store';
import { npcCurrency, selectedNpcBase } from './storeDefinitions.js';
import { MODULE_ID } from '~/src/helpers/constants';
import { activeTab } from '~/src/stores/index';

// Key for localStorage persistence
const NPC_STATE_KEY = `${MODULE_ID}-npc-state`;

// Persist only what we need to restore selection efficiently
export const npcSelectedBaseUuid = writable(null);

// NPC workflow state stores
export const npcFeatures = writable([]); // Features selected for the NPC
export const npcStats = writable({}); // Custom stats modifications
export const npcEquipment = writable([]); // Equipment selections
export const npcName = writable(''); // Custom NPC name

// Magic Items tab state
export const magicItemsState = writable({
  generationType: 'individual',
  partyLevel: 5,
  generatedMagicItems: [],
  manualNpcName: '',
  manualNpcCR: 0,
  manualNpcType: ''
});

export const npcProgress = writable({
  'npc-select': 0,
  'npc-features': 0,
  'npc-create': 0,
  'npc-equipment-shop': 0,
  'magic-items': 0
});

// Debug: Log whenever the store changes
npcCurrency.subscribe(value => {
  console.log('[NPC Store] npcCurrency store updated:', value);
});

// Load persisted state on module import
(function initializeNpcState() {
  try {
    const stored = localStorage.getItem(NPC_STATE_KEY);
    if (!stored) return;
    const state = JSON.parse(stored);
    
    if (state?.selectedBaseUuid) {
      npcSelectedBaseUuid.set(state.selectedBaseUuid);
      // Resolve the UUID and set the full Document into selectedNpcBase
      // Guard for test environments where fromUuid may not exist
      if (typeof fromUuid === 'function') {
        fromUuid(state.selectedBaseUuid).then((doc) => {
          if (doc) selectedNpcBase.set(doc);
        }).catch(() => {});
      }
    }
    
    // Restore other NPC state
    if (state?.features) npcFeatures.set(state.features);
    if (state?.stats) npcStats.set(state.stats);
    if (state?.equipment) npcEquipment.set(state.equipment);
    if (state?.currency) npcCurrency.set(state.currency);
    if (state?.name) npcName.set(state.name);
    if (state?.progress) npcProgress.set(state.progress);
    if (state?.magicItems) {
      // Ensure the generationType is set to 'individual' by default
      const magicItems = state.magicItems;
      if (magicItems.generationType !== 'individual') {
        magicItems.generationType = 'individual';
      }
      magicItemsState.set(magicItems);
    }
  } catch (e) {
    // no-op on parse / access errors
  }
})();

// Keep localStorage in sync when any NPC state changes
function persistNpcState() {
  try {
    const currentState = {
      selectedBaseUuid: get(npcSelectedBaseUuid),
      features: get(npcFeatures),
      stats: get(npcStats),
      equipment: get(npcEquipment),
      currency: get(npcCurrency),
      name: get(npcName),
      progress: get(npcProgress),
      magicItems: get(magicItemsState)
    };
    localStorage.setItem(NPC_STATE_KEY, JSON.stringify(currentState));
  } catch (_) {}
}

// Subscribe to all NPC state changes to persist them
npcSelectedBaseUuid.subscribe(() => persistNpcState());
npcFeatures.subscribe(() => persistNpcState());
npcStats.subscribe(() => persistNpcState());
npcEquipment.subscribe(() => persistNpcState());
npcCurrency.subscribe(() => persistNpcState());
npcName.subscribe(() => persistNpcState());
npcProgress.subscribe(() => persistNpcState());
magicItemsState.subscribe(() => persistNpcState());

selectedNpcBase.subscribe((doc) => {
  const uuid = doc?.uuid || null;
  if (get(npcSelectedBaseUuid) !== uuid) {
    npcSelectedBaseUuid.set(uuid);
  }
});

// Expose a derived progress value for the NPC Select tab
export const npcSelectProgress = derived(
  [activeTab, selectedNpcBase],
  ([$activeTab, $selectedNpcBase]) => {
    if ($activeTab !== 'npc-select') return 0;
    return $selectedNpcBase ? 100 : 0;
  }
);

// Derived progress for each tab
export const npcTabProgress = derived(
  [npcProgress, activeTab],
  ([$npcProgress, $activeTab]) => {
    return $npcProgress[$activeTab] || 0;
  }
);

// Helper function to update progress for a specific tab
export function updateNpcTabProgress(tabId, progress) {
  npcProgress.update(current => ({
    ...current,
    [tabId]: Math.max(0, Math.min(100, progress))
  }));
}

// Helper function to check if a tab is complete
export function isNpcTabComplete(tabId) {
  const progress = get(npcProgress);
  return (progress[tabId] || 0) >= 100;
}

// Helper function to reset NPC state when base NPC changes
export function resetNpcStateOnBaseChange() {
  // Reset features, stats, and equipment when base NPC changes
  npcFeatures.set([]);
  npcStats.set({});
  npcEquipment.set([]);
  // Don't reset currency here - let it be properly rolled based on NPC CR
  npcName.set('');
  
  // Reset magic items state when base NPC changes
  magicItemsState.set({
    generationType: 'individual',
    partyLevel: 5,
    generatedMagicItems: [],
    manualNpcName: '',
    manualNpcCR: 0,
    manualNpcType: ''
  });
  
  // Reset progress for all tabs except selection
  npcProgress.update(current => ({
    ...current,
    'npc-features': 0,
    'npc-create': 0,
    'npc-equipment-shop': 0,
    'magic-items': 0
  }));
}

// Helper function to add a feature to the NPC
export function addNpcFeature(feature) {
  npcFeatures.update(features => {
    // Check if feature already exists (by UUID)
    const exists = features.some(f => f.uuid === feature.uuid);
    if (!exists) {
      return [...features, feature];
    }
    return features;
  });
}

// Helper function to remove a feature from the NPC
export function removeNpcFeature(featureUuid) {
  npcFeatures.update(features => 
    features.filter(f => f.uuid !== featureUuid)
  );
}

// Helper function to update NPC stats
export function updateNpcStats(stats) {
  npcStats.update(current => ({
    ...current,
    ...stats
  }));
}

// Helper function to add equipment to the NPC
export function addNpcEquipment(equipment) {
  npcEquipment.update(equipmentList => {
    // Check if equipment already exists (by UUID)
    const exists = equipmentList.some(e => e.uuid === equipment.uuid);
    if (!exists) {
      return [...equipmentList, equipment];
    }
    return equipmentList;
  });
}

// Helper function to remove equipment from the NPC
export function removeNpcEquipment(equipmentUuid) {
  npcEquipment.update(equipmentList => 
    equipmentList.filter(e => e.uuid !== equipmentUuid)
  );
}

// Helper function to update NPC currency
export function updateNpcCurrency(currency) {
  npcCurrency.set(currency);
}

// Helper function to update NPC name
export function updateNpcName(name) {
  npcName.set(name);
}

/**
 * Auto-roll gold for NPCs based on their CR
 */
export async function autoRollGold(selectedNpcBase) {
  try {
    console.log('[NPC Store] Starting autoRollGold with:', selectedNpcBase);
    
    // Get the NPC's CR for gold calculation - the CR is stored at system.details.cr
    const npcCR = selectedNpcBase?.system?.details?.cr ?? 0;
    console.log('[NPC Store] NPC CR:', npcCR);
    
    // Calculate gold based on CR using Individual Treasure table (DMG)
    let newCurrency = { pp: 0, gp: 0, ep: 0, sp: 0, cp: 0 };
    
    if (npcCR === 0) {
      // CR 0: Individual Treasure Challenge 0-4
      const d100 = Math.floor(Math.random() * 100) + 1;
      if (d100 <= 30) {
        newCurrency.cp = Math.floor(Math.random() * 6 + 1) + Math.floor(Math.random() * 6 + 1) + 
                        Math.floor(Math.random() * 6 + 1) + Math.floor(Math.random() * 6 + 1) + 
                        Math.floor(Math.random() * 6 + 1); // 5d6 CP
      } else if (d100 <= 60) {
        newCurrency.sp = Math.floor(Math.random() * 6 + 1) + Math.floor(Math.random() * 6 + 1) + 
                        Math.floor(Math.random() * 6 + 1) + Math.floor(Math.random() * 6 + 1); // 4d6 SP
      } else if (d100 <= 70) {
        newCurrency.ep = Math.floor(Math.random() * 6 + 1) + Math.floor(Math.random() * 6 + 1) + 
                        Math.floor(Math.random() * 6 + 1); // 3d6 EP
      } else if (d100 <= 95) {
        newCurrency.gp = Math.floor(Math.random() * 6 + 1) + Math.floor(Math.random() * 6 + 1) + 
                        Math.floor(Math.random() * 6 + 1); // 3d6 GP
      } else {
        newCurrency.pp = Math.floor(Math.random() * 6 + 1); // 1d6 PP
      }
    } else if (npcCR <= 10) {
      // CR 5-10: Individual Treasure Challenge 5-10
      const d100 = Math.floor(Math.random() * 100) + 1;
      if (d100 <= 30) {
        newCurrency.cp = (Math.floor(Math.random() * 6 + 1) + Math.floor(Math.random() * 6 + 1) + 
                         Math.floor(Math.random() * 6 + 1) + Math.floor(Math.random() * 6 + 1)) * 100; // 4d6 × 100 CP
        newCurrency.ep = Math.floor(Math.random() * 6 + 1) * 10; // 1d6 × 10 EP
      } else if (d100 <= 60) {
        newCurrency.sp = (Math.floor(Math.random() * 6 + 1) + Math.floor(Math.random() * 6 + 1) + 
                         Math.floor(Math.random() * 6 + 1) + Math.floor(Math.random() * 6 + 1) + 
                         Math.floor(Math.random() * 6 + 1) + Math.floor(Math.random() * 6 + 1)) * 10; // 6d6 × 10 SP
        newCurrency.gp = (Math.floor(Math.random() * 6 + 1) + Math.floor(Math.random() * 6 + 1)) * 10; // 2d6 × 10 GP
      } else if (d100 <= 70) {
        newCurrency.ep = (Math.floor(Math.random() * 6 + 1) + Math.floor(Math.random() * 6 + 1) + 
                         Math.floor(Math.random() * 6 + 1)) * 10; // 3d6 × 10 EP
        newCurrency.gp = (Math.floor(Math.random() * 6 + 1) + Math.floor(Math.random() * 6 + 1)) * 10; // 2d6 × 10 GP
      } else if (d100 <= 95) {
        newCurrency.gp = (Math.floor(Math.random() * 6 + 1) + Math.floor(Math.random() * 6 + 1) + 
                         Math.floor(Math.random() * 6 + 1) + Math.floor(Math.random() * 6 + 1)) * 10; // 4d6 × 10 GP
      } else {
        newCurrency.gp = (Math.floor(Math.random() * 6 + 1) + Math.floor(Math.random() * 6 + 1)) * 10; // 2d6 × 10 GP
        newCurrency.pp = (Math.floor(Math.random() * 6 + 1) + Math.floor(Math.random() * 6 + 1) + 
                         Math.floor(Math.random() * 6 + 1)); // 3d6 PP
      }
    } else if (npcCR <= 16) {
      // CR 11-16: Individual Treasure Challenge 11-16
      const d100 = Math.floor(Math.random() * 100) + 1;
      if (d100 <= 20) {
        newCurrency.sp = (Math.floor(Math.random() * 6 + 1) + Math.floor(Math.random() * 6 + 1) + 
                         Math.floor(Math.random() * 6 + 1) + Math.floor(Math.random() * 6 + 1)) * 100; // 4d6 × 100 SP
        newCurrency.gp = Math.floor(Math.random() * 6 + 1) * 100; // 1d6 × 100 GP
      } else if (d100 <= 35) {
        newCurrency.ep = Math.floor(Math.random() * 6 + 1) * 100; // 1d6 × 100 EP
        newCurrency.gp = Math.floor(Math.random() * 6 + 1) * 100; // 1d6 × 100 GP
      } else if (d100 <= 75) {
        newCurrency.gp = (Math.floor(Math.random() * 6 + 1) + Math.floor(Math.random() * 6 + 1)) * 100; // 2d6 × 100 GP
        newCurrency.pp = (Math.floor(Math.random() * 6 + 1) + Math.floor(Math.random() * 6 + 1) + 
                         Math.floor(Math.random() * 6 + 1)) * 10; // 3d6 × 10 PP
      } else {
        newCurrency.gp = (Math.floor(Math.random() * 6 + 1) + Math.floor(Math.random() * 6 + 1)) * 100; // 2d6 × 100 GP
        newCurrency.pp = (Math.floor(Math.random() * 6 + 1) + Math.floor(Math.random() * 6 + 1)) * 10; // 2d6 × 10 PP
      }
    } else {
      // CR 17+: Individual Treasure Challenge 17+
      const d100 = Math.floor(Math.random() * 100) + 1;
      if (d100 <= 15) {
        newCurrency.ep = (Math.floor(Math.random() * 6 + 1) + Math.floor(Math.random() * 6 + 1)) * 1000; // 2d6 × 1,000 EP
        newCurrency.gp = (Math.floor(Math.random() * 6 + 1) + Math.floor(Math.random() * 6 + 1) + 
                         Math.floor(Math.random() * 6 + 1) + Math.floor(Math.random() * 6 + 1) + 
                         Math.floor(Math.random() * 6 + 1) + Math.floor(Math.random() * 6 + 1) + 
                         Math.floor(Math.random() * 6 + 1) + Math.floor(Math.random() * 6 + 1)) * 100; // 8d6 × 100 GP
      } else if (d100 <= 55) {
        newCurrency.gp = Math.floor(Math.random() * 6 + 1) * 1000; // 1d6 × 1,000 GP
        newCurrency.pp = Math.floor(Math.random() * 6 + 1) * 100; // 1d6 × 100 PP
      } else {
        newCurrency.gp = Math.floor(Math.random() * 6 + 1) * 1000; // 1d6 × 1,000 GP
        newCurrency.pp = (Math.floor(Math.random() * 6 + 1) + Math.floor(Math.random() * 6 + 1)) * 100; // 2d6 × 100 PP
      }
    }
    
    console.log('[NPC Store] Rolled currency:', newCurrency);
    
    // Set the rolled currency
    npcCurrency.set(newCurrency);
    
    // Log the roll
    window.GAS?.log?.d?.('[NPC Store] Auto-rolled currency:', { npcCR, newCurrency });
    console.log('[NPC Store] Currency store updated, current value:', get(npcCurrency));
    
    return newCurrency;
  } catch (error) {
    console.error('Error auto-rolling gold:', error);
    // Fallback to default 10 GP if roll fails
    const fallbackCurrency = { pp: 0, gp: 10, ep: 0, sp: 0, cp: 0 };
    npcCurrency.set(fallbackCurrency);
    return fallbackCurrency;
  }
}

export function clearNpcSelection() {
  try {
    localStorage.removeItem(NPC_STATE_KEY);
  } catch (_) {}
  npcSelectedBaseUuid.set(null);
  selectedNpcBase.set(null);
  npcFeatures.set([]);
  npcStats.set({});
  npcEquipment.set([]);
  // Don't reset currency here - let it be properly rolled based on NPC CR
  npcName.set('');
  magicItemsState.set({
    generationType: 'individual',
    partyLevel: 5,
    generatedMagicItems: [],
    manualNpcName: '',
    manualNpcCR: 0,
    manualNpcType: ''
  });
  npcProgress.set({
    'npc-select': 0,
    'npc-features': 0,
    'npc-create': 0,
    'npc-equipment-shop': 0,
    'magic-items': 0
  });
}

// Function to reset just the magic items state to default
export function resetMagicItemsToDefault() {
  magicItemsState.set({
    generationType: 'individual',
    partyLevel: 5,
    generatedMagicItems: [],
    manualNpcName: '',
    manualNpcCR: 0,
    manualNpcType: ''
  });
}


