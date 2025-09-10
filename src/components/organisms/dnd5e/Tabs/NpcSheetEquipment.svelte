<script>
  import { getContext } from 'svelte';
  import { getItemsArray } from "~/src/helpers/Utility";
  import FeatureItemList from "~/src/components/molecules/dnd5e/NPC/FeatureItemList.svelte";

  const documentStore = getContext('#doc');
  $: npc = $documentStore;
  $: items = getItemsArray(npc?.items).filter(i => ['weapon','armor','equipment','consumable','tool','backpack','loot'].includes(i?.type));
</script>

<template lang="pug">
  section
    +if("!items || items.length === 0")
      p (no equipment)
    +if("items && items.length > 0")
      // Use the reusable FeatureItemList to render equipment with images, actions and trash buttons
      FeatureItemList(items="{items}" showActions="{true}" trashable="{true}" showImage="{true}")
</template>

<style lang="sass">
section
  padding: .25rem
</style>
