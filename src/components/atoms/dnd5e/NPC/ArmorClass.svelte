<script>
  import { getContext, createEventDispatcher } from "svelte";
  import EditableValue from "~/src/components/atoms/EditableValue.svelte";
  
  export let ac;
  export let readonly = false;
  
  const actor = getContext("#doc");
  const dispatch = createEventDispatcher();
  
  function handleACSave(newValue) {
    const numValue = parseInt(newValue);
    if (!isNaN(numValue) && numValue >= 0) {
      dispatch('acUpdate', {
        value: numValue
      });
    }
  }
</script>

<template lang="pug">
  .armor-class
    .label AC: 
      EditableValue(
        value="{ac.value}"
        type="number"
        readonly="{readonly}"
        onSave="{handleACSave}"
        placeholder="10"
      )
    //- +if("ac.calc")
    //-   span &nbsp;({ac.calc})
</template>

<style lang="scss">
.armor-class {
  margin: 0.5em 0;
}
</style>
