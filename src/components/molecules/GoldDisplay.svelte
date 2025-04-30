<script>
  // Props to receive currency values
  export let gp = 0;
  export let sp = 0;
  export let cp = 0;
</script>

<div class="currency-display">
  {#if gp > 0}
    <span class="gold">{gp} <i class="fas fa-coins gold-coin"></i></span>
  {/if}
  {#if sp > 0 || gp > 0}
    <span class="silver">{sp} <i class="fas fa-coins silver-coin"></i></span>
  {/if}
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
    margin-bottom: 1rem

    .gold
      color: var(--dnd5e-color-gold, #b59e54)

    .silver
      color: #c0c0c0

    .copper
      color: #b87333

    .gold-coin
      filter: sepia(100%) saturate(300%) brightness(70%) hue-rotate(5deg)

    .silver-coin
      filter: sepia(100%) saturate(0%) brightness(70%) hue-rotate(5deg)

    .copper-coin
      filter: sepia(50%) saturate(200%) brightness(70%) hue-rotate(350deg)
</style>
