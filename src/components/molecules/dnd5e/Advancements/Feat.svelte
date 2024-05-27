<script>
  import { getContext, onDestroy, onMount, tick } from "svelte";
  
  export let advancement = null;
  
  onMount(async () => {
    console.log('advancement'+advancement.type, advancement)
  
  });
  
</script>

<template lang="pug">
  .advancement.mt-sm
    +if("advancement.title === 'Size'")
      .flexrow
        .flex.left {advancement.configuration.hint}

</template>

<style lang="sass">
  @import "../../../../../styles/Mixins.scss"
  .advancement
    @include inset

</style>