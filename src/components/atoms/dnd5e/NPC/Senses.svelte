<script>
  import { getContext, createEventDispatcher } from "svelte";
  import { skillBonus } from "~/src/helpers/Utility";
  
  export let senses = {};
  export let readonly = false;
  
  const actor = getContext("#doc");
  const dispatch = createEventDispatcher();
  
  // Available sense types
  const senseTypes = [
    { key: 'blindsight', label: 'Blindsight' },
    { key: 'darkvision', label: 'Darkvision' },
    { key: 'tremorsense', label: 'Tremorsense' },
    { key: 'truesight', label: 'Truesight' }
  ];
  
  // Get current senses that have values
  $: currentSenses = Object.entries(senses || {})
    .filter(([key, value]) => value && value > 0)
    .map(([key, value]) => ({ 
      key, 
      label: senseTypes.find(s => s.key === key)?.label || key,
      value: value
    }));
  
  // Get available sense types to add
  $: availableSenses = senseTypes.filter(sense => 
    !currentSenses.some(s => s.key === sense.key)
  );


  $: passivePerception = (() => {
    const prc = $actor?.system?.skills?.prc;
    if (!prc) return 10;
    const bonus = skillBonus($actor,'prc') || 0;
    return 10 + bonus;
  })();
  
  // Helper functions
  function getSenseLabel(key) {
    return senseTypes.find(s => s.key === key)?.label || key;
  }
  
  // State for inline editing
  let editingSense = null;
  let editValue = '';
  let showAddSelect = false;
  let newSenseType = '';
  let newSenseValue = 60;
  
  function startEdit(sense) {
    if (readonly) return;
    editingSense = sense.key;
    editValue = sense.value.toString();
  }
  
  function handleSenseSave(senseKey) {
    if (editingSense === senseKey) {
      const numValue = parseInt(editValue);
      if (!isNaN(numValue) && numValue >= 0) {
        if (numValue > 0) {
          dispatch('senseUpdate', { sense: senseKey, value: numValue });
        } else {
          // If value is 0 or negative, remove the sense
          dispatch('senseUpdate', { sense: senseKey, value: null });
        }
      }
      editingSense = null;
      editValue = '';
    }
  }
  
  function handleRemoveSense(senseKey) {
    dispatch('senseUpdate', { sense: senseKey, value: null });
  }
  
  function handleAddSense() {
    if (availableSenses.length > 0) {
      showAddSelect = true;
      newSenseType = availableSenses[0].key;
      newSenseValue = 60;
    }
  }
  
  function confirmAddSense() {
    if (newSenseType && newSenseValue > 0) {
      dispatch('senseUpdate', { sense: newSenseType, value: newSenseValue });
      showAddSelect = false;
      newSenseType = '';
      newSenseValue = 60;
    }
  }
  
  function cancelAddSense() {
    showAddSelect = false;
    newSenseType = '';
    newSenseValue = 60;
  }
  
  function handleKeydown(event, senseKey) {
    if (event.key === 'Enter') {
      handleSenseSave(senseKey);
    } else if (event.key === 'Escape') {
      editingSense = null;
    }
  }
</script>

<template lang="pug">
  .senses-container
    .label.inline Senses ( Passive {passivePerception} )
    .value
      +if("currentSenses && currentSenses.length > 0")
        +each("currentSenses as sense")
          .sense-item
            span.sense-type {getSenseLabel(sense.key)}
            +if("!readonly")
              +if("editingSense === sense.key")
                input.sense-value(
                  type="number"
                  bind:value="{editValue}"
                  min="0"
                  on:blur!="{() => handleSenseSave(sense.key)}"
                  on:keydown!="{e => handleKeydown(e, sense.key)}"
                  placeholder="60"
                  autofocus
                )
                button.remove-btn(
                  on:click!="{() => handleRemoveSense(sense.key)}"
                  title="Remove {getSenseLabel(sense.key)}"
                ) ×
                +else()
                  span.sense-value.sense-editable(
                    on:click!="{() => startEdit(sense)}"
                    class!="{editingSense === sense.key ? 'editing' : ''}"
                  ) {sense.value}
                  button.remove-btn(
                    on:click!="{() => handleRemoveSense(sense.key)}"
                    title="Remove {getSenseLabel(sense.key)}"
                  ) ×
            +if("readonly")
              span.sense-value {sense.value}
            span.unit ft.
      
      +if("!readonly && availableSenses && availableSenses.length > 0")
        +if("showAddSelect")
          .add-sense-form
            select.sense-type-select(
              bind:value="{newSenseType}"
            )
              +each("availableSenses as sense")
                option(value="{sense.key}") {sense.label}
            input.sense-value-input(
              type="number"
              bind:value="{newSenseValue}"
              min="1"
              placeholder="60"
            )
            span.unit ft.
            button.confirm-btn(
              on:click!="{confirmAddSense}"
              title="Add Sense"
            ) ✓
            button.cancel-btn(
              on:click!="{cancelAddSense}"
              title="Cancel"
            ) ×
          +else()
            button.add-btn(
              on:click!="{handleAddSense}"
              title="Add Sense"
            ) + Add Sense
      
      +if("!currentSenses || currentSenses.length === 0")
        span.no-senses (no senses)
