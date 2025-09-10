<script>
  // Props for dialog content
  export let defensive = '';
  export let offensive = '';
  export let finalCR = '';
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

  $: acDiffClass = acDiff >= 0 ? 'gas-diff-pos' : 'gas-diff-neg';
  $: attackDiffClass = attackDiff >= 0 ? 'gas-diff-pos' : 'gas-diff-neg';
  $: saveDiffClass = saveDiff >= 0 ? 'gas-diff-pos' : 'gas-diff-neg';
</script>

<template lang="pug">
.gas-cr-summary
  // Decorative title bar
  .gas-title-bar
    .gas-title-left
      .gas-cr-badge
        .gas-cr-number {finalCR}
        .gas-cr-label Final CR
    .gas-title-center
      .gas-pb Proficiency +{pb}
    .gas-title-right
      .gas-xp-label XP
      .gas-xp-value {xp}

  .gas-grid
    .gas-label Defensive CR
    .gas-monosp {defensive}
    .gas-label Offensive CR
    .gas-monosp {offensive}
    .gas-label Proficiency Bonus
    .gas-monosp +{pb}

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
  background: linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))
  display: flex
  flex-direction: column
  align-items: center
  justify-content: center
  box-shadow: 0 6px 18px rgba(0,0,0,0.45), inset 0 -4px 8px rgba(255,255,255,0.02)
  border: 1px solid rgba(255,255,255,0.06)

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
</style>