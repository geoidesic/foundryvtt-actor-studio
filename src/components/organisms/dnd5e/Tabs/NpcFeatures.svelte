<script>
  import { getContext, onMount, onDestroy } from "svelte";
  import IconSearchSelect from "~/src/components/atoms/select/IconSearchSelect.svelte";
  import StandardTabLayout from "~/src/components/organisms/StandardTabLayout.svelte";
  import FeatureItemList from "~/src/components/molecules/dnd5e/NPC/FeatureItemList.svelte";
  import { MODULE_ID } from "~/src/helpers/constants";
  import { enrichHTML } from "~/src/helpers/Utility";

  const actor = getContext("#doc");

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
      if (!raw) return [];
      const payload = JSON.parse(raw);
      const idx = payload?.index || [];
      // Flatten into simple options; allow duplicates by uuid
      const flattened = [];
      for (const row of idx) {
        const list = row?.items || [];
        for (const it of list) {
          if (it?.uuid && it?.name) {
            flattened.push({ label: it.name, value: it.uuid });
          }
        }
      }
      return flattened;
    } catch (_) {
      return [];
    }
  }

  function getItemSourcesFromActor(doc) {
    try {
      const src = doc?.toObject?.();
      if (!src) return [];
      return Array.isArray(src.items) ? src.items : [];
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

  const selectFeatureHandler = async (uuid) => {
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
      $actor.updateSource({ items });
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
      value = uuid;
      active = uuid;
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
      $actor.updateSource({ items });
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

  // Async helpers used with +await for enrichment (ensures parity with tab 1 rendering)
  async function enrichNameInline(name, uuid, doc) {
    try {
      const inline = uuid ? `@UUID[${uuid}]{${name}}` : name;
      const rollData = typeof doc?.getRollData === 'function' ? doc.getRollData() : {};
      const html = await enrichHTML(inline, { async: true, rollData, relativeTo: doc });
      return replaceActorName(html, doc?.name);
    } catch (_) {
      return name;
    }
  }
  async function enrichTextWithActor(raw, doc) {
    try {
      const rollData = typeof doc?.getRollData === 'function' ? doc.getRollData() : {};
      const html = await enrichHTML(raw || '', { async: true, rollData, relativeTo: doc });
      return replaceActorName(html, doc?.name);
    } catch (_) {
      return raw || '';
    }
  }

  let unsubscribe;
  onMount(async () => {
    options = loadIndexOptions();
    // Subscribe to actor changes so the right panel reflects current in-memory items
    try {
      unsubscribe = actor.subscribe(async (doc) => {
        try { window.GAS?.log?.g?.('[NPC Features] actor.subscribe triggered', { actorUuid: doc?.uuid, name: doc?.name }); } catch (_) {}
        await refreshRightPanelFromActor(doc);
      });
    } catch (_) {}
  });
  onDestroy(() => { try { if (unsubscribe) unsubscribe(); } catch (_) {} });
</script>

<template lang="pug">
StandardTabLayout(title="NPC Features" showTitle="true" tabName="npc-features")
  div(slot="left")
    .flexrow
      .flex3
        IconSearchSelect.icon-select({options} {active} {placeHolder} handler="{selectFeatureHandler}" id="npc-feature-select" bind:value)
  div(slot="right")
    +if("rightPanelItems?.length")
      FeatureItemList(items="{rightPanelItems}")
    +if("!rightPanelItems?.length")
      .hint No features added yet.
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
  

  
</style>

