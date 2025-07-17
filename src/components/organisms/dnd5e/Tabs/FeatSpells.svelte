<script>
  import { onMount, getContext, tick } from "svelte";
  import { localize as t, enrichHTML } from "~/src/helpers/Utility";
  import { actorInGame, isLevelUp } from "~/src/stores/index";
  import { parseFeatSpellRequirements, getAvailableSpellsForFeat } from "~/src/helpers/FeatSpellParser";
  import { getLevelUpFSM, LEVELUP_EVENTS } from "~/src/helpers/LevelUpStateMachine";
  import { getWorkflowFSM, WORKFLOW_EVENTS } from "~/src/helpers/WorkflowStateMachine";
  import { get } from "svelte/store";

  import Loading from "~/src/components/molecules/dnd5e/FeatSpells/Loading.svelte"
  import Choices from "~/src/components/molecules/dnd5e/FeatSpells/Choices.svelte"
  import SelectedSpells from "~/src/components/molecules/dnd5e/FeatSpells/SelectedSpells.svelte"
  import FixedSpells from "~/src/components/molecules/dnd5e/FeatSpells/FixedSpells.svelte"
  import AvailableSpells from "~/src/components/molecules/dnd5e/FeatSpells/AvailableSpells.svelte"
  
  // Component props
  export let sheet = null; // Accept but don't use to avoid warnings
  
  // Component state
  let featRequirements = [];
  let selectedSpells = new Map(); // Map of featId -> selected spells
  let selectedClasses = new Map(); // Map of featId -> selected class for generic feats
  let availableSpells = new Map(); // Map of featId -> available spell choices
  let isLoading = true;
  let error = null;
  let keywordFilter = '';
  let expandedLevels = {};
  let scrolled = false;
  
  // Get the current actor and workflow type
  $: actor = $actorInGame;
  $: isLevelUpWorkflow = $isLevelUp;
  
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
  
  /**
   * Initialize component on mount
   */
  onMount(async () => {
    await loadFeatSpellRequirements();
  });
  
  /**
   * Load feat spell requirements and available choices
   */
  async function loadFeatSpellRequirements() {
    try {
      isLoading = true;
      error = null;
      
      if (!actor) {
        throw new Error("No actor available");
      }
      
      // Get all feats from the actor
      const feats = actor.items.filter(item => item.type === 'feat');
      window.GAS.log.d('[FEAT SPELLS] Found feats:', feats.map(f => f.name));
      
      // Parse feat requirements
      featRequirements = parseFeatSpellRequirements(feats);
      window.GAS.log.d('[FEAT SPELLS] Parsed requirements:', featRequirements);
      
      // Keep all requirements - we want to show both choices AND fixed spells
      // Don't filter out requirements with choiceCount === 0
      
      if (featRequirements.length === 0) {
        window.GAS.log.d('[FEAT SPELLS] No feat spell requirements found, completing automatically');
        handleComplete();
        return;
      }
      
      // Load available spells for each requirement
      for (const requirement of featRequirements) {
        // Initialize selected spells and class for this feat
        selectedSpells.set(requirement.featId, []);
        
        if (requirement.requiresClassSelection) {
          // Don't load spells until class is selected
          selectedClasses.set(requirement.featId, null);
          availableSpells.set(requirement.featId, []);
        } else {
          // Load spells immediately for feats with predetermined sources
          const available = await getAvailableSpellsForFeat(requirement, actor);
          availableSpells.set(requirement.featId, available);
        }
      }
      
      // Trigger reactivity
      availableSpells = availableSpells;
      selectedSpells = selectedSpells;
      
    } catch (err) {
      window.GAS.log.e('[FEAT SPELLS] Error loading requirements:', err);
      error = err.message;
      ui.notifications?.error(err.message)
    } finally {
      isLoading = false;
    }
  }
  
  /**
   * Handle spell selection for a feat
   */
  async function onSpellSelected(featId, spell, isSelected) {
    await tick();
    const currentSelected = selectedSpells.get(featId) || [];
    const requirement = featRequirements.find(req => req.featId === featId);
    
    if (isSelected) {
      // Check selection limits
      const spellLevel = spell.system?.level || 0;
      const isCantrip = spellLevel === 0;
      
      if (requirement.cantrips && requirement.spells) {
        // Magic Initiate style - separate cantrip and spell limits
        const currentCantrips = currentSelected.filter(s => (s.system?.level || 0) === 0).length;
        const currentNonCantrips = currentSelected.filter(s => (s.system?.level || 0) > 0).length;
        
        if (isCantrip && currentCantrips >= requirement.cantrips) {
          ui.notifications?.warn(`You can only select ${requirement.cantrips} cantrips for ${requirement.featName}`);
          return;
        }
        if (!isCantrip && currentNonCantrips >= requirement.spells) {
          ui.notifications?.warn(`You can only select ${requirement.spells} level 1 spell for ${requirement.featName}`);
          return;
        }
      } else if (currentSelected.length >= requirement.choiceCount) {
        ui.notifications?.warn(`You can only select ${requirement.choiceCount} spells for ${requirement.featName}`);
        return;
      }
      
      // Add spell to selection
      selectedSpells.set(featId, [...currentSelected, spell]);
    } else {
      // Remove spell from selection
      selectedSpells.set(featId, currentSelected.filter(s => s._id !== spell._id));
    }
    
    // Trigger reactivity
    selectedSpells = selectedSpells;
  }
  
  /**
   * Handle class selection for generic feats like Magic Initiate
   */
  async function onClassSelected(featId, className) {
    selectedClasses.set(featId, className);
    
    // Find the requirement and update its spell sources
    const requirement = featRequirements.find(req => req.featId === featId);
    if (requirement && requirement.requiresClassSelection) {
      // Update the requirement with the selected class
      const updatedRequirement = {
        ...requirement,
        spellSources: [className],
        requiresClassSelection: false // Mark as no longer needing class selection
      };
      
      // Load spells for the selected class
      const available = await getAvailableSpellsForFeat(updatedRequirement, actor);
      availableSpells.set(featId, available);
      
      // Clear any previous spell selections since class changed
      selectedSpells.set(featId, []);
      
      // Trigger reactivity
      availableSpells = availableSpells;
      selectedSpells = selectedSpells;
      selectedClasses = selectedClasses;
    }
  }
  
  
  
  // Get all available spells from all feats for the spell browser
  $: allAvailableSpells = Array.from(availableSpells.values()).flat();
  
  // Filter spells by keyword
  $: filteredSpells = allAvailableSpells.filter(spell => 
    spell.name.toLowerCase().includes(keywordFilter.toLowerCase())
  );
  
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
  
  // Get all selected spells for display
  $: allSelectedSpells = Array.from(selectedSpells.entries()).flatMap(([featId, spells]) => 
    spells.map(spell => ({ featId, spell }))
  );
  
  // Toggle spell level expansion
  function toggleSpellLevel(level) {
    expandedLevels[level] = !expandedLevels[level];
    expandedLevels = { ...expandedLevels };
  }
  
  // Check if a spell is already selected
  function isSpellSelected(spell) {
    return allSelectedSpells.some(selected => selected.spell._id === spell._id);
  }
  
  // Add spell to selection
  async function addToSelection(spell) {
    // Find which feat this spell belongs to
    const featId = Array.from(availableSpells.entries()).find(([fId, spells]) => 
      spells.some(s => s._id === spell._id)
    )?.[0];
    
    if (featId) {
      await onSpellSelected(featId, spell, true);
    }
  }
  
  // Remove spell from selection
  function removeFromSelection(featId, spellId) {
    const currentSelected = selectedSpells.get(featId) || [];
    selectedSpells.set(featId, currentSelected.filter(s => s._id !== spellId));
    selectedSpells = selectedSpells;
  }
  
  /**
   * Check if all required selections are complete
   */
  function areAllSelectionsComplete() {
    for (const requirement of featRequirements) {
      // Skip requirements that have no choices (fixed spells only)
      if (requirement.choiceCount === 0) {
        continue;
      }
      
      const selected = selectedSpells.get(requirement.featId) || [];
      
      if (requirement.cantrips && requirement.spells) {
        // Magic Initiate style - check separate cantrip and spell counts
        const selectedCantrips = selected.filter(s => (s.system?.level || 0) === 0).length;
        const selectedNonCantrips = selected.filter(s => (s.system?.level || 0) > 0).length;
        
        if (selectedCantrips < requirement.cantrips || selectedNonCantrips < requirement.spells) {
          return false;
        }
      } else if (selected.length < requirement.choiceCount) {
        return false;
      }
    }
    return true;
  }
  
  /**
   * Handle completion of feat spell selection
   * Now triggers Footer action instead of handling locally
   */
  async function handleComplete() {
    try {
      // Add spells to the actor
      for (const requirement of featRequirements) {
        // Add selected spells (from user choices)
        const selected = selectedSpells.get(requirement.featId) || [];
        for (const spell of selected) {
          await addSpellToActor(spell, requirement);
        }
        
        // Add fixed spells (automatic from feat)
        if (requirement.fixedSpells && requirement.fixedSpells.length > 0) {
          for (const spellName of requirement.fixedSpells) {
            // Create a spell object for the fixed spell
            const fixedSpell = { name: spellName };
            await addSpellToActor(fixedSpell, requirement);
          }
        }
      }
      
      // Trigger the appropriate workflow event based on workflow type
      if (isLevelUpWorkflow) {
        const levelUpFSM = getLevelUpFSM();
        levelUpFSM.handle(LEVELUP_EVENTS.FEAT_SPELLS_COMPLETE);
      } else {
        const workflowFSM = getWorkflowFSM();
        workflowFSM.handle(WORKFLOW_EVENTS.FEAT_SPELLS_COMPLETE);
      }
      
    } catch (err) {
      window.GAS.log.e('[FEAT SPELLS] Error completing selection:', err);
      error = err.message;
    }
  }
  
  /**
   * Skip feat spell selection
   * Now triggers Footer action instead of handling locally
   */
  function handleSkip() {
    if (isLevelUpWorkflow) {
      const levelUpFSM = getLevelUpFSM();
      levelUpFSM.handle(LEVELUP_EVENTS.SKIP_FEAT_SPELLS);
    } else {
      const workflowFSM = getWorkflowFSM();
      workflowFSM.handle(WORKFLOW_EVENTS.SKIP_FEAT_SPELLS);
    }
  }
  
  /**
   * Add a selected spell to the actor
   */
  async function addSpellToActor(spell, requirement) {
    try {
      // Find the spell in available packs
      const spellData = await findSpellData(spell._id || spell.name);
      
      if (!spellData) {
        window.GAS.log.w('[FEAT SPELLS] Could not find spell data for:', spell.name);
        return;
      }
      
      // Create the spell item on the actor
      const itemData = {
        ...spellData,
        system: {
          ...spellData.system,
          preparation: {
            mode: "always", // Feat spells are always prepared
            prepared: true
          },
          sourceClass: requirement.featName || "feat" // Mark source as the feat
        }
      };
      
      await actor.createEmbeddedDocuments("Item", [itemData]);
      window.GAS.log.d('[FEAT SPELLS] Added spell to actor:', spell.name);
      
    } catch (err) {
      window.GAS.log.e('[FEAT SPELLS] Error adding spell to actor:', err);
      throw err;
    }
  }
  
  /**
   * Find spell data in compendiums
   */
  async function findSpellData(spellIdentifier) {
    const spellPacks = [
      'dnd5e.spells',
      'dnd-players-handbook.spells'
    ];
    
    for (const packId of spellPacks) {
      const pack = game.packs.get(packId);
      if (!pack) continue;
      
      try {
        const index = await pack.getIndex();
        const spellEntry = index.find(entry => 
          entry.name === spellIdentifier || 
          entry._id === spellIdentifier
        );
        
        if (spellEntry) {
          const spell = await pack.getDocument(spellEntry._id);
          return spell.toObject();
        }
      } catch (err) {
        window.GAS.log.w('[FEAT SPELLS] Error searching pack:', packId, err);
      }
    }
    
    return null;
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
        : spell.system?.activation?.type ? spell.system?.activation?.type
      : 'Unknown';
  }
