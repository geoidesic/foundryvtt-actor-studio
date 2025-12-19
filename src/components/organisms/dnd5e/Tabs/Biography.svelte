<script>
  import { getContext } from "svelte";
  import { writable } from "svelte/store";
  import { MODULE_ID } from "~/src/helpers/constants";
  import { getWorkflowFSM, WORKFLOW_EVENTS } from '~/src/helpers/WorkflowStateMachine';
  import { biographyOptions, isGenerating, biographyContent, generateBiography, requestTokens, responseTokens } from '~/src/stores/biography';
  import { updateSource } from '~/src/helpers/Utility';

  const actor = getContext("#doc");
  const app = getContext("#external").application;

  // Local loading state for UI feedback
  let isGeneratingLocal = false;

  async function handleGenerateBiography() {
    if (isGeneratingLocal) return;
    
    isGeneratingLocal = true;
    try {
      await generateBiography();
    } catch (error) {
      console.error('Biography generation failed:', error);
    } finally {
      isGeneratingLocal = false;
    }
  }

  async function handleNameInput(event) {
    const newName = event.target.value;
    // Update the actor name immediately when user types
    if ($actor && newName !== $actor.name) {
      await updateSource($actor, { name: newName });
    }
  }

  function completeBiography() {
    // Save the biography content to the actor
    const updates = {};

    if ($biographyContent.name) {
      updates['name'] = $biographyContent.name;
    }
    if ($biographyContent.ideals) {
      updates['system.details.ideals'] = $biographyContent.ideals;
    }
    if ($biographyContent.flaws) {
      updates['system.details.flaws'] = $biographyContent.flaws;
    }
    if ($biographyContent.bonds) {
      updates['system.details.bonds'] = $biographyContent.bonds;
    }
    if ($biographyContent.personalityTraits) {
      updates['system.details.trait'] = $biographyContent.personalityTraits;
    }
    if ($biographyContent.appearance) {
      updates['system.details.appearance'] = $biographyContent.appearance;
    }
    if ($biographyContent.biography) {
      updates['system.details.biography.value'] = $biographyContent.biography;
    }

    if (Object.keys(updates).length > 0) {
      updateSource($actor, updates);
    }

    // Transition to next workflow state
    const fsm = getWorkflowFSM();
    fsm.handle(WORKFLOW_EVENTS.BIOGRAPHY_COMPLETE);
  }
</script>

<template lang="pug">
.biography-tab
  .biography-header
    h3 Biography Generation
    p Generate detailed character biography elements using AI. Check the boxes for elements you want to generate.

  .token-info
    .token-display
      span Request Tokens: {$requestTokens}
      span Response Tokens: {$responseTokens}

  .biography-content
    .biography-cards
      .biography-card
        .card-header
          label.card-checkbox
            input.option-checkbox(
              type="checkbox"
              bind:checked="{$biographyOptions.name}"
            )
            span Name
        input.name-input(
          type="text"
          placeholder="Enter character name..."
          value="{$biographyContent.name}"
          on:input="{handleNameInput}"
        )

      .biography-card
        .card-header
          label.card-checkbox
            input.option-checkbox(
              type="checkbox"
              bind:checked="{$biographyOptions.ideals}"
            )
            span Ideals
        textarea.biography-textarea(
          placeholder="Enter character's flaws..."
          bind:value="{$biographyContent.flaws}"
          rows="3"
        )

      .biography-card
        .card-header
          label.card-checkbox
            input.option-checkbox(
              type="checkbox"
              bind:checked="{$biographyOptions.bonds}"
            )
            span Bonds
        textarea.biography-textarea(
          placeholder="Enter character's bonds..."
          bind:value="{$biographyContent.bonds}"
          rows="3"
        )

      .biography-card
        .card-header
          label.card-checkbox
            input.option-checkbox(
              type="checkbox"
              bind:checked="{$biographyOptions.personalityTraits}"
            )
            span Personality Traits
        textarea.biography-textarea(
          placeholder="Enter character's personality traits..."
          bind:value="{$biographyContent.personalityTraits}"
          rows="3"
        )

      .biography-card
        .card-header
          label.card-checkbox
            input.option-checkbox(
              type="checkbox"
              bind:checked="{$biographyOptions.appearance}"
            )
            span Appearance
        textarea.biography-textarea(
          placeholder="Enter character's physical appearance..."
          bind:value="{$biographyContent.appearance}"
          rows="3"
        )

      .biography-card
        .card-header
          label.card-checkbox
            input.option-checkbox(
              type="checkbox"
              bind:checked="{$biographyOptions.biography}"
            )
            span Biography
        textarea.biography-textarea(
          placeholder="Enter character's background biography..."
          bind:value="{$biographyContent.biography}"
          rows="4"
        )

  .biography-actions
    .action-buttons
      button.generate-btn(
        type="button"
        on:click="{handleGenerateBiography}"
        disabled="{isGeneratingLocal}"
      )
        i.fas(class="{isGeneratingLocal ? 'fa-spinner fa-spin' : 'fa-magic'}")
        span {isGeneratingLocal ? 'Generating...' : 'Generate Biography'}

  // Loading overlay
  +if("isGeneratingLocal")
    .loading-overlay
      .loading-content
        .spinner
          i.fas.fa-spinner.fa-spin
        .loading-text
          p Generating biography...
          button.cancel-btn(
            type="button"
            on:click!="{() => { isGeneratingLocal = false; }}"
          )
            span Cancel

