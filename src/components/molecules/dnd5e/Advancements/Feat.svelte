<script>
  import { getContext, onDestroy, onMount, tick } from "svelte";
  import { getAdvancementValue } from "~/src/helpers/Utility";
  
  export let advancement = null;
  
  onMount(async () => {
    console.log('advancement'+advancement.type, advancement)
  
  });
  
</script>

<template lang="pug">
  .advancement.mt-sm(data-type="{advancement.type}")
    +if("advancement.title === 'Size'")
      .flexrow
        .flex.left {getAdvancementValue(advancement)}

</template>

<style lang="sass">
  @import "../../../../../styles/Mixins.sass"
  .advancement
    @include inset

</style>