<script>
  import { log, update } from "~/src/helpers/Utility";
  import { Timing } from "@typhonjs-fvtt/runtime/util";
  import { createEventDispatcher, getContext, onDestroy, onMount, tick  } from "svelte";
  import { abilities, race } from "~/src/helpers/store"
  
  export let document = false;
  
  const dispatch = createEventDispatcher();
  const doc = document || getContext("#doc");
  const updateDebounce = Timing.debounce(updateValue, 300);

  function updateValue(attr, event) {
    const options = {system: {abilities: { [attr]: {value: Number(event.target.value)}}}};
    $doc.updateSource(options)
    $doc = $doc
  }

  $: systemAbilities = game.system.config.abilities
  $: systemAbilitiesArray = Object.entries(systemAbilities);
  $: raceFeatScore = 0;
  $: abilityAdvancements = $race?.advancement?.byType?.AbilityScoreImprovement?.[0].configuration?.fixed

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
        .flex1.center
          input.center.small(type="number" value="{$doc.system.abilities[ability[1].abbreviation].value}" on:input!="{updateDebounce(ability[1].abbreviation, event)}")
        .flex1.center.align-text-with-input {(Number(abilityAdvancements?.[ability[1].abbreviation]) || 0) + Number($doc.system.abilities[ability[1].abbreviation].value)}
        .flex1.center.align-text-with-input 
          +if("$doc.system.abilities[ability[1].abbreviation].mod > 0")
            span +
          span {$doc.system.abilities[ability[1].abbreviation].mod}
</template>

<style lang="sass">
  .align-text-with-input
    text-align: center
    margin-top: 0.3rem
</style>