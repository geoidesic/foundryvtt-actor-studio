<script>
  import { localize } from "#runtime/svelte/helper";
  import { getContext, onDestroy, onMount } from "svelte";
  import { goldRoll } from "~/src/stores/goldRoll";
  import { MODULE_ID } from "~/src/helpers/constants";
  import { writable } from 'svelte/store';

  export let characterClass;

  let formula = "";

  $: {
    if (characterClass?.system?.wealth) {
      formula = characterClass.system.wealth;
    } else {
      // Use default gold dice from settings if no class-specific formula
      formula = game.settings.get(MODULE_ID, "defaultGoldDice") || "5d4 * 10";
    }
  }

  // Derive hasRolled from the goldRoll store value
  $: hasRolled = $goldRoll > 0;

  async function rollGold() {
    const roll = await new Roll(formula).evaluate();
    const className = characterClass?.name || "Character";
    const flavor = `Rolling starting gold for ${className}`;
    await roll.toMessage({
      flavor,
      speaker: ChatMessage.getSpeaker()
    });
    $goldRoll = roll.total;
  }

  export function resetGoldRoll() {
    goldRoll.set(0);
  }
</script>

<template lang="pug">
  section.starting-gold
    .flexrow
      .flex0.required(class="{!hasRolled ? 'active' : ''}") *
      .flex3
        h2.left {localize('GAS.Equipment.StartingGold')}
    
    .flexcol.gold-section.gap-10
      .flexrow.left.gap-4
        .flex3.gold Starting Gold Formula: 
        .flex1.badge {formula}
      .flexrow.left
        .flex3 
          +if("hasRolled")
            .result
              span.label.gold Result: 
              span.value {$goldRoll} gp
        .flex0.right.controls(class="{hasRolled ? '' : 'active'}" alt="Roll" on:click!="{rollGold}")
          i.fas.fa-dice
</template>

<style lang="sass">
  @import "../../../../styles/Mixins.scss"
  .badge
    +badge()
  .starting-gold
    background: rgba(0, 0, 0, 0.2)
    border-radius: var(--border-radius)
    padding: 0.5rem
    margin-top: 1rem

  .gold-section
    padding: 0.5rem
    background: #000000
    border: 1px solid var(--dnd5e-color-gold)
    border-radius: var(--border-radius)
    color: var(--li-background-color)

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
    .label
      color: var(--color-text-dark-secondary)
      margin-right: 0.5rem
    .value
      color: var(--color-text-highlight)
      font-weight: bold
</style> 