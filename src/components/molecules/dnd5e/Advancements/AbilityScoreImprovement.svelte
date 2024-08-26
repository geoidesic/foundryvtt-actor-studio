<script>
  import { getContext, onDestroy, onMount, tick } from "svelte";
  import { getAdvancementValue } from "~/src/helpers/Utility";
  
  export let advancement = null;
  
  $: improvements = [];
  
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

  $: fixed = getNonZeroFixedValues(advancement.configuration)
  $: points = advancement.configuration.points

  $: if(fixed) {
    improvements = fixed;
  }
  $: if(points)(
    improvements = [
      { label: 'Points', value: Number(points) }
    ]
  )

  onMount(async () => {
    // game.system.log.d('advancement', advancement)
  });
  
</script>

<template lang="pug">
.advancement.mt-sm(data-type="{advancement.type}")
  +each("improvements as improvement")
    .flexrow
      .flex.left
        span.label {improvement.label}
      .flex0.right
        +if("Number(improvement.value) > 0")
          span +
        span.value {improvement.value}
</template>

<style lang="sass">
  @import "../../../../../styles/Mixins.scss"
  .advancement
    @include inset

</style>