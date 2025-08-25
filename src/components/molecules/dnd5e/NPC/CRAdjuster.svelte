<script>
  import { CRCalculator } from "~/src/helpers/CRCalculator.js";
  import { createEventDispatcher, getContext } from "svelte";
  
  const actor = getContext("#doc");

  export let readonly = false;
  
  const dispatch = createEventDispatcher();
  
  let targetCR = 0;
  let currentCR = 0;
  let currentCRBreakdown = null;
  let showAdvanced = false;
  let isAdjusting = false;
  
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
    currentCR = $actor.system?.details?.cr || 0;
    targetCR = currentCR;
    console.log('🔄 Actor changed, calculating CR...');
    // Use a separate function for async CR calculation
    calculateInitialCR($actor);
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
      
      // Apply the updates to the actor
      await $actor.update(updates);
      
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
    ui.notifications.info(`Current CR Analysis: Defensive CR ${formatCR(currentCRBreakdown.defensiveCR)}, Offensive CR ${formatCR(currentCRBreakdown.offensiveCR)}, Final CR ${formatCR(currentCRBreakdown.finalCR)}`);
  }
</script>

<template lang="pug">
.cr-adjuster
  .cr-header
    h3 Challenge Rating Adjustment
    button(
      type="button"
      class="btn btn-sm"
      on:click!="{recalculateCurrentCR}"
      disabled="{!actor}"
      title="Recalculate current CR based on current stats"
    )
      i.fas.fa-calculator
      span Analyze Current CR

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

  hr

  .cr-target
    .form-group
      label(for="target-cr") Target CR:
      select(
        id="target-cr"
        bind:value="{targetCR}"
        disabled="{readonly}"
        class="cr-select"
      )
        +each("crOptions as option")
          option(value="{option.value}") {option.label}

    .target-stats
      .stat-item
        .label Target XP:
        .value {formatXP(targetXP)}
      .stat-item
        .label Target HP:
        .value {targetHP}
      .stat-item
        .label Target AC:
        .value {targetAC}
      .stat-item
        .label Target DPR:
        .value {targetDPR}
      .stat-item
        .label Proficiency Bonus:
        .value +{targetPB}

    .cr-actions
      button(
        type="button"
        class="btn btn-primary"
        on:click!="{adjustToTargetCR}"
        disabled="{!actor || readonly || isAdjusting || targetCR === currentCR}"
      )
        +if("isAdjusting")
          i.fas.fa-spinner.fa-spin
          span Adjusting...
          +else()
            i.fas.fa-magic
            span Adjust to CR {formatCR(targetCR)}

      button(
        type="button"
        class="btn btn-secondary"
        on:click!="{() => showAdvanced = !showAdvanced}"
        disabled="{!actor}"
      )
        i.fas.fa-cog
        span {showAdvanced ? 'Hide' : 'Show'} Advanced Options

    +if("showAdvanced")
      .cr-advanced
        hr
        h4 Advanced CR Calculation
        p.text-muted
          | This tool uses the DMG challenge rating calculation rules to automatically adjust your NPC's stats.
          | It will modify HP, AC, ability scores, and feature damage to match the target CR.

        .warning
          i.fas.fa-exclamation-triangle
          strong Warning:
          | This will modify your NPC's stats. Make sure to review the changes before applying.

        .cr-tables
          details
            summary View CR Tables (DMG 273-283)
            .table-container
              .table-section
                h5 Defensive CR Table
                table.cr-table
                  thead
                    tr
                      th CR
                      th HP Range
                      th Expected AC
                  tbody
                    +each("Object.entries(CRCalculator.CR_TABLES.defensive).slice(0, 10) as [cr, stats]")
                      tr
                        td {formatCR(parseFloat(cr))}
                        td {stats.hp[0]}-{stats.hp[1]}
                        td {stats.ac}

              .table-section
                h5 Offensive CR Table
                table.cr-table
                  thead
                    tr
                      th CR
                      th DPR Range
                      th Attack Bonus
                      th Save DC
                  tbody
                    +each("Object.entries(CRCalculator.CR_TABLES.offensive).slice(0, 10) as [cr, stats]")
                      tr
                        td {formatCR(parseFloat(cr))}
                        td {stats.dpr[0]}-{stats.dpr[1]}
                        td +{stats.attack}
                        td {stats.save}
</template>
<style lang="sass">
  .cr-adjuster
    padding: 1rem
    border: 1px solid #ccc
    border-radius: 4px

  .cr-header
    display: flex
    justify-content: space-between
    align-items: center
    margin-bottom: 1rem

  .cr-header h3
    margin: 0

  .cr-current, .cr-target
    margin-bottom: 1rem

  .cr-info
    font-size: 1.1em
    margin-bottom: 0.5rem

  .cr-breakdown
    display: grid
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr))
    gap: 0.5rem
    margin-top: 0.5rem
    padding: 0.5rem
    border-radius: 3px
    border: 1px solid #ddd

  .breakdown-item
    display: flex
    justify-content: space-between

  .breakdown-item .label
    font-weight: bold


  .form-group
    margin-bottom: 1rem

  .form-group label
    display: block
    margin-bottom: 0.25rem
    font-weight: bold

  .cr-select
    width: 100%
    padding: 0.5rem
    border: 1px solid #ccc
    border-radius: 3px
    font-size: 1em

  .target-stats
    display: grid
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr))
    gap: 0.5rem
    margin: 1rem 0
    padding: 1rem
    border-radius: 3px
    border: 1px solid #ddd

  .stat-item
    display: flex
    justify-content: space-between
    align-items: center

  .stat-item .label
    font-weight: bold

  .stat-item .value
    font-weight: bold

  .cr-actions
    display: flex
    gap: 0.5rem
    flex-wrap: wrap

  .cr-advanced
    margin-top: 1rem

  .warning
    background: #fff3cd
    border: 1px solid #ffeaa7
    color: #856404
    padding: 0.75rem
    border-radius: 3px
    margin: 1rem 0
    display: flex
    align-items: center
    gap: 0.5rem

  .cr-tables
    margin-top: 1rem

  .table-container
    display: grid
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr))
    gap: 1rem
    margin-top: 1rem

  .cr-table
    width: 100%
    border-collapse: collapse
    font-size: 0.9em

  .cr-table th,
  .cr-table td
    padding: 0.25rem 0.5rem
    text-align: left
    border: 1px solid #ddd

  .cr-table th
    background: #f5f5f5
    font-weight: bold

  .text-muted
    color: #666
    font-style: italic

  details summary
    cursor: pointer
    font-weight: bold
    margin-bottom: 0.5rem

  details summary:hover
</style>
