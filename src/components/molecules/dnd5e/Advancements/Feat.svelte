<script>
  import { getContext, onDestroy, onMount, tick } from "svelte";
  import { getAdvancementHint } from "~/src/helpers/Utility";
  
  export let advancement = null;
  
  onMount(async () => {
    console.log('advancement'+advancement.type, advancement)
  
  });
  
</script>

<template lang="pug">
  .advancement.mt-sm(data-type="{advancement.type}")
    +if("advancement.title === 'Size'")
      .flexrow
        .flex.left {getAdvancementHint(advancement)}

</template>

<style lang="sass">
  @import "../../../../../styles/Mixins.scss"
  .advancement
    @include inset

</style>