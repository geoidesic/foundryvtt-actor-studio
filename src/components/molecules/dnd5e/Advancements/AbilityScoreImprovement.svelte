<script>
  import { getContext, onDestroy, onMount, tick } from "svelte";
    import { log } from "../../../../helpers/Utility";
  
  export let advancement = null;
  
  function getNonZeroFixedValues(obj) {
    if (!obj || typeof obj !== 'object' || !obj.fixed) {
      throw new Error('Invalid input object');
    }

    const fixed = obj.fixed;
    const nonZeroFixedArray = [];

    for (const key in fixed) {
      if (fixed.hasOwnProperty(key) && fixed[key] !== 0) {
        nonZeroFixedArray.push({ label: key, value: fixed[key] });
      }
    }

    return nonZeroFixedArray;
  }


  $: improvements = getNonZeroFixedValues(advancement.configuration);

  onMount(async () => {
    console.log('advancement'+advancement.type, advancement)
    
  });
  
</script>

<template lang="pug">
.advancement.mt-sm
  +each("improvements as improvement")
    .flexrow
      .flex.left
        span.label {improvement.label}
      .flex.right
        +if("Number(improvement.value) > 0")
          span +
        span.value {improvement.value}
</template>

<style lang="sass">
  @import "../../../../../styles/Mixins.scss"
  .advancement
    @include inset

</style>