</template>

<style lang="sass" scoped>
.senses-container

  input.sense-value
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
  .sense-item
    display: flex
    align-items: center
    gap: 4px
    margin-bottom: 2px
    
    .sense-type
      font-weight: 500
      min-width: 80px
      text-transform: capitalize
    
    .sense-value
      width: 50px
      text-align: center
      padding: 2px 4px
      font-size: inherit
      font-family: inherit
      
      &:focus
        outline: none
        border-color: var(--color-border-highlight, #007bff)
        box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25)
    
    .unit
      color: var(--color-text-secondary, #666)
      font-size: 0.9em
    
    .remove-btn
      background: var(--color-error, #dc3545)
      color: white
      border: none
      border-radius: 50%
      width: 20px
      height: 20px
      cursor: pointer
      font-size: 14px
      line-height: 1
      padding: 0
      
      &:hover
        background: var(--color-error-hover, #c82333)
  
  .add-btn
    background: var(--color-success, #28a745)
    color: white
    border: none
    border-radius: 3px
    padding: 4px 8px
    cursor: pointer
    font-size: 0.9em
    margin-top: 4px
    
    &:hover
      background: var(--color-success-hover, #218838)
  
  .add-sense-form
    display: flex
    align-items: center
    gap: 4px
    margin-top: 4px
    
    .sense-type-select
      min-width: 100px
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
    
    .sense-value-input
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
    
    .confirm-btn
      background: var(--color-success, #28a745)
      color: white
      border: none
      border-radius: 50%
      width: 20px
      height: 20px
      cursor: pointer
      font-size: 14px
      line-height: 1
      padding: 0
      
      &:hover
        background: var(--color-success-hover, #218838)
    
    .cancel-btn
      background: var(--color-secondary, #6c757d)
      color: white
      border: none
      border-radius: 50%
      width: 20px
      height: 20px
      cursor: pointer
      font-size: 14px
      line-height: 1
      padding: 0
      
      &:hover
        background: var(--color-secondary-hover, #5a6268)
  
  .no-senses
    color: var(--color-text-secondary, #666)
    font-style: italic
  
  .sense-editable
    cursor: pointer
    border-radius: 3px
    transition: background-color 0.2s
    
    &:hover
      background: var(--color-border-highlight-50, rgba(0, 123, 255, 0.1))
    
    &.editing
      background: var(--color-border-highlight-50, rgba(0, 123, 255, 0.1))

// Dark theme overrides
@media (prefers-color-scheme: dark)
  .senses-container
    .sense-item
      .sense-value
        background: var(--color-bg-primary, #2b2b2b)
        color: var(--color-text-primary, #ffffff)
        border-color: var(--color-border-highlight, #4a9eff)
        
        &:focus
          border-color: var(--color-border-highlight, #4a9eff)
          box-shadow: 0 0 0 2px rgba(74, 158, 255, 0.25)
    
    .add-sense-form
      .sense-type-select,
      .sense-value-input
        background: var(--color-bg-primary, #2b2b2b)
        color: var(--color-text-primary, #ffffff)
        border-color: var(--color-border-highlight, #4a9eff)
        
        &:focus
          border-color: var(--color-border-highlight, #4a9eff)
          box-shadow: 0 0 0 2px rgba(74, 158, 255, 0.25)

:global(.dark-mode)
  .senses-container
    .sense-item
      .sense-value
        background: var(--color-bg-primary, #2b2b2b)
        color: var(--color-text-primary, #ffffff)
        border-color: var(--color-border-highlight, #4a9eff)
        
        &:focus
          border-color: var(--color-border-highlight, #4a9eff)
          box-shadow: 0 0 0 2px rgba(74, 158, 255, 0.25)
    
    .add-sense-form
      .sense-type-select,
      .sense-value-input
        background: var(--color-bg-primary, #2b2b2b)
        color: var(--color-text-primary, #ffffff)
        border-color: var(--color-border-highlight, #4a9eff)
        
        &:focus
          border-color: var(--color-border-highlight, #4a9eff)
          box-shadow: 0 0 0 2px rgba(74, 158, 255, 0.25)
</style>
