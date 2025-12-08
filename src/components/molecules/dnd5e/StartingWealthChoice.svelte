<script>
  import { createEventDispatcher } from 'svelte';
  import { readOnlyTabs, startingWealthChoice } from '~/src/stores/index';
  
  const dispatch = createEventDispatcher();
  
  let choice = null;
  
  $: isReadOnly = $readOnlyTabs.includes('wealth-choice');
  
  // Update choice from store when readonly (after confirmation)
  $: if (isReadOnly && !choice) {
    choice = $startingWealthChoice;
  }
  
  function handleChoice(selectedChoice) {
    if (isReadOnly) return;
    choice = selectedChoice;
  }
  
  function confirmChoice() {
    if (choice && !isReadOnly) {
      dispatch('confirm', { choice });
    }
  }
  
  function handleEdit() {
    choice = null;
    dispatch('edit');
  }
</script>

<template lang="pug">
.starting-wealth-choice(class:readonly!="{isReadOnly}")
  h2 Starting Wealth
  +if("isReadOnly")
    p.readonly-message Your choice has been saved. You can change it by clicking the buttons below.
    +else()
      p.instruction Choose how you want to determine your starting wealth:
  
  .choice-buttons-container
    button.wealth-choice-button(
      type="button"
      class:selected!="{choice === 'equipment'}"
      on:click!="{() => handleChoice('equipment')}"
      disabled!="{isReadOnly}"
    )
      .choice-content
        .choice-icon
          i.fas.fa-box
        .choice-text
          .choice-title Standard Equipment
          .choice-detail Take the equipment listed in your class
    
    button.wealth-choice-button(
      type="button"
      class:selected!="{choice === 'gold'}"
      on:click!="{() => handleChoice('gold')}"
      disabled!="{isReadOnly}"
    )
      .choice-content
        .choice-icon
          i.fas.fa-coins
        .choice-text
          .choice-title Roll for Gold
          .choice-detail Roll dice to determine starting gold, then buy equipment
  
  +if("choice")
    .confirm-section
      button.confirm-button(
        type="button"
        on:click!="{confirmChoice}"
        disabled!="{isReadOnly}"
      ) 
        i.fas.fa-check
        span Confirm Choice
  
  +if("isReadOnly && choice")
    .readonly-indicator
      i.fas.fa-lock
      span Choice locked
      button.edit-button(
        type="button"
        on:click!="{handleEdit}"
        title="Change your wealth choice"
      )
        i.fas.fa-edit
        span Edit
</template>

<style lang="sass">
  $color-gold: #ffd700
  $color-bg: #1a1a1a
  $color-text-dark-primary: #e0e0e0
  $color-text-dark-secondary: #a0a0a0
  $color-border-light-primary: #404040
  $border-radius: 4px
  $color-success: #28a745

  .starting-wealth-choice
    padding: 2rem
    text-align: center
    background: rgba(0, 0, 0, 0.1)
    border-radius: $border-radius
    
    &.readonly
      opacity: 0.9
  
  h2
    margin: 0 0 1rem 0
    color: $color-text-dark-primary
    font-size: 1.5rem
    font-weight: 600
    text-transform: uppercase
  
  .instruction
    margin-bottom: 2rem
    color: $color-text-dark-secondary
    font-size: 0.95rem
    line-height: 1.5
  
  .readonly-message
    margin-bottom: 2rem
    color: #666
    font-size: 0.85rem
    font-style: italic
    line-height: 1.5

  .choice-buttons-container
    display: grid
    grid-template-columns: 1fr 1fr
    gap: 2rem
    margin: 2rem 0
    
    @media (max-width: 768px)
      grid-template-columns: 1fr
      gap: 1.5rem

  .wealth-choice-button
    display: flex
    align-items: center
    justify-content: center
    padding: 1.5rem
    border: 2px solid $color-border-light-primary
    border-radius: 8px
    background: $color-bg
    cursor: pointer
    transition: all 0.3s ease
    text-align: left
    font-family: inherit
    position: relative
    min-height: 140px

    &:hover:not(:disabled)
      border-color: $color-gold
      background: rgba(255, 215, 0, 0.05)
      transform: translateY(-2px)
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3)

    &.selected
      border-color: $color-gold
      background: rgba(255, 215, 0, 0.1)
      box-shadow: 0 0 16px rgba(255, 215, 0, 0.3), inset 0 0 8px rgba(255, 215, 0, 0.1)

    &:disabled
      opacity: 0.6
      cursor: not-allowed

  .choice-content
    display: flex
    flex-direction: column
    align-items: center
    gap: 1rem
    width: 100%

  .choice-icon
    display: flex
    align-items: center
    justify-content: center
    width: 48px
    height: 48px
    border-radius: 50%
    background: rgba(255, 215, 0, 0.15)
    color: $color-gold
    font-size: 1.75rem
    transition: all 0.3s ease

    .wealth-choice-button.selected &
      background: rgba(255, 215, 0, 0.3)
      transform: scale(1.1)

  .choice-text
    display: flex
    flex-direction: column
    gap: 0.25rem

  .choice-title
    font-size: 1.1rem
    font-weight: 600
    color: $color-text-dark-primary

  .choice-detail
    font-size: 0.85rem
    color: $color-text-dark-secondary
    line-height: 1.4

  .confirm-section
    display: flex
    justify-content: center
    margin-top: 2rem
    animation: slideInUp 0.3s ease

  .confirm-button
    padding: 0.75rem 2rem
    font-size: 1rem
    min-width: 180px
    display: flex
    align-items: center
    gap: 0.5rem
    justify-content: center
    border: none
    border-radius: $border-radius
    color: white
    background: $color-success
    cursor: pointer
    font-weight: 600
    transition: all 0.2s ease

    &:hover:not(:disabled)
      background: #218838
      transform: translateY(-1px)
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2)

    &:disabled
      opacity: 0.6
      cursor: not-allowed

    i
      font-size: 1rem

  .readonly-indicator
    display: flex
    align-items: center
    justify-content: center
    gap: 0.75rem
    margin-top: 1.5rem
    color: #666
    font-size: 0.85rem
    
    i
      font-size: 0.9rem

  .edit-button
    padding: 0.4rem 0.8rem
    font-size: 0.75rem
    border: 1px solid #666
    border-radius: 3px
    background: transparent
    color: #666
    cursor: pointer
    display: flex
    align-items: center
    gap: 0.3rem
    transition: all 0.2s ease
    white-space: nowrap

    &:hover
      background: rgba(100, 100, 100, 0.2)
      border-color: #888
      color: #888

    i
      font-size: 0.75rem

  @keyframes slideInUp
    from
      opacity: 0
      transform: translateY(10px)
    to
      opacity: 1
      transform: translateY(0)
</style>
