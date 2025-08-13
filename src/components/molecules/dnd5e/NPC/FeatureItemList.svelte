<script>
  import { getContext } from "svelte";
  import { enrichHTML } from "~/src/helpers/Utility";

  // Items should be an array of objects with at least { img, name, link? }
  export let items = [];
  export let trashable = false;

  const actor = getContext("#doc");

  // Keep a reactive local list so UI refreshes when the actor changes
  function mapItemsFromActor(doc) {
    try {
      const src = doc?.toObject?.();
      const list = Array.isArray(src?.items) ? src.items : [];
      return list.map((it) => ({
        img: it?.img,
        name: it?.name,
        link: it?.link || (it?.uuid ? `@UUID[${it.uuid}]{${it.name}}` : it?.name)
      }));
    } catch (_) {
      return [];
    }
  }

  let displayItems = items;
  $: displayItems = trashable ? mapItemsFromActor($actor) : items;

  function handleTrash(index) {
    alert(`Trash ${index}`);
    try {
      const src = $actor?.toObject?.();
      window.GAS.log.d(src);
      if (!src || !Array.isArray(src.items)) return;
      const updated = [...src.items];
      window.GAS.log.d(updated);
      if (index < 0 || index >= updated.length) return;
      updated.splice(index, 1);
      window.GAS.log.d(updated);
      $actor.updateSource({ items: updated });
      window.GAS.log.d($actor);
    } catch (_) {}
  }
</script>

<template lang="pug">
ul.icon-list
  +each("displayItems as item, idx")
    li.left
      .flexrow.gap-4
        .flex0.relative.image.mr-sm
          img.icon(src="{item.img}" alt="{item.name}")
        +await("enrichHTML(item.link || item.name)")
          +then("Html")
            .flex2 {@html Html}
        +if("trashable")
          .flex0
            button.icon-button.mt-xxs(type="button" on:click!="{() => handleTrash(idx)}" aria-label="Remove")
              i(class="fas fa-trash")
</template>

<style lang="sass" scoped>
</style>


