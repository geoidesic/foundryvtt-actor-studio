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
  display: inline-block
  vertical-align: middle
  margin: 0 .25rem
  width: 35px
  align-self: center
  // Prevent stretching in some headers
  flex: 0 0 auto

  .slide-toggle-track
    height: 16px
    border-radius: 999px
    background-color: var(--dnd5e-color-gold)
    border: 1px solid rgba(0,0,0,0.25)

  .slide-toggle-thumb
    width: 16px
    height: 16px
    border-radius: 50%
    background: #111
    border: 1px solid rgba(0,0,0,0.35)

// Slightly reduce size on compact headers
:global(.window-app .window-header) .gas-mode-slider
  transform: translateY(1px)
</style>
