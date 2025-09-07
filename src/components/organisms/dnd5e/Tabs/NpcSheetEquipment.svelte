<script>
  import { getContext } from 'svelte';
  import { getItemsArray } from "~/src/helpers/Utility";
  const documentStore = getContext('#doc');
  $: npc = $documentStore;
  $: items = getItemsArray(npc?.items).filter(i => ['weapon','armor','equipment','consumable','tool','backpack','loot'].includes(i?.type));
</script>

<template lang="pug">
  section
    +if("!items || items.length === 0")
      p (no equipment)
    +if("items && items.length > 0")
      ul
        +each("items as it")
          li {it.name}
</template>

<style lang="sass">
section
  padding: .25rem
</style>
