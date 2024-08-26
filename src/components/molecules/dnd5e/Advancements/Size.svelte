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
  .advancement.mt-sm(data-type="{advancement.type}")
    +if("advancement.title === 'Size'")
      .flexrow
        +if("getAdvancementValue(advancement, 'hint')")
          .flex.left {getAdvancementValue(advancement, 'hint')}
        +if("sizes?.size > 0")
          .flex0
            +each("sizes as size")
              .flex0.right.badge {game.system.config.actorSizes[size].label}
              

</template>

<style lang="sass">
  @import "../../../../../styles/Mixins.scss"
  .advancement
    @include inset
    .badge
      
      @include badge

</style>