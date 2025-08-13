import { writable, derived, get } from 'svelte/store';
import { MODULE_ID } from '~/src/helpers/constants';
import { activeTab } from '~/src/stores/index';
import { selectedNpcBase } from '~/src/stores/storeDefinitions';

// Key for localStorage persistence
const NPC_STATE_KEY = `${MODULE_ID}-npc-state`;

// Persist only what we need to restore selection efficiently
export const npcSelectedBaseUuid = writable(null);

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
  } catch (e) {
    // no-op on parse / access errors
  }
})();

// Keep localStorage in sync when either the UUID or the selected document changes
npcSelectedBaseUuid.subscribe((uuid) => {
  try {
    const next = { selectedBaseUuid: uuid };
    localStorage.setItem(NPC_STATE_KEY, JSON.stringify(next));
  } catch (_) {}
});

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

export function clearNpcSelection() {
  try {
    localStorage.removeItem(NPC_STATE_KEY);
  } catch (_) {}
  npcSelectedBaseUuid.set(null);
  selectedNpcBase.set(null);
}


