<script>
  export let cantripLabel = 'Cantrips';
  export let spellLabel = 'Spells';
  export let cantripCount = 0;
  export let cantripLimit = 0;
  export let spellCount = 0;
  export let spellLimit = 0;
  export let cantripCountAtLimit = false;
  export let spellCountAtLimit = false;
  export let hidden = false;
</script>

<template lang="pug">
.panel-header-grid(class:hidden="{hidden}")
  .grid-item.label {cantripLabel}:
  .grid-item.value(class:at-limit="{cantripCountAtLimit}") {cantripCount}/{cantripLimit}
  .grid-item.label {spellLabel}:
  .grid-item.value(class:at-limit="{spellCountAtLimit}") {spellCount}/{spellLimit}
</template>

<style lang="sass">
  .panel-header-grid
    display: grid
    grid-template-columns: 1fr 0.4fr 1fr 0.4fr
    grid-template-rows: repeat(2, auto)
    padding: 0.6rem 1.3rem 0.3rem 1.1rem
    gap: 4px
    margin-bottom: 0
    align-items: center
    background-color: var(--li-background-color)
    border-radius: var(--border-radius)
    border-collapse: none
    justify-content: space-evenly

    &.hidden
      display: none

    .label
      font-size: 0.95em
      color: var(--dnd5e-color-gold)
      text-align: right
      font-weight: 600

    .value
      font-size: 1.1em
      font-weight: bold
      text-align: left

      &.at-limit
        color: var(--color-positive)
</style>