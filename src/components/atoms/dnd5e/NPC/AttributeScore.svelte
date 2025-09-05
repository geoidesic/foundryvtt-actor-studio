<script>
  import { getContext, createEventDispatcher } from "svelte";
  import EditableValue from "~/src/components/atoms/EditableValue.svelte";
  
  export let abbreviation;
  export let score;
  export let readonly = false;
  
  const actor = getContext("#doc");
  const dispatch = createEventDispatcher();
  
  const mod = Math.floor((score - 10) / 2);
  const modString = mod >= 0 ? `+${mod}` : `${mod}`;
  
  function handleScoreSave(newValue) {
    console.log('AttributeScore - handleScoreSave called with:', newValue);
    const numValue = parseInt(newValue);
    if (!isNaN(numValue) && numValue >= 1 && numValue <= 30) {
      console.log('AttributeScore - Dispatching scoreUpdate event:', { ability: abbreviation, value: numValue });
      // Dispatch an event to let the parent component handle the update
      dispatch('scoreUpdate', {
        ability: abbreviation,
        value: numValue
      });
    } else {
      console.log('AttributeScore - Invalid value, not dispatching:', newValue);
    }
  }
</script>

<template lang="pug">
  .stat
    .flexcol.center
      .flex1.label {abbreviation}
      .flex1.value
        EditableValue(
          value="{score}"
          type="number"
          readonly="{readonly}"
          onSave="{handleScoreSave}"
          placeholder="10"
        ) ({modString})
</template>

<style lang="sass">
.stat 
  .label
    font-weight: bold
    text-transform: uppercase

// Removed unused CSS selector

</style>
