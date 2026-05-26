<script>
  import { createEventDispatcher } from "svelte";

  export let label = "";
  export let expanded = false;
  export let disabled = false;
  export let className = "";

  const dispatch = createEventDispatcher();

  function handleToggle() {
    if (disabled) return;
    dispatch("toggle");
  }
</script>

<template lang="pug">
button.collapsible-section-header.flexrow.pointer(
  type="button"
  class="{className}"
  disabled="{disabled}"
  aria-expanded="{expanded}"
  on:click="{handleToggle}"
)
  .toggle-marker.flex0 {expanded ? "[-]" : "[+]"}
  .header-label.flex {label}
  .header-right.flex0
    slot(name="right")
</template>

<style lang="sass">
  .collapsible-section-header
    display: flex
    align-items: center
    background: none
    border: none
    border-bottom: 1px solid var(--color-border-light-highlight)
    color: var(--gas-color-highlight)
    cursor: pointer
    font-family: var(--dnd5e-font-modesto)
    font-size: 1.5rem
    font-weight: 700
    line-height: 1.2
    margin: 0
    padding: 0
    text-align: left
    width: 100%

    &:hover
      background: rgba(0, 0, 0, 0.05)

    &:disabled
      cursor: not-allowed
      opacity: 0.5

      &:hover
        background: none

  .toggle-marker
    margin-right: var(--size-xs)
    white-space: nowrap

  .header-label
    flex: 1 1 auto
    min-width: 0

  .header-right
    margin-left: auto
</style>
