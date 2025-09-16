<script>
  import { getContext } from 'svelte'; 
  import { actorInGame } from '~/src/stores/index';
  // Props for dialog content
  export let defensive = '';
  export let offensive = '';
  export let initialCR = '';
  export let xp = 0;
  export let pb = 2;

  export let hp = 0;
  export let hpMin = 0;
  export let hpMax = 0;
  export let ac = 10;
  export let expectedAC = 10;
  export let acDiff = 0;

  export let dpr = 0;
  export let dprMin = 0;
  export let dprMax = 0;
  export let highestAttack = 0;
  export let expectedAttack = 0;
  export let highestSave = 0;
  export let expectedSave = 10;
  export let attackDiff = 0;
  export let saveDiff = 0;
  export let finalRule = '';
  export let type = 'calc';
  // The dialog may receive runtime data set by the host application via application.data.set
  export let appliedChanges = null; // array of {path, from, to}
  export let recalculatedBreakdown = null; // optional recalculated breakdown object
  const application = getContext('#external').application;
  console.log('application', application);
  console.log('$actorInGame', $actorInGame);
  import { ensureNumberCR } from '~/src/lib/cr.js';
  import { CRCalculator } from '~/src/helpers/CRCalculator.js';
  import { CRRetargeter } from '~/src/helpers/CRRetargeter.js';
  import { selectedTargetCR } from '~/src/stores/selectedTargetCR.js';
  
  // Initialize store with current CR value when component mounts
  selectedTargetCR.set(ensureNumberCR(initialCR, null));
  let showCRSelect = false;
  export let onTargetCRChange = null;
  const crOptions = Array.from({ length: 31 }, (_, i) => i); // 0..30
  
  // State for proposed changes
  let proposedChanges = null;
  let showChanges = false;

  $: acDiffClass = acDiff >= 0 ? 'gas-diff-pos' : 'gas-diff-neg';
  $: attackDiffClass = attackDiff >= 0 ? 'gas-diff-pos' : 'gas-diff-neg';
  $: saveDiffClass = saveDiff >= 0 ? 'gas-diff-pos' : 'gas-diff-neg';
  $: pointerClass = !showCRSelect && type == 'apply' ? 'pointer' : ''
  // Ensure the select value is numeric and defined
  $: crSelectValue = Number($selectedTargetCR ?? ensureNumberCR(initialCR, 0));

  function onCRSelected(newCR) {
    // Coerce and set targetCR
    const newTargetCR = ensureNumberCR(newCR, NaN);
    if (!Number.isFinite(newTargetCR)) return;
    
    // Update the store
    selectedTargetCR.set(newTargetCR);
    
    // Calculate proposed changes if different from current CR
    if (newTargetCR !== ensureNumberCR(initialCR, 0)) {
      calculateProposedChanges(newTargetCR);
      showChanges = true;
    } else {
      proposedChanges = null;
      showChanges = false;
    }
    
    // Update Apply button state via application data
    if (application) {
      try {
        application.data.set('buttons.apply.disabled', !newTargetCR);
        console.log('[CRCalculatorDialog] Apply button state updated to disabled:', !newTargetCR);
      } catch (err) {
        console.error('[CRCalculatorDialog] Error updating Apply button:', err);
      }
    }
    
    // Notify host that a target CR was selected
    if (typeof onTargetCRChange === 'function') {
      onTargetCRChange(newTargetCR);
    }
  }
  
  function calculateProposedChanges(targetCR) {
    try {
      // Get the actor from the application context
      console.log('[CRCalculatorDialog] Actor found:', $actorInGame);
      console.log('[CRCalculatorDialog] Target CR:', targetCR);
      console.log('[CRCalculatorDialog] Current CR:', ensureNumberCR(initialCR, 0));
      
      if (!$actorInGame) {
        console.warn('[CRCalculatorDialog] No actor found for calculating changes');
        proposedChanges = [];
        return;
      }
      
      // Calculate the proposed changes
      const updates = CRRetargeter.computeUpdates($actorInGame, targetCR);
      console.log('[CRCalculatorDialog] Updates object:', updates);
      
      proposedChanges = updates._metadata?.changes || [];
      console.log('[CRCalculatorDialog] Proposed changes:', proposedChanges);
      
      // If no changes found, create a fallback message
      if (!proposedChanges || proposedChanges.length === 0) {
        proposedChanges = [{
          label: 'CR Adjustment',
          from: ensureNumberCR(initialCR, 0),
          to: targetCR,
          type: 'cr'
        }];
      }
    } catch (err) {
      console.error('[CRCalculatorDialog] Error calculating proposed changes:', err);
      proposedChanges = [{
        label: 'Error calculating changes',
        from: 'Unknown',
        to: 'Unknown',
        type: 'error'
      }];
    }
  }

  function CRclick() {
  if(type == 'calc') return;
  showCRSelect = true
  }

  // No inline apply button — host dialog chrome will provide an Apply button.
