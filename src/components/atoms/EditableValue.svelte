<script>
  import { createEventDispatcher } from 'svelte';
  
  export let value = '';
  export let placeholder = '';
  export let type = 'text';
  export let readonly = false;
  export let className = '';
  export let onSave = null;
  
  const dispatch = createEventDispatcher();
  
  let isEditing = false;
  let editValue = '';
  let inputElement;
  
  function startEdit() {
    if (readonly) return;
    editValue = value;
    isEditing = true;
    setTimeout(() => {
      if (inputElement) {
        inputElement.focus();
        inputElement.select();
      }
    }, 0);
  }
  
  function handleSave() {
    if (editValue !== value) {
      const newValue = editValue;
      dispatch('save', { value: newValue, oldValue: value });
      if (onSave) {
        onSave(newValue);
      }
    }
    isEditing = false;
  }
  
  function handleCancel() {
    editValue = value;
    isEditing = false;
  }
  
  function handleKeydown(event) {
    if (event.key === 'Enter') {
      handleSave();
    } else if (event.key === 'Escape') {
      handleCancel();
    }
  }
</script>

<template lang="pug">
  +if("isEditing")
    input.editable-input(
      bind:this="{inputElement}"
      bind:value="{editValue}"
      placeholder="{placeholder}"
      on:blur="{handleSave}"
      on:keydown="{handleKeydown}"

      class!="{className}"
    )
  +if("!isEditing")
    span.editable-value(
      on:click!="{startEdit}"
      on:keydown!="{e => e.key === 'Enter' && startEdit()}"
      tabindex="0"
      role="button"
      aria-label="Click to edit {value || placeholder}"
      class!="{className}"
      class:editable="{!readonly}"
    ) {value || placeholder}
</template>

<style lang="sass" scoped>
.editable-value
  cursor: default
  padding: 2px 4px
  border-radius: 3px
  transition: background-color 0.2s ease, border-color 0.15s ease
  color: var(--color-text-primary, #333)
  // Reserve border space to avoid layout shift on hover
  border: 1px solid transparent
  box-sizing: border-box
  
  &.editable
    cursor: pointer
    
    &:hover
      background-color: var(--color-border-highlight-50, rgba(0, 123, 255, 0.1))
      border-color: var(--color-border-highlight, #007bff)

.editable-input
  width: 100%
  min-width: 60px
  padding: 2px 4px
  border: 1px solid var(--color-border-highlight, #007bff)
  border-radius: 3px
  background: var(--color-bg-primary, white)
  color: var(--color-text-primary, #333)
  font-size: inherit
  font-family: inherit
  
  &::placeholder
    color: var(--color-text-secondary, #666)
  
  &:focus
    outline: none
    border-color: var(--color-border-highlight, #007bff)
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25)
  
  // Dark theme specific overrides
  @media (prefers-color-scheme: dark)
    background: var(--color-bg-primary, #2b2b2b)
    color: var(--color-text-primary, #ffffff)
    border-color: var(--color-border-highlight, #4a9eff)
    
    &::placeholder
      color: var(--color-text-secondary, #cccccc)
  
  // Force dark theme when Foundry is in dark mode
  :global(.dark-mode) &
    background: var(--color-bg-primary, #2b2b2b)
    color: var(--color-text-primary, #ffffff)
    border-color: var(--color-border-highlight, #4a9eff)
    
    &::placeholder
      color: var(--color-text-secondary, #cccccc)
</style>
