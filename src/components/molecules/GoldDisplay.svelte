<script>
  // Props to receive currency values
  export let pp = 0; // Platinum pieces
  export let gp = 0; // Gold pieces
  export let ep = 0; // Electrum pieces
  export let sp = 0; // Silver pieces
  export let cp = 0; // Copper pieces
  
  // Support for legacy props (if only gp, sp, cp are passed)
  $: if (typeof pp === 'undefined' && typeof ep === 'undefined') {
    // Legacy mode - only show gp, sp, cp
    pp = 0;
    ep = 0;
  }
</script>

<div class="currency-display">
  <span class="platinum">{pp} <i class="fas fa-coins platinum-coin"></i></span>
  <span class="gold">{gp} <i class="fas fa-coins gold-coin"></i></span>
  <span class="electrum">{ep} <i class="fas fa-coins electrum-coin"></i></span>
  <span class="silver">{sp} <i class="fas fa-coins silver-coin"></i></span>
  <span class="copper">{cp} <i class="fas fa-coins copper-coin"></i></span>
</div>

<style lang="sass">
  .currency-display
    display: flex
    gap: 0.5rem
    align-items: center
    padding: 0.5rem
    background: rgba(255, 255, 255, 0.1)
    border: 1px solid var(--color-border-light-primary)
    border-radius: 4px
    font-size: 1.2rem

    .platinum
      color: #e5e4e2

    .gold
      color: var(--dnd5e-color-gold, #b59e54)

    .electrum
      color: #b8860b

    .silver
      color: #c0c0c0

    .copper
      color: #b87333

    .platinum-coin
      filter: sepia(100%) saturate(0%) brightness(90%) hue-rotate(0deg)

    .gold-coin
      filter: sepia(100%) saturate(300%) brightness(70%) hue-rotate(5deg)

    .electrum-coin
      filter: sepia(100%) saturate(200%) brightness(70%) hue-rotate(45deg)

    .silver-coin
      filter: sepia(100%) saturate(0%) brightness(70%) hue-rotate(5deg)

    .copper-coin
      filter: sepia(50%) saturate(200%) brightness(70%) hue-rotate(350deg)
</style>
