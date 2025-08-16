<script>
  import { getContext, onMount, onDestroy } from "svelte";
  import IconSearchSelect from "~/src/components/atoms/select/IconSearchSelect.svelte";
  import StandardTabLayout from "~/src/components/organisms/StandardTabLayout.svelte";
  import FeatureItemList from "~/src/components/molecules/dnd5e/NPC/FeatureItemList.svelte";
  import { MODULE_ID } from "~/src/helpers/constants";
  // itemsFromActor is provided by context from NPCAppShell
  import { updateSource } from "~/src/helpers/Utility";
  import { getNPCWorkflowFSM, NPC_WORKFLOW_EVENTS } from "~/src/helpers/NPC/WorkflowStateMachine";

  const actor = getContext("#doc");
  const npcWorkflowFSM = getContext("#npcWorkflowFSM");

  let options = [];
  let active = null;
  let value = null;
  let placeHolder = "Add a Feature...";
  let rightPanelItems = [];

  const INDEX_KEY = `${MODULE_ID}-npc-feature-index-v1`;

  function replaceActorName(html, actorName) {
    try {
      if (!html || !actorName) return html || '';
      return html.replace(/@name\b/gi, actorName);
    } catch (_) {
      return html;
    }
  }

  function loadIndexOptions() {
    try {
      const raw = localStorage.getItem(INDEX_KEY);
      console.log('[NPC Features] loadIndexOptions - localStorage raw data exists:', !!raw);
      
      if (!raw) {
        console.log('[NPC Features] loadIndexOptions - No localStorage data found');
        return [];
      }
      
      const payload = JSON.parse(raw);
      console.log('[NPC Features] loadIndexOptions - Parsed payload:', {
        version: payload.version,
        builtAt: payload.builtAt,
        indexLength: payload.index?.length || 0
      });
      
      const idx = payload?.index || [];
      console.log('[NPC Features] loadIndexOptions - Index array length:', idx.length);
      
      // Log the loaded index data to show descriptions are available
      if (window?.GAS?.log?.d) {
        window.GAS.log.d('[NPC Features] Loaded index from localStorage', {
          totalItems: idx.length,
          sampleItems: idx.slice(0, 3).map(item => ({
            name: item.name,
            hasDescription: !!item.description,
            descriptionLength: item.description?.length || 0,
            descriptionPreview: item.description?.substring(0, 100) || 'N/A',
            hasEnrichedLabel: !!item.enrichedLabel
          })),
          descriptionStats: {
            itemsWithDescription: idx.filter(item => item.description && item.description.length > 0).length,
            totalDescriptionLength: idx.reduce((sum, item) => sum + (item.description?.length || 0), 0),
            averageDescriptionLength: idx.length > 0 ? idx.reduce((sum, item) => sum + (item.description?.length || 0), 0) / idx.length : 0
          }
        });
      }
      
      // The index now contains pre-enriched data, so we can use it directly
      const flattened = idx.map(item => {
        if (item?.uuid && item?.name) {
          // Use the pre-enriched label from the index
          const enrichedLabel = item.enrichedLabel || item.name;
          
          // Create a tooltip or additional info from description if available
          const description = item.description || '';
          const hasDescription = description.length > 0;
          
          return { 
            label: enrichedLabel, 
            value: item.uuid, 
            img: item.img,
            uuid: item.uuid,
            description: description,
            hasDescription: hasDescription,
            // Store the enriched data for the IconSearchSelect
            enrichedLabel: enrichedLabel
          };
        }
        return null;
      }).filter(Boolean); // Remove any null entries
      
      console.log('[NPC Features] loadIndexOptions - Flattened options length:', flattened.length);
      console.log('[NPC Features] loadIndexOptions - Sample flattened options:', flattened.slice(0, 3));
      
      // Log the final flattened options
      if (window?.GAS?.log?.d) {
        window.GAS.log.d('[NPC Features] Flattened options ready', {
          totalOptions: flattened.length,
          optionsWithDescription: flattened.filter(opt => opt.hasDescription).length,
          optionsWithEnrichedLabel: flattened.filter(opt => opt.enrichedLabel).length,
          sampleOptions: flattened.slice(0, 3).map(opt => ({
            name: opt.label,
            hasDescription: opt.hasDescription,
            descriptionLength: opt.description?.length || 0,
            hasEnrichedLabel: !!opt.enrichedLabel
          }))
        });
      }
      
      return flattened;
    } catch (err) {
      console.error('[NPC Features] loadIndexOptions - Error:', err);
      return [];
    }
  }

  function getItemSourcesFromActor(doc) {
    try {
      const itemsCollection = doc?.items;
      if (!itemsCollection) return [];
      const list = Array.isArray(itemsCollection)
        ? itemsCollection
        : (itemsCollection.contents || Array.from(itemsCollection));
      return list.map((itemDoc) => itemDoc?.toObject ? itemDoc.toObject() : itemDoc);
    } catch (_) {
      return [];
    }
  }

  // For DnD5e v3, actors maintain a sourcedItems map keyed by compendium UUIDs.
  // Use it to backfill our module flag on embedded item documents so flags are present at runtime.
  async function backfillModuleFlagsFromSourcedItems(doc) {
    try {
      const map = doc?.sourcedItems;
      if (!map || typeof map.entries !== 'function') return;
      for (const [sourceKey, itemDoc] of map.entries()) {
        try {
          const hasFlag = await itemDoc?.getFlag?.(MODULE_ID, 'sourceUuid');
          if (!hasFlag && sourceKey) {
            await itemDoc.setFlag?.(MODULE_ID, 'sourceUuid', sourceKey);
            await itemDoc.setFlag?.(MODULE_ID, 'sourceId', sourceKey);
          }
        } catch (_) {}
      }
    } catch (_) {}
  }

  // Attempt to recover the original compendium/source UUID from an in-memory item
  function getSourceUuidFromItem(it) {
    try {
      const flags = it?.flags || {};
      const fromModule = flags?.[MODULE_ID]?.sourceUuid || flags?.[MODULE_ID]?.sourceId;
      const fromCore = flags?.core?.sourceId;
      const fromSystem = it?.system?.sourceId; // some systems store sourceId on system
      const direct = it?.uuid;
      return fromModule || fromCore || fromSystem || direct || null;
    } catch (_) {
      return null;
    }
  }

  async function refreshRightPanelFromActor(doc) {
    try {
      await backfillModuleFlagsFromSourcedItems(doc);
      const items = getItemSourcesFromActor(doc);
      try {
        window.GAS?.log?.g?.('[NPC Features] refreshRightPanelFromActor: raw actor items', {
          actorUuid: doc?.uuid,
          actorName: doc?.name,
          count: (items || []).length,
          sample: (items || []).slice(0, 5).map((it) => ({ _id: it?._id, id: it?.id, uuid: it?.uuid, name: it?.name, link: it?.link }))
        });
      } catch (_) {}
      const parentUuid = doc?.uuid;
      const baseItems = (items || []).map((it) => {
        const itemId = it?._id || it?.id;
        const sourceUuid = getSourceUuidFromItem(it);
        // If the embedded Item document exists but is missing our module flag, set it now
        try {
          if (itemId && sourceUuid && doc?.items) {
            const embedded = doc.items.get?.(itemId);
            if (embedded && !embedded.getFlag?.(MODULE_ID, 'sourceUuid')) {
              embedded.setFlag(MODULE_ID, 'sourceUuid', sourceUuid);
            }
          }
        } catch (_) {}
        // Prefer compendium/source UUID if available; otherwise fall back to embedded
        const embeddedUuid = itemId ? (parentUuid ? `${parentUuid}.Item.${itemId}` : `Item.${itemId}`) : null;
        const chosenUuid = sourceUuid || embeddedUuid;
        const link = chosenUuid ? `@UUID[${chosenUuid}]{${it?.name}}` : (it?.link || it?.name);
        return {
          img: it?.img,
          name: it?.name,
          link,
          uuid: chosenUuid,
          sourceUuid
        };
      });
      // Prefetch compendium items (best-effort)
      try {
        const fromUuidFn = globalThis?.fromUuid || window?.fromUuid || globalThis?.foundry?.utils?.fromUuid;
        if (fromUuidFn) {
          const withSources = await Promise.all(baseItems.map(async (bi) => {
            if (!bi?.sourceUuid) return bi;
            try {
              const srcDoc = await fromUuidFn(bi.sourceUuid);
              return { ...bi, source: srcDoc };
            } catch (_) {
              return bi;
            }
          }));
          rightPanelItems = withSources;
        } else {
          rightPanelItems = baseItems;
        }
      } catch (_) {
        rightPanelItems = baseItems;
      }
      try {
        window.GAS?.log?.g?.('[NPC Features] refreshRightPanelFromActor: mapped rightPanelItems', {
          count: (rightPanelItems || []).length,
          sample: (rightPanelItems || []).slice(0, 5)
        });
      } catch (_) {}
    } catch (_) {
      rightPanelItems = [];
    }
  }

  // Function to check if features are complete and trigger progression
  function checkFeaturesComplete() {
    try {
      const items = getItemSourcesFromActor($actor);
      const hasFeatures = items && items.length > 0;
      
      // Don't automatically trigger progression - let the user control when to advance
      // The footer button will handle the transition to the next tab
      window.GAS.log.d('[NPC Features] Features updated - user can now click button to proceed');
    } catch (err) {
      window.GAS?.log?.e?.('[NPC Features] Failed to check features completion', err);
    }
  }

  async function selectFeatureHandler(uuid) {
    try {
      const item = await fromUuid(uuid);
      if (!item) return;
      const data = game.items.fromCompendium(item);
      if (data && data._id) delete data._id; // ensure fresh id
      // Persist the original compendium UUID under our module namespace
      try {
        const srcUuid = item?.uuid || uuid;
        const fu = (globalThis?.foundry && globalThis.foundry.utils) ? globalThis.foundry.utils : undefined;
        if (fu?.setProperty) {
          fu.setProperty(data, `flags.${MODULE_ID}.sourceUuid`, srcUuid);
          fu.setProperty(data, `flags.${MODULE_ID}.sourceId`, srcUuid);
        } else {
          const existingFlags = data.flags && typeof data.flags === 'object' ? data.flags : {};
          const moduleFlags = existingFlags[MODULE_ID] && typeof existingFlags[MODULE_ID] === 'object' ? existingFlags[MODULE_ID] : {};
          data.flags = {
            ...existingFlags,
            [MODULE_ID]: {
              ...moduleFlags,
              sourceUuid: srcUuid,
              sourceId: srcUuid
            }
          };
        }
      } catch (_) {}
      try {
        window.GAS?.log?.g?.('[NPC Features] selectFeatureHandler: compendium item and prepared data', {
          selectedUuid: uuid,
          compendiumItem: { uuid: item?.uuid, name: item?.name, id: item?.id, _id: item?._id },
          prepared: { name: data?.name, hasId: Boolean(data?._id), hasFlags: Boolean(data?.flags), moduleFlag: data?.flags?.[MODULE_ID]?.sourceUuid, coreSourceId: data?.flags?.core?.sourceId }
        });
      } catch (_) {}

      const items = getItemSourcesFromActor($actor);
      items.push(data);
      
      // Capture existing item ids before source update
      const preIds = new Set(($actor?.items || []).map((i) => i.id));
      
      // Use updateSource utility function instead of direct updateSource
      await updateSource($actor, { items });
      
      // Poll for the new embedded item to appear, then set flags on the document itself
      try {
        const created = await new Promise((resolve) => {
          const maxAttempts = 20;
          let attempts = 0;
          const interval = setInterval(() => {
            try {
              const candidates = ($actor?.items || []).filter((i) => !preIds.has(i.id) && i?.name === data?.name && i?.type === data?.type);
              if (candidates && candidates.length > 0) {
                clearInterval(interval);
                resolve(candidates[0]);
              } else if (++attempts >= maxAttempts) {
                clearInterval(interval);
                resolve(null);
              }
            } catch (_) {
              clearInterval(interval);
              resolve(null);
            }
          }, 100);
        });
        if (created) {
          const src = item?.uuid || uuid;
          await created.setFlag(MODULE_ID, 'sourceUuid', src);
          await created.setFlag(MODULE_ID, 'sourceId', src);
        }
      } catch (_) {}
      
      // Clear the autocomplete selection
      value = null;
      active = null;
      
      // Check if features are complete after adding
      checkFeaturesComplete();
      
      // subscriber will refresh panel
    } catch (err) {
      window.GAS?.log?.e?.('[NPC Features] Failed adding feature', err);
    }
  };


  function removeFeatureAt(index) {
    try {
      const items = getItemSourcesFromActor($actor);
      if (index < 0 || index >= items.length) return;
      items.splice(index, 1);
      updateSource($actor, { items });
      $actor = $actor;
    } catch (err) {
      window.GAS?.log?.e?.('[NPC Features] Failed removing feature', err);
    }
  }

  function handleRemoveClick(event) {
    try {
      const idxAttr = event?.currentTarget?.dataset?.index;
      const idx = Number(idxAttr);
      if (Number.isFinite(idx)) removeFeatureAt(idx);
    } catch (_) {}
  }




  let unsubscribe;
  onMount(async () => {
    options = loadIndexOptions();
    
    // Debug: Check what we loaded
    console.log('[NPC Features] onMount - options loaded:', options);
    console.log('[NPC Features] onMount - options length:', options.length);
    
    // If options are empty, try to rebuild the index
    if (!options || options.length === 0) {
      console.log('[NPC Features] onMount - No options found, attempting to rebuild index...');
      try {
        // Import and call the rebuild function
        const { buildNpcFeatureIndex } = await import('~/src/hooks/npcIndex.js');
        console.log('[NPC Features] onMount - buildNpcFeatureIndex imported, calling...');
        const newIndex = await buildNpcFeatureIndex();
        console.log('[NPC Features] onMount - Index rebuild result:', {
          success: !!newIndex,
          length: newIndex?.length || 0
        });
        
        // Reload options after rebuild
        if (newIndex && newIndex.length > 0) {
          options = loadIndexOptions();
          console.log('[NPC Features] onMount - Options reloaded after rebuild:', options.length);
        }
      } catch (err) {
        console.error('[NPC Features] onMount - Failed to rebuild index:', err);
      }
    }
    
    // Debug: Check localStorage directly
    try {
      const raw = localStorage.getItem(INDEX_KEY);
      console.log('[NPC Features] onMount - localStorage raw data exists:', !!raw);
      if (raw) {
        const payload = JSON.parse(raw);
        console.log('[NPC Features] onMount - localStorage payload:', {
          version: payload.version,
          builtAt: payload.builtAt,
          indexLength: payload.index?.length || 0,
          sampleIndex: payload.index?.slice(0, 3) || []
        });
      }
    } catch (err) {
      console.error('[NPC Features] onMount - localStorage parse error:', err);
    }
    
    // Subscribe to actor changes so the right panel reflects current in-memory items
    try {
      unsubscribe = actor.subscribe(async (doc) => {
        try { window.GAS?.log?.g?.('[NPC Features] actor.subscribe triggered', { actorUuid: doc?.uuid, name: doc?.name }); } catch (_) {}
        await refreshRightPanelFromActor(doc);
      });
    } catch (_) {}
    
    window.GAS.log.d('actor', $actor);
  });
  onDestroy(() => { 
    try { 
      if (unsubscribe) unsubscribe(); 
    } catch (_) {} 
  });
