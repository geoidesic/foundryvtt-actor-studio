<script>
  import { getContext, createEventDispatcher } from 'svelte';
  import { updateSource } from "~/src/helpers/Utility";
  
  export let readonly = false;
  
  const actor = getContext("#doc");
  const dispatch = createEventDispatcher();
  
  $: movement = $actor?.system?.attributes?.movement || {};
  
  // Available movement types
  const movementTypes = [
    { key: 'walk', label: 'Walk' },
    { key: 'fly', label: 'Fly' },
    { key: 'swim', label: 'Swim' },
    { key: 'climb', label: 'Climb' },
    { key: 'burrow', label: 'Burrow' }
  ];
  
  // Reactive declarations - filter out zero values
  $: currentMovements = movement ? Object.entries(movement)
    .filter(([key, value]) => value > 0) // Only show movements with values > 0
    .map(([key, value]) => ({ key, value })) : [];
  
  $: availableTypes = movementTypes.filter(type => !movement || !movement[type.key] || movement[type.key] <= 0);
  
  // Comma-separated display for non-edit mode
  $: commaSeparatedMovements = currentMovements.map(m => `${getMovementLabel(m.key)} ${m.value} ft.`).join(', ');
  
  // State for inline editing
  let editingMovement = null;
  let editValue = '';
  let showAddSelect = false;
  let newMovementType = '';
  let newMovementValue = 30;
  let isEditing = false;
  
  // Helper function to get movement label
  function getMovementLabel(key) {
    return movementTypes.find(t => t.key === key)?.label || key;
  }
  
  function startEdit(movementItem) {
    if (readonly) return;
    editingMovement = movementItem.key;
    editValue = movementItem.value;
  }
  
  async function handleSpeedSave(movementKey) {
    if (editingMovement === movementKey) {
      const newValue = parseInt(editValue) || 0;
      try {
        if (newValue > 0) {
          await updateSource($actor, { [`system.attributes.movement.${movementKey}`]: newValue });
          dispatch('speedUpdate', { type: movementKey, value: newValue });
        } else {
          // If value is 0 or negative, remove the movement
          const currentMovement = { ...movement };
          delete currentMovement[movementKey];
          await updateSource($actor, { 'system.attributes.movement': currentMovement });
          dispatch('speedUpdate', { type: movementKey, value: null });
        }
      } catch (error) {
        console.error('Failed to update movement:', error);
      }
      editingMovement = null;
      editValue = '';
    }
  }
  
  async function handleRemoveMovement(movementKey) {
    try {
      const currentMovement = { ...movement };
      delete currentMovement[movementKey];
      await updateSource($actor, { 'system.attributes.movement': currentMovement });
      dispatch('speedUpdate', { type: movementKey, value: null });
    } catch (error) {
      console.error('Failed to remove movement:', error);
    }
  }
  
  function handleAddMovement() {
    if (availableTypes.length > 0) {
      showAddSelect = true;
      newMovementType = availableTypes[0].key;
      newMovementValue = 30;
    }
  }
  
  function startEditing() {
    if (!readonly) {
      isEditing = true;
    }
  }
  
  function stopEditing() {
    isEditing = false;
    showAddSelect = false;
    editingMovement = null;
  }
  
  async function confirmAddMovement() {
    if (newMovementType && newMovementValue > 0) {
      try {
        await updateSource($actor, { [`system.attributes.movement.${newMovementType}`]: newMovementValue });
        dispatch('speedUpdate', { type: newMovementType, value: newMovementValue });
        showAddSelect = false;
        newMovementType = '';
        newMovementValue = 30;
      } catch (error) {
        console.error('Failed to add movement:', error);
      }
    }
  }
  
  function cancelAddMovement() {
    showAddSelect = false;
    newMovementType = '';
    newMovementValue = 30;
  }
  
  function handleKeydown(event, movementKey) {
    if (event.key === 'Enter') {
      handleSpeedSave(movementKey);
    } else if (event.key === 'Escape') {
      editingMovement = null;
    }
  }
</script>

