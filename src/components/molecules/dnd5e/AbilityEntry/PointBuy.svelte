<script>
  import { Timing } from "@typhonjs-fvtt/runtime/util";
  import { createEventDispatcher, getContext, setContext, onDestroy, onMount, tick  } from "svelte";
  import { abilities, race, pointBuyScoreTotal, pointBuyLimit, abilityRolls } from "~/src/stores/index"
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
    $doc.updateSource(options);
    $doc = $doc;
    
    // Explicitly recalculate the pointBuyScoreTotal to ensure reactivity
    $pointBuyScoreTotal = systemAbilitiesArray?.reduce(
      (acc, ability) => acc + POINT_BUY_COSTS[Number($doc.system.abilities[ability[1].abbreviation]?.value)], 
      0
    ) || 12;
  }

  // Function to calculate pointBuyLimit
  function calculatePointBuyLimit() {
    return game.settings.get(MODULE_ID, "pointBuyLimit");
  }

  function reset() {
    $abilityRolls = {};
    const options = {system: {abilities: {}}};
    systemAbilitiesArray.forEach(ability => {
      options.system.abilities[ability[1].abbreviation] = {value: 10};
    });
    $doc.updateSource(options);
    $doc = $doc;
    
    // Explicitly recalculate the pointBuyScoreTotal to ensure reactivity
    $pointBuyScoreTotal = systemAbilitiesArray?.reduce(
      (acc, ability) => acc + POINT_BUY_COSTS[Number($doc.system.abilities[ability[1].abbreviation]?.value)], 
      0
    ) || 12;
  }
  

  $: systemAbilities = game.system.config.abilities
  $: systemAbilitiesArray = Object.entries(systemAbilities);
  $: raceFeatScore = 0;
  $: abilityAdvancements = $race?.advancement?.byType?.AbilityScoreImprovement?.[0].configuration?.fixed
  $: $pointBuyScoreTotal = systemAbilitiesArray?.reduce((acc, ability) => acc + POINT_BUY_COSTS[Number($doc.system.abilities[ability[1].abbreviation]?.value)], 0) || 12;
  $: activeCSSClass = $pointBuyScoreTotal !== $pointBuyLimit ? ' active' : '';
  $: pointBuyClass = $pointBuyScoreTotal > $pointBuyLimit ? 'red'+activeCSSClass: 'green'+activeCSSClass


  onMount(async () => {
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
        th.center Modifier
    tbody
      +each("systemAbilitiesArray as ability, index")
        tr
          td.ability {ability[1].label}
          td.center
            +if("abilityAdvancements?.[ability[1].abbreviation] > 0")
              span +
            span {abilityAdvancements?.[ability[1].abbreviation] || 0}
          td.center.relative
            input.left.small.mainscore(disabled type="number" value="{$doc.system.abilities[ability[1].abbreviation]?.value}" name="{ability[1].abbreviation}" id="{ability[1].abbreviation}" )
            .controls
              .up.chevron(on:click!="{updateDebounce(ability[1].abbreviation, {target: {value: Number($doc.system.abilities[ability[1].abbreviation]?.value) + 1}})}")
                i.fas.fa-chevron-up(alt="Decrease")
              .down.chevron( on:click!="{updateDebounce(ability[1].abbreviation, {target: {value: Number($doc.system.abilities[ability[1].abbreviation]?.value) - 1}})}")
                i.fas.fa-chevron-down(alt="Increase")
          td.center {(Number(abilityAdvancements?.[ability[1].abbreviation]) || 0) + Number($doc.system.abilities[ability[1].abbreviation]?.value || 0)}
          td.center
            +if("$doc.system.abilities[ability[1].abbreviation]?.mod > 0")
              span +
            span {$doc.system.abilities[ability[1].abbreviation]?.mod}
      tr
        td(colspan="5")
          hr
          .flexrow.justify-flexrow-vertical
            .flex1 Points total: 
            .flex
              +if("isNaN($pointBuyScoreTotal)")
                span.red(data-tooltip="{localize('GAS.Setting.AbilityEntry.AllowPointBuy.InvalidTotal')}") N/A
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
    border-spacing: 0 0.5rem
   
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
    min-width: 40px
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
        top: 0
        &:hover
          background-color: rgba(140, 90, 0, 0.2)
      &.down
        padding: 1px 3px 0px 3px
        bottom: 0
        &:hover
          background-color: rgba(140, 90, 0, 0.2)
    
</style>