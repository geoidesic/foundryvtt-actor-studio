<script>
  import { onMount } from "svelte";
  import { activeClass, characterClass, newClassLevel, isMultiClass } from "~/src/stores/index";
  import { log } from "../../../helpers/Utility";
  import { ucfirst } from "~/src/helpers/Utility.js";
  export let src = false;
  export let level = false;
  export let classKey = false;

  const cancelLevelUp = () => {
    $activeClass = false;
    $characterClass = false
    $newClassLevel = false
  };

  onMount(() => {
    // game.system.log.d("mounted LevelUpButtonInnards", src, level, classKey);
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
        +if("!$activeClass")
          i(class="fas fa-plus")
        +if("$activeClass && !$isMultiClass")
          i(class="fas fa-times" on:click!="{cancelLevelUp}")
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
</style>
