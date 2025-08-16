<script>
  import { getContext, createEventDispatcher } from "svelte";
  import EditableValue from "~/src/components/atoms/EditableValue.svelte";
  import { enrichHTML } from "~/src/helpers/Utility";

  export let hp; // { value, max, temp, tempmax, formula }
  export let readonly = false;
  
  const actor = getContext("#doc");
  const dispatch = createEventDispatcher();
  
  function handleMaxHPSave(newValue) {
    const numValue = parseInt(newValue);
    if (!isNaN(numValue) && numValue >= 1) {
      dispatch('hpUpdate', {
        type: 'max',
        value: numValue
      });
    }
  }
  
  function handleFormulaSave(newValue) {
    dispatch('hpUpdate', {
      type: 'formula',
      value: newValue
    });
  }
</script>

<template lang="pug">
  .hit-points
    .label.inline
      strong Hit Points  
    +await("enrichHTML(`[[/r ${hp.formula}]]`)")
      +then("Html")
        .value
          EditableValue(
            value="{hp.max}"
            type="number"
            readonly="{readonly}"
            onSave!="{handleMaxHPSave}"
            placeholder="10"
          )
          span {@html Html}
    +if("hp.temp")
      span &nbsp;Temp: {hp.temp}/{hp.tempmax}
</template>

<style lang="scss">
.hit-points {
  margin: 0.5em 0;
}
</style>