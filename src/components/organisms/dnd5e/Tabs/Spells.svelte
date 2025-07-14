<script>
  import { get } from 'svelte/store';
  import { readOnlyTabs, level as characterLevel } from '../../../../stores/index';
  import { characterClass } from '../../../../stores/storeDefinitions';
  import { localize as t } from "~/src/helpers/Utility";
  import { getContext, onDestroy, onMount, tick } from "svelte";
  import { availableSpells, selectedSpells, maxSpellLevel, 
    initializeSpellSelection, loadAvailableSpells, addSpell, removeSpell,
    spellLimits, currentSpellCounts, spellProgress
  } from '../../../../stores/spellSelection';
  import spellsKnownData from '../../../../stores/spellsKnown.json';
  
  const actor = getContext("#doc");
  
  let loading = true;
  let keywordFilter = '';
  let expandedLevels = {};
  let selectedSpellsList = [];
  let scrolled = false;
  let spellContainer;
  let cleanup;

  $: isDisabled = $readOnlyTabs.includes('spells');
  $: actorObject = $actor.toObject();

  // Get character class name for spell filtering and limits
  $: characterClassName = $characterClass?.name || 'Bard'; // Default to Bard for testing
  
  // Calculate max spell level based on character class and level (override store calculation)
  $: calculatedMaxSpellLevel = getMaxSpellLevelForClass($characterLevel, characterClassName);
  
  // Use our calculated max spell level if the store returns 0 (during character creation)
  $: effectiveMaxSpellLevel = $maxSpellLevel > 0 ? $maxSpellLevel : calculatedMaxSpellLevel;
  
  // Debug logging for character data
  $: {
    console.log(`[SPELLS DEBUG] Character data:`, {
      characterClass: $characterClass,
      characterClassName,
      characterLevel: $characterLevel,
      storeMaxSpellLevel: $maxSpellLevel,
      calculatedMaxSpellLevel,
      effectiveMaxSpellLevel,
      spellLimits: $spellLimits,
      progress: $spellProgress
    });
  }
  
  // Cache for enriched spell names
  let enrichedNames = {};

  // Helper to get enriched HTML for spell name
  async function getEnrichedName(spell) {
    const key = spell.uuid || spell._id || spell.id;
    if (!enrichedNames[key]) {
      enrichedNames[key] = foundry.applications.ux.TextEditor.implementation.enrichHTML(spell.enrichedName || spell.name || "", { async: true });
    }
    return enrichedNames[key];
  }

  // Calculate max spell level based on class and character level
  function getMaxSpellLevelForClass(level, className) {
    // Standard D&D 5e spellcasting progression for full casters
    const fullCasters = ['Bard', 'Cleric', 'Druid', 'Sorcerer', 'Wizard'];
    const halfCasters = ['Paladin', 'Ranger'];
    const thirdCasters = ['Arcane Trickster', 'Eldritch Knight'];
    const warlockProgression = ['Warlock'];
    
    if (fullCasters.includes(className)) {
      // Full casters: spell level = Math.ceil(character level / 2), max 9
      return Math.min(9, Math.ceil(level / 2));
    } else if (halfCasters.includes(className)) {
      // Half casters: spell level = Math.ceil((character level - 1) / 4), max 5
      return Math.min(5, Math.ceil((level - 1) / 4));
    } else if (thirdCasters.includes(className)) {
      // Third casters: spell level = Math.ceil((character level - 2) / 6), max 4
      return Math.min(4, Math.ceil((level - 2) / 6));
    } else if (warlockProgression.includes(className)) {
      // Warlocks have their own progression
      if (level >= 17) return 5;
      if (level >= 11) return 3;
      if (level >= 7) return 2;
      if (level >= 1) return 1;
      return 0;
    } else if (className === 'Artificer') {
      // Artificers are half casters but start at level 2
      if (level < 2) return 0;
      return Math.min(5, Math.ceil((level - 1) / 4));
    }
    
    // Non-spellcasting classes
    return 0;
  }

  // Fetch spells when component mounts
  onMount(async () => {
    loading = true;
    
    // Initialize spell selection with current actor
    initializeSpellSelection($actor);
    
    // Load available spells
    await loadAvailableSpells();
    
    // Debug logging
    console.log(`[SPELLS DEBUG] Loaded spells:`, {
      totalSpells: $availableSpells.length,
      characterLevel: $characterLevel,
      storeMaxSpellLevel: $maxSpellLevel,
      calculatedMaxSpellLevel,
      effectiveMaxSpellLevel,
      characterClassName,
      spellLimits,
      sampleSpells: $availableSpells.slice(0, 5).map(s => ({
        name: s.name,
        level: s.system?.level,
        classes: s.classes || s.labels?.classes || s.system?.classes
      }))
    });
    
    loading = false;

    // Find the actual scrolling container (section.a from PCAppShell)
    const scrollingContainer = document.querySelector('#foundryvtt-actor-studio-pc-sheet section.a');
    if (scrollingContainer) {
      const handleScroll = () => {
        scrolled = scrollingContainer.scrollTop > 0;
      };
      scrollingContainer.addEventListener('scroll', handleScroll);
      
      // Cleanup on destroy
      cleanup = () => {
        scrollingContainer.removeEventListener('scroll', handleScroll);
      };
    }
  });

  onDestroy(() => {
    if (cleanup) {
      cleanup();
    }
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

  // Filter spells by keyword and character class
  $: filteredSpells = $availableSpells.filter(spell => {
    const matchesKeyword = spell.name.toLowerCase().includes(keywordFilter.toLowerCase());
    const spellLevel = spell.system?.level || 0;
    const withinCharacterLevel = spellLevel <= effectiveMaxSpellLevel;
    
    // Filter by character class - check multiple possible locations for class data
    const spellClasses = spell.classes || spell.labels?.classes || spell.system?.classes || [];
    const availableToClass = spellClasses.includes(characterClassName) || 
                            spellClasses.includes(characterClassName.toLowerCase()) ||
                            // Fallback: if no class restrictions, allow all spells
                            spellClasses.length === 0;
    
    // Debug logging for spell filtering
    if (spell.name === "Acid Splash" || spell.name === "Cure Wounds" || spellLevel === 1) {
      console.log(`[SPELLS DEBUG] ${spell.name}:`, {
        spellLevel,
        storeMaxSpellLevel: $maxSpellLevel,
        effectiveMaxSpellLevel,
        withinCharacterLevel,
        spellClasses,
        characterClassName,
        availableToClass,
        matchesKeyword,
        finalResult: matchesKeyword && withinCharacterLevel && availableToClass
      });
    }
    
    return matchesKeyword && withinCharacterLevel && availableToClass;
  });

  // Group spells by level
  $: spellsByLevel = filteredSpells.reduce((acc, spell) => {
    const level = spell.system?.level || 0;
    const levelKey = level === 0 ? 'Cantrips' : `Level ${level}`;
    if (!acc[levelKey]) {
      acc[levelKey] = [];
    }
    acc[levelKey].push(spell);
    return acc;
  }, {});

  // Debug logging for spell grouping
  $: {
    if (Object.keys(spellsByLevel).length > 0) {
      console.log(`[SPELLS DEBUG] Spells by level:`, {
        totalFiltered: filteredSpells.length,
        groupedByLevel: Object.keys(spellsByLevel).map(level => ({
          level,
          count: spellsByLevel[level].length,
          samples: spellsByLevel[level].slice(0, 3).map(s => s.name)
        }))
      });
    }
  }

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
    // Check spell limits before adding
    const spellLevel = spell.system?.level || 0;
    const isCantrip = spellLevel === 0;
    
    if (isCantrip && $currentSpellCounts.cantrips >= $spellLimits.cantrips) {
      ui.notifications?.warn(t('Spells.CantripLimitReached'));
      return;
    }
    
    if (!isCantrip && $currentSpellCounts.spells >= $spellLimits.spells) {
      ui.notifications?.warn(t('Spells.SpellLimitReached'));
      return;
    }
    
    await addSpell(spell);
  }

  // Remove spell from selection
  function removeFromSelection(spellId) {
    removeSpell(spellId);
  }

  // Get spell school display name
  function getSchoolName(spell, forList = false) {
    const school = spell.system?.school;
    if (!school || school === 'Unknown') {
      return forList ? '' : '—';
    }
    return school;
  }

  // Get spell level display
  function getSpellLevelDisplay(spell) {
    const level = spell.system?.level || 0;
    return level === 0 ? t('Spells.Cantrip') : `${t('Spells.Level')} ${level}`;
  }

  // Get casting time display
  function getCastingTimeDisplay(spell) {
    return spell.system?.activation?.value && spell.system?.activation?.type 
      ? `${spell.system.activation.value} ${spell.system.activation.type}`
      : 'Unknown';
  }

  // Finalize spell selection
  function finalizeSpells() {
    if (!$spellProgress.isComplete) return;
    
    console.log('[SPELLS] Finalizing spell selection:', {
      cantrips: $currentSpellCounts.cantrips,
      spells: $currentSpellCounts.spells,
      total: $spellProgress.totalSelected,
      selectedSpells: selectedSpellsList.map(s => s.spell.name)
    });
    
    // TODO: Integrate with workflow state machine
    // This should trigger the next step in the character creation process
    ui.notifications?.info(`Spells finalized: ${$spellProgress.totalSelected} spells selected`);
  }
</script>

<div class="spells-tab-container" class:readonly={isDisabled}>
  {#if isDisabled}
    <div class="info-message">{t('Spells.SpellsReadOnly')}</div>
  {/if}

  <!-- Sticky spell limits header -->
  <div class="sticky-header" class:hidden={!scrolled}>
    <div class="spell-limits">
      <span class="limit-display">
        Cantrips: {$currentSpellCounts.cantrips}/{$spellLimits.cantrips}
      </span>
      <span class="limit-display">
        Spells: {$currentSpellCounts.spells}/{$spellLimits.spells === 999 ? 'All' : $spellLimits.spells}
      </span>
    </div>
  </div>

  <div class="spells-tab">
    <div class="left-panel" bind:this={spellContainer}>
  <!-- Improved grid header -->
  <div class="panel-header-grid" class:hidden={scrolled}>
    <div class="grid-item label">{characterClassName}:</div>
    <div class="grid-item value">{$characterLevel}</div>
    <div class="grid-item label">{t('Spells.MaxLvl')}:</div>
    <div class="grid-item value">{effectiveMaxSpellLevel}</div>
    <div class="grid-item label">{t('Spells.Cantrips')}:</div>
    <div class="grid-item value" class:at-limit={$currentSpellCounts.cantrips >= $spellLimits.cantrips}>{$currentSpellCounts.cantrips}/{$spellLimits.cantrips}</div>
    <div class="grid-item label">{t('Spells.Spells')}:</div>
    <div class="grid-item value" class:at-limit={$currentSpellCounts.spells >= $spellLimits.spells}>{$currentSpellCounts.spells}/{$spellLimits.spells === 999 ? 'All' : $spellLimits.spells}</div>
  </div>
 
      <h3>{t('Spells.SelectedSpells')}</h3>
      <div class="selected-spells">
        {#if selectedSpellsList.length === 0}
          <div class="empty-selection">
            <p>{t('Spells.NoSpellsSelected')}</p>
          </div>
        {:else}
          {#each selectedSpellsList as selectedSpell}
            <div class="selected-spell">
              <div class="spell-col1">
                <img src={selectedSpell.spell.img} alt={selectedSpell.spell.name} class="spell-icon" />
              </div>
              <div class="spell-col2 left">
                <div class="spell-name">
                  {#await getEnrichedName(selectedSpell.spell)}
                    {selectedSpell.spell.name}
                  {:then Html}
                    {@html Html}
                  {/await}
                </div>
                <div class="spell-subdetails">
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
      <h3>{t('Spells.AvailableSpells')}</h3>
      
      <!-- Keyword Filter Input -->
      <div class="filter-container mb-sm">
        <input 
          type="text" 
          bind:value={keywordFilter} 
          placeholder={t('Spells.FilterPlaceholder')} 
          class="keyword-filter"
          disabled={isDisabled}
        />
      </div>

      {#if loading}
        <div class="loading">{t('Spells.Loading')}</div>
      {:else if filteredSpells.length === 0}
        <div class="empty-state">
          <p>{keywordFilter ? t('Spells.NoMatchingSpells') : t('Spells.NoSpells')}</p>
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
                    <img src={spell.img} alt={spell.name} class="spell-icon cover" />
                    <div class="spell-info">
                      <span class="spell-name">
                        {#await getEnrichedName(spell)}
                          {spell.name}
                        {:then Html}
                          {@html Html}
                        {/await}
                      </span>
                      <div class="spell-meta">
                        {#if getSchoolName(spell, true)}<span class="spell-school">{getSchoolName(spell, true)}</span>{/if}
                        <span class="casting-time">{getCastingTimeDisplay(spell)}</span>
                      </div>
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


</div>

<style lang="sass">
  @import "../../../../../styles/Mixins.sass"

  :global(.GAS.theme-dark .selected-spell .spell-level)
    color: silver

  :global(.GAS.theme-dark .spell-row .spell-meta .spell-school)
    color: silver
  :global(.GAS.theme-dark .selected-spell .spell-school)
    color: silver !important

  .spells-tab-container 
    position: relative
    height: 100%
    width: 100%
    display: flex
    flex-direction: column

    &.readonly
      opacity: 0.7
      pointer-events: none
      
      :global(*)
        cursor: default !important
    
  .info-message
    font-size: 0.8rem
    color: #666
    font-style: italic
    margin: 1rem
    padding: 1rem
    background: rgba(0, 0, 0, 0.05)
    border-radius: var(--border-radius)

  .sticky-header
    position: sticky
    top: 15px
    left: 1rem
    z-index: 5
    background: black
    padding: 0.5rem
    margin: 0
    max-width: 200px
    border-radius: 4px
    &.hidden
      display: none

  .spells-tab
    display: flex
    height: 100%
    width: 100%
    flex: 1

  .left-panel
    flex: 1
    min-width: 300px
    max-width: 40%
    border-right: 1px solid var(--color-border-light-tertiary)
    padding: 1rem
    overflow-y: auto
    
    .panel-header
      margin-bottom: 1rem
      &.hidden
        display: none
        
    h3
      margin-bottom: 0.5rem
      
    .spell-limits
        display: flex
        flex-direction: column
        gap: 0.25rem
        margin-bottom: 1rem
        
        .limit-display
          font-size: 0.9rem
          padding: 0.25rem 0.5rem
          background: rgba(0, 128, 0, 0.1)
          border-radius: 4px
          
          &.at-limit
            background: rgba(255, 0, 0, 0.1)
            color: #cc0000

        .progress-section
          margin-top: 1rem
          margin-bottom: 1rem
          
          .progress-header
            display: flex
            justify-content: space-between
            align-items: center
            margin-bottom: 0.5rem
            font-size: 0.9rem
            
            .progress-text
              color: var(--color-text)
              
            .progress-percentage
              font-weight: bold
              color: var(--color-text-primary)
              
          .progress-bar
            width: 100%
            height: 8px
            background: var(--color-border-light-tertiary)
            border-radius: 4px
            overflow: hidden
            
            .progress-fill
              height: 100%
              background: linear-gradient(90deg, #28a745, #20c997)
              border-radius: 4px
              transition: width 0.3s ease
      
    .selected-spells
      max-height: 60vh
      overflow-y: auto
      
    .empty-selection
      text-align: center
      color: #666
      font-style: italic
      padding: 2rem
      
    .selected-spell
      display: flex
      align-items: center
      padding: 0.5rem
      border: 1px solid var(--color-border-light-tertiary)
      margin-bottom: 0.5rem
      border-radius: 4px
      background: var(--color-bg)
      
      .spell-col1, .spell-col3
        flex: 0 0 auto
        
      .spell-col2
        flex: 1
        margin: 0 0.5rem
        
      .spell-icon
        width: 32px
        height: 32px
        border-radius: 4px
        border: 1px solid var(--color-border-light-tertiary)
        
      .spell-name
        font-weight: bold
        display: block
        
      .spell-subdetails
        font-size: 0.85em
        color: #666
        display: flex
        gap: 0.5rem
        
        .spell-level, .spell-school
          background: rgba(0, 0, 0, 0.05)
          padding: 0.125rem 0.25rem
          border-radius: 3px
          
      .remove-btn
        background: none
        border: none
        cursor: pointer
        padding: 0.25rem 0 0.25rem 0.25rem
        border-radius: 3px
        line-height: 1
        
        &:hover
          background: rgba(153, 0, 0, 0.1)

        &:disabled
          opacity: 0.5
          cursor: not-allowed
          &:hover
            background: none

  .right-panel
    flex: 2
    padding: 1rem
    overflow-y: auto
    
    .filter-container
      margin-bottom: 1rem
      
    .keyword-filter
      width: 100%
      padding: 0.5rem
      border: 1px solid var(--color-border-light-tertiary)
      border-radius: 4px
      background: var(--color-bg)
      color: var(--color-text)
      
    .loading, .empty-state
      text-align: center
      color: #666
      font-style: italic
      padding: 2rem
      
    .spell-level-group
      margin-bottom: 1rem
      
    .spell-level-header
      background: var(--color-bg-btn)
      padding: 0.5rem
      border-radius: 4px
      cursor: pointer
      font-weight: bold
      border: 1px solid var(--color-border-light-tertiary)
      
      &:hover
        background: var(--color-bg-btn-hover)
        
    .spell-row
      display: flex
      align-items: center
      justify-content: space-between
      padding: 0.5rem
      border: 1px solid var(--color-border-light-tertiary)
      margin-bottom: 0.25rem
      border-radius: 4px
      background: var(--color-bg)
      
      &:hover
        background: var(--color-bg-btn)
        
      .spell-details
        display: flex
        align-items: center
        flex: 1
        gap: 0.5rem
        
        .spell-icon
          width: 24px
          height: 24px
          border-radius: 4px
          border: 1px solid var(--color-border-light-tertiary)
          flex-shrink: 0
          
        .spell-info
          display: flex
          flex-direction: column
          min-width: 0
          flex: 1
          
          .spell-name
            font-weight: bold
            
          .spell-meta
            font-size: 0.85em
            color: #666
            display: flex
            gap: 0.5rem
            
            .spell-school, .casting-time
              background: rgba(0, 0, 0, 0.05)
              padding: 0.125rem 0.25rem
              border-radius: 3px
            
      .spell-actions
        flex: 0 0 auto
        
        .add-btn
          background: var(--dnd5e-color-gold, #b59e54)
          border: none
          width: 24px
          height: 24px
          border-radius: 3px
          color: black
          display: flex
          align-items: center
          justify-content: center
          cursor: pointer

          i.fas.fa-plus
            margin-right: 0
            margin-left: 0

          &:hover
            background: darken(#b59e54, 10%)

          &:disabled
            opacity: 0.5
            cursor: not-allowed
            &:hover
              background: var(--dnd5e-color-gold, #b59e54)

  .finalize-section
    position: sticky
    bottom: 0
    left: 0
    right: 0
    padding: 1rem
    background: var(--color-bg)
    border-top: 1px solid var(--color-border-light-tertiary)
    z-index: 10
    
    .finalize-btn
      width: 100%
      padding: 1rem 2rem
      background: linear-gradient(135deg, #28a745, #20c997)
      color: white
      border: none
      border-radius: 8px
      font-size: 1rem
      font-weight: bold
      cursor: pointer
      display: flex
      align-items: center
      justify-content: center
      gap: 0.5rem
      transition: all 0.3s ease
      box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3)
      
      &:hover
        background: linear-gradient(135deg, #218838, #1ba085)
        transform: translateY(-2px)
        box-shadow: 0 6px 16px rgba(40, 167, 69, 0.4)
        
      &:active
        transform: translateY(0)
        
      &:disabled
        opacity: 0.6
        cursor: not-allowed
        transform: none
        box-shadow: none

  .spell-icon.cover
    width: 48px
    height: 48px
    object-fit: cover
    border-radius: 4px
    border: 1px solid var(--color-border-light-tertiary)

  .panel-header-grid
    display: grid
    grid-template-columns: 1fr 0.4fr 1fr 0.4fr
    grid-template-rows: repeat(2, auto)
    padding: 0.3rem 0.1rem
    gap: 4px
    margin-bottom: 1.5rem
    align-items: center
    background-color: var(--li-background-color)
    border-radius: var(--border-radius)
    border-collapse: none
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
        color: #cc0000
</style>