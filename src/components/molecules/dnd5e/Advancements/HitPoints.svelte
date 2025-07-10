<script>
  import { getContext, onDestroy, onMount, tick } from "svelte";
    import { getAdvancementValue } from "~/src/helpers/Utility";
  
  export let advancement = null;

  $: sizes = advancement.configuration.sizes;
  
  onMount(async () => {
    // window.GAS.log.d('advancement'+advancement.type, advancement)
    // window.GAS.log.d('Sizes', sizes);
  });
  
</script>

<template lang="pug">

</template>

<style lang="sass">
  @import "../../../../../styles/Mixins.sass"
  .advancement
    @include inset
    .badge
      
      @include badge

</style>