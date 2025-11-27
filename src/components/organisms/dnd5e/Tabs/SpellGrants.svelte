<script>
  import { get } from 'svelte/store';
  import { readOnlyTabs } from '~/src/stores/index';
  import { localize as t, enrichHTML } from "~/src/helpers/Utility";
  import { getContext, onDestroy, onMount, tick } from "svelte";
  import { loadAvailableSpells, availableSpells } from '~/src/stores/spellSelection';
  import { activeSpellGrants, spellGrantSelections, addSpellGrantSelection, removeSpellGrantSelection } from '~/src/stores/spellGrants';
  import { MODULE_ID } from '~/src/helpers/constants';
  
  export let sheet; // Passed from Tabs component
  
  const actor = getContext("#doc");
  
  let loading = true;
  let keywordFilter = '';
  let expandedLevels = {};
  let scrolled = false;
  let spellContainer;
  
  // Local state for spell grants
  let grantSpells = [];
  let selectedSpellsList = [];
  let currentGrant = null;

  $: isDisabled = $readOnlyTabs.includes('spell-grants');
  
  // Get the first active grant (for now, we'll handle one at a time)
  $: {
    if ($activeSpellGrants && $activeSpellGrants.length > 0) {
      currentGrant = $activeSpellGrants[0];
      window.GAS.log.d('[SPELL GRANTS] Current grant:', {
        grant: currentGrant,
        spellList: currentGrant.configuration?.restriction?.spellList,
        breakdown: currentGrant.configuration?.breakdown,
        levelRestriction: currentGrant.configuration?.restriction?.level
      });
    } else {
      currentGrant = null;
    }
  }
  
  // Get grant name for display
  $: characterClassName = currentGrant ? 
    (currentGrant.itemName || 'Unknown Grant') : 
    'No Active Grant';
  
  // Load spell selections for current grant
  $: {
    if (currentGrant) {
      const selections = $spellGrantSelections.get(currentGrant.advancementId);
      selectedSpellsList = selections?.selections || [];
      window.GAS.log.d('[SPELL GRANTS] Selected spells for grant:', selectedSpellsList);
    } else {
      selectedSpellsList = [];
    }
  }
  
  // Calculate spell limits from grant breakdown (e.g., Magic Initiate: 2 cantrips + 1 spell)
  $: {
    if (currentGrant?.configuration?.breakdown) {
      // Grant has breakdown (e.g., Magic Initiate: separate cantrip and spell counts)
      const breakdown = currentGrant.configuration.breakdown;
      
      // Find cantrip breakdown
      const cantripBreakdown = breakdown.find(b => b.maxLevel === 0);
      cantripLimit = cantripBreakdown?.count || 0;
      
      // Find spell breakdown (minLevel > 0)
      const spellBreakdown = breakdown.find(b => b.minLevel && b.minLevel > 0);
      spellLimit = spellBreakdown?.count || 0;
      
      window.GAS.log.d('[SPELL GRANTS] Breakdown limits:', { cantripLimit, spellLimit, breakdown });
    } else if (currentGrant) {
      // Simple grant (e.g., fighting style: 2 cantrips)
      if (currentGrant.maxLevel === 0) {
        cantripLimit = currentGrant.count;
        spellLimit = 0;
      } else if (currentGrant.minLevel > 0) {
        cantripLimit = 0;
        spellLimit = currentGrant.count;
      } else {
        cantripLimit = 0;
        spellLimit = currentGrant.count;
      }
    } else {
      cantripLimit = 0;
      spellLimit = 0;
    }
  }
  
  // Calculate CSS classes for limits
  $: cantripCountCss = cantripLimit > 0 && cantripCount >= cantripLimit ? 'at-limit' : '';
  $: spellCountCss = spellLimit > 0 && spellCount >= spellLimit ? 'at-limit' : '';
  
  // Get counts for display
  $: cantripCount = selectedSpellsList.filter(s => s.system?.level === 0).length;
  $: spellCount = selectedSpellsList.filter(s => s.system?.level > 0).length;
  
  // Reactive variable declarations (must be let, not const in reactive statements)
  let cantripLimit = 0;
  let spellLimit = 0;
  
  // Determine available spell levels
  $: effectiveMaxSpellLevel = currentGrant?.maxLevel || 0;
  
  // These conditions don't apply to spell grants
  $: shouldOfferAutoPopulate = false;
  $: isLevelUpWithNoSpellUpdates = false;
  
  // Cache for enriched spell names
  let enrichedNames = {};

  // Helper to get enriched HTML for spell name
  async function getEnrichedName(spell) {
    const key = spell.uuid || spell._id || spell.id;
    if (!enrichedNames[key]) {
      // Create a UUID link if we have a UUID, otherwise fall back to plain name
      let content;
      if (spell.uuid) {
        content = `@UUID[${spell.uuid}]{${spell.name}}`;
      } else {
        content = spell.name || "";
      }
      enrichedNames[key] = await enrichHTML(content, { async: true });
    }
    return enrichedNames[key];
  }

  // Store scroll handler reference for cleanup
  let scrollCleanup = null;

  // Fetch spells when component mounts or grant changes
  onMount(async () => {
    await loadGrantSpells();
    
    // Find the actual scrolling container (section.a from PCAppShell)
    const scrollingContainer = document.querySelector('#foundryvtt-actor-studio-pc-sheet section.a');
    if (scrollingContainer) {
      const handleScroll = () => {
        scrolled = scrollingContainer.scrollTop > 0;
      };
      scrollingContainer.addEventListener('scroll', handleScroll);
      
      // Store cleanup function
      scrollCleanup = () => {
        scrollingContainer.removeEventListener('scroll', handleScroll);
      };
    }
  });
  
  // Cleanup on component destroy
  onDestroy(() => {
    if (scrollCleanup) {
      scrollCleanup();
    }
  });
  
  // Reload spells when current grant changes
  $: {
    if (currentGrant) {
      loadGrantSpells();
    }
  }
  
  async function loadGrantSpells() {
    if (!currentGrant) return;
    
    loading = true;
    
    // Load spells from the grant's spell list(s)
    // spellList is in configuration.restriction.spellList
    const spellList = currentGrant.configuration?.restriction?.spellList;
    const spellLists = Array.isArray(spellList) ? spellList : [spellList];
      
    window.GAS.log.d('[SPELL GRANTS] Loading spells for grant:', {
      grantName: currentGrant.itemName,
      spellLists,
      grant: currentGrant
    });
    
    await loadAvailableSpells(spellLists);
    
    loading = false;
  }
  
  // Subscribe to availableSpells and apply grant-specific filtering
  $: {
    if ($availableSpells && currentGrant) {
      // Filter spells by grant's level requirements
      grantSpells = $availableSpells.filter(spell => {
        const spellLevel = spell.system?.level || 0;
        
        // Get level restrictions from configuration
        const levelRestriction = currentGrant.configuration?.restriction?.level;
        const minLevel = levelRestriction?.min ?? 0;
        const maxLevel = levelRestriction?.max ?? 9;
        
        // Check if spell level is within grant's min/max range
        if (spellLevel < minLevel || spellLevel > maxLevel) {
          return false;
        }
        
        // Check school restriction if specified
        const school = currentGrant.configuration?.restriction?.school;
        if (school && spell.system?.school !== school) {
          return false;
        }
        
        return true;
      });
      
      window.GAS.log.d('[SPELL GRANTS] Filtered spells:', {
        totalAvailable: $availableSpells.length,
        afterFiltering: grantSpells.length,
        levelRestriction: currentGrant.configuration?.restriction?.level
      });
    } else {
      grantSpells = [];
    }
  }

  // Filter spells by keyword
  $: filteredSpells = keywordFilter 
    ? grantSpells.filter(spell => 
        spell.name.toLowerCase().includes(keywordFilter.toLowerCase()) ||
        spell.system?.school?.toLowerCase().includes(keywordFilter.toLowerCase())
      )
    : grantSpells;

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

  $: spellLevels = Object.keys(spellsByLevel).sort((a, b) => {
    if (a === 'Cantrips') return -1;
    if (b === 'Cantrips') return 1;
    const levelA = parseInt(a.replace('Level ', ''));
    const levelB = parseInt(b.replace('Level ', ''));
    return levelA - levelB;
  });

  // Initialize expanded levels when spells load
  $: if (spellLevels.length > 0 && Object.keys(expandedLevels).length === 0) {
    expandedLevels = spellLevels.reduce((acc, level) => {
      acc[level] = true;
      return acc;
    }, {});
  }

  // Toggle spell level expansion
  function toggleSpellLevel(level) {
    expandedLevels[level] = !expandedLevels[level];
    expandedLevels = { ...expandedLevels };
  }

  // Add spell to grant selection
  async function addToSelection(spell) {
    if (!currentGrant) return;
    
    const spellId = spell.id || spell._id;
    
    // Check if already selected
    if (selectedSpellsList.some(s => (s.id || s._id) === spellId)) {
      ui.notifications?.warn('Spell already selected');
      return;
    }
    
    // Check limits based on spell level
    const spellLevel = spell.system?.level || 0;
    if (spellLevel === 0 && cantripLimit > 0) {
      const currentCantrips = selectedSpellsList.filter(s => s.system?.level === 0).length;
      if (currentCantrips >= cantripLimit) {
        ui.notifications?.warn(`You can only select ${cantripLimit} cantrip(s) from this grant`);
        return;
      }
    } else if (spellLevel > 0 && spellLimit > 0) {
      const currentSpells = selectedSpellsList.filter(s => s.system?.level > 0).length;
      if (currentSpells >= spellLimit) {
        ui.notifications?.warn(`You can only select ${spellLimit} spell(s) from this grant`);
        return;
      }
    }
    
    // Add to grant selections - add this spell to existing selections
    const currentSelections = $spellGrantSelections.get(currentGrant.advancementId)?.selections || [];
    const updatedSelections = [...currentSelections, spell];
    addSpellGrantSelection(currentGrant.advancementId, currentGrant, updatedSelections);
  }

  // Remove spell from selection
  function removeFromSelection(spellId) {
    if (!currentGrant) return;
    const currentSelections = $spellGrantSelections.get(currentGrant.advancementId)?.selections || [];
    const updatedSelections = currentSelections.filter(s => s.id !== spellId);
    addSpellGrantSelection(currentGrant.advancementId, currentGrant, updatedSelections);
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
    // window.GAS.log.q(spell)
    return spell.system?.activation?.value && spell.system?.activation?.type 
      ? `${spell.system.activation.value} ${spell.system.activation.type}`
        : spell.system?.activation?.type ? spell.system?.activation?.type
      : 'Unknown';
  }
