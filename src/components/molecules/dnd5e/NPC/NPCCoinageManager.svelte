<script>
  import { createEventDispatcher } from 'svelte';
  import GoldDisplay from '~/src/components/molecules/GoldDisplay.svelte';
  import { TreasureRoller } from '~/src/helpers/TreasureRoller.js';
  
  // Props
  export let coinage = { pp: 0, gp: 0, ep: 0, sp: 0, cp: 0 };
  export let isEditing = false;
  export let disabled = false;
  export let selectedNpc = null;
  
  // Events
  const dispatch = createEventDispatcher();
  
  // Local state for editing
  let localCoinage = { ...coinage };
  
  // Update local coinage when props change
  $: if (coinage && !isEditing) {
    localCoinage = { ...coinage };
  }
  
  // Functions
  function toggleEdit() {
    if (isEditing) {
      // Save changes
      dispatch('update', localCoinage);
    }
    dispatch('toggleEdit');
  }
  
  function updateCoinage(denomination, value) {
    localCoinage[denomination] = Math.max(0, parseInt(value) || 0);
    localCoinage = { ...localCoinage }; // Trigger reactivity
  }
  
  function addCoin(denomination, amount = 1) {
    localCoinage[denomination] += amount;
    localCoinage = { ...localCoinage }; // Trigger reactivity
  }
  
  function removeCoin(denomination, amount = 1) {
    localCoinage[denomination] = Math.max(0, localCoinage[denomination] - amount);
    localCoinage = { ...localCoinage }; // Trigger reactivity
  }
  
  function cancelEdit() {
    localCoinage = { ...coinage }; // Reset to original values
    dispatch('toggleEdit');
  }
  
  // Roll for treasure based on NPC CR
  function rollTreasure() {
    if (!selectedNpc) {
      console.warn('No NPC selected for treasure roll');
      return;
    }
    
    const rolledCoins = TreasureRoller.rollIndividualTreasure(selectedNpc);
    console.log('Rolled coins:', rolledCoins);
    
    // If editing, update local coinage
    if (isEditing) {
      localCoinage = { ...rolledCoins };
      console.log('Updated local coinage (editing):', localCoinage);
    } else {
      // If not editing, directly dispatch the update
      console.log('Dispatching update with:', rolledCoins);
      dispatch('update', rolledCoins);
    }
    
    // Show notification if available
    if (typeof ui !== 'undefined' && ui.notifications) {
      const description = TreasureRoller.getTreasureRollDescription(selectedNpc);
      ui.notifications.info(`Rolled treasure: ${description}`);
    }
  }
  
  // Get roll description for tooltip
  $: rollDescription = selectedNpc ? TreasureRoller.getTreasureRollDescription(selectedNpc) : 'No NPC selected';
</script>

