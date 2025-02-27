<script>
  import { getContext, onDestroy, onMount, tick } from "svelte";
  
  export let advancement = null;

  let initialId = null;
  let items = [];

  async function getItemsFromUUIDs(uuids) {
    const itemPromises = uuids.map(async (uuid) => {
      const item = await fromUuid(uuid);
      return item
    });
    return Promise.all(itemPromises);
  }

  async function getItems() {
    if (advancement.configuration.items && Array.isArray(advancement.configuration.items)) {
      items = await getItemsFromUUIDs(advancement.configuration.items.map(item => item.uuid));
    }
  }

  $: if (advancement.id != initialId) {
    getItems();
    initialId = advancement.id;
  }
  
  onMount(async () => {
    initialId = advancement.id;
  });
  
</script>

<template lang="pug">
  .advancement.mt-sm(data-type="{advancement.type}")
    ul.icon-list
    +each("items as item")
      li.left
        +await("TextEditor.enrichHTML(item?.system?.description?.value || '')")
          +then("Html")
            .flexrow.gap-4
              //- (data-tooltip="{Html || null}" data-tooltip-class="gas-tooltip dnd5e2 dnd5e-tooltip item-tooltip")
              .flex0.relative.image
                img.icon(src="{item?.img}" alt="{item?.name}")
              +if("item?.link")
                +await("TextEditor.enrichHTML(item.link || '')")
                  +then("Html")
                    .flex2 {@html Html}
                +else()
                  .flex2 {item?.name}

</template>

<style lang="sass">
  @import "../../../../../styles/Mixins.scss"
  .advancement
    .gold-button
      @include gold-button(null)
        
      
</style>