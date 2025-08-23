import { writable, derived, get } from 'svelte/store';
import { MODULE_ID } from '~/src/helpers/constants';
import { activeTab } from '~/src/stores/index';
import { selectedNpcBase } from '~/src/stores/storeDefinitions';

// Key for localStorage persistence
const NPC_STATE_KEY = `${MODULE_ID}-npc-state`;

// Persist only what we need to restore selection efficiently
export const npcSelectedBaseUuid = writable(null);

// NPC workflow state stores
export const npcFeatures = writable([]); // Features selected for the NPC
export const npcStats = writable({}); // Custom stats modifications
export const npcEquipment = writable([]); // Equipment selections
export const npcCurrency = writable({ pp: 0, gp: 0, ep: 0, sp: 0, cp: 0 }); // NPC currency
export const npcName = writable(''); // Custom NPC name

// Magic Items tab state
export const magicItemsState = writable({
  generationType: 'hoard',
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
    if (state?.magicItems) magicItemsState.set(state.magicItems);
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
  npcCurrency.set({ pp: 0, gp: 0, ep: 0, sp: 0, cp: 0 });
  npcName.set('');
  
  // Reset magic items state when base NPC changes
  magicItemsState.set({
    generationType: 'hoard',
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

export function clearNpcSelection() {
  try {
    localStorage.removeItem(NPC_STATE_KEY);
  } catch (_) {}
  npcSelectedBaseUuid.set(null);
  selectedNpcBase.set(null);
  npcFeatures.set([]);
  npcStats.set({});
  npcEquipment.set([]);
  npcCurrency.set({ pp: 0, gp: 0, ep: 0, sp: 0, cp: 0 });
  npcName.set('');
  magicItemsState.set({
    generationType: 'hoard',
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