<div class="npc-coinage-manager">
  {#if isEditing}
    <div class="coinage-editor">
      <div class="coinage-inputs">
        <div class="coinage-input-group">
          <label for="pp-input">PP:</label>
          <input 
            id="pp-input"
            type="number" 
            bind:value={localCoinage.pp} 
            on:input={() => updateCoinage('pp', localCoinage.pp)}
            min="0"
            class="coinage-input pp"
            disabled={disabled}
          />
          <div class="coinage-buttons">
            <button class="coinage-btn add" on:click={() => addCoin('pp', 1)} disabled={disabled}>+</button>
            <button class="coinage-btn remove" on:click={() => removeCoin('pp', 1)} disabled={disabled}>-</button>
          </div>
        </div>
        
        <div class="coinage-input-group">
          <label for="gp-input">GP:</label>
          <input 
            id="gp-input"
            type="number" 
            bind:value={localCoinage.gp} 
            on:input={() => updateCoinage('gp', localCoinage.gp)}
            min="0"
            class="coinage-input gp"
            disabled={disabled}
          />
          <div class="coinage-buttons">
            <button class="coinage-btn add" on:click={() => addCoin('gp', 1)} disabled={disabled}>+</button>
            <button class="coinage-btn remove" on:click={() => removeCoin('gp', 1)} disabled={disabled}>-</button>
          </div>
        </div>
        
        <div class="coinage-input-group">
          <label for="ep-input">EP:</label>
          <input 
            id="ep-input"
            type="number" 
            bind:value={localCoinage.ep} 
            on:input={() => updateCoinage('ep', localCoinage.ep)}
            min="0"
            class="coinage-input ep"
            disabled={disabled}
          />
          <div class="coinage-buttons">
            <button class="coinage-btn add" on:click={() => addCoin('ep', 1)} disabled={disabled}>+</button>
            <button class="coinage-btn remove" on:click={() => removeCoin('ep', 1)} disabled={disabled}>-</button>
          </div>
        </div>
        
        <div class="coinage-input-group">
          <label for="sp-input">SP:</label>
          <input 
            id="sp-input"
            type="number" 
            bind:value={localCoinage.sp} 
            on:input={() => updateCoinage('sp', localCoinage.sp)}
            min="0"
            class="coinage-input sp"
            disabled={disabled}
          />
          <div class="coinage-buttons">
            <button class="coinage-btn add" on:click={() => addCoin('sp', 1)} disabled={disabled}>+</button>
            <button class="coinage-btn remove" on:click={() => removeCoin('sp', 1)} disabled={disabled}>-</button>
          </div>
        </div>
        
        <div class="coinage-input-group">
          <label for="cp-input">CP:</label>
          <input 
            id="cp-input"
            type="number" 
            bind:value={localCoinage.cp} 
            on:input={() => updateCoinage('cp', localCoinage.cp)}
            min="0"
            class="coinage-input cp"
            disabled={disabled}
          />
          <div class="coinage-buttons">
            <button class="coinage-btn add" on:click={() => addCoin('cp', 1)} disabled={disabled}>+</button>
            <button class="coinage-btn remove" on:click={() => removeCoin('cp', 1)} disabled={disabled}>-</button>
          </div>
        </div>
      </div>
      
      <div class="coinage-actions">
        <button 
          class="action-btn roll" 
          on:click={rollTreasure} 
          disabled={disabled || !selectedNpc}
          title={rollDescription}
        >
          <i class="fas fa-dice"></i> Roll
        </button>
        <button class="action-btn save" on:click={toggleEdit} disabled={disabled}>
          <i class="fas fa-check"></i> Save
        </button>
        <button class="action-btn cancel" on:click={cancelEdit} disabled={disabled}>
          <i class="fas fa-times"></i> Cancel
        </button>
      </div>
    </div>
  {:else}
    <div class="coinage-display">
      <div class="coinage-info">
        <h4>NPC Coinage</h4>
        <p class="coinage-description">Treasure and roleplay currency</p>
      </div>
      <GoldDisplay {...coinage} />
      <div class="coinage-actions">
        <button 
          class="roll-treasure-btn" 
          on:click={rollTreasure} 
          disabled={disabled || !selectedNpc}
          title={rollDescription}
        >
          <i class="fas fa-dice"></i> Roll Coins
        </button>
        <button class="edit-coinage-btn" on:click={toggleEdit} disabled={disabled}>
          <i class="fas fa-edit"></i> Edit
        </button>
      </div>
    </div>
  {/if}
</div>

<style lang="sass">
  .npc-coinage-manager
    margin: 1rem 0
    padding: 1rem
    background: rgba(0, 0, 0, 0.05)
    border-radius: var(--border-radius)
    border: 1px solid var(--color-border-light-tertiary)

    .coinage-editor
      .coinage-inputs
        display: flex
        flex-direction: column
        gap: 0.5rem
        margin-bottom: 1rem

      .coinage-input-group
        display: flex
        align-items: center
        gap: 0.5rem

        label
          min-width: 30px
          font-weight: bold

        .coinage-input
          width: 60px
          padding: 0.25rem
          border: 1px solid var(--color-border-light-tertiary)
          border-radius: 3px
          text-align: center
          
          &.pp
            border-color: #e5e4e2
          &.gp
            border-color: var(--dnd5e-color-gold, #b59e54)
          &.ep
            border-color: #b8860b
          &.sp
            border-color: #c0c0c0
          &.cp
            border-color: #b87333

        .coinage-buttons
          display: flex
          gap: 0.25rem

          .coinage-btn
            width: 24px
            height: 24px
            border: none
            border-radius: 3px
            cursor: pointer
            font-weight: bold
            display: flex
            align-items: center
            justify-content: center

            &.add
              background: var(--dnd5e-color-gold, #b59e54)
              color: black

              &:hover
                background: darken(#b59e54, 10%)

            &.remove
              background: #dc3545
              color: white

              &:hover
                background: darken(#dc3545, 10%)

            &:disabled
              opacity: 0.5
              cursor: not-allowed

      .coinage-actions
        display: flex
        gap: 0.5rem

        .action-btn
          padding: 0.5rem 1rem
          border: none
          border-radius: 3px
          cursor: pointer
          font-size: 0.9rem

          &.roll
            background: #28a745
            color: white

            &:hover
              background: #218838

          &.save
            background: var(--color-highlight)
            color: white

            &:hover
              background: #0066cc

          &.cancel
            background: #6c757d
            color: white

            &:hover
              background: #5a6268

          &:disabled
            opacity: 0.5
            cursor: not-allowed

    .coinage-display
      display: flex
      align-items: center
      gap: 1rem
      flex-wrap: wrap

      .coinage-info
        flex: 1
        min-width: 200px

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
        background: #28a745

        &:hover
          background: #218838

      .edit-coinage-btn
        background: var(--color-highlight)

        &:hover
          background: #0066cc
</style>