</script>

<template lang="pug">
.feat-spells-container.flexrow
  +if("isLoading")
    Loading
  +elseif("error")
    .error-state
      i.fas.fa-exclamation-triangle
      span {t('FeatSpells.Error', { error })}
      button.retry-btn(on:click!="{loadFeatSpellRequirements}") {t('Retry')}
    +elseif("featRequirements.length === 0")
      .no-requirements
        i.fas.fa-info-circle
        span {t('FeatSpells.NoRequirements')}
      +else()
        .left-panel.feat-spells-tab
          h3 {t('FeatSpells.SelectedSpells')}
          Choices(
            featRequirements="{featRequirements}"
            selectedClasses="{selectedClasses}"
            availableSpells="{availableSpells}"
            selectedSpells="{selectedSpells}"
            actor="{actor}"
            onClassSelected="{onClassSelected}"
          )
            
          //- Selected spells display
          SelectedSpells(
            allSelectedSpells="{allSelectedSpells}"
            getEnrichedName="{getEnrichedName}"
            getSpellLevelDisplay="{getSpellLevelDisplay}"
            getSchoolName="{getSchoolName}"
            removeFromSelection="{removeFromSelection}"
          )

          //- Fixed spells display
          FixedSpells(featRequirements="{featRequirements}")

        .right-panel.spell-list
          h3 {t('FeatSpells.AvailableSpells')}
          .filter-container.mb-sm
            input.keyword-filter(
              type="text" 
              bind:value="{keywordFilter}" 
              placeholder="{t('Spells.FilterPlaceholder')}"
            )
          
          AvailableSpells(
            allAvailableSpells="{allAvailableSpells}"
            filteredSpells="{filteredSpells}"
            spellsByLevel="{spellsByLevel}"
            spellLevels="{spellLevels}"
            expandedLevels="{expandedLevels}"
            toggleSpellLevel="{toggleSpellLevel}"
            isSpellSelected="{isSpellSelected}"
            addToSelection="{addToSelection}"
            getEnrichedName="{getEnrichedName}"
            getSchoolName="{getSchoolName}"
            getCastingTimeDisplay="{getCastingTimeDisplay}"
            keywordFilter="{keywordFilter}"
          )
