<script>
  import { onMount, onDestroy } from 'svelte';

  // Shared edit mode store and permission flag
  export let editStore; // writable<boolean>
  export let canEdit = false;

  let el;
  let unsub;

  function syncFromStore(value) {
    try {
      if (!el) return;
      el.checked = !!value;
      el.disabled = !canEdit;
      const label = game?.i18n?.localize?.(`DND5E.SheetMode${value ? 'Edit' : 'Play'}`) ?? 'Edit';
      el.dataset.tooltip = 'DND5E.SheetModeEdit';
      el.setAttribute('aria-label', label);
    } catch (_) {}
  }

  function onChange(ev) {
    if (!canEdit) return;
    const checked = !!ev.currentTarget.checked;
    editStore?.set?.(checked);
  }

  onMount(() => {
    unsub = editStore?.subscribe?.(syncFromStore);
    if (el) el.addEventListener('change', onChange);
  });

  onDestroy(() => {
    try { if (el) el.removeEventListener('change', onChange); } catch (_) {}
    try { unsub?.(); } catch (_) {}
  });
</script>

<svelte:options accessors={true} />

<template lang="pug">
  //- Header slide toggle like dnd5e
  slide-toggle.mode-slider.gas-mode-slider(bind:this="{el}")
</template>

<style lang="sass">
// Compact & aligned header toggle with dnd5e palette
.gas-mode-slider
  --slide-toggle-height: 18px
  --slide-toggle-width: 36px
  --slide-toggle-padding: 3px
  --slide-toggle-thumb-width: calc(var(--slide-toggle-height) - var(--slide-toggle-padding) * 2)
  --slide-toggle-thumb-height: var(--slide-toggle-thumb-width)
  --slide-toggle-transition-time: 250ms
  display: inline-block
  width: var(--slide-toggle-width)
  height: var(--slide-toggle-height)
  cursor: var(--cursor-pointer)
  vertical-align: middle
  margin: 0 .25rem
  width: 35px
  align-self: center
  // Prevent stretching in some headers
  flex: 0 0 auto

:global(.gas-mode-slider .slide-toggle-track)
  --slide-toggle-track-color-unchecked: dimgrey
  width: 100%
  height: 100%
  background: var(--slide-toggle-track-color-unchecked, black)
  border-radius: calc((var(--slide-toggle-height) * 2) / 3)
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.45)
  display: flex
  flex-direction: row
  justify-content: start
  padding: var(--slide-toggle-padding)

:global(.gas-mode-slider[aria-label="Edit"] .slide-toggle-track)
  background: var(--color-positive, green)
  
:global(.gas-mode-slider .slide-toggle-track .slide-toggle-thumb::before)
  content: "\f0ad"
  font-family: var(--font-awesome)
  color: black
  font-weight: bold
  font-size: var(--font-size-9)
  position: absolute
  top: 1px
  right: 1px

:global(.gas-mode-slider .slide-toggle-thumb)
  position: relative
  width: var(--slide-toggle-thumb-width)
  height: var(--slide-toggle-thumb-height)
  border-radius: 100%
  background: var(--slide-toggle-thumb-color, white)
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.45)
  text-align: top
  transition: margin-left var(--slide-toggle-transition-time) ease
:global(.dnd5e2.sheet:is(.item, .actor):where(:not(.minimized)) > header > slide-toggle.gas-mode-slider .slide-toggle-thumb::before )
  content: "\f0ad"
  font-family: var(--font-awesome)
  color: var(--dnd5e-background-alt-1)
  font-weight: bold
  font-size: var(--font-size-9)
// Slightly reduce size on compact headers
:global(.window-app .window-header) .gas-mode-slider
  transform: translateY(1px)
</style>