<template lang="pug">
  .speed-container
    .flexrow.justify-flexrow-vertical
      .flex1
        .label.inline Speed
      .flex4
        .value
          +if("!isEditing")
            +if("currentMovements && currentMovements.length > 0")
              span.movements-display(
                on:click!="{startEditing}"
                class!="{readonly ? '' : 'editable'}"
                title!="{readonly ? '' : 'Click to edit movement'}"
              ) {commaSeparatedMovements}
              +else()
                span.no-movement(
                  on:click!="{startEditing}"
                  class!="{readonly ? '' : 'editable'}"
                  title!="{readonly ? '' : 'Click to add movement'}"
                ) (no movement)
          +if("isEditing")
            .movements-edit-mode
              +if("currentMovements && currentMovements.length > 0")
                +each("currentMovements as movement")
                  .movement-item
                    span.movement-type {getMovementLabel(movement.key)}
                    +if("editingMovement === movement.key")
                      input.movement-input(
                        type="number"
                        bind:value="{editValue}"
                        min="0"
                        on:blur!="{() => handleSpeedSave(movement.key)}"
                        on:keydown!="{e => handleKeydown(e, movement.key)}"
                        placeholder="30"
                        autofocus
                      )
                      button.button-remove(
                        on:click!="{() => handleRemoveMovement(movement.key)}"
                        title="Remove {getMovementLabel(movement.key)}"
                      ) ×
                      +else()
                        span.movement-value.speed-editable(
                          on:click!="{() => startEdit(movement)}"
                          class!="{editingMovement === movement.key ? 'editing' : ''}"
                        ) {movement.value}
                        span.unit ft.
                        button.button-remove(
                          on:click!="{() => handleRemoveMovement(movement.key)}"
                          title="Remove {getMovementLabel(movement.key)}"
                        ) ×
          
          +if("isEditing && !readonly")
            +if("showAddSelect")
              .add-movement-form
                select.movement-type-select(
                  bind:value="{newMovementType}"
                )
                  +each("availableTypes as type")
                    option(value="{type.key}") {type.label}
                input.movement-value-input(
                  type="number"
                  bind:value="{newMovementValue}"
                  min="1"
                  placeholder="30"
                )
                span.unit ft.
                button.button-confirm(
                  on:click!="{confirmAddMovement}"
                  title="Add Movement"
                ) ✓
                button.button-cancel(
                  on:click!="{cancelAddMovement}"
                  title="Cancel"
                ) ×
            +if("!showAddSelect")
              .add-movement-buttons
                +if("availableTypes && availableTypes.length > 0")
                  button.button-confirm(
                    on:click!="{handleAddMovement}"
                    title="Add Movement"
                  ) +
                button.button-confirm(
                  on:click!="{stopEditing}"
                  title="Done editing"
                ) ✓
</template>

<style lang="sass" scoped>
  @import "/Users/noeldacosta/code/foundryvtt-actor-studio/styles/Mixins.sass"
.speed-container
  .movements-display
    @include display-hover
  
  .no-movement
    @include empty-state
  
  
  .movements-edit-mode
    margin-top: 4px
  
  .add-movement-buttons
    @include button-container
  
  .movement-item
    @include item-list
    
    .movement-type
      font-weight: bold
      // min-width: 40px
      text-transform: capitalize
    
    .movement-value
      // Styles for the span display value only
      // width: 50px
      text-align: center
      padding: 2px 4px
    
    .movement-input
      width: 50px
      text-align: center
      padding: 2px 4px
      border: 1px solid var(--color-border-highlight, #007bff)
      border-radius: 3px
      background: var(--color-bg-primary, white)
      color: var(--color-text-primary, #333)
      font-size: inherit
      font-family: inherit
      
      &:focus
        outline: none
        border-color: var(--color-border-highlight, #007bff)
        box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25)
    
    .unit
      color: var(--color-text-secondary, #666)
      font-size: 0.9em
    
    .button-remove
      @include button-remove
  
  
  .add-movement-form
    @include form-container
    margin-top: 4px
    
    .movement-type-select
      @include form-select
      min-width: 80px
    
    .movement-value-input
      @include form-number-input
    
  
  .no-movement
    color: var(--color-text-secondary, #666)
    font-style: italic
  
  .speed-editable
    cursor: pointer
    border-radius: 3px
    transition: background-color 0.2s
    
    &:hover
      background: var(--color-border-highlight-50, rgba(0, 123, 255, 0.1))
    
    &.editing
      background: var(--color-border-highlight-50, rgba(0, 123, 255, 0.1))

// Dark theme overrides
@media (prefers-color-scheme: dark)
  .speed-container
    .movement-item
      .movement-input
        background: var(--color-bg-primary, #2b2b2b)
        color: var(--color-text-primary, #ffffff)
        border-color: var(--color-border-highlight, #4a9eff)
        
        &:focus
          border-color: var(--color-border-highlight, #4a9eff)
          box-shadow: 0 0 0 2px rgba(74, 158, 255, 0.25)
    
    .add-movement-form
      .movement-type-select,
      .movement-value-input
        background: var(--color-bg-primary, #2b2b2b)
        color: var(--color-text-primary, #ffffff)
        border-color: var(--color-border-highlight, #4a9eff)
        
        &:focus
          border-color: var(--color-border-highlight, #4a9eff)
          box-shadow: 0 0 0 2px rgba(74, 158, 255, 0.25)

:global(.dark-mode)
  .speed-container
    .movement-item
      .movement-input
        background: var(--color-bg-primary, #2b2b2b)
        color: var(--color-text-primary, #ffffff)
        border-color: var(--color-border-highlight, #4a9eff)
        
        &:focus
          border-color: var(--color-border-highlight, #4a9eff)
          box-shadow: 0 0 0 2px rgba(74, 158, 255, 0.25)
    
    .add-movement-form
      .movement-type-select,
      .movement-value-input
        background: var(--color-bg-primary, #2b2b2b)
        color: var(--color-text-primary, #ffffff)
        border-color: var(--color-border-highlight, #4a9eff)
        
        &:focus
          border-color: var(--color-border-highlight, #4a9eff)
          box-shadow: 0 0 0 2px rgba(74, 158, 255, 0.25)
</style>
