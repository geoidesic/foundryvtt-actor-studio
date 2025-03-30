<script>
  import { Timing } from "@typhonjs-fvtt/runtime/util";
  import { createEventDispatcher, getContext, onDestroy, onMount, tick  } from "svelte";
  import { abilities, race } from "~/src/stores/index"
  
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

  $: console.log(systemAbilitiesArray)
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
            +if("abilityAdvancements?.[ability[0]] > 0")
              span +
            span {abilityAdvancements?.[ability[0]] || 0}
          td.center
            input.center.small(name="{ability[0]}" id="{ability[0]}" type="number" value="{$doc.system.abilities[ability[0]]?.value}" on:input!="{updateDebounce(ability[0], event)}")
          td.center {(Number(abilityAdvancements?.[ability[0]]) || 0) + Number($doc.system.abilities[ability[0]]?.value || 0)}
          td.center
            +if("Number($doc.system.abilities[ability[0]]?.mod) + (Number(abilityAdvancements?.[ability[0]]) || 0) > 0")
              span +
            span {Number($doc.system.abilities[ability[0]]?.mod) + (Number(abilityAdvancements?.[ability[0]]) || 0)}
          
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
</style>