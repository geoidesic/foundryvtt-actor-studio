<script>
  import { getContext } from "svelte";
  import StandardTabLayout from "~/src/components/organisms/StandardTabLayout.svelte";
  import FeatureItemList from "~/src/components/molecules/dnd5e/NPC/FeatureItemList.svelte";
  import NPCStatBlock from "~/src/components/molecules/dnd5e/NPC/NPCStatBlock.svelte";

  const actor = getContext("#doc");
</script>

<template lang="pug">
StandardTabLayout(title="Create NPC" showTitle="true" tabName="npc-create")
  div(slot="left")
    FeatureItemList(trashable="{true}")
  
  div(slot="right")
    NPCStatBlock(
      name="{$actor.name || 'Unnamed NPC'}"
      npc="{$actor}"
      readonly="{false}"
    )
</template>

<style lang="sass" scoped>
// Add any specific styling here if needed
</style>
