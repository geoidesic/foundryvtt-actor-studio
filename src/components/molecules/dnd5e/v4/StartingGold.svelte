<script>
  import { localize as t } from "~/src/helpers/Utility";
  import { getContext, onDestroy, onMount } from "svelte";
  import { goldRoll } from "~/src/stores/storeDefinitions";
  import { goldChoices, setClassGoldChoice, setBackgroundGoldChoice, clearGoldChoices, totalGoldFromChoices } from "~/src/stores/goldChoices";
  import { parsedEquipmentGold, equipmentGoldOptions, setEquipmentGoldChoice, clearEquipmentGoldChoices } from "~/src/stores/equipmentGold";
  import { MODULE_ID } from "~/src/helpers/constants";
  import { clearEquipmentSelections } from "~/src/stores/equipmentSelections";
  import IconButton from "~/src/components/atoms/button/IconButton.svelte";
  
  export let characterClass;
  export let background;


  let classGoldOnly = 0;
  let classGoldWithEquipment = 0;
  let backgroundGoldOnly = 0;
  let backgroundGoldWithEquipment = 0;

  export const scrape2024SecondaryGoldAward = (item) => {
    // Extract awards using a regular expression
    const awards = item.system?.description?.value?.match(/\[\[\/award (\d+)GP\]\]/g);
    
    if (awards) {
      const extractedAwards = awards.map(award => parseInt(award.match(/(\d+)GP/)[1], 10));
      const max = Math.max(...extractedAwards);
      const min = Math.min(...extractedAwards);
      
      return {max, min};
    } else {
      console.log('No awards found.');
      return 0
    }
  }
  
  // @deprecated: not accurate.
  // Function to extract gold value from description text
  export function scrapeGoldFromBackground(background) {
    // Look for pattern ", X GP;" where X is a number
    // const match = background.system.description?.value.match(/,\s*(\d+)\s*GP;/i);
    // Match all occurrences of digits followed by a space and 'GP'
    const matches = background.system.description?.value.match(/(\d+)\s*GP/gi);
    // Extract the number values as integers
    const goldValues = matches ? matches.map(m => parseInt(m.match(/\d+/)[0], 10)) : [];
    window.GAS.log.d("scrapeGoldFromBackground goldValues", goldValues);
    if(goldValues) {
      const max = Math.max(...goldValues);
      const min = Math.min(...goldValues);
      
      return {max, min};
    } else {
      console.warn('No gold value found in description.');
      return 0;
    }

  }

  $: {
    if (characterClass) {
      // Gold only amount comes from system.wealth
      classGoldOnly = characterClass.system.wealth || 0;
      // With equipment amount: use parsed equipment gold if available, otherwise fall back to scraping
      const classGold = $parsedEquipmentGold.fromClass;
      if (classGold.goldOptions.length > 0 && !classGold.hasVariableGold) {
        classGoldWithEquipment = classGold.goldOptions[0].goldAmount;
      } else {
        classGoldWithEquipment = scrape2024SecondaryGoldAward(characterClass)?.min || 0;
      }
    }
    
    if (background) {
      // Gold only amount comes from system.wealth
      backgroundGoldOnly = background.system.wealth || 0;
      // With equipment amount: use parsed equipment gold if available, otherwise fall back to scraping
      const backgroundGold = $parsedEquipmentGold.fromBackground;
      if (backgroundGold.goldOptions.length > 0 && !backgroundGold.hasVariableGold) {
        backgroundGoldWithEquipment = backgroundGold.goldOptions[0].goldAmount;
      } else if (backgroundGold.hasVariableGold) {
        // For variable gold, use 0 as placeholder since user will select specific amount
        backgroundGoldWithEquipment = 0;
      } else {
        // Fall back to scraping only if parsing found nothing
        backgroundGoldWithEquipment = scrapeGoldFromBackground(background)?.min || 0;
      }
    }
  }

  function handleClassChoice(choice) {
    // Check if this class has variable gold options
    const classGold = $parsedEquipmentGold.fromClass;
    
    if (choice === 'equipment' && classGold.hasVariableGold) {
      // For variable gold, set base gold to 0 since amount comes from equipment selection
      const goldValue = 0;
      setClassGoldChoice(choice, goldValue);
    } else {
      // Standard behavior for fixed gold amounts
      const goldValue = choice === 'equipment' ? classGoldWithEquipment : classGoldOnly;
      setClassGoldChoice(choice, goldValue);
      
      // For equipment choice, set the equipment gold amount from parsed data
      if (choice === 'equipment') {
        const equipmentGoldAmount = classGold.standardEquipmentGold || classGoldWithEquipment || 0;
        setEquipmentGoldChoice('fromClass', 'default', equipmentGoldAmount);
      } else if (choice === 'gold') {
        // Clear equipment gold when choosing gold only
        setEquipmentGoldChoice('fromClass', null, 0);
      }
    }
  }

  function handleBackgroundChoice(choice) {
    console.log('🔧 handleBackgroundChoice called:', { choice, showEditButton });
    
    // Check if this background has variable gold options
    const backgroundGold = $parsedEquipmentGold.fromBackground;
    console.log('🔧 backgroundGold:', backgroundGold);
    
    if (choice === 'equipment' && backgroundGold.hasVariableGold) {
      // For variable gold, set base gold to 0 since amount comes from equipment selection
      const goldValue = 0;
      console.log('🔧 Variable gold path - setting goldValue:', goldValue);
      setBackgroundGoldChoice(choice, goldValue);
    } else {
      // Standard behavior for fixed gold amounts
      const goldValue = choice === 'equipment' ? backgroundGoldWithEquipment : backgroundGoldOnly;
      console.log('🔧 Standard path - goldValue:', goldValue, 'backgroundGoldWithEquipment:', backgroundGoldWithEquipment);
      setBackgroundGoldChoice(choice, goldValue);
      
      // For equipment choice, set the equipment gold amount from parsed data
      if (choice === 'equipment') {
        const equipmentGoldAmount = backgroundGold.standardEquipmentGold || backgroundGoldWithEquipment || 0;
        console.log('🔧 Setting equipment gold amount:', equipmentGoldAmount);
        setEquipmentGoldChoice('fromBackground', 'default', equipmentGoldAmount);
      } else if (choice === 'gold') {
        // Clear equipment gold when choosing gold only
        setEquipmentGoldChoice('fromBackground', null, 0);
      }
    }
  }

  function handleEquipmentGoldChoice(source, choice, goldAmount) {
    if (showEditButton) return;
    setEquipmentGoldChoice(source, choice, goldAmount);
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
    clearEquipmentGoldChoices();
  }

  $: classChoice = $goldChoices.fromClass.choice;
  $: backgroundChoice = $goldChoices.fromBackground.choice;
  
  // Debug the gold calculation components
  $: {
    console.log('🔧 GOLD CALCULATION DEBUG:', {
      classGoldValue: $goldChoices.fromClass.goldValue,
      backgroundGoldValue: $goldChoices.fromBackground.goldValue, 
      classEquipmentGold: $equipmentGoldOptions.fromClass.currentGoldAmount,
      backgroundEquipmentGold: $equipmentGoldOptions.fromBackground.currentGoldAmount,
      goldChoices: $goldChoices,
      equipmentGoldOptions: $equipmentGoldOptions
    });
  }
  
  // Use the centralized totalGoldFromChoices derived store that includes variable equipment gold
  $: totalGold = $totalGoldFromChoices;
  $: hasChoices = characterClass || background;
  $: isComplete = classChoice && backgroundChoice;
  $: showEditButton = hasChoices && classChoice && backgroundChoice;
  
  // Enhanced checks for gold completion - selecting equipment choice is sufficient, even for variable gold
  $: classGoldComplete = classChoice === 'gold' || classChoice === 'equipment';
  $: backgroundGoldComplete = backgroundChoice === 'gold' || backgroundChoice === 'equipment';
