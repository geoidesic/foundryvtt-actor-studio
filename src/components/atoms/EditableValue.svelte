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
    console.log('EditableValue - startEdit called, readonly:', readonly, 'value:', value);
    if (readonly) {
      console.log('EditableValue - Cannot edit, readonly is true');
      return;
    }
    console.log('EditableValue - Starting edit mode');
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
    console.log('EditableValue - handleSave called, editValue:', editValue, 'original value:', value);
    if (editValue !== value) {
      const newValue = editValue;
      console.log('EditableValue - Dispatching save event with:', newValue);
      dispatch('save', { value: newValue, oldValue: value });
      if (onSave) {
        console.log('EditableValue - Calling onSave callback with:', newValue);
        onSave(newValue);
      }
    } else {
      console.log('EditableValue - No change in value, not saving');
    }
    console.log('EditableValue - Exiting edit mode');
    isEditing = false;
  }
  
  function handleCancel() {
    editValue = value;
    isEditing = false;
  }
  
  function handleKeydown(event) {
    console.log('EditableValue - handleKeydown called with key:', event.key);
    if (event.key === 'Enter') {
      console.log('EditableValue - Enter key detected, calling handleSave');
      handleSave();
    } else if (event.key === 'Escape') {
      console.log('EditableValue - Escape key detected, calling handleCancel');
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
      on:input!="{e => console.log('EditableValue - Input value changed to:', e.target.value)}"
      class!="{className}"
    )
  +if("!isEditing")
    span.editable-value(
      on:click!="{() => { console.log('EditableValue - Clicked! readonly:', readonly, 'value:', value); startEdit(); }}"
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
  transition: background-color 0.2s ease
  color: var(--color-text-primary, #333)
  
  &.editable
    cursor: pointer
    
    &:hover
      background-color: var(--color-border-highlight-50, rgba(0, 123, 255, 0.1))
      border: 1px solid var(--color-border-highlight, #007bff)

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
