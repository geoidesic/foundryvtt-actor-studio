<script>
  import { localize } from "#runtime/svelte/helper";
  import { getContext, onDestroy, onMount } from "svelte";
  import { goldRoll } from "~/src/stores/storeDefinitions";
  import { goldChoices, setClassGoldChoice, setBackgroundGoldChoice, clearGoldChoices } from "~/src/stores/goldChoices";
  import { MODULE_ID } from "~/src/helpers/constants";
  import { clearEquipmentSelections } from "~/src/stores/equipmentSelections";
  import IconButton from "~/src/components/atoms/button/IconButton.svelte";
  
  export let characterClass;
  export let background;


  let classGoldOnly = 0;
  let classGoldWithEquipment = 0;
  let backgroundGoldOnly = 0;
  let backgroundGoldWithEquipment = 0;

  // Function to extract gold value from description text
  function extractGoldFromDescription(description) {
    if (!description) return 0;
    
    // Look for pattern ", X GP;" where X is a number
    const match = description.match(/,\s*(\d+)\s*GP;/i);
    if (match && match[1]) {
      return parseInt(match[1]);
    }
    return 0;
  }

  $: {
    if (characterClass) {
      // Gold only amount comes from system.wealth
      classGoldOnly = characterClass.system.wealth || 0;
      // With equipment amount comes from description
      classGoldWithEquipment = extractGoldFromDescription(characterClass.system.description?.value) || 0;
    }
    
    if (background) {
      // Gold only amount comes from system.wealth
      backgroundGoldOnly = background.system.wealth || 0;
      // With equipment amount comes from description
      backgroundGoldWithEquipment = extractGoldFromDescription(background.system.description?.value) || 0;
    }
  }

  function handleClassChoice(choice) {
    if (showEditButton) return;
    const goldValue = choice === 'equipment' ? classGoldWithEquipment : classGoldOnly;
    setClassGoldChoice(choice, goldValue);
  }

  function handleBackgroundChoice(choice) {
    if (showEditButton) return;
    const goldValue = choice === 'equipment' ? backgroundGoldWithEquipment : backgroundGoldOnly;
    setBackgroundGoldChoice(choice, goldValue);
  }

  function makeClassChoiceHandler(choice) {
    return function classChoiceHandler() {
      handleClassChoice(choice);
    };
  }

  function makeBackgroundChoiceHandler(choice) {
    return function backgroundChoiceHandler() {
      handleBackgroundChoice(choice);
    };
  }

  function handleEdit() {
    clearGoldChoices();
    clearEquipmentSelections();
  }

  $: classChoice = $goldChoices.fromClass.choice;
  $: backgroundChoice = $goldChoices.fromBackground.choice;
  $: totalGold = parseInt($goldChoices.fromClass.goldValue) + parseInt($goldChoices.fromBackground.goldValue);
  $: hasChoices = characterClass || background;
  $: isComplete = classChoice && backgroundChoice;
  $: showEditButton = classChoice && backgroundChoice;
</script>

