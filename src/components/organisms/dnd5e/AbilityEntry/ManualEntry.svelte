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
  .flexrow.mb-sm.header
    .flex3.left Ability
    .flex1.center Score
    .flex1.center Modifier
  +each("systemAbilitiesArray as ability, index")
    .flexrow.mb-sm
      .flex3.left {ability[1].label}
      .flex1.center
        input.center.small(type="number" value="{$doc.system.abilities[ability[1].abbreviation].value}" on:input!="{updateDebounce(ability[1].abbreviation, event)}")
      .flex1.center.align-text-with-input 
        +if("$doc.system.abilities[ability[1].abbreviation].mod > 0")
          span +
        span {$doc.system.abilities[ability[1].abbreviation].mod}
</template>

<style lang="sass">
  .header
    font-family: var(--dnd5e-font-modesto)

  .align-text-with-input
    text-align: center
    margin-top: 0.3rem
</style>