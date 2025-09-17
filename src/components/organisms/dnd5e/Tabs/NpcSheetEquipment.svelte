<script>
  import { getContext, onDestroy } from 'svelte';
  import { getItemsArray } from "~/src/helpers/Utility";
  import FeatureItemList from "~/src/components/molecules/dnd5e/NPC/FeatureItemList.svelte";
  import { MODULE_ID } from '~/src/helpers/constants';

  const documentStore = getContext('#doc');
  const editStore = getContext('#editStore');
  $: npc = $documentStore;
  $: items = getItemsArray(npc?.items).filter(i => ['weapon','armor','equipment','consumable','tool','backpack','loot'].includes(i?.type));

  let isEditing = false;
  const unsub = editStore?.subscribe?.((v) => isEditing = !!v);
  onDestroy(() => { try { unsub?.(); } catch(_){} });

  // Open an item's sheet for editing from the equipment list when in sheet edit mode
  async function openFeatureEditor(item, event) {
    try {
      if (event && typeof event.stopPropagation === 'function') event.stopPropagation();
      // If it's a live embedded Item document, open its sheet
      if (item?.sheet && typeof item.sheet.render === 'function') {
        await item.sheet.render(true);
        return;
      }
      // Try to resolve embedded item by id/_id on the npc document
      const id = item?._id || item?.id;
      if (id && npc?.items) {
        const found = npc.items.find(i => (i.id === id || i._id === id));
        if (found && found.sheet) { await found.sheet.render(true); return; }
      }
      // Fallback: try fromUuid/source flags
      const uuid = item?.uuid || item?.flags?.core?.sourceId || item?.flags?.[MODULE_ID]?.sourceUuid;
      if (uuid) {
        try {
          const resolved = await fromUuid(uuid);
          if (resolved && resolved.sheet) { await resolved.sheet.render(true); return; }
        } catch (_) {}
      }
      ui.notifications?.warn?.('Unable to open equipment editor from sheet');
    } catch (err) {
      console.error('[NpcSheetEquipment] openFeatureEditor failed', err);
      ui.notifications?.error?.('Unable to open equipment editor');
    }
  }
</script>

<template lang="pug">
  section
    +if("!items || items.length === 0")
      p (no equipment)
    +if("items && items.length > 0")
      // Use the reusable FeatureItemList to render equipment with images, actions and trash buttons
      // When in sheet edit mode, enable the edit extraAction so users can open the item sheet
      FeatureItemList(items="{items}" showActions="{true}" trashable="{isEditing}" showImage="{true}" extraAction="{isEditing ? openFeatureEditor : null}" extraActionIcon="{'fas fa-edit'}" extraActionTitle="{'Edit Item'}")
</template>

<style lang="sass">
section
  padding: .25rem
</style>
