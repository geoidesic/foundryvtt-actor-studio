<script>
  import { getContext, onDestroy, onMount, tick } from "svelte";
  import { getAdvancementValue } from "~/src/helpers/Utility";
  
  export let advancement = null;

  $: count = advancement?.configuration?.choices?.[0]
    ? typeof advancement.configuration.choices[0] === 'object' && advancement.configuration.choices[0] !== null
      ? advancement.configuration.choices[0].count
      : advancement.configuration.choices[0]
    : '-';

  onMount(async () => {
  
  });
  
</script>

<template lang="pug">
  .advancement.mt-sm(data-type="{advancement.type}")
    +if("advancement.title === 'Cantrip'")
      .flexrow
        .flex.left {getAdvancementValue(advancement, 'hint')}
      +else()
        .flexrow
          h3.flex.left
            span Choose 
            span {count}&nbsp
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