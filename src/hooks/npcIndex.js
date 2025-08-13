import { MODULE_ID } from '~/src/helpers/constants';
import { getPacksFromSettings, extractItemsFromPacksSync } from '~/src/helpers/Utility';

const LOCAL_STORAGE_KEY = `${MODULE_ID}-npc-feature-index-v1`;

/**
 * Returns the cached NPC feature index from localStorage, or null if missing.
 */
export function getNpcFeatureIndex() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (_) {
    return null;
  }
}

/**
 * Removes the cached index to force a rebuild
 */
export function invalidateNpcFeatureIndex() {
  try {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  } catch (_) {}
}

/**
 * Builds the NPC feature index by scanning configured NPC compendiums.
 * Note: This must run in the main thread because it relies on Foundry APIs (fromUuid, pack index).
 * The heavy work is chunked to avoid blocking the UI.
 */
export async function buildNpcFeatureIndex() {
  const packs = getPacksFromSettings('npcs');
  if (!packs || packs.length === 0) return [];

  // Extract only NPC entries with their UUIDs
  const entries = extractItemsFromPacksSync(packs, ['uuid->uuid', 'type']).filter(e => e.type === 'npc');

  const index = [];
  const batchSize = 5;

  for (let i = 0; i < entries.length; i += batchSize) {
    const batch = entries.slice(i, i + batchSize);
    await Promise.all(batch.map(async (entry) => {
      try {
        const actor = await fromUuid(entry.uuid);
        if (!actor) return;
        const items = [];
        try {
          const collection = actor.items;
          const arr = (collection && (collection.contents || Array.from(collection))) || [];
          for (const item of arr) {
            if (!item) continue;
            items.push({ name: item.name, uuid: item.uuid });
          }
        } catch (_) {}
        index.push({ npc_uuid: entry.uuid, items });
      } catch (err) {
        // Skip problematic entries
      }
    }));
    // Yield to the event loop between batches
    await new Promise(r => setTimeout(r, 0));
  }

  return index;
}

/**
 * Initializes the NPC feature index if not present. Stores result in localStorage.
 * Non-blocking: fires and forgets, logs completion.
 */
export function initializeNpcFeatureIndex() {
  // If already cached, do nothing
  const cached = getNpcFeatureIndex();
  if (cached && Array.isArray(cached.index)) return;

  // Fire-and-forget async build
  (async () => {
    try {
      const index = await buildNpcFeatureIndex();
      const payload = {
        version: 1,
        builtAt: Date.now(),
        index,
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(payload));
      window.GAS?.log?.g?.('[NPC INDEX] Built NPC feature index', payload);
    } catch (err) {
      window.GAS?.log?.e?.('[NPC INDEX] Failed to build NPC feature index', err);
    }
  })();
}


