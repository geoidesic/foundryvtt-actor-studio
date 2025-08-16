<script>
  import { getContext, createEventDispatcher } from "svelte";
  import EditableValue from "~/src/components/atoms/EditableValue.svelte";
  
  export let movement; // { walk, fly, swim, burrow, climb, units, hover }
  export let readonly = false;
  
  const actor = getContext("#doc");
  const dispatch = createEventDispatcher();
  
  function handleSpeedSave(type, newValue) {
    const numValue = parseInt(newValue);
    if (!isNaN(numValue) && numValue >= 0) {
      dispatch('speedUpdate', {
        type: type,
        value: numValue
      });
    }
  }
</script>

<template lang="pug">
  .speed.label.inline
    strong Speed: 
  .value
    span
      +if("movement.walk")
        EditableValue(
          value="{movement.walk}"
          type="number"
          readonly="{readonly}"
          onSave!="{val => handleSpeedSave('walk', val)}"
          placeholder="30"
        )
        span  ft.
      +if("movement.fly")
        span , Fly 
        EditableValue(
          value="{movement.fly}"
          type="number"
          readonly="{readonly}"
          onSave!="{val => handleSpeedSave('fly', val)}"
          placeholder="0"
        )
        span  ft.{movement.hover ? ' (hover)' : ''}
      +if("movement.swim")
        span , Swim 
        EditableValue(
          value="{movement.swim}"
          type="number"
          readonly="{readonly}"
          onSave!="{val => handleSpeedSave('swim', val)}"
          placeholder="0"
        )
        span  ft.
      +if("movement.burrow")
        span , Burrow 
        EditableValue(
          value="{movement.burrow}"
          type="number"
          readonly="{readonly}"
          onSave!="{val => handleSpeedSave('burrow', val)}"
          placeholder="0"
        )
        span  ft.
      +if("movement.climb")
        span , Climb 
        EditableValue(
          value="{movement.climb}"
          type="number"
          readonly="{readonly}"
          onSave!="{val => handleSpeedSave('climb', val)}"
          placeholder="0"
        )
        span  ft.
</template>

<style lang="scss">
.speed {
  margin: 0.5em 0;
}
</style>
