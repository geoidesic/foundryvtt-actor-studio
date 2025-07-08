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
  @import "../../../../../styles/Mixins.sass"
  .advancement
    @include inset
    @include staticOptions
    
  .icon-list
    padding: 0
    margin: 4px 0 0 0
    list-style-type: none
    
  .icon-list li
    display: flex
    align-items: center
    margin: 2px 0
    padding: 0
    border: 1px solid #ccc
    border-radius: 4px
    height: 30px
    overflow: hidden
    
  .icon-list li .flexrow
    display: flex
    align-items: center
    width: 100%
    height: 100%
    
  .icon-list li .flex0.image
    flex: 0 0 30px
    height: 100%
    display: flex
    align-items: center
    justify-content: center
    margin-right: 4px
    
  .icon-list li .flex0.image img.icon
    width: 30px
    height: 30px
    object-fit: cover
    
  .icon-list li .flex2
    display: flex
    align-items: center
    padding: 0 8px
    flex-grow: 1
    height: 100%
    font-size: 0.9rem
</style>