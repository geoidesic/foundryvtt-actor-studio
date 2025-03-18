<script>
import { getContext, onMount } from "svelte";
import { isLevelUpAdvancementInProgress } from "~/src/stores";
import LevelUpButtonInnards from "~/src/plugins/level-up/LevelUpButtonInnards.svelte";

export let cssClasses;
export let tooltip = 'Cancel';
export let eventHandler = () => {};
export let imgSrc;
export let oldLevel;
export let newLevel = false;
export let classKey;
export let iconClass;
export let disabled = false;

onMount(async () => {
  console.log('ClassLevelRow');
});
</script>
<template lang="pug">
pre isLevelUpAdvancementInProgress {$isLevelUpAdvancementInProgress}
.class-row(
  class="{cssClasses} {disabled ? 'disabled' : ''}" 
  role="button" 
  aria-role="button" 
  aria-label="{tooltip}" 
  data-tooltip="{tooltip}" 
  on:mousedown!="{$isLevelUpAdvancementInProgress ? () => {} : eventHandler}"
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
  &.disabled
    opacity: 0.3
</style>