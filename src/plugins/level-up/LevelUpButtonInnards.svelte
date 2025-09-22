<script>
  import { onMount } from "svelte";
  import { ucfirst } from "~/src/helpers/Utility.js";
  import { readOnlyTabs } from "~/src/stores/index"
  export let src = false;
  export let oldLevel = false;
  export let newLevel = false;
  export let classKey = false;
  export let iconClass = 'fas fa-plus';

  onMount(() => {
  });
</script>

<template lang="pug">
+if("src && oldLevel && classKey")
  .flexrow.class-row
    .flex0.icon
      img(height="40" width="40" src="{src}")
    .flex3.flexrow
      .flex3.left.pa-xs {ucfirst(classKey)} 
      .center.mr-sm(class="{newLevel ? 'flex2' : 'flex0'}")
        .lozenge.pa-xs {oldLevel} {newLevel ? '→ ' + newLevel : ''} 
      +if("!$readOnlyTabs.includes('level-up')")
        .flex0.right.pr-md.py-xs
          i(class="{iconClass}")
</template>

<style lang="sass">
  @use '../../../styles/Mixins.sass' as mixins
  .lozenge
    background-color: var(--dnd5e-color-gold)
    color: #000
    border-radius: var(--border-radius)
    box-shadow: 0 0 6px var(--dnd5e-shadow-45)
  .gold-button-disabled
    +mixins.gold-button(null)
  .gold-button
    +mixins.gold-button  
  .class-row
    padding: 0
    justify-items: center
    align-items: center
  .icon
    min-width: 40px
  i
    &:not(.fa-plus):not(.fa-times)
      margin-right: 0.8em
</style>
