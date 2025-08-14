import { MODULE_ID } from '~/src/helpers/constants';
import { getPacksFromSettings, extractItemsFromPacksSync } from '~/src/helpers/Utility';

const LOCAL_STORAGE_KEY = `${MODULE_ID}-npc-feature-index-v1`;

/**
 * Returns the cached NPC feature index from localStorage, or null if missing.
 */
export function getNpcFeatureIndex() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (window?.GAS?.log?.d) {
      window.GAS.log.d('[NPC INDEX] Read from localStorage', {
        key: LOCAL_STORAGE_KEY,
        hasValue: !!raw,
        preview: raw ? `${String(raw).slice(0, 120)}…` : null
      });
    }
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
 * Deduplicates items across all NPCs to prevent showing the same feature multiple times
 * Allows duplicate names but prevents duplicate name + content combinations
 */
function deduplicateItems(index) {
  const seenItems = new Map(); // key: name + content hash, value: { uuid, npc_uuid }
  const deduplicatedIndex = [];
  
  for (const npcEntry of index) {
    const deduplicatedItems = [];
    
    for (const item of npcEntry.items) {
      // Create a content hash based on name and other identifying properties
      // We'll use a simple hash of the item data to detect duplicates
      const contentHash = createItemHash(item);
      const key = `${item.name}|${contentHash}`;
      
      if (!seenItems.has(key)) {
        // First time seeing this item, add it
        seenItems.set(key, { uuid: item.uuid, npc_uuid: npcEntry.npc_uuid });
        deduplicatedItems.push(item);
        
        if (window?.GAS?.log?.v) {
          window.GAS.log.v('[NPC INDEX] Added unique item', { name: item.name, uuid: item.uuid, npc_uuid: npcEntry.npc_uuid });
        }
      } else {
        // Duplicate item found, log it
        const existing = seenItems.get(key);
        if (window?.GAS?.log?.d) {
          window.GAS.log.d('[NPC INDEX] Skipped duplicate item', { 
            name: item.name, 
            uuid: item.uuid, 
            npc_uuid: npcEntry.npc_uuid,
            existingUuid: existing.uuid,
            existingNpcUuid: existing.npc_uuid
          });
        }
      }
    }
    
    // Only add NPC entries that still have items after deduplication
    if (deduplicatedItems.length > 0) {
      deduplicatedIndex.push({ npc_uuid: npcEntry.npc_uuid, items: deduplicatedItems });
    }
  }
  
  if (window?.GAS?.log?.i) {
    window.GAS.log.i('[NPC INDEX] Deduplication complete', {
      originalIndexSize: index.length,
      deduplicatedIndexSize: deduplicatedIndex.length,
      totalOriginalItems: index.reduce((sum, npc) => sum + npc.items.length, 0),
      totalDeduplicatedItems: deduplicatedIndex.reduce((sum, npc) => sum + npc.items.length, 0)
    });
  }
  
  return deduplicatedIndex;
}

/**
 * Creates a hash of item content to detect duplicates
 */
