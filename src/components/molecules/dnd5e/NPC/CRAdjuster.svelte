<script>
  import { CRCalculator } from "~/src/helpers/CRCalculator.js";
  import { updateSource } from "~/src/helpers/Utility.js";
  import { createEventDispatcher, getContext } from "svelte";
  
  const actor = getContext("#doc");

  export let readonly = false;
  
  const dispatch = createEventDispatcher();
  
  let targetCR = 0;
  let currentCR = 0;
  let currentCRBreakdown = null;
  let showAdvanced = false;
  let isAdjusting = false;
  let isCollapsed = false;
  
  // Apply calculated CR to the in-memory actor
  async function applyCalculatedCR() {
    if (!$actor || readonly || !currentCRBreakdown) return;
    const finalCR = currentCRBreakdown.finalCR;
    if (finalCR === undefined || finalCR === null) return;
    try {
      // Update only the in-memory actor's CR (do not persist to compendium)
      await updateSource($actor, { system: { details: { cr: finalCR } } });
      // update local state to reflect change
      currentCR = finalCR;
      ui.notifications.info(`Applied calculated CR ${formatCR(finalCR)} to actor`);
    } catch (err) {
      console.error('Failed to apply calculated CR:', err);
      ui.notifications.error('Failed to apply calculated CR. See console for details.');
    }
  }
  
  // Debug: Log the CRCalculator version and check if it's the updated one
  console.log('🔧 CRCalculator loaded:', CRCalculator);
  console.log('🔧 CRCalculator.calculateCurrentCR:', typeof CRCalculator.calculateCurrentCR);
  console.log('🔧 CRCalculator.CR_TABLES.offensive[0]:', CRCalculator.CR_TABLES.offensive[0]);
  console.log('🔧 CRCalculator.CR_TABLES.offensive[5]:', CRCalculator.CR_TABLES.offensive[5]);
  
  // CR options for selection
  const crOptions = [
    { value: 0, label: '0 (10 XP)' },
    { value: 0.125, label: '1/8 (25 XP)' },
    { value: 0.25, label: '1/4 (50 XP)' },
    { value: 0.5, label: '1/2 (100 XP)' },
    { value: 1, label: '1 (200 XP)' },
    { value: 2, label: '2 (450 XP)' },
    { value: 3, label: '3 (700 XP)' },
    { value: 4, label: '4 (1,100 XP)' },
    { value: 5, label: '5 (1,800 XP)' },
    { value: 6, label: '6 (2,300 XP)' },
    { value: 7, label: '7 (2,900 XP)' },
    { value: 8, label: '8 (3,900 XP)' },
    { value: 9, label: '9 (5,000 XP)' },
    { value: 10, label: '10 (5,900 XP)' },
    { value: 11, label: '11 (7,200 XP)' },
    { value: 12, label: '12 (8,400 XP)' },
    { value: 13, label: '13 (10,000 XP)' },
    { value: 14, label: '14 (11,500 XP)' },
    { value: 15, label: '15 (13,000 XP)' },
    { value: 16, label: '16 (15,000 XP)' },
    { value: 17, label: '17 (18,000 XP)' },
    { value: 18, label: '18 (20,000 XP)' },
    { value: 19, label: '19 (22,000 XP)' },
    { value: 20, label: '20 (25,000 XP)' },
    { value: 21, label: '21 (33,000 XP)' },
    { value: 22, label: '22 (41,000 XP)' },
    { value: 23, label: '23 (50,000 XP)' },
    { value: 24, label: '24 (62,000 XP)' },
    { value: 25, label: '25 (75,000 XP)' },
    { value: 26, label: '26 (90,000 XP)' },
    { value: 27, label: '27 (105,000 XP)' },
    { value: 28, label: '28 (120,000 XP)' },
    { value: 29, label: '29 (135,000 XP)' },
    { value: 30, label: '30 (155,000 XP)' }
  ];
  
  // Reactive statements
  $: if ($actor) {
    const newCurrentCR = $actor.system?.details?.cr || 0;
    
    // Only set targetCR on initial load, not on every actor change
    if (currentCR !== newCurrentCR) {
      currentCR = newCurrentCR;
      targetCR = currentCR;
      console.log('🔄 Actor changed, calculating CR...');
      // Use a separate function for async CR calculation
      calculateInitialCR($actor);
    }
  }
  
  async function calculateInitialCR(actor) {
    try {
      currentCRBreakdown = await CRCalculator.calculateCurrentCR(actor);
      console.log('📊 Initial CR breakdown:', currentCRBreakdown);
    } catch (error) {
      console.error('Error calculating initial CR:', error);
    }
  }
  
  $: targetXP = CRCalculator.XP_VALUES[targetCR] || 0;
  $: targetPB = CRCalculator.PROFICIENCY_BONUS[targetCR] || 2;
  $: targetHP = getTargetHP();
  $: targetAC = getTargetAC();
  $: targetDPR = getTargetDPR();
  
  // Debug reactive statement to ensure UI updates
  $: if (currentCRBreakdown) {
    console.log('🔄 CR breakdown updated, UI should refresh:', currentCRBreakdown);
  }
  
  function getTargetHP() {
    const stats = CRCalculator.CR_TABLES.defensive[targetCR];
    if (!stats) return 0;
    const [min, max] = stats.hp;
    return Math.round((min + max) / 2);
  }
  
  function getTargetAC() {
    const stats = CRCalculator.CR_TABLES.defensive[targetCR];
    return stats?.ac || 13;
  }
  
  function getTargetDPR() {
    const stats = CRCalculator.CR_TABLES.offensive[targetCR];
    if (!stats) return 0;
    const [min, max] = stats.dpr;
    return Math.round((min + max) / 2);
  }
  
  function formatCR(cr) {
    if (cr === 0) return '0';
    if (cr === 0.125) return '1/8';
    if (cr === 0.25) return '1/4';
    if (cr === 0.5) return '1/2';
    return cr.toString();
  }
  
  function formatXP(xp) {
    return xp.toLocaleString();
  }
  
  async function adjustToTargetCR() {
    if (!$actor || readonly) return;
    
    isAdjusting = true;
    
    try {
      // Calculate the adjustments needed
      const updates = CRCalculator.adjustActorToCR($actor, targetCR);
      
      // Apply the updates to the actor using updateSource utility
      await updateSource($actor, updates);
      
      // Dispatch event to notify parent components
      dispatch('crAdjusted', {
        oldCR: currentCR,
        newCR: targetCR,
        updates
      });
      
      // Update local state
      currentCR = targetCR;
      currentCRBreakdown = await CRCalculator.calculateCurrentCR($actor);
      
      // Show success message
      ui.notifications.info(`NPC adjusted to CR ${formatCR(targetCR)}`);
      
    } catch (error) {
      console.error('Error adjusting CR:', error);
      ui.notifications.error('Failed to adjust CR. See console for details.');
    } finally {
      isAdjusting = false;
    }
  }
  
  async function recalculateCurrentCR() {
    if (!$actor) return;
    
    console.log('🔄 Recalculating CR for actor:', $actor);
    currentCRBreakdown = await CRCalculator.calculateCurrentCR($actor);
    console.log('📊 New CR breakdown:', currentCRBreakdown);
    
    // Force a reactive update
    currentCRBreakdown = { ...currentCRBreakdown };
    
    // Show the breakdown
    ui.notifications.info(`Current CR Analysis: Defensive CR ${formatCR(currentCRBreakdown.defensiveCR)}, Offensive CR ${formatCR(currentCRBreakdown.offensiveCR)}, Calculated CR ${formatCR(currentCRBreakdown.finalCR)}`);
  }