<template lang="pug">
section.starting-gold
  .flexrow
    +if("!showEditButton")
      .flex0.required(class!="{!classChoice || !backgroundChoice ? 'active' : ''}")
        span *
    .flex3
      h2.left
        span {localize('GAS.Equipment.Gold')}
    +if("showEditButton")
      .flex0.right
        IconButton.option(
          on:click!="{handleEdit}"
          icon="fas fa-pencil"
        )
  
  .flexcol.gold-section.gap-10(class!="{showEditButton ? 'disabled' : ''}")
    
    +if("background")
      .equipment-group
        .flexrow.left
          .flex.group-label {background.name} Options
        .options
          button.option(
            class!="{backgroundChoice === 'equipment' ? 'selected' : ''} {showEditButton ? 'disabled' : ''}"
            on:mousedown!="{makeBackgroundChoiceHandler('equipment')}"
            disabled!="{showEditButton}"
          )
            .flexrow.justify-flexrow-vertical.no-wrap
              .flex0.relative.icon
                i.fas.fa-sack-dollar
              .flex2.left.name
                span Equipment + {backgroundGoldWithEquipment} gp
          button.option(
            class!="{backgroundChoice === 'gold' ? 'selected' : ''} {showEditButton ? 'disabled' : ''}"
            on:mousedown!="{makeBackgroundChoiceHandler('gold')}"
            disabled!="{showEditButton}"
          )
            .flexrow.justify-flexrow-vertical.no-wrap
              .flex0.relative.icon
                i.fas.fa-coins
              .flex2.left.name
                span {backgroundGoldOnly} gp
    
    +if("characterClass")
      .equipment-group
        .flexrow.left
          .flex.group-label {characterClass.name} Options
        .options
          button.option(
            class!="{classChoice === 'equipment' ? 'selected' : ''} {showEditButton ? 'disabled' : ''}"
            on:mousedown!="{makeClassChoiceHandler('equipment')}"
            disabled!="{showEditButton}"
          )
            .flexrow.justify-flexrow-vertical.no-wrap
              .flex0.relative.icon
                i.fas.fa-sack-dollar
              .flex2.left.name
                span Equipment + {classGoldWithEquipment} gp
          button.option(
            class!="{classChoice === 'gold' ? 'selected' : ''} {showEditButton ? 'disabled' : ''}"
            on:mousedown!="{makeClassChoiceHandler('gold')}"
            disabled!="{showEditButton}"
          )
            .flexrow.justify-flexrow-vertical.no-wrap
              .flex0.relative.icon
                i.fas.fa-coins
              .flex2.left.name
                span {classGoldOnly} gp
    
    +if("classChoice && backgroundChoice")
      .equipment-group
        .flexrow.left.result
          .label
            span Total Gold:
          .value
            span {totalGold} gp
</template>

<style lang="sass">
@import "../../../../../styles/Mixins.scss"
.badge
  +badge()
.starting-gold
  background: rgba(0, 0, 0, 0.2)
  border-radius: var(--border-radius)
  padding: 0.5rem

.gold-section
  padding: 0.5rem
  border-radius: var(--border-radius)
  &:not(.disabled)
    border: 1px solid var(--dnd5e-color-gold)
    background: rgba(0, 0, 0, 0.2)
    background: #000000
    color: var(--dnd5e-color-gold)

.equipment-group
  margin-bottom: 0.75rem
  margin-right: 0.2rem
  padding: 0.5rem
  border-radius: var(--border-radius)
  background: rgba(0, 0, 0, 0.2)
  
  &:last-child
    margin-bottom: 0

.group-label
  display: block
  font-size: 1em
  color: var(--dnd5e-color-gold)
  margin-bottom: 0.5rem
  font-style: italic

.options
  display: grid
  grid-template-columns: repeat(1, 1fr)
  gap: 0.2rem

.option
  display: flex
  padding: 0.3rem 0.5rem
  border: 1px solid rgba(255, 255, 255, 0.1)
  border-radius: 4px
  background: rgba(0, 0, 0, 0.4)
  color: var(--li-background-color)
  cursor: pointer
  transition: all 0.5s ease
  
  &:hover:not(.disabled)
    background: var(--dnd5e-color-gold)
    border-color: rgba(255, 255, 255, 0.2)

    .icon
      i
        color: var(--dnd5e-color-dark)
    span
      color: var(--dnd5e-color-dark)
  &.selected
    background: rgba(0, 0, 0, 0.8)
    border-color: #b59e54
    box-shadow: 0 0 10px rgba(181, 158, 84, 0.2)
    &:hover:not(.disabled)
      background: rgba(0, 0, 0, 0.8)
      border-color: #b59e54
      box-shadow: 0 0 10px rgba(181, 158, 84, 0.2)
      span
        color: #fff
      .icon
        i
          color: #fff

  &.disabled
    cursor: not-allowed
    opacity: 0.5
    transition: opacity 0.5s ease

  &.confirm
    background: var(--color-positive)
    border-color: var(--color-positive)
    color: white
    &:hover
      background: var(--color-positive-dark)

.icon
  min-width: 32px
  max-height: 32px
  margin-right: 0.2rem
  display: flex
  align-items: center
  justify-content: center
  i
    font-size: 1.2em
    color: var(--dnd5e-color-gold)

.name
  font-size: smaller
  line-height: 2rem

.result
  margin-top: 1rem
  .label
    color: var(--color-text-dark-secondary)
    margin-right: 0.5rem
  .value
    color: var(--color-text-highlight)
    font-weight: bold

.mt-sm
  margin-top: 0.5rem
</style> 