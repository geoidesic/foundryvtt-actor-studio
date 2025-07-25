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
    race,
    pointBuyScoreTotal,
    pointBuyLimit,
    abilityRolls,
  } from "~/src/stores/index";
  import { POINT_BUY_COSTS, MODULE_ID } from "~/src/helpers/constants";
  import { dnd5eModCalc } from "~/src/helpers/Utility";
  import { localize as t } from "~/src/helpers/Utility";

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
    return game.settings.get(MODULE_ID, "pointBuyLimit");
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
  $: raceFeatScore = 0;
  $: abilityAdvancements =
    $race?.advancement?.byType?.AbilityScoreImprovement?.[0].configuration
      ?.fixed;
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
        +if("window.GAS.dnd5eRules == '2014'")
          th.center Origin
        th.center Score
        th.center Modifier
    tbody
      +each("systemAbilitiesArray as ability, index")
        tr
          td.ability {ability[1].label}
          td.center.relative
            input.left.small.mainscore(disabled type="number" value="{$doc.system.abilities[ability[0]]?.value}" name="{ability[0]}" id="{ability[0]}" )
            .controls
              .up.chevron(on:click!="{updateDebounce(ability[0], {target: {value: Number($doc.system.abilities[ability[0]]?.value) + 1}})}")
                i.fas.fa-chevron-up(alt="{t('AltText.Increase')}")
              .down.chevron( on:click!="{updateDebounce(ability[0], {target: {value: Number($doc.system.abilities[ability[0]]?.value) - 1}})}")
                i.fas.fa-chevron-down(alt="{t('AltText.Decrease')}")
          
          +if("window.GAS.dnd5eRules == '2014'")
            td.center
              +if("abilityAdvancements?.[ability[0]] > 0")
                span +
              span {abilityAdvancements?.[ability[0]] || 0}
          td.center {(Number(abilityAdvancements?.[ability[0]]) || 0) + Number($doc.system.abilities[ability[0]]?.value || 0)}
          td.center
            +if("dnd5eModCalc(Number($doc.system.abilities[ability[0]]?.value) + (Number(abilityAdvancements?.[ability[0]]) || 0)) > 0")
              span +
            span {dnd5eModCalc(Number($doc.system.abilities[ability[0]]?.value) + (Number(abilityAdvancements?.[ability[0]]) || 0))}
      tr
        td(colspan="5")
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
          td(colspan="5")
            hr
            button.btn.btn-primary(on:click="{reset}") Reset scores

</template>

<style lang="sass">
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
  .mainscore
    min-width: 33px
    max-width: 33px
  .score
    &.active
      animation: pulse 0.5s infinite
  .controls
    .chevron
      position: absolute
      font-size: 0.75rem
      right: 0
      cursor: pointer
      background-color: rgba(0, 0, 0, 0.1)
      &.up
        padding: 1px 3px 0px 3px
        top: 8px
        &:hover
          background-color: rgba(140, 90, 0, 0.2)
      &.down
        padding: 1px 3px 0px 3px
        bottom: 8px
        &:hover
          background-color: rgba(140, 90, 0, 0.2)

</style>
