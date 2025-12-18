<script>
  import { getContext } from "svelte";
  import { writable } from "svelte/store";
  import { MODULE_ID } from "~/src/helpers/constants";
  import LLM from "~/src/plugins/llm";
  import { getWorkflowFSM, WORKFLOW_EVENTS } from '~/src/helpers/WorkflowStateMachine';

  const actor = getContext("#doc");
  const app = getContext("#external").application;

  // Biography generation options
  const biographyOptions = writable({
    ideals: true,
    flaws: true,
    bonds: true,
    personalityTraits: true,
    appearance: true,
    biography: true
  });

  // Generation state
  const isGenerating = writable(false);
  const requestTokens = writable(0);
  const responseTokens = writable(0);
  const generatedBiography = writable({
    ideals: '',
    flaws: '',
    bonds: '',
    personalityTraits: '',
    appearance: '',
    biography: ''
  });

  // Calculate request tokens (rough estimate)
  $: {
    const selectedOptions = Object.entries($biographyOptions).filter(([_, selected]) => selected).length;
    const baseTokens = 100; // Base prompt tokens
    const perOptionTokens = 50; // Tokens per selected option
    $requestTokens = baseTokens + (selectedOptions * perOptionTokens);
  }

  async function generateBiography() {
    if ($isGenerating) return;

    $isGenerating = true;
    try {
      // Build the prompt based on selected options
      const selectedElements = Object.entries($biographyOptions)
        .filter(([_, selected]) => selected)
        .map(([key, _]) => key);

      if (selectedElements.length === 0) {
        ui.notifications.warn('Please select at least one biography element to generate.');
        return;
      }

      // Get race and class info for context
      const race = $actor?.system?.details?.race || 'human';
      const characterClass = $actor?.classes ? Object.keys($actor.classes)[0] : 'adventurer';
      const level = $actor?.system?.details?.level || 1;

      // Generate biography using LLM
      const result = await LLM.generateBiography({
        race,
        characterClass,
        level,
        elements: selectedElements
      });

      // Update the generated biography
      $generatedBiography = result;

      // Estimate response tokens (rough calculation)
      const responseText = Object.values(result).join(' ');
      $responseTokens = Math.ceil(responseText.length / 4); // Rough token estimate

      ui.notifications.info('Biography generated successfully!');

    } catch (error) {
      console.error('Failed to generate biography:', error);
      ui.notifications.error('Failed to generate biography. Please try again.');
    } finally {
      $isGenerating = false;
    }
  }

  function completeBiography() {
    // Save the generated biography to the actor
    const updates = {};

    if ($generatedBiography.ideals) {
      updates['system.details.ideals'] = $generatedBiography.ideals;
    }
    if ($generatedBiography.flaws) {
      updates['system.details.flaws'] = $generatedBiography.flaws;
    }
    if ($generatedBiography.bonds) {
      updates['system.details.bonds'] = $generatedBiography.bonds;
    }
    if ($generatedBiography.personalityTraits) {
      updates['system.details.trait'] = $generatedBiography.personalityTraits;
    }
    if ($generatedBiography.appearance) {
      updates['system.details.appearance'] = $generatedBiography.appearance;
    }
    if ($generatedBiography.biography) {
      updates['system.details.biography.value'] = $generatedBiography.biography;
    }

    if (Object.keys(updates).length > 0) {
      $actor.update(updates);
    }

    // Transition to next workflow state
    const fsm = getWorkflowFSM();
    fsm.handle(WORKFLOW_EVENTS.BIOGRAPHY_COMPLETE);
  }

  function skipBiography() {
    // Transition to next workflow state without generating
    const fsm = getWorkflowFSM();
    fsm.handle(WORKFLOW_EVENTS.BIOGRAPHY_COMPLETE);
  }
</script>

<template lang="pug">
.biography-tab
  .biography-header
    h3 Biography Generation
    p Generate detailed character biography elements using AI. Select which elements you want to generate below.

  .biography-options
    h4 Select Biography Elements:
    .option-grid
      +each("Object.entries($biographyOptions) as [key, selected]")
        .option-item
          label.option-label
            input.option-checkbox(
              type="checkbox"
              bind:checked="{selected}"
            )
            span.option-text {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}

  .token-info
    .token-display
      span Request Tokens: {$requestTokens}
      span Response Tokens: {$responseTokens}

  .biography-content
    +if("$generatedBiography.ideals")
      .biography-section
        h5 Ideals
        p {$generatedBiography.ideals}

    +if("$generatedBiography.flaws")
      .biography-section
        h5 Flaws
        p {$generatedBiography.flaws}

    +if("$generatedBiography.bonds")
      .biography-section
        h5 Bonds
        p {$generatedBiography.bonds}

    +if("$generatedBiography.personalityTraits")
      .biography-section
        h5 Personality Traits
        p {$generatedBiography.personalityTraits}

    +if("$generatedBiography.appearance")
      .biography-section
        h5 Appearance
        p {$generatedBiography.appearance}

    +if("$generatedBiography.biography")
      .biography-section
        h5 Biography
        p {$generatedBiography.biography}

  .biography-actions
    button.generate-btn(
      type="button"
      on:click="{generateBiography}"
      disabled="{$isGenerating}"
    )
      | {#if $isGenerating}Generating...{:else}Generate Biography{/if}

    button.skip-btn(
      type="button"
      on:click="{skipBiography}"
    )
      | Skip Biography
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

    .biography-section
      margin-bottom: 1.5rem
      padding: 1rem
      background: var(--color-bg-dark-secondary)
      border-radius: 4px

      h5
        margin: 0 0 0.5rem 0
        color: var(--color-text-dark-primary)

      p
        margin: 0
        color: var(--color-text-dark-secondary)
        line-height: 1.5

  .biography-actions
    display: flex
    gap: 1rem
    justify-content: flex-end

    button
      padding: 0.75rem 1.5rem
      border: none
      border-radius: 4px
      font-weight: 500
      cursor: pointer
      transition: all 0.2s ease

      &.generate-btn
        background: var(--color-primary)
        color: white

        &:hover:not(:disabled)
          background: var(--color-primary-dark)

        &:disabled
          opacity: 0.6
          cursor: not-allowed

      &.complete-btn
        background: var(--color-success)
        color: white

        &:hover:not(:disabled)
          background: var(--color-success-dark)

        &:disabled
          opacity: 0.6
          cursor: not-allowed

      &.skip-btn
        background: var(--color-bg-dark-secondary)
        color: var(--color-text-dark-primary)

        &:hover
          background: var(--color-bg-dark-tertiary)
</style>