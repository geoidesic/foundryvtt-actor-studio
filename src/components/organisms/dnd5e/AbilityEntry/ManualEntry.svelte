<script>
  import { log, update } from "~/src/helpers/Utility";
  import { Timing } from "@typhonjs-fvtt/runtime/util";
  import { createEventDispatcher, getContext, onDestroy, onMount  } from "svelte";
  
  export let document = false;
  
  const dispatch = createEventDispatcher();
  const doc = document || getContext("#doc");
  const updateDebounce = Timing.debounce(updateValue, 300);

  function updateValue(attr, event) {
    const options = {system: {abilities: { [attr]: {value: Number(event.target.value)}}}};
    $doc.updateSource(options)
    $doc = $doc
    log.d($doc.system.abilities);
  }

  $: systemAbilities = game.system.config.abilities
  $: systemAbilitiesArray = Object.entries(systemAbilities);

</script>

<template lang="pug">
.attribute-entry.mt-sm
  h5.flexrow.mb-sm
    .flex2.left Ability
    .flex1.center Race / Background
    .flex1.center Base Score
    .flex1.center Modifier
  .indent
    +each("systemAbilitiesArray as ability, index")
      .flexrow.mb-sm
        .flex2.left {ability[1].label}
        .flex1.center.align-text-with-input  0
        .flex1.center
          input.center.small(type="number" value="{$doc.system.abilities[ability[1].abbreviation].value}" on:input!="{updateDebounce(ability[1].abbreviation, event)}")
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