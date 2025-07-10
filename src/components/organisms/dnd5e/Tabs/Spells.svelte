<script>
  import { availableSpells, selectedSpells, characterLevel, maxSpellLevel, initializeSpellSelection, loadAvailableSpells, addSpell, removeSpell } from '../../../../stores/spellSelection';
  import { readOnlyTabs } from '../../../../stores/index';
  import { onMount, getContext } from 'svelte';
  import { localize } from "#runtime/svelte/helper";
  import { get } from 'svelte/store';

  import SvelteSelect from 'svelte-select';
  import { extractMapIteratorObjectProperties, getPackFolders,getPacksFromSettings, log, getRules } from "~/src/helpers/Utility";
  import { getContext, onDestroy, onMount, tick } from "svelte";
  import Tabs from '~/src/components/molecules/Tabs.svelte';
  import { localize } from "~/src/helpers/Utility";
  
  const actor = getContext("#doc");
  
  let loading = true;
  let keywordFilter = '';
  let expandedLevels = {};
  let spellsByLevel = {};
  let selectedSpellsList = [];

  $: isDisabled = $readOnlyTabs.includes('spells');
  $: actorObject = $actor.toObject();

  // Fetch spells when component mounts
  onMount(async () => {
    loading = true;
    
    // Initialize spell selection with current actor
    initializeSpellSelection($actor);
    
    // Load available spells
    await loadAvailableSpells();
    
    loading = false;
  });

  // Update selected spells list when selectedSpells changes
  $: {
    if ($selectedSpells) {
      selectedSpellsList = Array.from($selectedSpells.entries()).map(([spellId, { itemData }]) => ({
        id: spellId,
        spell: itemData
      }));
    }
  }

  // Filter and group spells by level
  $: filteredSpells = $availableSpells.filter(spell => {
    const matchesKeyword = spell.name.toLowerCase().includes(keywordFilter.toLowerCase());
    const spellLevel = spell.system?.level || 0;
    const withinCharacterLevel = spellLevel <= $maxSpellLevel;
    return matchesKeyword && withinCharacterLevel;
  });

  $: spellsByLevel = filteredSpells.reduce((acc, spell) => {
    const level = spell.system?.level || 0;
    const levelKey = level === 0 ? 'Cantrips' : `Level ${level}`;
    if (!acc[levelKey]) {
      acc[levelKey] = [];
    }
    acc[levelKey].push(spell);
    return acc;
  }, {});

  $: spellLevels = Object.keys(spellsByLevel).sort((a, b) => {
    if (a === 'Cantrips') return -1;
    if (b === 'Cantrips') return 1;
    const levelA = parseInt(a.replace('Level ', ''));
    const levelB = parseInt(b.replace('Level ', ''));
    return levelA - levelB;
  });

  // Toggle spell level expansion
  function toggleSpellLevel(level) {
    expandedLevels[level] = !expandedLevels[level];
    expandedLevels = { ...expandedLevels };
  }

  // Add spell to selection
  async function addToSelection(spell) {
    await addSpell(spell);
  }

  // Remove spell from selection
  function removeFromSelection(spellId) {
    removeSpell(spellId);
  }

  // Get spell school display name
  function getSchoolName(spell) {
    return spell.system?.school || 'Unknown';
  }

  // Get spell level display
  function getSpellLevelDisplay(spell) {
    const level = spell.system?.level || 0;
    return level === 0 ? 'Cantrip' : `Level ${level}`;
  }
</script>