</script>

<template lang="pug">
spells-tab-container(class:readonly="{isDisabled}")
 
  +if("isDisabled")
    .info-message {t('Spells.SpellsReadOnly')}

  .sticky-header(class:hidden="{!scrolled}")
    .panel-header-grid
      +if("cantripLimit > 0")
        .grid-item.label {t('Spells.Cantrips')}:
        .grid-item.value(class:at-limit="{cantripCountCss}") {cantripCount}/{cantripLimit}
      +if("spellLimit > 0")
        .grid-item.label {t('Spells.Spells')}:
        .grid-item.value(class:at-limit="{spellCountCss}") {spellCount}/{spellLimit}
  
  .spells-tab
    .left-panel(bind:this="{spellContainer}")
      .panel-header-grid(class:hidden="{scrolled}")
        +if("cantripLimit > 0")
          .grid-item.label {t('Spells.Cantrips')}:
          .grid-item.value(class:at-limit="{cantripCountCss}") {cantripCount}/{cantripLimit}
        +if("spellLimit > 0")
          .grid-item.label {t('Spells.Spells')}:
          .grid-item.value(class:at-limit="{spellCountCss}") {spellCount}/{spellLimit}
      h3 {t('Spells.SelectedSpells')}

      .selected-spells
        +if("selectedSpellsList.length === 0")
          .empty-selection
            p {t('Spells.NoSpellsSelected')}      

          +else()
            +each("selectedSpellsList as selectedSpell")
              .selected-spell
                .spell-col1
                  img.spell-icon( alt="{selectedSpell.name}" src="{selectedSpell.img}")
                .spell-col2.left            
                  .spell-name
                    +await("getEnrichedName(selectedSpell)")
                      span {selectedSpell.name}
                      +then("Html")
                        span {@html Html}
                      +catch("error")
                        span {selectedSpell.name}


                  .spell-subdetails
                    span.spell-level {getSpellLevelDisplay(selectedSpell)}
                    span.spell-school {getSchoolName(selectedSpell)}

                .spell-col3
                  button.remove-btn(on:click!="{ () => removeFromSelection(selectedSpell.id || selectedSpell._id) }" disabled="{isDisabled}")
                    i.fas.fa-trash

    .right-panel.spell-list
      h3 {t('Spells.AvailableSpells')} | {characterClassName}
      .filter-container.mb-sm
        input.keyword-filter(type="text" bind:value="{keywordFilter}" placeholder="{t('Spells.FilterPlaceholder')}" disabled="{isDisabled}")
      +if("loading")
        .loading {t('Spells.Loading')}
        +elseif("filteredSpells.length === 0")
          .empty-state
            p {keywordFilter ? t('Spells.NoMatchingSpells') : t('Spells.NoSpells')}
          +else()
            +each("spellLevels as spellLevel")
              +if("(spellLevel == 'Cantrips' && !cantripCountCss) || (spellLevel != 'Cantrips' && !spellCountCss)")
                .spell-level-group
                  h4.left.mt-sm.flexrow.spell-level-header.pointer(on:click!="{ () => toggleSpellLevel(spellLevel) }")
                    .flex0.mr-xs
                      +if("expandedLevels[spellLevel]")
                        span [-]
                        +else()
                          span [+]
                    .flex1 {spellLevel} ({spellsByLevel[spellLevel].length})

                  +if("expandedLevels[spellLevel]")
                    ul.blank
                      +each("spellsByLevel[spellLevel] as spell (spell.uuid || spell._id)")
                        li.flexrow.spell-row.justify-flexrow-vertical
                          .flex0.spell-details
                            img.spell-icon.cover(src="{spell.img}" alt="{spell.name}")

                          .flex1.spell-info
                            .flexrow
                              .flex1.left.spell-name.gold
                                +await("getEnrichedName(spell)")
                                  span {spell.name}
                                  +then("Html")
                                    span {@html Html}
                                  +catch("error")
                                    span {spell.name}
                            .flexrow.smalltext

                              .flex1.left.spell-meta
                                +if("getSchoolName(spell, true)")
                                  .flexrow.gap-10
                                    .flex2.flexrow
                                      div School:
                                      .badge {getSchoolName(spell, true)}
                                    .flex2.flexrow 
                                      div Activation
                                      .badge {getCastingTimeDisplay(spell)}

                          .spell-actions.mx-sm
                            button.add-btn(on:click|preventDefault!="{ () => addToSelection(spell) }" disabled="{isDisabled}")
                              i.fas.fa-plus
                +else()
                  .spell-level-group
                    p.left.mt-sm.flexrow.positive 
                      i.fa.fa-check.getParentClasses
                      | {spellLevel} selection completed
