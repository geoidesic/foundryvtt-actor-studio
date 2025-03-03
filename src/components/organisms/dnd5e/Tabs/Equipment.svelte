<script>
  import { goldRoll } from "~/src/stores/goldRoll";
  import { areGoldChoicesComplete } from "~/src/stores/goldChoices";
  import { localize } from "#runtime/svelte/helper";
  import { MODULE_ID } from "~/src/helpers/constants";
  import { getContext } from "svelte";
  import { characterClass, characterSubClass, background } from "~/src/stores/index";
  import StartingGold from "~/src/components/molecules/dnd5e/StartingGold.svelte";
  import StartingGoldv4 from "~/src/components/molecules/dnd5e/v4/StartingGold.svelte";
  import StartingEquipment from "~/src/components/molecules/dnd5e/StartingEquipment.svelte";
  import EquipmentSelectorDetail from "~/src/components/molecules/dnd5e/EquipmentSelection/EquipmentSelectorDetail.svelte";
  import PlannedInventory from "~/src/components/molecules/dnd5e/EquipmentSelection/PlannedInventory.svelte";
  const doc = getContext("#doc");

  // Get equipment selection setting
  $: equipmentSelectionEnabled = game.settings.get(MODULE_ID, "enableEquipmentSelection");

  // Track if gold has been rolled/selected based on version
  $: isGoldComplete = window.GAS.dnd5eVersion === 4 ? $areGoldChoicesComplete : $goldRoll > 0;

  // Get proficiencies from actor
  $: proficiencies = $doc.system?.proficiencies || {};
  
</script>

<template lang="pug">
.container
  .content
    .flexrow
      .flex2.pr-sm.col-a
        h3 {localize('GAS.Equipment.Selection')}
        section.equipment-flow
          +if("window.GAS.dnd5eVersion === 4")
            StartingGoldv4(characterClass="{$characterClass}" background="{$background}" disabled="{false}")
            +else()
              StartingGold(characterClass="{$characterClass}" disabled="{false}")
          +if("isGoldComplete")
            StartingEquipment(startingEquipment="{$characterClass?.system?.startingEquipment}" proficiencies="{proficiencies}" disabled="{false}")
      .flex0.border-right.right-border-gradient-mask
      .flex3.left.scroll.col-b
        PlannedInventory
        EquipmentSelectorDetail
</template>

<style lang="sass">
.container
  height: 100%
  
.content
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

:global(.equipment-flow .starting-gold)
  background: transparent !important
  margin-top: 0 !important
  padding: 0 !important

:global(.equipment-flow .starting-equipment)
  background: transparent !important
  margin-top: 0 !important
  padding: 0 !important
</style> 