</script>

<template lang="pug">
section.starting-gold
  .flexrow
    +if("!showEditButton")
      .flex0.required(class!="{!classChoice || !backgroundChoice ? 'active' : ''}")
        span *
    .flex3
      h2.left
        span {t('Equipment.Gold')}
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
                +if("$parsedEquipmentGold.fromBackground.hasVariableGold")
                  span {t('Equipment.Label')} + variable gp
                  +else()
                    span {t('Equipment.Label')} + {backgroundGoldWithEquipment} gp
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
                +if("$parsedEquipmentGold.fromClass.hasVariableGold")
                  span {t('Equipment.Label')} + variable gp
                  +else()
                    span {t('Equipment.Label')} + {classGoldWithEquipment} gp
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
    

    
    +if("classGoldComplete && backgroundGoldComplete")
      .equipment-group.final-gold
        .flexrow.left.result
          .flex0.relative.icon
            i.fas.fa-coins
          .flex2.left
            .label
              span Total Gold:
            .value
              span {totalGold} gp
</template>

<style lang="sass">
@import "../../../../../styles/Mixins.sass"
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

  &.final-gold
    border: 1px solid var(--dnd5e-color-gold)
    background: #000000
    color: var(--dnd5e-color-gold)
    
    .icon
      min-width: 32px
      max-height: 32px
      margin-right: 0.5rem
      display: flex
      align-items: center
      justify-content: center
      
      i
        color: var(--dnd5e-color-gold)
        font-size: 1.2em
    
    .label
      color: var(--dnd5e-color-gold)
      margin-right: 0.5rem
    
    .value
      color: var(--dnd5e-color-gold)
      font-weight: bold

  &.variable-gold
    border: 1px solid var(--color-text-highlight)
    background: rgba(0, 0, 0, 0.3)
    
    .group-label
      color: var(--color-text-highlight)
      font-weight: bold

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

button.option
  color: white
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

.description
  font-size: 0.8em
  color: rgba(255, 255, 255, 0.7)
  font-style: italic
  text-align: right
  white-space: nowrap
  overflow: hidden
  text-overflow: ellipsis
  max-width: 200px

.mt-sm
  margin-top: 0.5rem
</style> 