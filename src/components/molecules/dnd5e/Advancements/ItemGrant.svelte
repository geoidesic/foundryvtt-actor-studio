<script>
  import { getContext, onDestroy, onMount, tick } from "svelte";
  
  export let advancement = null;
  
  onMount(async () => {
    console.log('advancement'+advancement.type, advancement)
  
  });
  
</script>

<template lang="pug">
  .advancement.mt-sm
    +if("advancement.title === 'Languages'")
      .flexrow
        .flex.left
          span.label Any
        .flex.right
          span.value {advancement.configuration.choices[0].count}
    +if("advancement.title === 'Skills'")
      +each("advancement.items as skill")
        .flexrow
          .flex.left {game.system.config.skills[skill.value].label}

</template>

<style lang="sass">
  @import "../../../../../styles/Mixins.scss"
  .advancement
    @include inset

</style>