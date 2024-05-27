<script>
  import { getContext, onDestroy, onMount, tick } from "svelte";
    import { log } from "../../../../helpers/Utility";
  
  export let advancement = null;

  let items = [];

  async function getItemsFromUUIDs(uuids) {
    const itemPromises = uuids.map(async (uuid) => {
      const item = await fromUuid(uuid);
      log.d('item', item)
      return item
    });
    return Promise.all(itemPromises);
  }


  
  onMount(async () => {
    console.log('advancement'+advancement.type, advancement)
    if (advancement.configuration.items && Array.isArray(advancement.configuration.items)) {
      items = await getItemsFromUUIDs(advancement.configuration.items.map(item => item.uuid));
    }
  });
  
</script>

<template lang="pug">
  .advancement.mt-sm
    ul.icon-list
    +each("items as item")
      li.left
        +await("TextEditor.enrichHTML(item.system.description.value || '')")
          +then("Html")
            .flexrow(data-tooltip="{Html || null}" data-tooltip-class="gas-tooltip")
              .flex0.relative.image
                img.icon(src="{item.img}" alt="{item.name}")
              .flex2 {item.name}

</template>

<style lang="sass">
  @import "../../../../../styles/Mixins.scss"
  .advancement
    @include inset
    @include staticOptions

</style>