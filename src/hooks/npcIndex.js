import { MODULE_ID } from '~/src/helpers/constants';
import { getPacksFromSettings, extractItemsFromPacksSync } from '~/src/helpers/Utility';
import { startNpcIndexLoading, stopNpcIndexLoading } from '~/src/stores/npcIndexLoading.js';

const LOCAL_STORAGE_KEY = `${MODULE_ID}-npc-feature-index-v1`;

/**
 * Returns the cached NPC feature index from localStorage, or null if missing.
 */
export function getNpcFeatureIndex() {
  try {
    console.log('[NPC INDEX] getNpcFeatureIndex called, key:', LOCAL_STORAGE_KEY);
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    console.log('[NPC INDEX] localStorage.getItem result:', {
      hasRaw: !!raw,
      rawLength: raw?.length || 0,
      rawPreview: raw ? `${String(raw).slice(0, 120)}…` : null
    });
    
    if (window?.GAS?.log?.d) {
      window.GAS.log.d('[NPC INDEX] Read from localStorage', {
        key: LOCAL_STORAGE_KEY,
        hasValue: !!raw,
        preview: raw ? `${String(raw).slice(0, 120)}…` : null
      });
    }
    if (!raw) {
      console.log('[NPC INDEX] No localStorage data found');
      return null;
    }
    
    const parsed = JSON.parse(raw);
    console.log('[NPC INDEX] Parsed result:', {
      hasVersion: !!parsed.version,
      hasBuiltAt: !!parsed.builtAt,
      hasIndex: !!parsed.index,
      indexLength: parsed.index?.length || 0,
      indexType: typeof parsed.index
    });
    
    return parsed;
  } catch (err) {
    console.error('[NPC INDEX] getNpcFeatureIndex error:', err);
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
  let totalItems = 0;
  let duplicateCount = 0;
  
  for (const npcEntry of index) {
    const deduplicatedItems = [];
    
    for (const item of npcEntry.items) {
      totalItems++;
      // Create a content hash based on item properties that would indicate duplicate content
      // We'll use a simple hash of the item data to detect duplicates
      const contentHash = createItemHash(item);
      const key = `${item.name}|${contentHash}`;
      
      if (window?.GAS?.log?.v) {
        window.GAS.log.v('[NPC INDEX] Processing item', { 
          name: item.name, 
          uuid: item.uuid, 
          npc_uuid: npcEntry.npc_uuid,
          contentHash,
          key,
          hasDescription: !!(item.description),
          descriptionLength: item.description?.length || 0,
          descriptionPreview: item.description?.substring(0, 50) || 'N/A'
        });
      }
      
      if (!seenItems.has(key)) {
        // First time seeing this item, add it
        seenItems.set(key, { uuid: item.uuid, npc_uuid: npcEntry.npc_uuid });
        deduplicatedItems.push(item);
        
        if (window?.GAS?.log?.v) {
          window.GAS.log.v('[NPC INDEX] Added unique item', { 
            name: item.name, 
            uuid: item.uuid, 
            npc_uuid: npcEntry.npc_uuid,
            descriptionLength: item.description?.length || 0
          });
        }
      } else {
        // Duplicate item found, log it
        duplicateCount++;
        const existing = seenItems.get(key);
        if (window?.GAS?.log?.d) {
          window.GAS.log.d('[NPC INDEX] Skipped duplicate item', { 
            name: item.name, 
            uuid: item.uuid, 
            npc_uuid: npcEntry.npc_uuid,
            existingUuid: existing.uuid,
            existingNpcUuid: existing.npc_uuid,
            contentHash,
            key,
            currentDescriptionLength: item.description?.length || 0,
            existingDescriptionLength: 'N/A' // We don't store description in seenItems map
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
      totalOriginalItems: totalItems,
      totalDeduplicatedItems: deduplicatedIndex.reduce((sum, npc) => sum + npc.items.length, 0),
      duplicatesFound: duplicateCount,
      uniqueItems: totalItems - duplicateCount
    });
  }
  
  return deduplicatedIndex;
}

/**
 * Sorts all items alphabetically by name for easier navigation
 */
function sortItemsAlphabetically(index) {
  // Flatten all items from all NPCs into a single array
  const allItems = [];
  for (const npcEntry of index) {
    for (const item of npcEntry.items) {
      allItems.push({
        ...item,
        npc_uuid: npcEntry.npc_uuid
      });
    }
  }
  
  // Sort alphabetically by name (case-insensitive)
  allItems.sort((a, b) => {
    const nameA = (a.name || '').toLowerCase();
    const nameB = (b.name || '').toLowerCase();
    return nameA.localeCompare(nameB);
  });
  
  if (window?.GAS?.log?.i) {
    window.GAS.log.i('[NPC INDEX] Alphabetical sorting complete', {
      totalItems: allItems.length,
      sampleItems: allItems.slice(0, 5).map(item => ({ 
        name: item.name, 
        hasDescription: !!item.description,
        descriptionLength: item.description?.length || 0,
        descriptionPreview: item.description?.substring(0, 80) || 'N/A'
      })),
      descriptionStats: {
        totalItems: allItems.length,
        itemsWithDescription: allItems.filter(item => item.description && item.description.length > 0).length,
        averageDescriptionLength: allItems.reduce((sum, item) => sum + (item.description?.length || 0), 0) / allItems.length
      }
    });
  }
  
  return allItems;
}

/**
 * Creates a hash of item content to detect duplicates
 */
function createItemHash(item) {
  window.GAS.log.p('createItemHash', item);
  // Create a hash based on item properties that indicate content similarity
  // Exclude uuid since it's always unique and would prevent duplicate detection
  // Exclude img since it's just a visual representation and shouldn't affect duplicate detection
  // Include description to better detect duplicate content
  const contentString = `${item.name}|${item.description || ''}`;
  
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
  startNpcIndexLoading();
  const startedAt = Date.now();
  
  try {
    const packs = getPacksFromSettings('npcs');
    // if (window?.GAS?.log?.i) {
    //   window.GAS.log.i('[NPC INDEX] Starting build');
    //   window.GAS.log.d('[NPC INDEX] Packs from settings',
    //     (packs || []).map(p => ({ id: p?.metadata?.id, label: p?.metadata?.label, type: p?.metadata?.type }))
    //   );
    // }
    if (!packs || packs.length === 0) {
      // window?.GAS?.log?.w?.('[NPC INDEX] No NPC packs configured. Aborting build.');
      return [];
    }

    // Get enhanced index with additional fields including system.description
    const enhancedEntries = [];
    for (const pack of packs) {
      try {
        // Get the default index first
        const defaultIndex = pack.index;
        if (!defaultIndex) {
          // window?.GAS?.log?.w?.('[NPC INDEX] Pack has no default index', pack.metadata?.name);
          continue;
        }

        // Get enhanced index with additional fields
        const enhancedIndex = await pack.getIndex({ 
          fields: ['system.description'] 
        });
        
        if (!enhancedIndex) {
          // window?.GAS?.log?.w?.('[NPC INDEX] Failed to get enhanced index for pack', pack.metadata?.name);
          continue;
        }

        // window?.GAS?.log?.d?.('[NPC INDEX] Enhanced index retrieved', {
        //   packName: pack.metadata?.name,
        //   enhancedIndexSize: enhancedIndex.size,
        //   hasSystemField: enhancedIndex.size > 0 && Object.keys(enhancedIndex.entries().next().value?.[1] || {}).some(key => key.startsWith('system'))
        // });

        // Extract NPC entries with enhanced data
        const entries = enhancedIndex.entries();
        let npcCount = 0;
        let descriptionCount = 0;
        
        for (const [key, data] of entries) {
          if (data.type === 'npc') {
            npcCount++;
            const hasDescription = !!(data.system?.description?.value);
            if (hasDescription) descriptionCount++;
            
            // Log detailed information about the first few NPCs to show what we're getting
            if (npcCount <= 3) {
              // window?.GAS?.log?.d?.('[NPC INDEX] Sample NPC entry', {
              //   packName: pack.metadata?.name,
              //   npcName: data.name,
              //   npcUuid: data.uuid || key,
              //   hasSystemField: !!data.system,
              //   hasDescriptionField: !!data.system?.description,
              //   descriptionLength: data.system?.description?.value?.length || 0,
              //   descriptionPreview: data.system?.description?.value?.substring(0, 100) || 'N/A',
              //   rawSystemData: Object.keys(data.system || {}),
              //   fullDataKeys: Object.keys(data)
              // });
            }
            
            enhancedEntries.push({
              uuid: data.uuid || key,
              type: data.type,
              img: data.img,
              name: data.name,
              description: data.system?.description?.value || ''
            });
          }
        }
        
        // window?.GAS?.log?.i?.('[NPC INDEX] Pack processing complete', {
        //   packName: pack.metadata?.name,
        //   totalEntries: enhancedIndex.size,
        //   npcEntries: npcCount,
        //   npcsWithDescription: descriptionCount,
        //   descriptionPercentage: npcCount > 0 ? Math.round((descriptionCount / npcCount) * 100) : 0
        // });
        
      } catch (err) {
        window?.GAS?.log?.w?.('[NPC INDEX] Failed to get enhanced index for pack', { pack: pack.metadata?.name, err });
      }
    }

    // if (window?.GAS?.log?.d) {
    //   window.GAS.log.d('[NPC INDEX] Enhanced entry counts', {
    //     totalEnhancedEntries: enhancedEntries.length,
    //     sampleEntries: enhancedEntries.slice(0, 3).map(e => ({ name: e.name, hasDescription: !!e.description }))
    //   });
    // }

    const index = [];
    const batchSize = 5;

    for (let i = 0; i < enhancedEntries.length; i += batchSize) {
      const batch = enhancedEntries.slice(i, i + batchSize);
      await Promise.all(batch.map(async (entry) => {
        try {
          const actor = await fromUuid(entry.uuid);
          if (!actor) {
            // window?.GAS?.log?.w?.('[NPC INDEX] fromUuid returned null for entry', entry);
            return;
          }
          const items = [];
          try {
            const collection = actor.items;
            const arr = (collection && (collection.contents || Array.from(collection))) || [];
            for (const item of arr) {
              if (!item) continue;
              
              const itemDescription = item.system?.description?.value || '';
              const hasDescription = itemDescription.length > 0;
              
              // Log detailed information about the first few items to show what we're getting
              if (items.length < 3) {
                // window?.GAS?.log?.d?.('[NPC INDEX] Sample item from actor', {
                //   actorName: actor.name,
                //   itemName: item.name,
                //   itemType: item.type,
                //   itemUuid: item.uuid,
                //   hasSystemField: !!item.system,
                //   hasDescriptionField: !!item.system?.description,
                //   descriptionLength: itemDescription.length,
                //   descriptionPreview: itemDescription.substring(0, 100) || 'N/A',
                //   rawSystemData: Object.keys(item.system || {}),
                //   fullItemKeys: Object.keys(item)
                // });
              }
              
              items.push({ 
                name: item.name, 
                uuid: item.uuid, 
                img: item.img,
                description: itemDescription
              });
            }
          } catch (_) {}
          index.push({ npc_uuid: entry.uuid, items });
          // if (window?.GAS?.log?.v) {
          //   window.GAS.log.v('[NPC INDEX] Indexed NPC', {
          //     npcUuid: entry.uuid,
          //     itemCount: items.length
          //   });
          // }
        } catch (err) {
          window?.GAS?.log?.w?.('[NPC INDEX] Failed to index NPC entry; skipping', { entry, err });
        }
      }));
      // Yield to the event loop between batches
      await new Promise(r => setTimeout(r, 0));
      // if (window?.GAS?.log?.d) {
        // window.GAS.log.d('[NPC INDEX] Batch progress', {
        //   processed: Math.min(i + batch.length, enhancedEntries.length),
        //   total: enhancedEntries.length,
        //   currentIndexSize: index.length
        // });
      // }
    }

    // window?.GAS?.log?.i?.('[NPC INDEX] Build complete', {
    //   indexSize: index.length,
    //   durationMs: Date.now() - startedAt
    // });
    
    // Deduplicate items to prevent showing the same feature multiple times
    const deduplicatedIndex = deduplicateItems(index);
    
    // Sort items alphabetically for easier navigation
    const sortedItems = sortItemsAlphabetically(deduplicatedIndex);
    
    return sortedItems;
  } finally {
    stopNpcIndexLoading();
  }
}

/**
 * Initializes the NPC feature index if not present. Stores result in localStorage.
 * Non-blocking: fires and forgets, logs completion.
 */
export function initializeNpcFeatureIndex() {
  console.log('[NPC INDEX] initializeNpcFeatureIndex called');
  
  // If already cached, do nothing
  const cached = getNpcFeatureIndex();
  console.log('[NPC INDEX] Cached index check:', {
    hasCached: !!cached,
    isArray: Array.isArray(cached?.index),
    cachedLength: cached?.index?.length || 0
  });
  
  if (cached && Array.isArray(cached.index) && cached.index.length > 0) {
    console.log('[NPC INDEX] Using cached index, length:', cached.index.length);
    window?.GAS?.log?.i?.('[NPC INDEX] Using cached index', {
      version: cached.version,
      builtAt: cached.builtAt,
      size: Array.isArray(cached.index) ? cached.index.length : 0
    });
    return;
  }
  if (cached && Array.isArray(cached.index) && cached.index.length === 0) {
    console.log('[NPC INDEX] Cached index exists but is empty; rebuilding now.');
    window?.GAS?.log?.w?.('[NPC INDEX] Cached index exists but is empty; rebuilding now.');
  }

  console.log('[NPC INDEX] Starting async build...');
  
  // Fire-and-forget async build
  (async () => {
    try {
      startNpcIndexLoading();
      console.log('[NPC INDEX] Async build started');
      const index = await buildNpcFeatureIndex();
      console.log('[NPC INDEX] Async build completed, result length:', index?.length || 0);
      
      // Log detailed information about the final index before storing
      if (window?.GAS?.log?.d) {
        window.GAS.log.d('[NPC INDEX] Final index before storage', {
          totalItems: index.length,
          sampleItems: index.slice(0, 3).map(item => ({
            name: item.name,
            hasDescription: !!item.description,
            descriptionLength: item.description?.length || 0,
            descriptionPreview: item.description?.substring(0, 100) || 'N/A'
          })),
          descriptionStats: {
            itemsWithDescription: index.filter(item => item.description && item.description.length > 0).length,
            totalDescriptionLength: index.reduce((sum, item) => sum + (item.description?.length || 0), 0),
            averageDescriptionLength: index.length > 0 ? index.reduce((sum, item) => sum + (item.description?.length || 0), 0) / index.length : 0
          }
        });
      }
      
      const payload = {
        version: 1,
        builtAt: Date.now(),
        index,
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(payload));
      console.log('[NPC INDEX] Index stored in localStorage, key:', LOCAL_STORAGE_KEY);
      window.GAS?.log?.g?.('[NPC INDEX] Stored NPC feature index', {
        version: payload.version,
        builtAt: payload.builtAt,
        size: payload.index?.length || 0,
        storageSize: JSON.stringify(payload).length,
        descriptionStats: {
          itemsWithDescription: payload.index.filter(item => item.description && item.description.length > 0).length,
          totalDescriptionLength: payload.index.reduce((sum, item) => sum + (item.description?.length || 0), 0)
        }
      });
    } catch (err) {
      console.error('[NPC INDEX] Async build failed:', err);
      window.GAS?.log?.e?.('[NPC INDEX] Async build failed', err);
    } finally {
      stopNpcIndexLoading();
    }
  })();
}


