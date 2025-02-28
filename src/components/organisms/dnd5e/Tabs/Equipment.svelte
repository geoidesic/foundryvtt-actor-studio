// Reuse existing StartingGold/StartingEquipment components in select mode
// Add additional selection interfaces for spells, purchases, etc. 

<script>
  import { getContext } from "svelte";
  import { localize } from "#runtime/svelte/helper";
  import StartingGold from "~/src/components/molecules/dnd5e/StartingGold.svelte";
  import StartingEquipment from "~/src/components/molecules/dnd5e/StartingEquipment.svelte";
  import { characterClass, characterSubClass } from "~/src/stores/index";
  import { MODULE_ID } from "~/src/helpers/constants";

  const doc = getContext("#doc");

  // Get equipment selection setting
  $: equipmentSelectionEnabled = game.settings.get(MODULE_ID, "enableEquipmentSelection");

  // Track if gold has been rolled
  $: hasRolledGold = $goldRoll > 0;

  // Get proficiencies from actor
  $: proficiencies = $doc.system?.proficiencies || {};
</script>

<template lang="pug">
.container
  .content
    .flexrow
      .flex3.left.scroll.col-b
        h2 {localize('GAS.Equipment.Title')}
        +if("equipmentSelectionEnabled")
          section.equipment-flow
            StartingGold(characterClass="{$characterClass}")
            +if("hasRolledGold")
              StartingEquipment(startingEquipment="{$characterClass?.system?.startingEquipment}" proficiencies="{proficiencies}")
      .flex0.border-right.right-border-gradient-mask
      .flex2.pr-sm.col-a
        h3 {localize('GAS.Equipment.Summary')}
        // Equipment summary will go here
</template>

<style lang="sass">
.container
  height: 100%
  
.content
  padding: 1rem
  height: 100%
  overflow-y: auto

.equipment-flow
  margin-top: 1rem
  display: flex
  flex-direction: column
  gap: 1rem

section
  background: rgba(0, 0, 0, 0.05)
  border-radius: var(--border-radius)
  padding: 1rem
</style> 