</script>

<template lang="pug">
StandardTabLayout(title="NPC Features" showTitle="true" tabName="npc-features")
  div(slot="left")
    .flexrow
      .flex3
        IconSearchSelect.icon-select(
          {active} 
          {placeHolder} 
          options="{options}"
          handler!="{selectFeatureHandler}" 
          id="npc-feature-select" 
          bind:value
          enableEnrichment="{true}"
        )
      .flex0
        button.debug-button(
          type="button"
          on:click!="{async () => { console.log('Manual rebuild clicked'); try { const { buildNpcFeatureIndex } = await import('~/src/hooks/npcIndex.js'); const result = await buildNpcFeatureIndex(); console.log('Manual rebuild result:', result); options = loadIndexOptions(); } catch (err) { console.error('Manual rebuild failed:', err); } }}"
          title="Debug: Rebuild NPC Index"
        ) 🔄
  
  div(slot="right")
    FeatureItemList(trashable="{true}")
</template>

<style lang="sass" scoped>
.icon-button
  background: var(--dnd5e-background-10)
  border: 1px solid var(--color-border-highlight)
  border-radius: 4px
  cursor: pointer
  padding: 4px 8px
  &:hover
    background: var(--dnd5e-background-20)

.mt-xxs
  margin-top: 0.25rem

.hint
  color: var(--color-text-dark-secondary)
  font-style: italic

.debug-button
  background: #ff6b6b
  color: white
  border: none
  border-radius: 4px
  padding: 4px 8px
  cursor: pointer
  font-size: 12px
  margin-left: 8px
  
  &:hover
    background: #ff5252
</style>