<div class="spells-tab-container" class:disabled={isDisabled}>
  <div class="spells-tab">
    <!-- Left Panel: Selected Spells -->
    <div class="left-panel">
      <h3 class="left no-margin">{localize('GAS.Spells.CharacterLevel')}: {$characterLevel}</h3>
      <h3 class="left no-margin">{localize('GAS.Spells.MaxSpellLevel')}: {$maxSpellLevel}</h3>
      
      <h3>{localize('GAS.Spells.SelectedSpells')}</h3>
      <div class="selected-spells">
        {#if selectedSpellsList.length === 0}
          <div class="empty-selection">
            <p>{localize('GAS.Spells.NoSpellsSelected')}</p>
          </div>
        {:else}
          {#each selectedSpellsList as selectedSpell}
            <div class="selected-spell">
              <div class="spell-col1">
                <img src={selectedSpell.spell.img} alt={selectedSpell.spell.name} class="spell-icon" />
              </div>
              <div class="spell-col2 left">
                <div class="spell-name">{selectedSpell.spell.name}</div>
                <div class="spell-details">
                  <span class="spell-level">{getSpellLevelDisplay(selectedSpell.spell)}</span>
                  <span class="spell-school">{getSchoolName(selectedSpell.spell)}</span>
                </div>
              </div>
              <div class="spell-col3">
                <button class="remove-btn" on:click={() => removeFromSelection(selectedSpell.id)} disabled={isDisabled}>
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
          {/each}
        {/if}
      </div>
    </div>

    <!-- Right Panel: Available Spells -->
    <div class="right-panel spell-list">
      <h3>{localize('GAS.Spells.AvailableSpells')}</h3>
      
      <!-- Keyword Filter Input -->
      <div class="filter-container mb-sm">
        <input 
          type="text" 
          bind:value={keywordFilter} 
          placeholder={localize('GAS.Spells.FilterPlaceholder')} 
          class="keyword-filter"
          disabled={isDisabled}
        />
      </div>

      {#if loading}
        <div class="loading">{localize('GAS.Spells.Loading')}</div>
      {:else if filteredSpells.length === 0}
        <div class="empty-state">
          <p>{keywordFilter ? localize('GAS.Spells.NoMatchingSpells') : localize('GAS.Spells.NoSpells')}</p>
        </div>
      {:else}
        {#each spellLevels as spellLevel}
          <div class="spell-level-group">
            <h4 class="left mt-sm flexrow spell-level-header pointer" on:click={() => toggleSpellLevel(spellLevel)}>
              <div class="flex0 mr-xs">
                {#if expandedLevels[spellLevel]}
                  <span>[-]</span>
                {:else}
                  <span>[+]</span>
                {/if}
              </div>
              <div class="flex">{spellLevel} ({spellsByLevel[spellLevel].length})</div>
            </h4>
            {#if expandedLevels[spellLevel]}
              {#each spellsByLevel[spellLevel] as spell (spell.uuid || spell._id)}
                <div class="spell-row">
                  <div class="spell-details">
                    <img src={spell.img} alt={spell.name} class="spell-icon" />
                    <div class="spell-info">
                      <span class="spell-name">{spell.name}</span>
                      <span class="spell-school">{getSchoolName(spell)}</span>
                    </div>
                  </div>
                  <div class="spell-actions">
                    <button class="add-btn" on:click|preventDefault={() => addToSelection(spell)} disabled={isDisabled}>
                      <i class="fas fa-plus"></i>
                    </button>
                  </div>
                </div>
              {/each}
            {/if}
          </div>
        {/each}
      {/if}
    </div>
  </div>
  {#if isDisabled}
    <div class="overlay"></div>
  {/if}
</div>

<style lang="sass">
  @import "../../../../../styles/features/equipment-purchase.scss"

  .spells-tab-container
    position: relative
    height: 100%
    
    &.disabled
      pointer-events: none
      
    .overlay
      position: absolute
      top: 0
      left: 0
      right: 0
      bottom: 0
      background: rgba(0, 0, 0, 0.1)
      z-index: 1000

  .spells-tab
    display: flex
    height: 100%
    gap: 1rem

  .left-panel
    flex: 1
    padding: 1rem
    border-right: 1px solid #ccc
    overflow-y: auto
    
    h3
      margin-bottom: 0.5rem
      
    .selected-spells
      max-height: 400px
      overflow-y: auto
      
    .empty-selection
      text-align: center
      color: #666
      font-style: italic
      
    .selected-spell
      display: flex
      align-items: center
      padding: 0.5rem
      border: 1px solid #ddd
      margin-bottom: 0.5rem
      border-radius: 4px
      
      .spell-col1, .spell-col3
        flex: 0 0 auto
        
      .spell-col2
        flex: 1
        margin: 0 0.5rem
        
      .spell-icon
        width: 32px
        height: 32px
        border-radius: 4px
        
      .spell-name
        font-weight: bold
        display: block
        
      .spell-details
        font-size: 0.85em
        color: #666
        
        .spell-level, .spell-school
          margin-right: 0.5rem
          
      .remove-btn
        background: #dc3545
        color: white
        border: none
        padding: 0.25rem 0.5rem
        border-radius: 4px
        cursor: pointer
        
        &:hover
          background: #c82333
          
        &:disabled
          opacity: 0.6
          cursor: not-allowed

  .right-panel
    flex: 2
    padding: 1rem
    overflow-y: auto
    
    .filter-container
      margin-bottom: 1rem
      
    .keyword-filter
      width: 100%
      padding: 0.5rem
      border: 1px solid #ccc
      border-radius: 4px
      
    .loading, .empty-state
      text-align: center
      color: #666
      font-style: italic
      padding: 2rem
      
    .spell-level-group
      margin-bottom: 1rem
      
    .spell-level-header
      background: #f8f9fa
      padding: 0.5rem
      border-radius: 4px
      cursor: pointer
      font-weight: bold
      
      &:hover
        background: #e9ecef
        
    .spell-row
      display: flex
      align-items: center
      justify-content: space-between
      padding: 0.5rem
      border: 1px solid #eee
      margin-bottom: 0.25rem
      border-radius: 4px
      
      &:hover
        background: #f8f9fa
        
      .spell-details
        display: flex
        align-items: center
        flex: 1
        
        .spell-icon
          width: 24px
          height: 24px
          border-radius: 4px
          margin-right: 0.5rem
          
        .spell-info
          display: flex
          flex-direction: column
          
          .spell-name
            font-weight: bold
            
          .spell-school
            font-size: 0.85em
            color: #666
            
      .spell-actions
        flex: 0 0 auto
        
        .add-btn
          background: #28a745
          color: white
          border: none
          padding: 0.25rem 0.5rem
          border-radius: 4px
          cursor: pointer
          
          &:hover
            background: #218838
            
          &:disabled
            opacity: 0.6
            cursor: not-allowed
</style>