</template>

<style lang="sass">
  @use "../../../../../styles/Mixins.sass" as M
  .badge
    +M.badge(var(--color-cool-3), 0.5rem)
    margin-top: -2px
    margin-left: -8px

  :global(.GAS.theme-dark .selected-spell .spell-level)
    color: silver

  :global(.GAS.theme-dark .spell-row .spell-meta .spell-school)
    color: silver
  :global(.GAS.theme-dark .selected-spell .spell-school)
    color: silver !important

  .feat-spells-container
    height: 100%
    width: 100%
    display: flex
    flex-direction: column

  ul.blank
     padding: 0 

  .loading-state, .error-state, .no-requirements
    display: flex
    flex-direction: column
    align-items: center
    justify-content: center
    height: 100%
    gap: 1rem
    color: var(--color-text-dark-5, #6c757d)

  .error-state
    color: var(--color-text-danger, #dc3545)

  .retry-btn
    padding: 0.5rem 1rem
    background: var(--color-bg-btn, #007bff)
    color: white
    border: none
    border-radius: 4px
    cursor: pointer

  .feat-spells-tab
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
    
    h3, h4
      margin-bottom: 0.5rem
      color: var(--color-text-dark-primary, #212529)

  .class-selection-section
    margin-bottom: 1rem
    padding: 1rem
    background: var(--color-bg-option, #f8f9fa)
    border: 1px solid var(--color-border-light-tertiary, #e9ecef)
    border-radius: 6px

    h4
      margin: 0 0 0.75rem 0
      font-size: 1rem
      color: var(--color-text-dark-primary, #212529)

  .class-selection
    .filter-label
      display: block
      margin-bottom: 0.5rem
      font-weight: 500
      color: var(--color-text-dark-primary, #212529)
      font-size: 0.9rem

    .filter-select
      width: 100%
      padding: 0.5rem
      border: 1px solid var(--color-border-light, #dee2e6)
      border-radius: 4px
      background: var(--color-bg, white)
      color: var(--color-text-dark-primary, #212529)
      font-size: 0.9rem

      &:focus
        outline: none
        border-color: var(--color-border-focus, #007bff)
        box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25)

  .selected-spells
    margin-bottom: 1rem

    .empty-selection
      text-align: center
      padding: 2rem 1rem
      color: var(--color-text-dark-5, #6c757d)
      font-style: italic

  .selected-spell
    display: flex
    align-items: center
    gap: 0.75rem
    padding: 0.75rem
    margin-bottom: 0.5rem
    background: var(--color-bg, white)
    border: 1px solid var(--color-border-light-tertiary, #e9ecef)
    border-radius: 4px

    .spell-col1
      flex-shrink: 0
      
      .spell-icon
        width: 32px
        height: 32px
        border-radius: 4px
        object-fit: cover

    .spell-col2
      flex: 1
      min-width: 0

      .spell-name
        font-weight: 500
        color: var(--color-text-dark-primary, #212529)
        margin-bottom: 0.25rem
        line-height: 1.3

      .spell-subdetails
        display: flex
        gap: 0.75rem
        font-size: 0.85rem
        color: var(--color-text-dark-5, #6c757d)

    .spell-col3
      flex-shrink: 0

      .remove-btn
        padding: 0.25rem 0.5rem
        background: transparent
        border: 1px solid var(--color-border-light, #dee2e6)
        border-radius: 3px
        color: var(--color-text-danger, #dc3545)
        cursor: pointer
        font-size: 0.85rem

        &:hover
          background: var(--color-bg-danger, #f8d7da)

  .fixed-spells-section
    margin-bottom: 1rem
    padding: 1rem
    background: var(--color-bg-success, #d4edda)
    border: 1px solid var(--color-border-success, #c3e6cb)
    border-radius: 6px

    h4
      margin: 0 0 0.75rem 0
      color: var(--color-text-success, #155724)
      font-size: 1rem

  .fixed-spells
    display: flex
    flex-direction: column
    gap: 0.5rem

  .fixed-spell
    display: flex
    align-items: center
    gap: 0.5rem
    padding: 0.5rem
    background: var(--color-bg, white)
    border: 1px solid var(--color-border-success, #c3e6cb)
    border-radius: 4px
    color: var(--color-text-success, #155724)
    font-size: 0.9rem

    i
      color: var(--color-text-success, #155724)

  .right-panel.spell-list
    flex: 1
    padding: 1rem
    overflow-y: auto
    
    h3
      margin-bottom: 0.5rem
      color: var(--color-text-dark-primary, #212529)

  .filter-container
    margin-bottom: 1rem

    .keyword-filter
      width: 100%
      padding: 0.5rem
      border: 1px solid var(--color-border-light, #dee2e6)
      border-radius: 4px
      background: var(--color-bg, white)
      color: var(--color-text-dark-primary, #212529)
      font-size: 0.9rem

      &:focus
        outline: none
        border-color: var(--color-border-focus, #007bff)
        box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25)

      &::placeholder
        color: var(--color-text-dark-5, #6c757d)

  .empty-state
    text-align: center
    padding: 2rem 1rem
    color: var(--color-text-dark-5, #6c757d)
    font-style: italic

  .spell-level-group
    margin-bottom: 1rem

  .spell-level-header
    background: var(--color-bg-option, #f8f9fa)
    padding: 0.5rem 0.75rem
    border: 1px solid var(--color-border-light-tertiary, #e9ecef)
    border-radius: 4px
    margin-bottom: 0.5rem
    cursor: pointer
    transition: background-color 0.2s

    &:hover
      background: var(--color-bg-btn-secondary, #e9ecef)

  .spell-row
    padding: 0.75rem
    margin-bottom: 0.5rem
    background: var(--color-bg, white)
    border: 1px solid var(--color-border-light-tertiary, #e9ecef)
    border-radius: 4px
    align-items: center
    transition: all 0.2s ease

    &:hover
      border-color: var(--color-border-light, #dee2e6)
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1)

  .spell-details
    .spell-icon
      width: 32px
      height: 32px
      border-radius: 4px
      object-fit: cover

  .spell-info
    .spell-name
      font-weight: 500
      color: var(--color-text-dark-primary, #212529)
      margin-bottom: 0.25rem

    .spell-meta
      font-size: 0.85rem
      color: var(--color-text-dark-5, #6c757d)

  .spell-actions
    .add-btn
      padding: 0.25rem 0.5rem
      background: var(--color-bg-btn, #007bff)
      color: white
      border: none
      border-radius: 3px
      cursor: pointer
      font-size: 0.85rem

      &:hover
        background: var(--color-bg-btn-hover, #0056b3)

    .spell-selected
      padding: 0.25rem 0.5rem
      color: var(--color-text-success, #28a745)
      font-size: 0.85rem

  .feat-spells-actions
    display: flex
    gap: 1rem
    justify-content: flex-end
    padding: 1rem
    border-top: 1px solid var(--color-border-light-tertiary, #e9ecef)
    background: var(--color-bg-option, #f8f9fa)

  .skip-btn, .complete-btn
    padding: 0.75rem 1.5rem
    border: 1px solid transparent
    border-radius: 4px
    font-weight: 500
    cursor: pointer
    transition: all 0.2s
    font-size: 0.9rem

  .skip-btn
    background: var(--color-bg-option, #f8f9fa)
    color: var(--color-text-dark-5, #6c757d)
    border-color: var(--color-border-light, #dee2e6)

    &:hover
      background: var(--color-bg-btn-secondary, #e9ecef)
      color: var(--color-text-dark-primary, #212529)

  .complete-btn
    background: var(--color-bg-btn, #007bff)
    color: white

    &:hover:not(:disabled)
      background: var(--color-bg-btn-hover, #0056b3)

    &:disabled
      background: var(--color-bg-option, #f8f9fa)
      color: var(--color-text-dark-inactive, #adb5bd)
      cursor: not-allowed

  // Dark theme support
  :global(.GAS.theme-dark) .feat-spells-container
    background: var(--color-bg-dark, #1a1a1a)
    color: var(--color-text-light, #ffffff)

    .class-selection-section,
    .fixed-spells-section,
    .selected-spell,
    .spell-row
      background: var(--color-bg-dark-secondary, #2a2a2a)
      border-color: var(--color-border-dark, #444)

    .filter-select,
    .keyword-filter
      background: var(--color-bg-dark-secondary, #2a2a2a)
      border-color: var(--color-border-dark, #444)
      color: var(--color-text-light, #ffffff)

    .spell-level-header
      background: var(--color-bg-dark-secondary, #2a2a2a)
      border-color: var(--color-border-dark, #444)

      &:hover
        background: var(--color-bg-dark-tertiary, #3a3a3a)

    .feat-spells-actions
      background: var(--color-bg-dark-secondary, #2a2a2a)
      border-color: var(--color-border-dark, #444)
</style>
