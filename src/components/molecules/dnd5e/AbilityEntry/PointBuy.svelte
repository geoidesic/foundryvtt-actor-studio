<script>
  import { log } from "~/src/helpers/Utility";
  import { Timing } from "@typhonjs-fvtt/runtime/util";
  import { createEventDispatcher, getContext, onDestroy, onMount, tick  } from "svelte";
  import { abilities, race, } from "~/src/helpers/store"
  import { POINT_BUY_COSTS, MODULE_ID } from "~/src/helpers/constants"
  import { localize } from "#runtime/svelte/helper";
  
  export let document = false;
  
  const dispatch = createEventDispatcher();
  const doc = document || getContext("#doc");
  const updateDebounce = Timing.debounce(updateValue, 100);

  function updateValue(attr, event) {
    if(event.target.value < 8) return false;
    if(event.target.value > 15) return false;
    const options = {system: {abilities: { [attr]: {value: Number(event.target.value)}}}};
    $doc.updateSource(options)
    $doc = $doc
  }

  function reset() {
    const options = {system: {abilities: {}}};
    systemAbilitiesArray.forEach(ability => {
      options.system.abilities[ability[1].abbreviation] = {value: 10};
    });
    $doc.updateSource(options);
    $doc = $doc;
  }
  

  $: systemAbilities = game.system.config.abilities
  $: systemAbilitiesArray = Object.entries(systemAbilities);
  $: raceFeatScore = 0;
  $: abilityAdvancements = $race?.advancement?.byType?.AbilityScoreImprovement?.[0].configuration?.fixed
  $: scoreTotal = systemAbilitiesArray.reduce((acc, ability) => acc + POINT_BUY_COSTS[Number($doc.system.abilities[ability[1].abbreviation].value)], 0)
  $: pointBuyLimit = game.settings.get(MODULE_ID, "pointBuyLimit")
  $: pointBuyClass = scoreTotal > pointBuyLimit ? 'red': 'green'

  onMount(async () => {
  });
</script>

<template lang="pug">
.attribute-entry.mt-sm
  h5.flexrow.mb-sm
    .flex2.left Ability
    .flex1.center Race / Feat
    .flex1.center Base Score
    .flex1.center Score
    .flex1.center Modifier
  .indent
    +each("systemAbilitiesArray as ability, index")
      .flexrow.mb-sm
        .flex2.left {ability[1].label}
        .flex1.center.align-text-with-input
          +if("abilityAdvancements?.[ability[1].abbreviation] > 0")
            span +
          span {abilityAdvancements?.[ability[1].abbreviation] || 0}
        .flex1.center.relative
          input.left.small.mainscore(disabled type="number" value="{$doc.system.abilities[ability[1].abbreviation].value}")
          .controls
            .up.chevron
              i.fas.fa-chevron-up(alt="Decrease" on:click!="{updateDebounce(ability[1].abbreviation, {target: {value: Number($doc.system.abilities[ability[1].abbreviation].value) + 1}})}")
            .down.chevron
              i.fas.fa-chevron-down(alt="Increase" on:click!="{updateDebounce(ability[1].abbreviation, {target: {value: Number($doc.system.abilities[ability[1].abbreviation].value) - 1}})}")
        .flex1.center.align-text-with-input {(Number(abilityAdvancements?.[ability[1].abbreviation]) || 0) + Number($doc.system.abilities[ability[1].abbreviation].value)}
        .flex1.center.align-text-with-input 
          +if("$doc.system.abilities[ability[1].abbreviation].mod > 0")
            span +
          span {$doc.system.abilities[ability[1].abbreviation].mod}
    hr
    .flexrow.justify-flexrow-vertical
      .flex1 Points total: 
      .flex
        +if("isNaN(scoreTotal)")
          span.red(data-tooltip="{localize('GAS.Setting.AbilityEntry.AllowPointBuy.InvalidTotal')}") N/A
          +else()
            input.center.small(disabled class="{pointBuyClass}"  type="number" value="{scoreTotal}") 
      .flex0 / 
      .flex1 
        input.center.small(disabled  type="number" value="{pointBuyLimit}") 
    
    +if("isNaN(scoreTotal)")
      hr
      button.btn.btn-primary(on:click="{reset}") Reset scores

</template>

<style lang="sass">
  .align-text-with-input
    margin-top: 0.3rem
  .green
    color: green
  .red
    color: red
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
    
</style>