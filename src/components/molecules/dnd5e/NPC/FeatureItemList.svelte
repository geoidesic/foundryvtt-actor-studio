<script>
  import { getContext } from "svelte";
  import { enrichHTML } from "~/src/helpers/Utility";
  import { MODULE_ID } from "~/src/helpers/constants";
  import { itemsFromActorStore } from "~/src/stores/index";

  // Items should be an array of objects with at least { img, name, link? }
  export let trashable = false;

  const actor = getContext("#doc");

  // Derive a best-effort UUID for enrichment from raw item source
  function getSourceUuidFromRaw(it, doc) {
    try {
      const flags = it?.flags || {};
      const fromModule = flags?.[MODULE_ID]?.sourceUuid;
      const fromCore = flags?.core?.sourceId;
      const fromSystem = it?.system?.sourceId;
      const direct = it?.uuid;
      const itemId = it?._id || it?.id;
      const parentUuid = doc?.uuid;
      const embedded = itemId ? (parentUuid ? `${parentUuid}.Item.${itemId}` : `Item.${itemId}`) : null;
      return fromModule || fromCore || fromSystem || direct || embedded || null;
    } catch (_) {
      return null;
    }
  }
  function handleTrash(index) {
    window.GAS.log.d(`Trash ${index}`);
    try {
      const src = $actor?.toObject?.();
      window.GAS.log.d('handleTrash src', src);
      if (!src || !Array.isArray(src.items)) return;
      const updated = [...src.items];
      window.GAS.log.d('handleTrash updated pre', updated);
      if (index < 0 || index >= updated.length) return;
      updated.splice(index, 1);
      window.GAS.log.d('handleTrash updatedpost ', updated);
      $actor.updateSource({ items: updated });
      $actor = $actor;
      window.GAS.log.d('handleTrash $actor', $actor);
    } catch (_) {}
  }



  $: items = trashable ? $itemsFromActorStore(actor) : $actor.Items

</script>

<template lang="pug">
ul.icon-list
  +each("items as item, idx")
    li.left
      .flexrow.gap-4.relative
        .flex0.relative.image.mr-sm
          img.icon(src="{item.img}" alt="{item.name}")
        +await("enrichHTML(item.link || item.name)")
          +then("Html")
            .flex2.text {@html Html}
        +if("trashable")
          .flex0
            button.icon-button.mr-sm(type="button" on:click!="{() => handleTrash(idx)}" aria-label="Remove")
              i(class="fas fa-trash")
</template>

<style lang="sass" scoped>
ul.icon-list
  list-style: none
  margin: 0
  padding: 0

ul.icon-list > li
  padding: 0
  &:hover
    box-shadow: 4px 0px 8px 3px var(--actor-studio-color-primary) inset

// Ensure content aligns nicely per Foundry flex helpers
.flexrow
  align-items: center

.image
  position: relative
  width: 40px
  min-width: 40px
  height: 40px

.tab-content ul.icon-list .image img.icon
  position: absolute
  top: 0
  left: 0
  bottom: 0
  right: 0
  width: 100%
  height: 100%
  object-fit: cover

.tab-content ul.icon-list .image
  min-width: 40px
// Keep the trash button centered vertically
button.icon-button
  margin-top: 0

.text
  display: flex
  align-items: center
</style>


