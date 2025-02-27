<script>
  import { getContext, onDestroy, onMount, tick } from "svelte";
    import { getAdvancementValue } from "~/src/helpers/Utility";
  
  export let advancement = null;

  $: sizes = advancement.configuration.sizes;
  
  onMount(async () => {
    // game.system.log.d('advancement'+advancement.type, advancement)
    // game.system.log.d('Sizes', sizes);
  });
  
</script>

<template lang="pug">

</template>

<style lang="sass">
  @import "../../../../../styles/Mixins.scss"
  .advancement
    @include inset
    .badge
      
      @include badge

</style>