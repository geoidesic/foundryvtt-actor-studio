<script>
  import { onMount } from "svelte";
  import { ucfirst } from "~/src/helpers/Utility.js";

  export let src = false;
  export let level = false;
  export let classKey = false;
  export let iconClass = 'fas fa-plus';

  onMount(() => {
  });
</script>

<template lang="pug">
+if("src && level && classKey")
  .flexrow.class-row
    .flex0.icon
      img(height="40" width="40" src="{src}")
    .flex3.flexrow
      .flex3.left.pa-xs {ucfirst(classKey)} 
      .flex0.right.mr-sm
        .lozenge.pa-xs {level} 
      .flex0.right.pr-md.py-xs
        i(class="{iconClass}")
</template>

<style lang="sass">
  @import '../../../../styles/Mixins.scss'
  .lozenge
    background-color: var(--dnd5e-color-gold)
    color: #000
    border-radius: var(--border-radius)
    box-shadow: 0 0 6px var(--dnd5e-shadow-45)
  .gold-button-disabled
    @include gold-button(null)
  .gold-button
    @include gold-button  
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
