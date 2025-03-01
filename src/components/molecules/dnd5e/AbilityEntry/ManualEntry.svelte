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
          td.center
            input.center.small(name="{ability[1].abbreviation}" id="{ability[1].abbreviation}" type="number" value="{$doc.system.abilities[ability[1].abbreviation]?.value}" on:input!="{updateDebounce(ability[1].abbreviation, event)}")
          td.center {(Number(abilityAdvancements?.[ability[1].abbreviation]) || 0) + Number($doc.system.abilities[ability[1].abbreviation]?.value || 0)}
          td.center
            +if("$doc.system.abilities[ability[1].abbreviation]?.mod > 0")
              span +
            span {$doc.system.abilities[ability[1].abbreviation]?.mod}
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