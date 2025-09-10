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
</script>

<template lang="pug">
  section
    FeatureItemList(trashable="{isEditing}" items="{itemsArray}" dedupe="{true}" sort="{true}" showActions="{true}" hideSpellDuplicates="{true}")
</template>

<style lang="sass">
section
  padding: .25rem
</style>
