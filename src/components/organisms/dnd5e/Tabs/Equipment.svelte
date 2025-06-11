<script>
  import { onMount } from "svelte";
  import { goldRoll } from "~/src/stores/storeDefinitions";
  import { localize as t } from "#runtime/svelte/helper";
  import { MODULE_ID } from "~/src/helpers/constants";
  import { getContext } from "svelte";
  import { goldChoices } from "../../../../stores/goldChoices";
  import { areGoldChoicesComplete } from "~/src/stores/goldChoices";
  import { destroyAdvancementManagers } from "~/src/helpers/advancementManager";
  import { compatibleStartingEquipment } from "~/src/stores/startingEquipment";
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
  $: isGoldComplete = window.GAS.dnd5eVersion >= 4  && window.GAS.dnd5eRules === "2024" ? $areGoldChoicesComplete : $goldRoll > 0;

  // Get proficiencies from actor
  $: proficiencies = $doc.system?.proficiencies || {};

  $: window.GAS.log.d("Equipment goldChoices", $goldChoices);

  $: window.GAS.log.d("Equipment compatibleStartingEquipment", $compatibleStartingEquipment);

  onMount(() => {
    if(game.settings.get(MODULE_ID, 'disableAdvancementCapture')) {
      destroyAdvancementManagers();
    }
  });

</script>

<template lang="pug">
.container
  .content
    .flexrow
      .flex2.pr-sm.col-a
        //- pre dnd5eVersion { window.GAS.dnd5eVersion}
        //- pre dnd5eRules { window.GAS.dnd5eRules}
        h3 {t('GAS.Equipment.StartingGold')}
        section.equipment-flow
          +if("window.GAS.dnd5eVersion >= 4 && window.GAS.dnd5eRules === '2024'")
            StartingGoldv4(characterClass="{$characterClass}" background="{$background}")
            +else()
              StartingGold(characterClass="{$characterClass}")
          +if("isGoldComplete")
            h3 {t('GAS.Equipment.Selection')}
            StartingEquipment(startingEquipment="{$compatibleStartingEquipment}" proficiencies="{proficiencies}")
      .flex0.border-right.right-border-gradient-mask
      .flex3.left.scroll.col-b
        PlannedInventory
        EquipmentSelectorDetail
</template>

<style lang="sass">
.container
  height: 100%
  
  .col-a
      max-width: 325px
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