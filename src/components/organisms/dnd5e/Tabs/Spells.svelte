<script>
  import { get } from 'svelte/store';
  import { readOnlyTabs, isLevelUp, newLevelValueForExistingClass, levelUpClassObject, classUuidForLevelUp } from '~/src/stores/index';
  import { characterClass, characterSubClass } from '~/src/stores/storeDefinitions';
  import { localize as t, enrichHTML } from "~/src/helpers/Utility";
  import { getContext, onDestroy, onMount, tick } from "svelte";
  import { availableSpells, selectedSpells, maxSpellLevel, 
    initializeSpellSelection, loadAvailableSpells, addSpell, removeSpell,
    spellLimits, currentSpellCounts, spellProgress, autoPopulateAllSpells
  } from '~/src/stores/spellSelection';
  import spellsKnownData from '~/src/stores/spellsKnown.json';
  import { MODULE_ID } from '~/src/helpers/constants';
  import { determineSpellListClass, parseSpellcastingFromDescription } from '~/src/helpers/LevelUpStateMachine';
  
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
  // During level-up, prefer the class the user selected to level (levelUpClassObject)
  $: characterClassName = ($isLevelUp && $levelUpClassObject)
    ? ($levelUpClassObject.system?.identifier || $levelUpClassObject.name || $levelUpClassObject.label)
    : (determineSpellListClass($actor) || $characterClass?.name || 'Bard'); // Default to Bard for testing

  // Debug: log which class we think is being used for spell selection
  $: window.GAS?.log?.d?.('[SPELLS] selected class for spell tab:', {
    isLevelUp: $isLevelUp,
    characterClassName,
    characterClassStore: $characterClass,
    levelUpClassObject: $levelUpClassObject,
    classUuidForLevelUp: $classUuidForLevelUp,
    actorName: $actor?.name
  });
  
  // Debug the character class name calculation and reload spells when it changes
  $: {
    try {
      window.GAS.log.d('[SPELLS] characterClassName updated:', characterClassName, 'actor:', $actor?.name);
      // Reload spells when character class name changes (for level-up scenarios)
      if (characterClassName && $isLevelUp) {
        loadAvailableSpells(characterClassName);
      }
    } catch (error) {
      window.GAS.log.e('[SPELLS] Error in characterClassName reactive statement:', error);
    }
  }
  
  // Calculate the effective character level for spell calculations
  // For character creation: Always use level 1
  // For level-up: Use the new level value
  $: effectiveCharacterLevel = $isLevelUp && $newLevelValueForExistingClass 
    ? $newLevelValueForExistingClass 
    : 1; // Character creation is always level 1
  
  // Check if character class gets access to all spells
  $: hasAllSpellsAccess = $spellLimits.hasAllSpells;
  
  // Calculate max spell level based on character class and the effective level
  $: calculatedMaxSpellLevel = getMaxSpellLevelForClass(effectiveCharacterLevel, characterClassName, $actor);
  
  // For level-up scenarios, use the new level for spell level calculations
  $: levelUpAwareMaxSpellLevel = $isLevelUp && $newLevelValueForExistingClass 
    ? getMaxSpellLevelForClass($newLevelValueForExistingClass, characterClassName, $actor)
    : calculatedMaxSpellLevel;
  
  // Use our calculated max spell level if the store returns 0 (during character creation)
  $: effectiveMaxSpellLevel = $maxSpellLevel > 0 ? $maxSpellLevel : levelUpAwareMaxSpellLevel;
  
  // Calculate old max spell level for level-up scenarios
  $: oldMaxSpellLevel = $isLevelUp && $newLevelValueForExistingClass 
    ? getMaxSpellLevelForClass($newLevelValueForExistingClass - 1, characterClassName, $actor)
    : 0;
  
  // Determine if auto-populate should be offered
  $: shouldOfferAutoPopulate = hasAllSpellsAccess && (
    !$isLevelUp || // Always offer during character creation
    (effectiveMaxSpellLevel > oldMaxSpellLevel) // Only offer during level-up if max spell level increased
  );
  
  // Check if this is a level-up with no new spell access
  $: isLevelUpWithNoSpellUpdates = $isLevelUp && hasAllSpellsAccess && effectiveMaxSpellLevel <= oldMaxSpellLevel;
  
  // Debug logging for character data
  // $: {
  //   window.GAS.log.d(`[SPELLS DEBUG] Character data:`, {
  //     characterClass: $characterClass,
  //     characterClassName,
  //     effectiveCharacterLevel,
  //     newLevelValueForExistingClass: $newLevelValueForExistingClass,
  //     isLevelUp: $isLevelUp,
  //     storeMaxSpellLevel: $maxSpellLevel,
  //     calculatedMaxSpellLevel,
  //     levelUpAwareMaxSpellLevel,
  //     effectiveMaxSpellLevel,
  //     spellLimits: $spellLimits,
  //     progress: $spellProgress
  //   });
  // }
  
  // Cache for enriched spell names
  let enrichedNames = {};

  // Helper to safely get fromUuidSync
  const fromUuidSync = (uuid) => {
    try {
      return foundry.utils?.fromUuidSync?.(uuid) || null;
    } catch (error) {
      window.GAS.log.w('[SPELLS] Error in fromUuidSync:', error);
      return null;
    }
  };

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

  // Calculate max spell level based on class and character level
  function getMaxSpellLevelForClass(level, className, actor = null) {
    // Get the current D&D rules version
    const rulesVersion = window.GAS?.dnd5eRules || '2014';
    const is2024Rules = rulesVersion === '2024';
    
    // If we have an actor, try to determine spellcasting progression from actor's spellcasting system
    if (actor) {
      const actorData = actor.system || actor.data?.data;
      if (actorData?.spellcasting) {
        // Check if this is subclass spellcasting (like Eldritch Knight)
        const spellcastingEntries = Object.values(actorData.spellcasting);
        for (const entry of spellcastingEntries) {
          if (entry.progression) {
            // Use the progression from the actor's spellcasting system
            return getMaxSpellLevelByProgression(level, entry.progression, is2024Rules);
          }
        }
      }
    }
    
    // Fallback to class-based detection
    return getMaxSpellLevelByClassName(level, className, is2024Rules);
  }

  // Helper function to calculate max spell level by progression type
  function getMaxSpellLevelByProgression(level, progression, is2024Rules) {
    switch (progression) {
      case 'full':
        return Math.min(9, Math.ceil(level / 2));
      case 'half':
        if (is2024Rules) {
          return Math.min(5, Math.ceil(level / 4));
        } else {
          return Math.min(5, Math.ceil((level - 1) / 4));
        }
      case 'third':
        return Math.min(4, Math.ceil((level - 2) / 6));
      case 'pact':
        // Warlock progression
        if (level >= 17) return 5;
        if (level >= 11) return 3;
        if (level >= 7) return 2;
        if (level >= 1) return 1;
        return 0;
      default:
        return 0;
    }
  }

  // Helper function to calculate max spell level by class name (fallback)
  function getMaxSpellLevelByClassName(level, className, is2024Rules) {
    // Standard D&D 5e spellcasting progression for full casters
    const fullCasters = ['Bard', 'Cleric', 'Druid', 'Sorcerer', 'Wizard'];
    const halfCasters = ['Paladin', 'Ranger'];
    const thirdCasters = ['Arcane Trickster', 'Eldritch Knight'];
    const warlockProgression = ['Warlock'];
    
    if (fullCasters.includes(className)) {
      // Full casters: spell level = Math.ceil(character level / 2), max 9
      return Math.min(9, Math.ceil(level / 2));
    } else if (halfCasters.includes(className)) {
      // Half casters: Different progression for 2014 vs 2024 rules
      if (is2024Rules) {
        // 2024 rules: Half casters start spellcasting at level 1
        return Math.min(5, Math.ceil(level / 4));
      } else {
        // 2014 rules: Half casters start spellcasting at level 2
        return Math.min(5, Math.ceil((level - 1) / 4));
      }
    } else if (thirdCasters.includes(className)) {
      // Third casters: spell level = Math.ceil((character level - 2) / 6), max 4
      return Math.min(4, Math.ceil((level - 2) / 6));
    } else if (warlockProgression.includes(className)) {
      // Warlocks have their own progression based on D&D 5e warlock table
      // Spell levels increase at 3, 5, 7, and 9
      if (level >= 9) return 5;
      if (level >= 7) return 4;
      if (level >= 5) return 3;
      if (level >= 3) return 2;
      if (level >= 1) return 1;
      return 0;
    } else if (className === 'Artificer') {
      // Artificers: Different progression for 2014 vs 2024 rules
      if (is2024Rules) {
        // 2024 rules: Artificers start spellcasting at level 1
        return Math.min(5, Math.ceil(level / 4));
      } else {
        // 2014 rules: Artificers start spellcasting at level 2
        if (level < 2) return 0;
        return Math.min(5, Math.ceil((level - 1) / 4));
      }
    }
    
    // Non-spellcasting classes
    return 0;
  }

  // Fetch spells when component mounts
  onMount(async () => {
    loading = true;
    
    // Initialize spell selection with current actor
    initializeSpellSelection($actor);
    
    // Load available spells with character class filtering
    // Note: This might be overridden by LevelUpStateMachine, but we need it for character creation
    await loadAvailableSpells(characterClassName);
    
    // Debug logging
    // window.GAS.log.d(`[SPELLS DEBUG] Loaded spells:`, {
    //   totalSpells: $availableSpells.length,
    //   effectiveCharacterLevel,
    //   storeMaxSpellLevel: $maxSpellLevel,
    //   calculatedMaxSpellLevel,
    //   effectiveMaxSpellLevel,
    //   characterClassName,
    //   spellLimits,
    //   sampleSpells: $availableSpells.slice(0, 5).map(s => ({
    //     name: s.name,
    //     level: s.system?.level,
    //     classes: s.labels?.classes || []
    //   }))
    // });
    
    loading = false;
    window.GAS.log.d('[SPELLS] Component mounted, loading set to false, availableSpells count:', $availableSpells.length);

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
  $: actorSpells = $actor.items.filter(item => item.type === 'spell');

  $: window.GAS.log.g(actorSpells);

  // Filter spells by keyword and character class
  $: filteredSpells = $availableSpells.filter(spell => {
    const matchesKeyword = spell.name.toLowerCase().includes(keywordFilter.toLowerCase());
    const spellLevel = spell.system?.level || 0;
    
    // Only show cantrips if character can learn them (cantrip limit > 0)
    // This fixes Rangers 2014 who get 0 cantrips but were still seeing cantrips in the list
    // Allow spells up to the character's max spell level
    // OR allow level 1 spells if the character has spell slots available (fixes Ranger 2024 issue)
    const withinCharacterLevel = 
      (spellLevel === 0 && $spellLimits.cantrips > 0) || 
      (spellLevel > 0 && spellLevel <= effectiveMaxSpellLevel) || 
      (spellLevel === 1 && $spellLimits.spells > 0);
    
    const alreadySelected = selectedSpellsList.map(item => item.id).includes(spell._id);
    const alreadyKnown = actorSpells.map(item => item.name).includes(spell.name);

    // NOTE: class availability is already resolved by `loadAvailableSpells()` and
    // embedded in the `availableSpells` store. The UI should not re-run class
    // filtering here to avoid accidental double-filtering or divergent logic.
    return matchesKeyword && withinCharacterLevel && !alreadySelected && !alreadyKnown
  });
  
  // Debug filtered spells
  $: window.GAS.log.d('[SPELLS] Filtered spells count:', filteredSpells.length, 'from available:', $availableSpells.length);

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
  // $: {
  //   if (Object.keys(spellsByLevel).length > 0) {
  //     window.GAS.log.d(`[SPELLS DEBUG] Spells by level:`, {
  //       totalFiltered: filteredSpells.length,
  //       groupedByLevel: Object.keys(spellsByLevel).map(level => ({
  //         level,
  //         count: spellsByLevel[level].length,
  //         samples: spellsByLevel[level].slice(0, 3).map(s => s.name)
  //       }))
  //     });
  //   }
  // }

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
    // Always get the latest store values to avoid stale cap checks
    await tick();
    const spellLevel = spell.system?.level || 0;
    const isCantrip = spellLevel === 0;
    const counts = get(currentSpellCounts);
    const limits = get(spellLimits);

    // Strict enforcement: check if adding this spell would exceed limits
    if (isCantrip && counts.cantrips >= limits.cantrips) {
      ui.notifications?.warn(t('Spells.CantripLimitReached'));
      return;
    }
    if (!isCantrip && counts.spells >= limits.spells) {
      ui.notifications?.warn(t('Spells.SpellLimitReached'));
      return;
    }
    
    // Double-check that we're not adding duplicates
    const spellId = spell.id || spell._id;
    const currentSelections = get(selectedSpells);
    if (currentSelections.has(spellId)) {
      ui.notifications?.warn('Spell already selected');
      return;
    }
    
    await addSpell(spell);
  }

  // Remove spell from selection
  function removeFromSelection(spellId) {
    removeSpell(spellId);
  }

  // Auto-populate all spells for classes that get all spells
  async function autoPopulateSpells() {
    if (!hasAllSpellsAccess) {
      ui.notifications?.warn('This class does not have access to all spells');
      return;
    }
    
    try {
      const success = await autoPopulateAllSpells(
        characterClassName, 
        effectiveMaxSpellLevel, 
        $actor, 
        $isLevelUp, 
        oldMaxSpellLevel
      );
      if (success) {
        // Refresh the selected spells list
        await tick();
      }
    } catch (error) {
      console.error('Error auto-populating spells:', error);
      ui.notifications?.error('Failed to auto-populate spells');
    }
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

  $: cantripCountCss = $currentSpellCounts.cantrips >= $spellLimits.cantrips
  $: spellCountCss = $currentSpellCounts.spells >= $spellLimits.spells
</script>

<template lang="pug">
spells-tab-container(clas:readonlys="{isDisabled}")
 
  +if("isDisabled")
    .info-message {t('Spells.SpellsReadOnly')}
    +elseif("isLevelUpWithNoSpellUpdates")
      .info-message.no-updates-notice
        p 
          strong No spell updates needed for this level-up
        p 
          | {characterClassName}s have access to all spells of appropriate level. At level {$newLevelValueForExistingClass}, you still have access to the same spell levels (1-{effectiveMaxSpellLevel}) as before.
        p 
          em Your spell selection is complete - no changes needed.
    +elseif("shouldOfferAutoPopulate")
      .info-message.all-spells-notice
        p 
          strong {characterClassName}s 
          | have access to all spells of appropriate level. You only need to select the cantrips you want to know - all other spells can be prepared during gameplay.
        p 
          em Note: You still need to select your cantrips as they cannot be changed later.
        .auto-populate-section
          button.auto-populate-btn(
            on:click!="{ () => autoPopulateSpells() }" 
            disabled="{isDisabled || loading}"
          )
            i.fas.fa-magic
            +if("$isLevelUp && effectiveMaxSpellLevel > oldMaxSpellLevel")
              span Auto-populate New Level {effectiveMaxSpellLevel} Spells
              +else()
                span Auto-populate All Spells (Levels 1-{effectiveMaxSpellLevel})
  .sticky-header(class:hidden="{!scrolled}")
    .panel-header-grid
      .grid-item.label {t('Spells.Cantrips')}:
      .grid-item.value(class:at-limit="{cantripCountCss}") {$currentSpellCounts.cantrips}/{$spellLimits.cantrips}
      .grid-item.label {t('Spells.Spells')}:
      .grid-item.value(class:at-limit="{spellCountCss}") {$currentSpellCounts.spells}/{$spellLimits.spells === 999 ? 'All' : $spellLimits.spells}
  .spells-tab
    .left-panel(bind:this="{spellContainer}")
      .panel-header-grid(class:hidden="{scrolled}")
        .grid-item.label {t('Spells.Cantrips')}:
        .grid-item.value(class:at-limit="{cantripCountCss}") {$currentSpellCounts.cantrips}/{$spellLimits.cantrips}
        .grid-item.label {t('Spells.Spells')}:
        .grid-item.value(class:at-limit="{spellCountCss}") {$currentSpellCounts.spells}/{$spellLimits.spells === 999 ? 'All' : $spellLimits.spells}
      h3 {t('Spells.SelectedSpells')}

      .selected-spells
        +if("selectedSpellsList.length === 0")
          .empty-selection
            p {t('Spells.NoSpellsSelected')}      

          +else()
            +each("selectedSpellsList as selectedSpell")
              .selected-spell
                .spell-col1
                  img.spell-icon( alt="{selectedSpell.spell.name}" src="{selectedSpell.spell.img}")
                .spell-col2.left            
                  .spell-name
                    +await("getEnrichedName(selectedSpell.spell)")
                      span {selectedSpell.spell.name}
                      +then("Html")
                        span {@html Html}
                      +catch("error")
                        span {selectedSpell.spell.name}


                  .spell-subdetails
                    span.spell-level {getSpellLevelDisplay(selectedSpell.spell)}
                    span.spell-school {getSchoolName(selectedSpell.spell)}

                .spell-col3
                  button.remove-btn(on:click!="{ () => removeFromSelection(selectedSpell.id) }" disabled="{isDisabled}")
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