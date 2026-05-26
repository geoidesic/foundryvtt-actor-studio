<script>
  import { Timing } from "@typhonjs-fvtt/runtime/util";
  import {
    createEventDispatcher,
    getContext,
    setContext,
    onDestroy,
    onMount,
    tick,
  } from "svelte";
  import {
    abilities,
    pointBuyScoreTotal,
    pointBuyLimit,
    abilityRolls,
  } from "~/src/stores/index";
  import { POINT_BUY_COSTS, MODULE_ID } from "~/src/helpers/constants";
  import { dnd5eModCalc, localize as t, safeGetSetting } from "~/src/helpers/Utility";

  export let document = false;

  const dispatch = createEventDispatcher();
  const doc = document || getContext("#doc");
  const updateDebounce = Timing.debounce(updateValue, 100);

  async function updateValue(attr, event) {
    if (event.target.value < 8) return false;
    if (event.target.value > 15) return false;
    const options = {
      system: { abilities: { [attr]: { value: Number(event.target.value) } } },
    };
    await $doc.updateSource(options);
    if ($doc.render) {
      $doc.render();
    }
    // Explicitly recalculate the pointBuyScoreTotal to ensure reactivity
    $pointBuyScoreTotal =
      systemAbilitiesArray?.reduce(
        (acc, ability) =>
          acc +
          POINT_BUY_COSTS[Number($doc.system.abilities[ability[0]]?.value)],
        0,
      ) || 12;
  }

  // Function to calculate pointBuyLimit
  function calculatePointBuyLimit() {
    return safeGetSetting(MODULE_ID, "pointBuyLimit", 27);
  }

  async function reset() {
    $abilityRolls = {};
    const options = { system: { abilities: {} } };
    systemAbilitiesArray.forEach((ability) => {
      options.system.abilities[ability[0]] = { value: 10 };
    });
    await $doc.updateSource(options);
    if ($doc.render) {
      $doc.render();
    }
    // Explicitly recalculate the pointBuyScoreTotal to ensure reactivity
    $pointBuyScoreTotal =
      systemAbilitiesArray?.reduce(
        (acc, ability) =>
          acc +
          POINT_BUY_COSTS[Number($doc.system.abilities[ability[0]]?.value)],
        0,
      ) || 12;
  }

  $: systemAbilities = game.system.config.abilities;
  $: systemAbilitiesArray = Object.entries(systemAbilities);
  $: $pointBuyScoreTotal =
    systemAbilitiesArray?.reduce(
      (acc, ability) =>
        acc + POINT_BUY_COSTS[Number($doc.system.abilities[ability[0]]?.value)],
      0,
    ) || 12;
  $: activeCSSClass = $pointBuyScoreTotal !== $pointBuyLimit ? " active" : "";
  $: pointBuyClass =
    $pointBuyScoreTotal > $pointBuyLimit
      ? "red" + activeCSSClass
      : "green" + activeCSSClass;

  onMount(async () => {});
</script>

<template lang="pug">
.attribute-entry.mt-sm
  table
    thead
      tr
        th.ability Ability
        th.center Base
        th.center Modifier
    tbody
      +each("systemAbilitiesArray as ability, index")
        tr
          td.ability {ability[1].label}
          td.center.score-cell
            input.left.small.mainscore(disabled type="number" value="{$doc.system.abilities[ability[0]]?.value}" name="{ability[0]}" id="{ability[0]}" )
            .controls
              .up.chevron(on:click!="{updateDebounce(ability[0], {target: {value: Number($doc.system.abilities[ability[0]]?.value) + 1}})}")
                i.fas.fa-chevron-up(alt="{t('AltText.Increase')}")
              .down.chevron( on:click!="{updateDebounce(ability[0], {target: {value: Number($doc.system.abilities[ability[0]]?.value) - 1}})}")
                i.fas.fa-chevron-down(alt="{t('AltText.Decrease')}")
          
          td.center
            +if("dnd5eModCalc(Number($doc.system.abilities[ability[0]]?.value)) > 0")
              span +
            span {dnd5eModCalc(Number($doc.system.abilities[ability[0]]?.value))}
      tr
        td(colspan="3")
          hr
          .flexrow.justify-flexrow-vertical
            .flex1 Points total: 
            .flex
              +if("isNaN($pointBuyScoreTotal)")
                span.red(data-tooltip="{t('Setting.AbilityEntry.AllowPointBuy.InvalidTotal')}") N/A
                +else()
                  input.score.center.small( disabled class="{pointBuyClass}"  type="number" value="{$pointBuyScoreTotal}") 
            .flex0 / 
            .flex1 
              input.center.small(disabled  type="number" value="{$pointBuyLimit}") 
      
      +if("isNaN($pointBuyScoreTotal)")
        tr
          td(colspan="3")
            hr
            button.btn.btn-primary(on:click="{reset}") Reset scores

</template>

<style lang="sass">
  @import './ability-entry-controls.sass'

  table
    width: 100%
    border-collapse: separate
    
   
  th
    padding: 0.1rem 0.5rem
    text-align: left
    font-family: var(--dnd5e-font-modesto)
    &.center
      text-align: center
    &.ability
      width: 25%
   
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
  .score
    &.active
      animation: pulse 0.5s infinite

</style>
