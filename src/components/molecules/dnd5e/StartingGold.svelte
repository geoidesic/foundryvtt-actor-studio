<script>
  import { localize } from "@typhonjs-fvtt/runtime/util/i18n";
  import { getContext, onDestroy, onMount } from "svelte";
  import { goldRoll } from "~/src/stores/storeDefinitions";
  import { MODULE_ID } from "~/src/helpers/constants";
  import { writable } from 'svelte/store';

  export let characterClass;
  export let disabled = false;

  let formula = "";

  $: {
    if (characterClass?.system?.wealth) {
      formula = characterClass.system.wealth;
      // If formula doesn't contain 'd', set goldRoll directly
      if (!formula.includes('d')) {
        $goldRoll = parseInt(formula) || 0;
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
        h2.left {localize('GAS.Equipment.Gold')}
    
    .flexcol.gold-section.gap-10(class="{disabled ? 'disabled' : ''}")
      +if("!hasRolled")
        .flexrow.left.gap-4
          .flex1 Formula: 
          .flex1.badge.center {formula}
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
          .flex0.right.controls(class="{hasRolled || disabled ? '' : 'active'}" alt="Roll" on:click!="{rollGold}")
            i.fas.fa-dice
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
    padding: 0 0 0.5rem 0
    border-radius: var(--border-radius)
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
      padding: 0.5rem
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