</script>

<template lang="pug">
.gas-cr-summary
  // Decorative title bar
  .gas-title-bar
    .gas-title-left
        .gas-cr-badge(on:click!="{CRclick}" class="{pointerClass}")
          +if("!showCRSelect")
            // show selected targetCR if chosen, otherwise show initialCR
            .gas-cr-number {CRCalculator.formatCR($selectedTargetCR ?? initialCR)}
            +else()
              select.gas-cr-select(
                value="{crSelectValue}"
                on:change!="{(e) => { showCRSelect = false; onCRSelected(Number(e.target.value)); }}"
              )
                +each("crOptions as c")
                  option(value="{c}") {c}
          +if("!showCRSelect")
            .gas-cr-label CR
          // Dialog chrome provides the Apply button via TJSDialog.wait; host will enable it when selection occurs
    .gas-title-center
      .gas-pb Proficiency +{pb}
    .gas-title-right
      .gas-xp-label XP
      .gas-xp-value {xp}

  +if("!showChanges")
    .gas-grid
      .gas-label Defensive CR
      .gas-monosp {defensive}
      .gas-label Offensive CR
      .gas-monosp {offensive}
      .gas-label Proficiency Bonus
      .gas-monosp +{pb}
    +else()
      .gas-changes-section
        h4 Proposed Changes
        +if("proposedChanges && proposedChanges.length > 0")
          +each("proposedChanges as change")
            .gas-change-item
              .gas-change-label {change.label}
              .gas-change-value
                span.gas-change-from {change.from}
                span.gas-change-arrow →
                span.gas-change-to {change.to}
          +else()
            .gas-no-changes No changes needed for this CR

  details.gas-details
    summary Show detailed calculation
    .gas-details-body
      .gas-section
        h4 Defensive
        .gas-kv
          div HP
          .gas-monosp {hp} (range: {hpMin}–{hpMax})
          div AC
          .gas-monosp {ac}
          div Expected AC
          .gas-monosp
            | {expectedAC} 
            span(class="{acDiffClass}") ( {acDiff >= 0 ? '+' : ''}{acDiff} )
      .gas-hr
      .gas-section
        h4 Offensive
        .gas-kv
          div DPR
          .gas-monosp {dpr} (range: {dprMin}–{dprMax})
          div Highest attack bonus
          .gas-monosp
            | {highestAttack} (expected {expectedAttack}) 
            span(class="{attackDiffClass}") ( {attackDiff >= 0 ? '+' : ''}{attackDiff} )
          div Highest save DC
          .gas-monosp
            | {highestSave} (expected {expectedSave}) 
            span(class="{saveDiffClass}") ( {saveDiff >= 0 ? '+' : ''}{saveDiff} )
      .gas-hr
      .gas-section
        h4 Finalization
        .gas-kv
          div Rule
          .gas-monosp {finalRule}
  +if("appliedChanges && appliedChanges.length > 0")
    .gas-hr
    .gas-section
      h4 Applied Changes
      +each("appliedChanges as d")
        .gas-kv
          div {d.path}
          .gas-monosp {String(d.from)} → {String(d.to)}
  +if("recalculatedBreakdown")
    .gas-hr
    .gas-section
      h4 Recalculated
      .gas-kv
        div Defensive CR
        .gas-monosp {CRCalculator.formatCR(recalculatedBreakdown.defensiveCR)}
        div Offensive CR
        .gas-monosp {CRCalculator.formatCR(recalculatedBreakdown.offensiveCR)}
        div Calculated CR
        .gas-monosp {CRCalculator.formatCR(recalculatedBreakdown.calculatedCR)}
