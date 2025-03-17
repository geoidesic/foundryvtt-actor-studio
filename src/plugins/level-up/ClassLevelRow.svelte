<script>
import { getContext, onMount } from "svelte";
import LevelUpButtonInnards from "~/src/plugins/level-up/LevelUpButtonInnards.svelte";

export let cssClasses;
export let tooltip = 'Cancel';
export let eventHandler = () => {};
export let imgSrc;
export let oldLevel;
export let newLevel = false;
export let classKey;
export let iconClass;

onMount(async () => {
  console.log('ClassLevelRow');
});
</script>
<template lang="pug">
.class-row(
  class="{cssClasses}" 
  role="button" 
  aria-role="button" 
  aria-label="{tooltip}" 
  data-tooltip="{tooltip}" 
  on:mousedown!="{eventHandler}"
)
  LevelUpButtonInnards(
    src="{imgSrc}" 
    oldLevel="{oldLevel}" 
    newLevel="{newLevel}" 
    classKey="{classKey}" 
    iconClass="{iconClass}"
  )
</template>
<style lang="sass">
@use '../../../styles/Mixins.scss' as mixins

.gold-button-disabled
  +mixins.gold-button(null)
.gold-button
  +mixins.gold-button  
</style>