</template>

<style lang="sass">
  @import "../../../../../styles/Mixins.sass"

  .badge
    +badge(var(--color-cool-3), 0.5rem)
    margin-top: -2px
    margin-left: -8px
  :global(.GAS.theme-dark .selected-spell .spell-level)
    color: silver

  :global(.GAS.theme-dark .spell-row .spell-meta .spell-school)
    color: silver
  :global(.GAS.theme-dark .selected-spell .spell-school)
    color: silver !important

  .spells-tab-container 
    height: 100%
    width: 100%
    display: flex
    flex-direction: column

    &.readonly
      opacity: 0.7
      pointer-events: none
      
      :global(*)
        cursor: default !important
    
  ul.blank
     padding: 0 
  .info-message
    font-size: 0.8rem
    color: #666
    font-style: italic
    margin: 1rem
    padding: 1rem
    background: rgba(0, 0, 0, 0.05)
    border-radius: var(--border-radius)
    
    &.all-spells-notice
      background: rgba(0, 128, 0, 0.1)
      border: 1px solid rgba(0, 128, 0, 0.2)
      color: var(--gas-color-text)
      font-style: normal
      
      strong
        color: var(--dnd5e-color-gold, #b59e54)
        
      em
        font-size: 0.9em
        color: var(--gas-color-text)
        opacity: 0.8
    
    &.no-updates-notice
      background: rgba(66, 109, 190, 0.1)
      border: 1px solid rgba(66, 109, 190, 0.3)
      color: var(--gas-color-text)
      font-style: normal
      text-align: center
      
      strong
        color: var(--as-blue)
        font-size: 1.1em
        
      em
        font-size: 0.9em
        color: var(--gas-color-text)
        opacity: 0.8
        
      .auto-populate-section
        margin-top: 1rem
        
        .auto-populate-btn
          background: linear-gradient(135deg, #28a745, #20c997)
          color: white
          border: none
          padding: 0.75rem 1.5rem
          border-radius: 6px
          font-size: 0.95rem
          font-weight: 600
          cursor: pointer
          display: flex
          align-items: center
          gap: 0.5rem
          transition: all 0.3s ease
          box-shadow: 0 2px 8px rgba(40, 167, 69, 0.3)
          
          &:hover:not(:disabled)
            background: linear-gradient(135deg, #218838, #1ba085)
            transform: translateY(-2px)
            box-shadow: 0 4px 12px rgba(40, 167, 69, 0.4)
            
          &:active
            transform: translateY(0)
            
          &:disabled
            opacity: 0.6
            cursor: not-allowed
            transform: none
            box-shadow: none
            
          i.fas.fa-magic
            font-size: 1.1em

  .sticky-header
    position: sticky
    top: 27px
    left: 20px
    z-index: 5
    max-width: 200px
    &.hidden
      display: none

  .spells-tab
    display: flex
    height: 100%
    width: 100%
    flex: 1

  .left-panel
    flex: 1
    max-width: 40%
    min-width: 250px
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
      position: relative
      
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
      position: relative
     
      border: 1px solid var(--color-border-light-tertiary)
      margin-bottom: 0.25rem
      border-radius: 4px
      background: var(--color-bg)
      min-height: 40px
      
      &:hover
        background: var(--color-bg-btn)
        
      .spell-details
        min-width: 50px
        
        .spell-icon
          width: 40px
          height: 40px
          border-radius: 4px
          flex-shrink: 0
          object-fit: cover
          position: absolute
          border-top: 1px solid var(--dnd5e-color-gold)
          border-left: 1px solid var(--dnd5e-color-gold)
          border-bottom: 1px solid var(--dnd5e-color-gold)
          border-right: none
          border-top-right-radius: 0
          border-bottom-right-radius: 0
          left: -1px
          top: 0px
          margin-top: -1px

          img
            border: none

          
        .spell-info
          
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
    padding: 0.6rem 1.3rem 0.3rem 1.1rem
    gap: 4px
    margin-bottom: 0
    align-items: center
    background-color: var(--li-background-color)
    border-radius: var(--border-radius)
    border-collapse: none
    justify-content: space-evenly
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