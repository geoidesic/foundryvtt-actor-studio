<script>
  import { getContext } from "svelte";
  import StandardTabLayout from "~/src/components/organisms/StandardTabLayout.svelte";
  import FeatureItemList from "~/src/components/molecules/dnd5e/NPC/FeatureItemList.svelte";
  import NPCStatBlock from "~/src/components/molecules/dnd5e/NPC/NPCStatBlock.svelte";
  import CRAdjuster from "~/src/components/molecules/dnd5e/NPC/CRAdjuster.svelte";
  import { updateSource, getItemSourcesFromActor } from "~/src/helpers/Utility";
  import { MODULE_ID } from "~/src/helpers/constants";

  const actor = getContext("#doc");
  
  // Handle CR adjustment events
  function handleCRAdjusted(event) {
    console.log('CR adjusted:', event.detail);
    // The CR adjuster will have already updated the actor
    // We can add additional logic here if needed
  }

  // Open an item's sheet for editing from the feature list
  // Accepts either an embedded Item Document or a raw data object that may contain a uuid
  async function openFeatureEditor(item, event) {
    // Diagnostic: log incoming item metadata to determine whether it's an embedded doc or a snapshot
    try {
      const q = window?.GAS?.log?.q || console.dir || (() => {});
      q({ incoming: {
        name: item?.name,
        uuid: item?.uuid || item?._source?.uuid || null,
        id: item?._id || item?.id || null,
        hasSheet: !!item?.sheet,
        isEmbedded: !!item?.isEmbedded || !!(actor?.items?.get?.(item?._id || item?.id))
      }});
    } catch (_) {}
    try {
      if (event && typeof event.stopPropagation === 'function') event.stopPropagation();

      // If the caller passed a live embedded Item document, open its sheet directly.
      if (item?.sheet && typeof item.sheet.render === 'function') {
        await item.sheet.render(true);
        return;
      }

      // If passed a UUID or source link, try to prefer the actor's embedded item first.
      let resolved = null;
      const maybeUuid = item?.uuid || item?.flags?.[MODULE_ID]?.sourceUuid || item?.flags?.core?.sourceId || item?.system?.sourceId || null;

      // If the maybeUuid contains an Item id (e.g. Actor.<id>.Item.<itemId> or Compendium.xxx.Item.<itemId>),
      // extract that trailing itemId and try to resolve it directly from the actor's embedded items first.
      if (maybeUuid && typeof maybeUuid === 'string') {
        const match = maybeUuid.match(/(?:\.Item\.|\/Item\/|Item\.)([A-Za-z0-9]+)$/);
        const trailingId = match?.[1];
        if (trailingId && actor?.items) {
          // Try direct get by embedded id, then fallback to matching uuid suffix. Also try actor.items.contents if available.
          const direct = (actor.items.get?.(trailingId))
            || (actor.items.find?.(i => i?.uuid?.endsWith(`.Item.${trailingId}`)))
            || (actor.items?.contents && actor.items.contents.find?.(i => i?.id === trailingId || i?._id === trailingId));
          if (direct && direct.sheet) { await direct.sheet.render(true); return; }
        }

        // If the maybeUuid looks unprefixed (e.g. "Item.xxx"), try an actor-prefixed form
        try {
          if (/^Item\.[A-Za-z0-9]+$/.test(maybeUuid) && actor?.uuid) {
            const actorPrefixed = `${actor.uuid}.${maybeUuid}`;
            // Try to find the embedded doc by exact uuid
            const embeddedExact = actor.items?.find?.(i => i?.uuid === actorPrefixed);
            if (embeddedExact && embeddedExact.sheet) { await embeddedExact.sheet.render(true); return; }
            // Try resolving via fromUuid as a last resort
            try {
              const resolvedActorPref = await fromUuid(actorPrefixed);
              if (resolvedActorPref && resolvedActorPref?.sheet) { await resolvedActorPref.sheet.render(true); return; }
            } catch (_) {}
          }
        } catch (_) {}

        // If we couldn't locate an embedded item by trailing id, try fromUuid to resolve the document (compendium/world item)
        try { resolved = await fromUuid(maybeUuid); } catch (_) { resolved = null; }
        if (resolved && resolved?.sheet) {
          // If the resolved doc is embedded on our actor, open that; otherwise fall back to other lookup methods below.
          if (resolved.parent === actor) { await resolved.sheet.render(true); return; }
        }
      }

      // Try to find an embedded item on the actor by id/_id or by flags/name/type
      const id = item?._id || item?.id;
      if (id && actor?.items?.get) {
        const found = actor.items.get(id);
        if (found && found.sheet) { await found.sheet.render(true); return; }
      }

      const sourceUuid = maybeUuid;
      if (actor?.items && sourceUuid) {
        const bySrc = actor.items.find(i => (i.getFlag?.(MODULE_ID, 'sourceUuid') || i.flags?.core?.sourceId || i.system?.sourceId || i.uuid) === sourceUuid);
        if (bySrc) { await bySrc.sheet.render(true); return; }
      }

      // Fallback: match by name and type
      if (actor?.items && item?.name && item?.type) {
        const byName = actor.items.find(i => i.name === item.name && i.type === item.type);
        if (byName) { await byName.sheet.render(true); return; }
      }

      ui.notifications?.warn?.('Unable to locate embedded item to edit');
    } catch (err) {
      console.error('[NpcCreate] openFeatureEditor failed', err);
      ui.notifications?.error?.('Unable to open feature editor');
    }
  }
</script>

<template lang="pug">
StandardTabLayout(title="Create NPC" showTitle="true" tabName="npc-create")
  div(slot="right")
    FeatureItemList(trashable="{true}" uuidFromFlags="{true}"  dedupe="{true}" sort="{true}" extraAction="{openFeatureEditor}" extraActionIcon="{'fas fa-edit'}" extraActionTitle="{'Edit Feature'}")
  
  div(slot="left")
    // CR Adjustment Tool
    //- CRAdjuster(
    //-   actor="{$actor}"
    //-   readonly="{false}"
    //-   on:crAdjusted="{handleCRAdjusted}"
    //- )
    
    
    // NPC Stat Block
    NPCStatBlock(
      name="{$actor.name || 'Unnamed NPC'}"
      npc="{$actor}"
      readonly="{false}"
      enableCrCalculator="{true}"
    )
</template>

<style lang="sass" scoped>
// Add any specific styling here if needed
</style>