function createItemHash(item) {
  // Create a more robust hash based on multiple item properties
  // This helps detect duplicates even when items have the same name but different content
  const contentString = `${item.name}|${item.img || ''}|${item.uuid || ''}`;
  
  // Use a better hashing algorithm (simple but effective)
  let hash = 0;
  if (contentString.length === 0) return hash.toString(16);
  
  for (let i = 0; i < contentString.length; i++) {
    const char = contentString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return Math.abs(hash).toString(16);
}

/**
 * Builds the NPC feature index by scanning configured NPC compendiums.
 * Note: This must run in the main thread because it relies on Foundry APIs (fromUuid, pack index).
 * The heavy work is chunked to avoid blocking the UI.
 */
export async function buildNpcFeatureIndex() {
  const startedAt = Date.now();
  const packs = getPacksFromSettings('npcs');
  if (window?.GAS?.log?.i) {
    window.GAS.log.i('[NPC INDEX] Starting build');
    window.GAS.log.d('[NPC INDEX] Packs from settings',
      (packs || []).map(p => ({ id: p?.metadata?.id, label: p?.metadata?.label, type: p?.metadata?.type }))
    );
  }
  if (!packs || packs.length === 0) {
    window?.GAS?.log?.w?.('[NPC INDEX] No NPC packs configured. Aborting build.');
    return [];
  }

  // Extract only NPC entries with their UUIDs
  const allEntries = extractItemsFromPacksSync(packs, ['uuid->uuid', 'type', 'img']);
  const entries = allEntries.filter(e => e.type === 'npc');
  if (window?.GAS?.log?.d) {
    window.GAS.log.d('[NPC INDEX] Entry counts', {
      totalFromPacks: allEntries.length,
      filteredNpc: entries.length
    });
    if (entries.length === 0 && allEntries.length > 0) {
      window.GAS.log.w('[NPC INDEX] No entries with type "npc" found. Sample of first 5 raw entries:', allEntries.slice(0, 5));
    }
  }

  const index = [];
  const batchSize = 5;

  for (let i = 0; i < entries.length; i += batchSize) {
    const batch = entries.slice(i, i + batchSize);
    await Promise.all(batch.map(async (entry) => {
      try {
        const actor = await fromUuid(entry.uuid);
        if (!actor) {
          window?.GAS?.log?.w?.('[NPC INDEX] fromUuid returned null for entry', entry);
          return;
        }
        const items = [];
        try {
          const collection = actor.items;
          const arr = (collection && (collection.contents || Array.from(collection))) || [];
          for (const item of arr) {
            if (!item) continue;
            items.push({ name: item.name, uuid: item.uuid, img: item.img });
          }
        } catch (_) {}
        index.push({ npc_uuid: entry.uuid, items });
        if (window?.GAS?.log?.v) {
          window.GAS.log.v('[NPC INDEX] Indexed NPC', {
            npcUuid: entry.uuid,
            itemCount: items.length
          });
        }
      } catch (err) {
        window?.GAS?.log?.w?.('[NPC INDEX] Failed to index NPC entry; skipping', { entry, err });
      }
    }));
    // Yield to the event loop between batches
    await new Promise(r => setTimeout(r, 0));
    if (window?.GAS?.log?.d) {
      window.GAS.log.d('[NPC INDEX] Batch progress', {
        processed: Math.min(i + batch.length, entries.length),
        total: entries.length,
        currentIndexSize: index.length
      });
    }
  }

  window?.GAS?.log?.i?.('[NPC INDEX] Build complete', {
    indexSize: index.length,
    durationMs: Date.now() - startedAt
  });
  
  // Deduplicate items to prevent showing the same feature multiple times
  const deduplicatedIndex = deduplicateItems(index);
  
  return deduplicatedIndex;
}

/**
 * Initializes the NPC feature index if not present. Stores result in localStorage.
 * Non-blocking: fires and forgets, logs completion.
 */
export function initializeNpcFeatureIndex() {
  // If already cached, do nothing
  const cached = getNpcFeatureIndex();
  if (cached && Array.isArray(cached.index) && cached.index.length > 0) {
    window?.GAS?.log?.i?.('[NPC INDEX] Using cached index', {
      version: cached.version,
      builtAt: cached.builtAt,
      size: Array.isArray(cached.index) ? cached.index.length : 0
    });
    return;
  }
  if (cached && Array.isArray(cached.index) && cached.index.length === 0) {
    window?.GAS?.log?.w?.('[NPC INDEX] Cached index exists but is empty; rebuilding now.');
  }

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
      window.GAS?.log?.g?.('[NPC INDEX] Stored NPC feature index', {
        version: payload.version,
        builtAt: payload.builtAt,
        size: payload.index?.length || 0
      });
    } catch (err) {
      window.GAS?.log?.e?.('[NPC INDEX] Failed to build NPC feature index', err);
    }
  })();
}


