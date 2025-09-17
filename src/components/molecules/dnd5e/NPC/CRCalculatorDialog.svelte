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
  let itemAnalysis = null;
  
  // Proposed values for detailed calculation
  let proposedHP = 0;
  let proposedAC = 0;
  let proposedDPR = 0;
  let proposedAttack = 0;
  let proposedSave = 0;
  let proposedACDiff = 0;
  let proposedAttackDiff = 0;
  let proposedSaveDiff = 0;
  let proposedFinalRule = '';

  $: acDiffClass = acDiff >= 0 ? 'gas-diff-pos' : 'gas-diff-neg';
  $: attackDiffClass = attackDiff >= 0 ? 'gas-diff-pos' : 'gas-diff-neg';
  $: saveDiffClass = saveDiff >= 0 ? 'gas-diff-pos' : 'gas-diff-neg';
  $: pointerClass = !showCRSelect && type == 'apply' ? 'pointer' : ''
  
  // Proposed value classes
  $: proposedACDiffClass = proposedACDiff >= 0 ? 'gas-diff-pos' : 'gas-diff-neg';
  $: proposedAttackDiffClass = proposedAttackDiff >= 0 ? 'gas-diff-pos' : 'gas-diff-neg';
  $: proposedSaveDiffClass = proposedSaveDiff >= 0 ? 'gas-diff-pos' : 'gas-diff-neg';
  // Ensure the select value is numeric and defined
  $: crSelectValue = Number($selectedTargetCR ?? ensureNumberCR(initialCR, 0));

  async function onCRSelected(newCR) {
    // Coerce and set targetCR
    const newTargetCR = ensureNumberCR(newCR, NaN);
    if (!Number.isFinite(newTargetCR)) return;
    
    // Update the store
    selectedTargetCR.set(newTargetCR);
    
    // Calculate proposed changes if different from current CR
    if (newTargetCR !== ensureNumberCR(initialCR, 0)) {
      await calculateProposedChanges(newTargetCR);
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
  
  async function calculateProposedChanges(targetCR) {
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
      
      // Get the actual current CR from the actor
      const actualCurrentCR = $actorInGame?.system?.details?.cr || 0;
      console.log('[CRCalculatorDialog] Actual current CR from actor.system.details.cr:', actualCurrentCR);
      
      // Calculate the proposed changes - await the async call
      console.log('[CRCalculatorDialog] Calling CRRetargeter.computeUpdates with:', { actor: $actorInGame, targetCR });
      const updates = await CRRetargeter.computeUpdates($actorInGame, targetCR);
      console.log('[CRCalculatorDialog] Updates object:', updates);
      console.log('[CRCalculatorDialog] Updates keys:', Object.keys(updates));
      console.log('[CRCalculatorDialog] Metadata:', updates._metadata);
      
      // Extract changes from the updates object
      proposedChanges = [];
      
      // Extract item analysis from metadata
      if (updates._metadata && updates._metadata.itemAnalysis) {
        itemAnalysis = updates._metadata.itemAnalysis;
        console.log('[CRCalculatorDialog] Item analysis:', itemAnalysis);
        console.log('[CRCalculatorDialog] Item analysis length:', itemAnalysis.length);
      } else {
        console.log('[CRCalculatorDialog] No item analysis found in metadata');
        itemAnalysis = null;
      }
      
      // Use the metadata changes if available (preferred method)
      if (updates._metadata && updates._metadata.changes && updates._metadata.changes.length > 0) {
        console.log('[CRCalculatorDialog] Using metadata changes:', updates._metadata.changes);
        proposedChanges = updates._metadata.changes.map(change => ({
          label: change.label,
          from: change.from,
          to: change.to,
          type: change.type || 'unknown'
        }));
      } else {
        // Fallback to manual extraction
        console.log('[CRCalculatorDialog] No metadata changes, extracting manually');
        
        // Add CR change
        if (updates['system.details.cr'] !== undefined) {
          proposedChanges.push({
            label: 'Challenge Rating',
            from: actualCurrentCR,
            to: updates['system.details.cr'],
            type: 'cr'
          });
        }
        
        // Add HP change
        if (updates['system.attributes.hp.max'] !== undefined) {
          const currentHP = $actorInGame?.system?.attributes?.hp?.max || 0;
          proposedChanges.push({
            label: 'Hit Points',
            from: currentHP,
            to: updates['system.attributes.hp.max'],
            type: 'hp'
          });
        }
        
        // Add AC change
        if (updates['system.attributes.ac.value'] !== undefined) {
          const currentAC = $actorInGame?.system?.attributes?.ac?.value || 10;
          proposedChanges.push({
            label: 'Armor Class',
            from: currentAC,
            to: updates['system.attributes.ac.value'],
            type: 'ac'
          });
        }
        
        // Add ability score changes
        const abilities = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
        abilities.forEach(ability => {
          const path = `system.abilities.${ability}.value`;
          if (updates[path] !== undefined) {
            const currentValue = $actorInGame?.system?.abilities?.[ability]?.value || 10;
            proposedChanges.push({
              label: ability.toUpperCase(),
              from: currentValue,
              to: updates[path],
              type: 'ability'
            });
          }
        });
      }
      
      console.log('[CRCalculatorDialog] Proposed changes:', proposedChanges);
      
      // Calculate proposed values for detailed calculation
      calculateProposedValues(updates);
      
      // If no changes found, create a fallback message
      if (proposedChanges.length === 0) {
        proposedChanges = [{
          label: 'No specific changes calculated',
          from: 'Unknown',
          to: 'Unknown',
          type: 'error'
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

  function calculateProposedValues(updates) {
    // Calculate proposed HP
    proposedHP = updates['system.attributes.hp.max'] || hp;
    
    // Calculate proposed AC
    proposedAC = updates['system.attributes.ac.value'] || ac;
    proposedACDiff = proposedAC - expectedAC;
    
    // Calculate proposed DPR (this would need to be calculated from item changes)
    proposedDPR = dpr; // For now, keep current DPR
    
    // Calculate proposed attack bonus (this would need to be calculated from ability changes)
    proposedAttack = highestAttack; // For now, keep current attack
    proposedAttackDiff = proposedAttack - expectedAttack;
    
    // Calculate proposed save DC (this would need to be calculated from ability changes)
    proposedSave = highestSave; // For now, keep current save
    proposedSaveDiff = proposedSave - expectedSave;
    
    // Calculate proposed final rule
    const targetCR = updates['system.details.cr'] || ensureNumberCR(initialCR, 0);
    const targetCRData = CRCalculator.CR_TABLES.defensive[targetCR];
    const targetOffensiveData = CRCalculator.CR_TABLES.offensive[targetCR];
    
    if (targetCRData && targetOffensiveData) {
      const targetDefensiveCR = targetCRData.cr;
      const targetOffensiveCR = targetOffensiveData.cr;
      const crDifference = Math.abs(targetDefensiveCR - targetOffensiveCR);
      
      if (crDifference >= 1) {
        proposedFinalRule = `Higher CR used (difference ≥ 1)`;
      } else {
        proposedFinalRule = `Average CR used (difference < 1)`;
      }
    } else {
      proposedFinalRule = 'CR calculation error';
    }
    
    console.log('[CRCalculatorDialog] Calculated proposed values:', {
      proposedHP,
      proposedAC,
      proposedDPR,
      proposedAttack,
      proposedSave,
      proposedACDiff,
      proposedAttackDiff,
      proposedSaveDiff,
      proposedFinalRule
    });
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
  +if("showChanges")
    .gas-changes-section
      .gas-proposed-changes-section
        h4 Proposed Changes
        +if("proposedChanges && proposedChanges.length > 0")
          +each("proposedChanges as change")
            .gas-change-item
              .gas-change-label {change.label}
              .gas-change-value
                span.gas-change-from {change.from}
                span.gas-change-arrow →
                span.gas-change-to {change.to}
        +if("!proposedChanges || proposedChanges.length === 0")
          .gas-no-changes No changes needed for this CR

      .gas-item-analysis
        h4 Current Items & CR Impact
        +if("itemAnalysis && itemAnalysis.length > 0")
          +each("itemAnalysis as item")
            .gas-item-detail
              .gas-item-header
                .gas-item-name {item.name}
                .gas-item-type {item.type}
                .gas-item-impact CR +{item.currentCRImpact}
              .gas-item-details
                +each("Object.entries(item.details) as [key, value]")
                  .gas-item-kv
                    .gas-item-key {key}
                    .gas-item-value {value}
        +if("!itemAnalysis || itemAnalysis.length === 0")
          .gas-no-items No items found on this actor

  details.gas-details
    summary Show detailed calculation
    .gas-details-body
      +if("!showChanges")
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
      +if("showChanges")
        .gas-section
          h4 Proposed Defensive
          .gas-kv
            div HP
            .gas-monosp {proposedHP} (range: {hpMin}–{hpMax})
            div AC
            .gas-monosp {proposedAC}
            div Expected AC
            .gas-monosp
              | {expectedAC} 
              span(class="{proposedACDiffClass}") ( {proposedACDiff >= 0 ? '+' : ''}{proposedACDiff} )
        .gas-hr
        .gas-section
          h4 Proposed Offensive
          .gas-kv
            div DPR
            .gas-monosp {proposedDPR} (range: {dprMin}–{dprMax})
            div Highest attack bonus
            .gas-monosp
              | {proposedAttack} (expected {expectedAttack}) 
              span(class="{proposedAttackDiffClass}") ( {proposedAttackDiff >= 0 ? '+' : ''}{proposedAttackDiff} )
            div Highest save DC
            .gas-monosp
              | {proposedSave} (expected {expectedSave}) 
              span(class="{proposedSaveDiffClass}") ( {proposedSaveDiff >= 0 ? '+' : ''}{proposedSaveDiff} )
        .gas-hr
        .gas-section
          h4 Proposed Finalization
          .gas-kv
            div Rule
            .gas-monosp {proposedFinalRule}
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

/* Proposed Changes Styles */
.gas-changes-section
  margin-top: 0.5rem
  height: 300px
  overflow-y: auto
  
  h4
    margin: 0 0 8px 0
    font-size: 12px
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
  font-size: 13px

.gas-change-value
  display: flex
  align-items: center
  gap: 4px
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace
  font-size: 13px

.gas-change-from

.gas-change-arrow

.gas-change-to
  font-weight: 600

.gas-no-changes
  color: var(--color-text-dark-secondary, #666)
  font-style: italic
  text-align: center
  padding: 1rem

/* Item Analysis Styles */
.gas-item-analysis
  margin-top: 1rem
  padding: 0.5rem
  border-radius: 6px
  border: 1px solid var(--color-border, #ddd)

  h4
    margin: 0 0 8px 0
    font-size: 12px
    text-transform: uppercase
    letter-spacing: .02em

.gas-item-detail
  margin-bottom: 8px
  padding: 6px
  border-radius: 4px
  border: 1px solid var(--color-border, #eee)

.gas-item-header
  display: flex
  align-items: center
  gap: 8px
  margin-bottom: 4px

.gas-item-name
  font-weight: 600

.gas-item-type
  font-size: 11px
  text-transform: uppercase
  padding: 2px 6px
  border-radius: 3px

.gas-item-impact
  font-size: 11px
  font-weight: 600
  margin-left: auto

.gas-item-details
  display: grid
  grid-template-columns: 1fr 1fr
  gap: 4px 12px
  font-size: 12px

.gas-item-kv
  display: flex
  justify-content: space-between
  align-items: center

.gas-item-key
  text-transform: capitalize

.gas-item-value
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace

.gas-no-items
  font-style: italic
  text-align: center
  padding: 1rem
  border-radius: 4px
  border: 1px solid var(--color-border, #eee)
</style>