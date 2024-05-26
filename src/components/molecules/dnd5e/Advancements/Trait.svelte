<script>
import { getContext, onDestroy, onMount, tick } from "svelte";

export let advancement = null;

$: grantArray = Array.from(advancement.configuration.grants).map(grant => {
  const [label, value] = grant.split(':');
  return { label, value };
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
  +if("advancement.title === 'Skills'")
    +each("grantArray as skill")
      .flexrow
        .flex.left {game.system.config.skills[skill.value].label}
    
</template>

<style lang="sass">
  @import "../../../../../styles/Mixins.scss"
  .advancement
    @include inset

</style>