</template>

<style lang="sass">
.gas-cr-summary
  font-size: 13px

.gas-grid
  display: grid
  grid-template-columns: auto auto
  gap: 4px 12px
  align-items: center

.gas-label
  color: var(--color-text-dark-secondary, #666)

details.gas-details
  margin-top: 0.5rem
  > summary
    cursor: pointer
    user-select: none

.gas-monosp
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace

.gas-section
  margin-top: 0.5rem
  h4
    margin: 0 0 4px 0
    font-size: 12px
    color: var(--color-text-dark-secondary, #555)
    text-transform: uppercase
    letter-spacing: .02em

.gas-kv
  display: grid
  grid-template-columns: 1fr auto
  gap: 2px 12px

.gas-hr
  border-top: 1px solid var(--color-border, #9993)
  margin: 6px 0

.gas-diff-pos
  color: var(--color-positive, #2e7d32)

.gas-diff-neg
  color: var(--color-negative, #c62828)

/* Title styles */
.gas-title-bar
  display: flex
  align-items: center
  justify-content: space-between
  gap: 12px
  padding: 10px 12px
  border-radius: 8px
  margin-bottom: 10px
  /* subtle heroic gradient */
  background: linear-gradient(90deg, rgba(30,30,60,0.95), rgba(60,20,40,0.85));
  color: var(--color-text-on-dark, #fff)

.gas-title-left
  display: flex
  align-items: center

.gas-cr-badge
  width: 86px
  height: 86px
  min-width: 86px
  border-radius: 12px
  transition: background 3s ease
  background: linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))
  display: flex
  flex-direction: column
  align-items: center
  justify-content: center
  box-shadow: 0 6px 18px rgba(0,0,0,0.45), inset 0 -4px 8px rgba(255,255,255,0.02)
  border: 1px solid rgba(255,255,255,0.06)

  &.pointer
    &:hover
      background: linear-gradient(90deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))


.gas-cr-number
  font-size: 36px
  font-weight: 800
  line-height: 1
  color: var(--color-accent, #ffd8a6)

.gas-cr-label
  font-size: 11px
  margin-top: 4px
  opacity: 0.85
  text-transform: uppercase

.gas-title-center
  flex: 1
  padding-left: 12px
  display: flex
  align-items: center

.gas-pb
  font-size: 13px
  color: rgba(255,255,255,0.9)

.gas-title-right
  display: flex
  flex-direction: column
  align-items: flex-end

.gas-xp-label
  font-size: 11px
  text-transform: uppercase
  opacity: 0.9

.gas-xp-value
  font-size: 20px
  font-weight: 700
  color: var(--color-accent, #ffd8a6)

/* Proposed Changes Styles */
.gas-changes-section
  margin-top: 0.5rem
  
  h4
    margin: 0 0 8px 0
    font-size: 12px
    color: var(--color-text-dark-secondary, #555)
    text-transform: uppercase
    letter-spacing: .02em

.gas-change-item
  display: grid
  grid-template-columns: 1fr auto
  gap: 8px 12px
  align-items: center
  padding: 4px 0
  border-bottom: 1px solid var(--color-border, #9993)

.gas-change-label
  color: var(--color-text-dark-secondary, #666)
  font-size: 13px

.gas-change-value
  display: flex
  align-items: center
  gap: 4px
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace
  font-size: 13px

.gas-change-from
  color: var(--color-negative, #c62828)

.gas-change-arrow
  color: var(--color-text-dark-secondary, #666)

.gas-change-to
  color: var(--color-positive, #2e7d32)
  font-weight: 600

.gas-no-changes
  color: var(--color-text-dark-secondary, #666)
  font-style: italic
  text-align: center
  padding: 1rem
</style>