</template>

<style lang="sass">
.biography-tab
  padding: 1rem

  .biography-header
    margin-bottom: 1.5rem

    h3
      margin: 0 0 0.5rem 0
      color: var(--color-text-dark-primary)

    p
      margin: 0
      color: var(--color-text-dark-secondary)

  .biography-options
    margin-bottom: 1.5rem

    h4
      margin: 0 0 1rem 0

    .option-grid
      display: grid
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr))
      gap: 1rem

      .option-item
        .option-label
          display: flex
          align-items: center
          cursor: pointer

          .option-checkbox
            margin-right: 0.5rem

          .option-text

  .token-info
    margin-bottom: 1.5rem
    padding: 1rem
    background: var(--color-bg-dark-secondary)
    border-radius: 4px

    .token-display
      display: flex
      justify-content: space-between
      font-family: monospace

      span
        color: var(--color-text-dark-secondary)

  .biography-content
    margin-bottom: 1.5rem

    .biography-cards
      display: grid
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr))
      gap: 1rem

      .biography-card
        background: var(--color-bg-dark-secondary)
        border-radius: 8px
        padding: 1rem
        border: 1px solid var(--color-border-light)

        .card-header
          display: flex
          align-items: center
          margin-bottom: 0.75rem

          .card-checkbox
            display: flex
            align-items: center
            cursor: pointer
            font-weight: 600

            .option-checkbox
              margin-right: 0.5rem

        .biography-textarea
          width: 100%
          padding: 0.75rem
          border: 1px solid var(--color-border-light)
          border-radius: 4px
          font-family: inherit
          font-size: 0.9rem
          line-height: 1.4
          resize: vertical
          min-height: 80px

          &:focus
            outline: none
            border-color: var(--color-primary)
            box-shadow: 0 0 0 2px rgba(var(--color-primary-rgb), 0.2)

        .name-input
          width: 100%
          padding: 0.75rem
          border: 1px solid var(--color-border-light)
          border-radius: 4px
          font-family: inherit
          font-size: 0.9rem

          &:focus
            outline: none
            border-color: var(--color-primary)
            box-shadow: 0 0 0 2px rgba(var(--color-primary-rgb), 0.2)

  .biography-actions
    margin-bottom: 1.5rem
    display: flex
    justify-content: center

    .action-buttons
      .generate-btn
        background: var(--color-primary)
        color: white
        border: none
        padding: 0.75rem 1.5rem
        border-radius: 4px
        font-family: inherit
        font-size: 0.9rem
        cursor: pointer
        display: flex
        align-items: center
        gap: 0.5rem
        transition: background-color 0.2s

        &:hover:not(:disabled)
          background: var(--color-primary-dark)

        &:disabled
          background: var(--color-bg-dark-secondary)
          color: var(--color-text-dark-secondary)
          cursor: not-allowed

  .loading-overlay
    position: fixed
    top: 0
    left: 0
    right: 0
    bottom: 0
    background: rgba(0, 0, 0, 0.7)
    display: flex
    align-items: center
    justify-content: center
    z-index: 1000

    .loading-content
      background: var(--color-bg-dark-primary)
      padding: 2rem
      border-radius: 8px
      text-align: center
      border: 1px solid var(--color-border-light)

      .spinner
        font-size: 2rem
        color: var(--color-primary)
        margin-bottom: 1rem

      .loading-text
        p
          margin: 0 0 1rem 0
          color: var(--color-text-dark-primary)

        .cancel-btn
          background: var(--color-bg-dark-secondary)
          color: var(--color-text-dark-primary)
          border: 1px solid var(--color-border-light)
          padding: 0.5rem 1rem
          border-radius: 4px
          cursor: pointer
          font-family: inherit
          font-size: 0.9rem

          &:hover
            background: var(--color-bg-dark-tertiary)
</style>