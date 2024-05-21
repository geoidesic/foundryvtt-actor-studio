<script>
  import { log, update } from "~/src/helpers/Utility";
  import { Timing } from "@typhonjs-fvtt/runtime/util";
  import { createEventDispatcher, getContext, onDestroy, onMount  } from "svelte";
  
  export let document = false;
  
  const dispatch = createEventDispatcher();
  const doc = document || getContext("#doc");
  const updateDebounce = (path) => Timing.debounce($doc.update({[path]: Number(event.target.value) }), 300);

  function updateValue(attr, event) {
    const options = {system: {abilities: { [attr]: {value: Number(event.target.value)}}}};
    console.log(options);
    $doc.updateSource(options)
    console.log($doc);
  }

  $: systemAbilities = game.system.config.abilities
  $: systemAbilitiesArray = Object.entries(systemAbilities);

</script>

<template lang="pug">
.attribute-entry.mt-sm
  +each("systemAbilitiesArray as ability, index")
    .flexrow.mb-sm
      .flex1 {ability[1].label}
      .flex3.right
        //- input(type="number" value="{$doc.system.abilities[ability[1].abbreviation].value}" on:input="{updateDebounce(`system.abilities.${ability[1].abbreviation}.value`)}" style="width: 40px")
        input(type="number" value="{$doc.system.abilities[ability[1].abbreviation].value}" on:input!="{updateValue(ability[1].abbreviation, event)}" style="width: 40px")
</template>

