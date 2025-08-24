<script>
  import { npcCurrency, selectedNpcBase } from '~/src/stores/index';
  import { autoRollGold } from '~/src/stores/npc';
  import GoldDisplay from '~/src/components/molecules/GoldDisplay.svelte';

  // Props
  export let showRollButton = true;
  export let showEditButton = false;
  export let onEdit = null;

  // Functions
  function handleRollCurrency() {
    console.log('[NPCCurrencyDisplay] Roll button clicked');
    console.log('[NPCCurrencyDisplay] selectedNpcBase:', $selectedNpcBase);
    if ($selectedNpcBase) {
      console.log('[NPCCurrencyDisplay] Calling autoRollGold with:', $selectedNpcBase);
      autoRollGold($selectedNpcBase);
    } else {
      console.warn('[NPCCurrencyDisplay] No NPC selected, cannot roll currency');
    }
  }

  // Debug: Log whenever currency changes
  $: console.log('[NPCCurrencyDisplay] Currency changed:', $npcCurrency);

  function handleEditCurrency() {
    if (onEdit) {
      onEdit();
    }
  }
</script>

<div class="npc-currency-display">
  <div class="coinage-info">
    <h4>Coins</h4>
  </div>
  
  <GoldDisplay {...$npcCurrency} />
  
  {#if showRollButton || showEditButton}
    <div class="coinage-actions">
      {#if showRollButton}
        <button 
          class="roll-treasure-btn" 
          on:click={handleRollCurrency}
          disabled={!$selectedNpcBase}
          title="Roll currency based on NPC CR"
        >
          <i class="fas fa-dice"></i> Roll
        </button>
      {/if}
      
      {#if showEditButton && onEdit}
        <button 
          class="edit-coinage-btn" 
          on:click={handleEditCurrency}
          title="Edit currency values"
        >
          <i class="fas fa-edit"></i> Edit
        </button>
      {/if}
    </div>
  {/if}
</div>

<style lang="sass">
  .npc-currency-display
    margin: 1rem 0
    padding: 1rem
    background: rgba(0, 0, 0, 0.05)
    border-radius: var(--border-radius)
    border: 1px solid var(--color-border-light-tertiary)

    .coinage-info
      margin-bottom: 1rem

      h4
        margin: 0 0 0.25rem 0
        font-size: 1rem

      .coinage-description
        margin: 0
        font-size: 0.8rem
        font-style: italic

    .coinage-actions
      display: flex
      gap: 0.5rem
      margin-top: 1rem

      .roll-treasure-btn, .edit-coinage-btn
        padding: 0.5rem 1rem
        border: none
        border-radius: 3px
        color: white
        cursor: pointer
        font-size: 0.9rem

        &:disabled
          opacity: 0.5
          cursor: not-allowed

      .roll-treasure-btn
        background: var(--color-success, #28a745)

        &:hover:not(:disabled)
          background: var(--color-success-hover, #218838)

      .edit-coinage-btn
        background: var(--color-highlight)

        &:hover:not(:disabled)
          background: #0066cc
</style>
