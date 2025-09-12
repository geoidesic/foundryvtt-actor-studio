<script>
  import { getContext } from 'svelte';
  import FeatureItemList from "~/src/components/molecules/dnd5e/NPC/FeatureItemList.svelte";
  import { getItemsArray } from "~/src/helpers/Utility";
  const documentStore = getContext('#doc');
  const editStore = getContext('#editStore');
  $: npc = $documentStore;
  $: itemsArray = getItemsArray(npc?.items);
  let isEditing = false;
  const unsub = editStore?.subscribe?.((v) => isEditing = !!v);
  import { onDestroy } from 'svelte';
  onDestroy(() => { try { unsub?.(); } catch(_){} });

  // Open embedded item sheet from the NPC stat block when in sheet edit mode
  async function openFeatureEditor(item, event) {
    try {
      if (event && typeof event.stopPropagation === 'function') event.stopPropagation();
      // If already a live embedded document, open sheet
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
      ui.notifications?.warn?.('Unable to open feature editor from sheet');
    } catch (err) {
      console.error('[NpcSheetFeatures] openFeatureEditor failed', err);
      ui.notifications?.error?.('Unable to open feature editor');
    }
  }
</script>

<template lang="pug">
  section
    FeatureItemList(trashable="{isEditing}" items="{itemsArray}" dedupe="{true}" sort="{true}" showActions="{true}" hideSpellDuplicates="{true}" extraAction="{isEditing ? openFeatureEditor : null}" extraActionIcon="{'fas fa-edit'}" extraActionTitle="{'Edit Feature'}")
</template>

<style lang="sass">
section
  padding: .25rem
</style>
