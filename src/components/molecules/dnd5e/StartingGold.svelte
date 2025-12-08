<script>
  import { localize as t } from "~/src/helpers/Utility";
  import { getContext, onDestroy, onMount } from "svelte";
  import { goldRoll } from "~/src/stores/storeDefinitions";
  import { MODULE_ID } from "~/src/helpers/constants";
  import { writable } from 'svelte/store';

  export let characterClass;
  export let disabled = false;

  let formula = "";

  // D&D 2014 starting wealth formulas by class
  // Used when system.wealth doesn't contain a formula (e.g., in dnd5e v4 with 2014 rules)
  const CLASS_WEALTH_FORMULAS_2014 = {
    'Barbarian': '2d4 * 10',
    'Bard': '5d4 * 10',
    'Cleric': '5d4 * 10',
    'Druid': '2d4 * 10',
    'Fighter': '5d4 * 10',
    'Monk': '5d4',
    'Paladin': '5d4 * 10',
    'Ranger': '5d4 * 10',
    'Rogue': '4d4 * 10',
    'Sorcerer': '3d4 * 10',
    'Warlock': '4d4 * 10',
    'Wizard': '4d4 * 10',
    'Artificer': '5d4 * 10' // Tasha's Cauldron
  };

  $: {
    if (characterClass?.system?.wealth) {
      const wealthValue = characterClass.system.wealth;
      
      window.GAS.log.d('[StartingGold] Wealth data:', {
        wealthValue,
        type: typeof wealthValue,
        isObject: typeof wealthValue === 'object',
        hasFormula: wealthValue?.formula,
        hasValue: wealthValue?.value,
        className: characterClass.name,
        dnd5eVersion: window.GAS.dnd5eVersion,
        dnd5eRules: window.GAS.dnd5eRules
      });
      
      // In dnd5e v4 with 2014 rules, wealth might be stored in .formula or .value property
      // Try to access formula first, then fall back to the value itself
      if (typeof wealthValue === 'object' && wealthValue.formula) {
        formula = wealthValue.formula;
      } else if (typeof wealthValue === 'object' && wealthValue.value) {
        formula = wealthValue.value;
      } else {
        formula = String(wealthValue);
      }
      
      // If the formula doesn't contain 'd' (no dice), it's a fixed value
      // In 2014 rules, we need a dice formula, so look it up from our table
      if (!formula.includes('d')) {
        const className = characterClass.name;
        const formula2014 = CLASS_WEALTH_FORMULAS_2014[className];
        
        if (formula2014 && (window.GAS.dnd5eRules === '2014' || window.GAS.dnd5eVersion < 4)) {
          // Use the 2014 dice formula for this class
          formula = formula2014;
          window.GAS.log.d('[StartingGold] Using 2014 formula lookup for', className, ':', formula);
        } else {
          // For 2024 rules or unknown classes, use the fixed value
          $goldRoll = parseInt(formula) || 0;
          window.GAS.log.d('[StartingGold] Using fixed gold value (2024):', $goldRoll);
        }
      }
    } else {
      // Use default gold dice from settings if no class-specific formula
      formula = game.settings.get(MODULE_ID, "defaultGoldDice") || "5d4 * 10";
    }
  }

  // Derive hasRolled from the goldRoll store value
  $: hasRolled = $goldRoll > 0;

  async function rollGold() {
    if (disabled) return;
    const roll = await new Roll(formula).evaluate();
    const className = characterClass?.name || "Character";
    const flavor = `Rolling starting gold for ${className}`;
    roll.toMessage({
      flavor,
      speaker: ChatMessage.getSpeaker()
    }, {rollMode: game.settings.get('core', 'rollMode')});

    $goldRoll = roll.total;
  }

  export function resetGoldRoll() {
    goldRoll.set(0);
  }
</script>

<template lang="pug">
  section.starting-gold
    .flexrow
      +if("!disabled")
        .flex0.required(class="{!hasRolled ? 'active' : ''}") *
      .flex3
        h2.left {t('Equipment.Gold')}
    
    .flexcol.gold-section.gap-10(class="{disabled ? 'disabled' : ''}")
      +if("!hasRolled")
        .roll-gold.flexcol.gap-10
          .flexrow.left.gap-4
            .flex1 Formula: 
            .flex1.badge.center {formula}
          .flexrow
            .flex1
            .flex0.right.controls(class="{hasRolled || disabled ? '' : 'active'}" alt="Roll" on:click!="{rollGold}")
              i.fas.fa-dice
          
      +if("!disabled")
        .flexrow.left.justify-flexrow-vertical
          .flex3 
            +if("hasRolled")
              .result.final-gold-result
                .flexrow.justify-flexrow-vertical.no-wrap
                  .flex0.relative.icon
                    i.fas.fa-coins
                  .flex2.left
                    span.value {$goldRoll} gp
</template>

<style lang="sass">
  @import "../../../../styles/Mixins.sass"
  .badge
    +badge()
  .starting-gold
    background: rgba(0, 0, 0, 0.2)
    border-radius: var(--border-radius)
    padding: 0.5rem

  .gold-section
    border-radius: var(--border-radius)
    .roll-gold
      padding: 0.5rem
    &:not(.disabled)
      border: 1px solid var(--dnd5e-color-gold)
      background: rgba(0, 0, 0, 0.2)
      background: #000000
      color: var(--dnd5e-color-gold)


  .formula
    .label
      color: var(--color-text-dark-secondary)
      margin-right: 0.5rem
    .value
      font-family: monospace

  .controls
    cursor: pointer
    min-width: 24px
    font-size: 1rem
    background-color: rgba(0, 0, 0, 0.1)
    padding: 2px 1px 0px 0px
    visibility: hidden
    border: 1px solid var(--color-positive)
    border-radius: 4px
    color: var(--color-positive)
    &:hover
      cursor: pointer
      background-color: rgba(140, 90, 0, 0.2)
    &.active
      visibility: visible
      border: 1px solid var(--dnd5e-color-gold)
      color: var(--dnd5e-color-gold)
      animation: pulse 1s infinite

  .result
    &.final-gold-result
      padding: 0 0.5rem 0.5rem 0.5rem
      border-radius: var(--border-radius)
      // border: 1px solid var(--dnd5e-color-gold)
      background: #000000
      color: var(--dnd5e-color-gold)
      margin-top: 0.5rem
      
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
      font-weight: bold
</style> 