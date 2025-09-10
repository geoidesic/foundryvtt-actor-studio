<script>
  import { npcCurrency, selectedNpcBase } from '~/src/stores/index';
  import { autoRollGold, autoRollHoardGold } from '~/src/stores/npc';
  import GoldDisplay from '~/src/components/molecules/GoldDisplay.svelte';

  // Props
  export let showRollButton = true;
  export let showEditButton = false;
  // Only show roll/edit controls when rendered inside a sheet. Parent components should pass a truthy `sheet` value.
  export let sheet = false;
  export let onEdit = null;
  export let hoardMode = false;
  export let partyLevel = 5;

  // Functions
  function handleRollCurrency() {
    console.log('[NPCCurrencyDisplay] Roll button clicked');
    if (hoardMode) {
      console.log('[NPCCurrencyDisplay] Hoard mode - rolling hoard currency for level:', partyLevel);
      rollHoardCurrency();
    } else {
      console.log('[NPCCurrencyDisplay] Individual mode - rolling NPC currency');
      console.log('[NPCCurrencyDisplay] selectedNpcBase:', $selectedNpcBase);
      if ($selectedNpcBase) {
        console.log('[NPCCurrencyDisplay] Calling autoRollGold with:', $selectedNpcBase);
        autoRollGold($selectedNpcBase);
      } else {
        console.warn('[NPCCurrencyDisplay] No NPC selected, cannot roll currency');
      }
    }
  }

  function rollHoardCurrency() {
    console.log('[NPCCurrencyDisplay] Rolling hoard currency for party level:', partyLevel);
    
    // Call the hoard roll function
    autoRollHoardGold(partyLevel);
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
  
  // Treat sheet as a string marker; only enable controls when the parent explicitly passes a sheet identifier that includes 'sheet'
  $: isSheet = typeof sheet === 'string' ? sheet.toLowerCase().includes('sheet') : !!sheet;

  {#if (showRollButton || showEditButton) && isSheet}
    <div class="coinage-actions">
      {#if showRollButton}
        <button 
          class="roll-treasure-btn" 
          on:click={handleRollCurrency}
          disabled={hoardMode ? false : !$selectedNpcBase}
          title={hoardMode ? "Roll hoard currency based on party level" : "Roll currency based on NPC CR"}
        >
          <i class="fas fa-dice"></i> {hoardMode ? 'Roll Hoard' : 'Roll'}
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
        display: inline-flex
        align-items: center
        gap: 0.5rem
        padding: 0.5rem 1rem
        border: none
        border-radius: 3px
        color: white
        cursor: pointer
        font-size: 0.9rem
        font-weight: 500
        transition: all 0.2s ease
        min-width: 120px
        justify-content: center

        &:disabled
          opacity: 0.6
          cursor: not-allowed

        &:hover:not(:disabled)
          transform: translateY(-1px)
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2)

        i
          font-size: 1rem

        span
          white-space: nowrap

      .roll-treasure-btn
        background: var(--color-success, #28a745)

        &:hover:not(:disabled)
          background: var(--color-success-hover, #218838)

      .edit-coinage-btn
        background: var(--color-highlight, #2196f3)

        &:hover:not(:disabled)
          background: var(--color-highlight-hover, #0066cc)
</style>
