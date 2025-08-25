<script>
  import { getContext } from "svelte";
  import StandardTabLayout from "~/src/components/organisms/StandardTabLayout.svelte";
  import FeatureItemList from "~/src/components/molecules/dnd5e/NPC/FeatureItemList.svelte";
  import NPCStatBlock from "~/src/components/molecules/dnd5e/NPC/NPCStatBlock.svelte";
  import CRAdjuster from "~/src/components/molecules/dnd5e/NPC/CRAdjuster.svelte";

  const actor = getContext("#doc");
  
  // Handle CR adjustment events
  function handleCRAdjusted(event) {
    console.log('CR adjusted:', event.detail);
    // The CR adjuster will have already updated the actor
    // We can add additional logic here if needed
  }
</script>

<template lang="pug">
StandardTabLayout(title="Create NPC" showTitle="true" tabName="npc-create")
  div(slot="left")
    FeatureItemList(trashable="{true}")
  
  div(slot="right")
    // CR Adjustment Tool
    CRAdjuster(
      actor="{$actor}"
      readonly="{false}"
      on:crAdjusted="{handleCRAdjusted}"
    )
    
    hr.my-md
    
    // NPC Stat Block
    NPCStatBlock(
      name="{$actor.name || 'Unnamed NPC'}"
      npc="{$actor}"
      readonly="{false}"
    )
</template>

<style lang="sass" scoped>
// Add any specific styling here if needed
</style>
