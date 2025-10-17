<script>
  import { getContext, onDestroy, onMount, tick } from "svelte";
  import { getAdvancementValue } from "~/src/helpers/Utility";
  
  export let advancement = null;

  $: count = advancement?.configuration?.choices?.[0]
    ? typeof advancement.configuration.choices[0] === 'object' && advancement.configuration.choices[0] !== null
      ? advancement.configuration.choices[0].count
      : advancement.configuration.choices[0]
    : '-';

  // Helper function to extract compendium name from UUID
  function getCompendiumNameFromUuid(uuid) {
    try {
      // UUID format: Compendium.{packName}.{entityType}.{entityId}
      const parts = uuid.split('.');
      if (parts.length >= 2 && parts[0] === 'Compendium') {
        return parts[1];
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  // Helper function to check if compendium is available
  function isCompendiumAvailable(uuid) {
    const compendiumName = getCompendiumNameFromUuid(uuid);
    if (!compendiumName) return false;
    
    const pack = game.packs.get(`Compendium.${compendiumName}`);
    return pack && pack.visible;
  }

  // Helper function to get user-friendly error message
  function getErrorMessage(uuid) {
    const compendiumName = getCompendiumNameFromUuid(uuid);
    if (compendiumName) {
      return `Compendium "${compendiumName}" is missing.`;
    }
    return `Error loading item: ${uuid}`;
  }

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
          h4.flex.left
            span Choose&nbsp
            span {count}&nbsp
            span from: 
        ul.icon-list
          +each("advancement.configuration.pool as pool")
            +await("fromUuid(pool.uuid)")
              +then("item")
                +if("item")
                  li.left
                    .flexrow
                      .flex0.relative.image
                        img.icon(src="{item.img}" alt="{item.name}")
                      .flex2 {item.name}
                  +else()
                    li.left.error-item
                      .flexrow
                        .flex0.relative.image
                          i.fas.fa-exclamation-triangle.icon(style="color: #ff6b6b;")
                        .flex2 {getErrorMessage(pool.uuid)}
              +catch("error")
                li.left.error-item
                  .flexrow
                    .flex0.relative.image
                      i.fas.fa-exclamation-triangle.icon(style="color: #ff6b6b;")
                    .flex2 {getErrorMessage(pool.uuid)}

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
    
  .icon-list li.error-item
    border-color: #ff6b6b
    background-color: rgba(255, 107, 107, 0.1)
    
  .icon-list li.error-item .flex2
    color: #ff6b6b
    font-style: italic
    font-size: 0.8rem
</style>