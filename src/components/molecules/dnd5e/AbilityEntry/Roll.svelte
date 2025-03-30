<script>
  import { Timing } from "@typhonjs-fvtt/runtime/util";
  import { createEventDispatcher, getContext, onDestroy, onMount, tick  } from "svelte";
  import { abilities, race, abilityRolls } from "~/src/stores/index"
  import { MODULE_ID } from "~/src/helpers/constants"
  
  export let document = false;
  
  const dispatch = createEventDispatcher();
  const doc = document || getContext("#doc");
  const updateDebounce = Timing.debounce(updateValue, 100);
  let formula, allowMove;

  function updateValue(attr, event) {
    if(event.target.value < 8) return false;
    if(event.target.value > 15) return false;
    const options = {system: {abilities: { [attr]: {value: Number(event.target.value)}}}};
    $doc.updateSource(options)
    $doc = $doc
  }

  async function swapAbilities(attr, direction) {
    const abilities = Object.keys($doc.system.abilities);
    const index = abilities.indexOf(attr);
    
    if (direction === 1 && index > 0) {
      // Move up
      const prevAbility = abilities[index - 1];
      const options = {
        system: {
          abilities: {
            [attr]: { value: $doc.system.abilities[prevAbility].value },
            [prevAbility]: { value: $doc.system.abilities[attr].value },
          },
        },
      };
      await $doc.updateSource(options);
      $doc = $doc;
    } else if (direction === -1 && index < abilities.length - 1) {
      // Move down
      const nextAbility = abilities[index + 1];
      const options = {
        system: {
          abilities: {
            [attr]: { value: $doc.system.abilities[nextAbility].value },
            [nextAbility]: { value: $doc.system.abilities[attr].value },
          },
        },
      };
      await $doc.updateSource(options);
      $doc = $doc;
    }
  }

  async function roll(attr) {
    const roll = await new Roll(formula).evaluate();
    await roll.toMessage();

    $abilityRolls = !$abilityRolls ? {} : $abilityRolls
    $abilityRolls[attr] = roll.total

    // set the value of the ability to the result of the roll
    const options = {system: {abilities: { [attr]: {value: Number(roll.total)}}}};
    $doc.updateSource(options)
    $doc = $doc
  }
  

  $: systemAbilities = game.system.config.abilities
  $: systemAbilitiesArray = Object.entries(systemAbilities);
  $: raceFeatScore = 0;
  $: abilityAdvancements = $race?.advancement?.byType?.AbilityScoreImprovement?.[0].configuration?.fixed
  $: allRolled = systemAbilitiesArray.every(ability => $abilityRolls[ability[0]] !== undefined);
  $: scoreClass = allowMove && allRolled ? 'left' : 'center';
  
  onMount(async () => {
    formula = game.settings.get(MODULE_ID, "abiiltyRollFormula")
    allowMove = game.settings.get(MODULE_ID, "allowAbilityRollScoresToBeMoved")
  });
</script>

<template lang="pug">
.attribute-entry.mt-sm
  table
    thead
      tr
        th.ability Ability
        th.center Race / Feat
        th.center Base Score
        th.center Score
        th.center Mod
        th.center.roll-col
    tbody
      +each("systemAbilitiesArray as ability, index")
        tr
          td.ability {ability[1].label}
          td.center
            +if("abilityAdvancements?.[ability[0]] > 0")
              span +
            span {abilityAdvancements?.[ability[0]] || 0}
          td.center.relative
            input.small.mainscore(class="{scoreClass}" disabled type="number" value="{$doc.system.abilities[ability[0]]?.value}"  name="{ability[0]}" id="{ability[0]}")
            +if("allowMove && allRolled")
              .controls
                .up.chevron
                  +if("index != 0")
                    i.fas.fa-chevron-up(alt="Move Up" on:click!="{swapAbilities(ability[0], 1)}")
                .down.chevron
                  +if("index != systemAbilitiesArray.length - 1")
                    i.fas.fa-chevron-down(alt="Move Down" on:click!="{swapAbilities(ability[0], -1)}")
          td.center
            span {(Number(abilityAdvancements?.[ability[0]]) || 0) + Number($doc.system.abilities[ability[0]]?.value || 0)}
          td.center
            +if("Number($doc.system.abilities[ability[0]]?.mod) + (Number(abilityAdvancements?.[ability[0]]) || 0) > 0")
              span +
            span {Number($doc.system.abilities[ability[0]]?.mod) + (Number(abilityAdvancements?.[ability[0]]) || 0)}
          td.center
            .buttons(class="{$abilityRolls[ability[0]] ? '' : 'active'}" alt="Roll" on:click!="{roll(ability[0])}")
              i.fas.fa-dice

</template>

<style lang="sass">
  table
    width: 100%
    border-collapse: separate
    border-spacing: 0 0.5rem
   
  th
    padding: 0.1rem 0.5rem
    text-align: left
    font-family: var(--dnd5e-font-modesto)
    &.center
      text-align: center
    &.roll-col
      width: 2rem
   
  td
    text-align: left
    &.center
      text-align: center
    &.ability
      width: 25%
 
  .green
    color: green
  .red
    color: red
  .relative
    position: relative
    background-color: rgba(0, 0, 0, 0.05)
    border-radius: 3px
    input
      background: none
      width: 3em
      &:disabled
        color: var(--color-text-dark-primary)
      text-decoration: none
      border: none
      outline: none
      box-shadow: none
      -webkit-appearance: none
      -moz-appearance: none
      appearance: none
  .mainscore
    min-width: 40px
  .controls
    .chevron
      position: absolute
      font-size: 0.75rem
      right: 0
      cursor: pointer
      background-color: rgba(0, 0, 0, 0.1)
      &.up
        padding: 1px 3px 0px 3px
        top: 0
        &:hover
          background-color: rgba(140, 90, 0, 0.2)
      &.down
        padding: 1px 3px 0px 3px
        bottom: 0
        &:hover
          background-color: rgba(140, 90, 0, 0.2)
  .buttons
    cursor: pointer
    min-width: 24px
    font-size: 1rem
    background-color: rgba(0, 0, 0, 0.1)
    padding: 2px 1px 0px 0px
    border: 1px solid var(--color-positive)
    border-radius: 4px
    color: var(--color-positive)
    &:hover
      cursor: pointer
      background-color: rgba(140, 90, 0, 0.2)
    &.active
      border: 1px solid var(--color-negative)
      color: var(--color-negative)
      animation: pulse 1s infinite
</style>