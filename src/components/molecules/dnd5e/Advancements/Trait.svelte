<script>
import { getContext, onDestroy, onMount, tick } from "svelte";

export let advancement = null;

$: grantArray = Array.from(advancement.configuration.grants).map(grant => {
  const split = grant.split(':');
  switch (split[0]) {
    case 'weapon':
      return split[2]
  
    default:
      return game.system.config[split[0]][split[1]].label
  }
});


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
    +else()
      +each("grantArray as grant")
        .flexrow
          .flex.left {grant}
    
</template>

<style lang="sass">
  @import "../../../../../styles/Mixins.scss"
  .advancement
    @include inset

</style>