<script>
  import { log, update } from "~/src/helpers/Utility";
  import { Timing } from "@typhonjs-fvtt/runtime/util";
  import { createEventDispatcher, getContext, onDestroy, onMount, tick  } from "svelte";
  import { abilities, race, } from "~/src/helpers/store"
  import { MODULE_ID } from "~/src/helpers/constants"
  
  export let document = false;
  
  const dispatch = createEventDispatcher();
  const doc = document || getContext("#doc");
  const updateDebounce = Timing.debounce(updateValue, 100);
  let formula;

  function updateValue(attr, event) {
    if(event.target.value < 8) return false;
    if(event.target.value > 15) return false;
    const options = {system: {abilities: { [attr]: {value: Number(event.target.value)}}}};
    $doc.updateSource(options)
    $doc = $doc
  }


  async function roll(attr) {
    const roll = await new Roll(formula).evaluate();
    await roll.toMessage();

    // set the value of the ability to the result of the roll
    const options = {system: {abilities: { [attr]: {value: Number(roll.total)}}}};
    $doc.updateSource(options)
    $doc = $doc
  }
  

  $: systemAbilities = game.system.config.abilities
  $: systemAbilitiesArray = Object.entries(systemAbilities);
  $: raceFeatScore = 0;
  $: abilityAdvancements = $race?.advancement?.byType?.AbilityScoreImprovement?.[0].configuration?.fixed

  onMount(async () => {
    formula = game.settings.get(MODULE_ID, "abiiltyRollFormula")
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
          input.center.small(disabled type="number" value="{$doc.system.abilities[ability[1].abbreviation].value}")
        .flex1.center.align-text-with-input {(Number(abilityAdvancements?.[ability[1].abbreviation]) || 0) + Number($doc.system.abilities[ability[1].abbreviation].value)}
        .flex1.center.align-text-with-input 
          +if("$doc.system.abilities[ability[1].abbreviation].mod > 0")
            span +
          span {$doc.system.abilities[ability[1].abbreviation].mod}
        .flex0.center.justify-flexrow-vertical.controls(alt="Roll" on:click!="{roll(ability[1].abbreviation)}")
          i.fas.fa-dice

</template>

<style lang="sass">
  .align-text-with-input
    margin-top: 0.3rem
  .green
    color: green
  .red
    color: red
  .controls
    cursor: pointer
    min-width: 24px
    font-size: 1rem
    background-color: rgba(0, 0, 0, 0.1)
    padding: 2px 1px 0px 0px
    border: 1px solid grey
    border-radius: 4px
    &:hover
      cursor: pointer
      background-color: rgba(140, 90, 0, 0.2)
    
</style>