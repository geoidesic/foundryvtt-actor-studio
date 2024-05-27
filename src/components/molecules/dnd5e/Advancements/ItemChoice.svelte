<script>
  import { getContext, onDestroy, onMount, tick } from "svelte";
  
  export let advancement = null;
  
  onMount(async () => {
    console.log('>>> advancement'+advancement.type, advancement)
  
  });
  
</script>

<template lang="pug">
  .advancement.mt-sm
    +if("advancement.title === 'Cantrip'")
      .flexrow
        .flex.left {advancement.configuration.hint}
      +else()
        .flexrow
          h3.flex.left
            span Choose 
            span {advancement.configuration.choices[0]}&nbsp
            span from: 
        ul.icon-list
          +each("advancement.configuration.pool as pool")
            +await("fromUuid(pool.uuid)")
              +then("item")
                li.left
                  .flexrow
                    .flex0.relative.image
                      img.icon(src="{item.img}" alt="{item.name}")
                    .flex2 {item.name}

</template>

<style lang="sass">
  @import "../../../../../styles/Mixins.scss"
  .advancement
    @include inset
    @include staticOptions

</style>