</script>

<template lang="pug">
.cr-adjuster
  .cr-header
    h4 Challenge Rating Adjustment
    .header-controls
      // collapse/expand only (icon-only)
      button(
        type="button"
        class="btn btn-sm btn-icon"
        on:click!="{() => isCollapsed = !isCollapsed}"
        data-tooltip="{isCollapsed ? 'Expand' : 'Collapse'}"
        aria-label="{isCollapsed ? 'Expand' : 'Collapse'}"
      )
        i.fas(class!="{isCollapsed ? 'fa-chevron-down' : 'fa-chevron-up'}")
  
  +if("!isCollapsed")
    .cr-content
      .cr-row
        .cr-main
          .cr-text
            .cr-current
            .cr-info
              strong Current CR: {formatCR(currentCR)} ({formatXP(actor?.system?.details?.xp?.value || 0)} XP)
            +if("currentCRBreakdown")
              .cr-breakdown
                .breakdown-item
                  .label Defensive CR:
                  .value {formatCR(currentCRBreakdown.defensiveCR)}
                .breakdown-item
                  .label Offensive CR:
                  .value {formatCR(currentCRBreakdown.offensiveCR)}
                .breakdown-item
                  .label Calculated CR:
                  .value {formatCR(currentCRBreakdown.finalCR)}
                .breakdown-item
                  .label Proficiency Bonus:
                  .value +{currentCRBreakdown.proficiencyBonus}

            // add compact advanced-toggle inside text block
            .advanced-toggle
              button(
                type="button"
                class="btn btn-sm btn-icon"
                on:click!="{() => showAdvanced = !showAdvanced}"
                data-tooltip="{showAdvanced ? 'Hide Advanced Options' : 'Show Advanced Options'}"
                aria-label="{showAdvanced ? 'Hide Advanced Options' : 'Show Advanced Options'}"
              )
                i.fas.fa-cog

            +if("showAdvanced")
              .cr-advanced
                h5 Advanced CR Calculation
                p.text-muted
                  | This tool uses the challenge rating calculation rules to automatically analyse and suggest adjustments for your NPC's stats.
                  | It will propose changes for HP, AC, ability scores, and feature damage to better match the calculated CR.

                .warning
                  i.fas.fa-exclamation-triangle
                  strong Warning:
                  | These are suggested changes only. Review any adjustments before applying them to your NPC.

          .cr-buttons
            button(
              type="button"
              class="btn btn-sm btn-icon"
              on:click!="{recalculateCurrentCR}"
              disabled="{!actor}"
              data-tooltip="Recalculate current CR based on current stats"
              aria-label="Recalculate current CR"
            )
              i.fas.fa-calculator
            button(
              type="button"
              class="btn btn-sm btn-icon"
              on:click!="{applyCalculatedCR}"
              disabled="{!actor || readonly || !currentCRBreakdown || currentCRBreakdown.finalCR === currentCR}"
              data-tooltip="Apply the calculated CR to the in-memory actor"
              aria-label="Apply calculated CR"
            )
              i.fas.fa-save

  //- Target CR UI removed - feature deprecated / unstable
</template>
<style lang="sass">
</style>
