<script>
  import { onMount } from "svelte";
  import { goldRoll, startingWealthChoice } from "~/src/stores/storeDefinitions";
  import { localize as t } from "~/src/helpers/Utility";
  import { MODULE_ID } from "~/src/helpers/constants";
  import { getContext } from "svelte";
  import { goldChoices, areGoldChoicesComplete } from "~/src/stores/goldChoices";
  import { parsedEquipmentGold, areEquipmentGoldChoicesComplete, equipmentGoldOptions } from "~/src/stores/equipmentGold";
  import { destroyAdvancementManagers } from "~/src/helpers/AdvancementManager";

  import { compatibleStartingEquipment, classStartingEquipment, backgroundStartingEquipment } from "~/src/stores/startingEquipment";
  import { characterClass, characterSubClass, background, readOnlyTabs } from "~/src/stores/index";
  import StartingGold from "~/src/components/molecules/dnd5e/StartingGold.svelte";
  import StartingGoldv4 from "~/src/components/molecules/dnd5e/v4/StartingGold.svelte";
  
  import StartingEquipment from "~/src/components/molecules/dnd5e/StartingEquipment.svelte";
  import EquipmentSelectorDetail from "~/src/components/molecules/dnd5e/EquipmentSelection/EquipmentSelectorDetail.svelte";
  import PlannedInventory from "~/src/components/molecules/dnd5e/EquipmentSelection/PlannedInventory.svelte";
  import StandardTabLayout from "~/src/components/organisms/StandardTabLayout.svelte";
  const doc = getContext("#doc");

  // Get equipment selection setting
  $: equipmentSelectionEnabled = game.settings.get(MODULE_ID, "enableEquipmentSelection");

  // Track if gold has been rolled/selected based on version
  $: isGoldComplete = window.GAS.dnd5eVersion >= 4  && window.GAS.dnd5eRules === "2024" ? $areGoldChoicesComplete : $goldRoll > 0;
  
  // For 2024 rules, check if user chose equipment (vs gold only) for class/background
  $: userChoseEquipment = window.GAS.dnd5eVersion >= 4 && window.GAS.dnd5eRules === "2024" ? 
    ($goldChoices.fromClass.choice === 'equipment' || $goldChoices.fromBackground.choice === 'equipment') : true;
  
  // Check if we have variable gold that still needs equipment selection to complete
  $: hasVariableGoldNeedingSelection = $parsedEquipmentGold && 
    (($parsedEquipmentGold.fromClass.hasVariableGold && $goldChoices.fromClass.choice === 'equipment') ||
     ($parsedEquipmentGold.fromBackground.hasVariableGold && $goldChoices.fromBackground.choice === 'equipment'));
  
  // 2014 rules: check user's wealth choice
  $: is2014Rules = window.GAS.dnd5eRules === "2014";
  $: userChose2014Equipment = is2014Rules && $startingWealthChoice === 'equipment';
  $: userChose2014Gold = is2014Rules && $startingWealthChoice === 'gold';
  
  // Show gold roller for 2014 when they chose gold, or for pre-2024 when no choice made yet
  $: shouldShowGoldRoller = is2014Rules ? userChose2014Gold : true;
  
  // Equipment should show when:
  // - 2024 rules: user chose equipment AND (choices complete OR variable gold needs selection)
  // - 2014 rules: user chose equipment (not gold)
  $: shouldShowEquipment = window.GAS.dnd5eVersion >= 4 && window.GAS.dnd5eRules === "2024" ? 
    (userChoseEquipment && ($areGoldChoicesComplete || hasVariableGoldNeedingSelection)) :
    (is2014Rules ? userChose2014Equipment : $goldRoll > 0);

  // Get proficiencies from actor
  $: proficiencies = $doc.system?.proficiencies || {};

  // Check if equipment tab is readonly
  $: isDisabled = $readOnlyTabs.includes("equipment");

  $: window.GAS.log.d("Equipment goldChoices", $goldChoices);

  $: window.GAS.log.d("Equipment compatibleStartingEquipment", $compatibleStartingEquipment);

  $: window.GAS.log.d("Equipment component:", {
    isDisabled,
    readOnlyTabs: $readOnlyTabs,
    characterClass: $characterClass,
    background: $background,
    classWealth: $characterClass?.system?.wealth,
    goldRoll: $goldRoll
  });

  onMount(() => {
    if(game.settings.get(MODULE_ID, 'disableAdvancementCapture')) {
      window.GAS.log.d('[EQUIPMENT] Advancement capture disabled - destroying advancement managers');
      destroyAdvancementManagers();
    }
    
    // For 2014 rules: Don't automatically reset gold roll in onMount
    // Gold can only be rolled once - preserve existing value if present
    // The value will only be reset when the user changes their wealth choice (not just re-confirms it)
    window.GAS.log.d('[EQUIPMENT] onMount - preserving gold roll:', $goldRoll);
  });

</script>

<template lang="pug">
StandardTabLayout(tabName="equipment")
  div(slot="left")
    //- pre dnd5eVersion { window.GAS.dnd5eVersion}
    //- pre dnd5eRules { window.GAS.dnd5eRules}
    h3 {t('Equipment.StartingGold')}
    +if("isDisabled")
      .info-message {t('Equipment.EquipmentReadOnly')}
    
    section.equipment-flow(class="{isDisabled ? 'readonly' : ''}")        
      //- 2024 rules: show v4 gold component
      +if("window.GAS.dnd5eVersion >= 4 && window.GAS.dnd5eRules === '2024'")
        StartingGoldv4(characterClass="{$characterClass}" background="{$background}")
      //- 2014 rules: show gold roller only if they chose gold
      +if("is2014Rules && shouldShowGoldRoller")
        StartingGold(characterClass="{$characterClass}")
      //- Pre-2024 without 2014 choice system: show gold roller
      +if("!is2014Rules && window.GAS.dnd5eRules !== '2024'")
        StartingGold(characterClass="{$characterClass}")
      
      //- Show equipment if conditions are met (but not for 2014 rules when user chose gold)
      +if("(shouldShowEquipment || isDisabled) && !(is2014Rules && userChose2014Gold)")
        StartingEquipment(
          startingEquipment="{$compatibleStartingEquipment}" 
          classEquipment="{$classStartingEquipment}"
          backgroundEquipment="{$backgroundStartingEquipment}"
          characterClass="{$characterClass}"
          background="{$background}"
          proficiencies="{proficiencies}"
          disabled="{isDisabled}"
          parsedEquipmentGold="{$parsedEquipmentGold}"
          equipmentGoldOptions="{$equipmentGoldOptions}"
        )
  div(slot="right")
    +if("!(is2014Rules && userChose2014Gold)")
      PlannedInventory
      EquipmentSelectorDetail
</template>

<style lang="sass">
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

.info-message
  font-size: 0.8rem
  color: #666
  font-style: italic
  margin-top: 1rem
  margin-bottom: 0.5rem
  padding: 1rem
  background: rgba(0, 0, 0, 0.05)
  border-radius: var(--border-radius)

.equipment-flow.readonly
  opacity: 0.7
  pointer-events: none
  
  :global(*)
    cursor: default !important
</style> 