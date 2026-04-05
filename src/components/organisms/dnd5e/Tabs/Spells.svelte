<script>
  import { get } from 'svelte/store';
  import { readOnlyTabs, isLevelUp, newLevelValueForExistingClass, levelUpClassObject, classUuidForLevelUp } from '~/src/stores/index';
  import { characterClass } from '~/src/stores/storeDefinitions';
  import { localize as t, enrichHTML } from "~/src/helpers/Utility";
  import { getContext, onDestroy, onMount, tick } from "svelte";
  import { availableSpells, selectedSpells, maxSpellLevel, 
    initializeSpellSelection, loadAvailableSpells, addSpell, removeSpell,
    spellLimits, currentSpellCounts
  } from '~/src/stores/spellSelection';
  import { determineSpellListClass } from '~/src/helpers/LevelUpStateMachine';
  import SpellCounterGrid from '~/src/components/atoms/dnd5e/SpellCounterGrid.svelte';
  import SelectedSpellsPanel from '~/src/components/molecules/dnd5e/Spells/SelectedSpellsPanel.svelte';
  import AvailableSpellsPanel from '~/src/components/molecules/dnd5e/Spells/AvailableSpellsPanel.svelte';
  
  const actor = getContext("#doc");
  
  let loading = true;
  let keywordFilter = '';
  let expandedLevels = {};
  let selectedSpellsList = [];
  let scrolled = false;
  let cleanup;
  let lastAutoSelectSignature = '';
  let autoSelectInProgress = false;

  $: isDisabled = $readOnlyTabs.includes('spells');
  $: actorObject = $actor.toObject();

  // Get character class name for spell filtering and limits
  // CRITICAL: During level-up, first check if the character has subclass spellcasting (e.g., Eldritch Knight)
  // Only use levelUpClassObject if it actually grants spellcasting
  $: characterClassName = (() => {
    if ($isLevelUp && $actor) {
      // First, try to determine spell list from subclass/features
      const spellListFromActor = determineSpellListClass($actor);
      if (spellListFromActor && typeof spellListFromActor === 'string') {
        window.GAS?.log?.d?.('[SPELLS] Using spell list from subclass/features:', spellListFromActor);
        return spellListFromActor;
      }
      
      // If levelUpClassObject has spellcasting, use it
      if ($levelUpClassObject) {
        const levelUpProgress = $levelUpClassObject.system?.spellcasting?.progression;
        if (levelUpProgress && levelUpProgress !== 'none') {
          window.GAS?.log?.d?.('[SPELLS] Using spell list from levelUpClassObject:', $levelUpClassObject.system?.identifier || $levelUpClassObject.name);
          return $levelUpClassObject.system?.identifier || $levelUpClassObject.name;
        }
      }
    }
    
    // Fallback: use determineSpellListClass for non-level-up or when no class spellcasting
    return determineSpellListClass($actor) || $characterClass?.name || 'Bard';
  })();

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

  function getSpellSelectionKey(spell) {
    return spell?.id || spell?._id || spell?.uuid || null;
  }
  
  function getAutoSelectedSpells() {
    const spells = $availableSpells || [];
    if (!hasAllSpellsAccess) return [];

    const knownSpellNames = new Set((actorSpells || []).map(item => String(item?.name || '').toLowerCase()));

    const rawMatches = ($isLevelUp && oldMaxSpellLevel > 0)
      ? spells.filter(spell => {
        const spellLevel = spell.system?.level || 0;
        return spellLevel > oldMaxSpellLevel && spellLevel <= levelUpAwareMaxSpellLevel;
      })
      : spells.filter(spell => {
        const spellLevel = spell.system?.level || 0;
        return spellLevel > 0 && spellLevel <= levelUpAwareMaxSpellLevel;
      });

    const uniqueByKey = new Map();
    for (const spell of rawMatches) {
      const key = getSpellSelectionKey(spell);
      if (!key) continue;
      const nameLower = String(spell?.name || '').toLowerCase();
      if (knownSpellNames.has(nameLower)) continue;
      if (!uniqueByKey.has(key)) {
        uniqueByKey.set(key, spell);
      }
    }

    return Array.from(uniqueByKey.values());
  }

  // For classes with "all spells" access (e.g. Cleric), derive a concrete spell count
  // matching what auto-populate will add, so the UI can show real numbers instead of "All" / 0.
  $: autoPopulateEligibleSpellCount = hasAllSpellsAccess
    ? getAutoSelectedSpells().length
    : $spellLimits.spells;

  $: displaySpellLimit = hasAllSpellsAccess
    ? autoPopulateEligibleSpellCount
    : $spellLimits.spells;

  // Check if this is a level-up with no new auto-selected spells and no cantrip updates.
  $: isLevelUpWithNoSpellUpdates = $isLevelUp
    && hasAllSpellsAccess
    && autoPopulateEligibleSpellCount === 0
    && $spellLimits.cantrips === 0;

  $: shouldShowAllSpellsNotice = hasAllSpellsAccess && !isLevelUpWithNoSpellUpdates;

  async function autoSelectAllAccessSpells() {
    if (!hasAllSpellsAccess || loading) return;

    const autoSelectedSpells = getAutoSelectedSpells();
    const desiredIds = autoSelectedSpells
      .map(spell => getSpellSelectionKey(spell))
      .filter(Boolean)
      .sort();

    const signature = [
      $isLevelUp,
      oldMaxSpellLevel,
      levelUpAwareMaxSpellLevel,
      desiredIds.join('|')
    ].join('::');

    if (signature === lastAutoSelectSignature || autoSelectInProgress) return;

    autoSelectInProgress = true;
    try {
      const desiredSet = new Set(desiredIds);
      const currentSelections = get(selectedSpells);

      for (const [selectedSpellId, { itemData }] of currentSelections.entries()) {
        const level = itemData?.system?.level || 0;
        if (level > 0 && !desiredSet.has(selectedSpellId)) {
          removeSpell(selectedSpellId);
        }
      }

      for (const spell of autoSelectedSpells) {
        const spellId = getSpellSelectionKey(spell);
        const latestSelections = get(selectedSpells);
        if (spellId && !latestSelections.has(spellId)) {
          await addSpell(spell);
        }
      }

      lastAutoSelectSignature = signature;
    } finally {
      autoSelectInProgress = false;
    }
  }

  $: if (hasAllSpellsAccess && !loading) {
    autoSelectAllAccessSpells();
  }

  $: if (!hasAllSpellsAccess) {
    lastAutoSelectSignature = '';
  }
  
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
    const normalizedClassName = String(className || '')
      .toLowerCase()
      .replace(/^dnd5e\.classes\./, '')
      .trim();

    // Standard D&D 5e spellcasting progression for full casters
    const fullCasters = ['bard', 'cleric', 'druid', 'sorcerer', 'wizard'];
    const halfCasters = ['paladin', 'ranger'];
    const thirdCasters = ['arcane trickster', 'arcane-trickster', 'eldritch knight', 'eldritch-knight'];
    const warlockProgression = ['warlock'];
    
    if (fullCasters.includes(normalizedClassName)) {
      // Full casters: spell level = Math.ceil(character level / 2), max 9
      return Math.min(9, Math.ceil(level / 2));
    } else if (halfCasters.includes(normalizedClassName)) {
      // Half casters: Different progression for 2014 vs 2024 rules
      if (is2024Rules) {
        // 2024 rules: Half casters start spellcasting at level 1
        return Math.min(5, Math.ceil(level / 4));
      } else {
        // 2014 rules: Half casters start spellcasting at level 2
        return Math.min(5, Math.ceil((level - 1) / 4));
      }
    } else if (thirdCasters.includes(normalizedClassName)) {
      // Third casters: spell level = Math.ceil((character level - 2) / 6), max 4
      return Math.min(4, Math.ceil((level - 2) / 6));
    } else if (warlockProgression.includes(normalizedClassName)) {
      // Warlocks have their own progression based on D&D 5e warlock table
      // Spell levels increase at 3, 5, 7, and 9
      if (level >= 9) return 5;
      if (level >= 7) return 4;
      if (level >= 5) return 3;
      if (level >= 3) return 2;
      if (level >= 1) return 1;
      return 0;
    } else if (normalizedClassName === 'artificer') {
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
    const withinCharacterLevel = hasAllSpellsAccess
      ? (spellLevel === 0 && $spellLimits.cantrips > 0)
      : (
        (spellLevel === 0 && $spellLimits.cantrips > 0) ||
        (spellLevel > 0 && spellLevel <= effectiveMaxSpellLevel) ||
        (spellLevel === 1 && $spellLimits.spells > 0)
      );
    
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

  function handleKeywordFilter(event) {
    keywordFilter = event.currentTarget?.value || '';
  }

  // Add spell to selection
  async function addToSelection(spell) {
    // Always get the latest store values to avoid stale cap checks
    await tick();
    const spellLevel = spell.system?.level || 0;
    const isCantrip = spellLevel === 0;
    const counts = get(currentSpellCounts);
    const limits = get(spellLimits);
    const effectiveSpellLimit = hasAllSpellsAccess ? displaySpellLimit : limits.spells;

    if (hasAllSpellsAccess && !isCantrip) {
      return;
    }

    // Strict enforcement: check if adding this spell would exceed limits
    if (isCantrip && counts.cantrips >= limits.cantrips) {
      ui.notifications?.warn(t('Spells.CantripLimitReached'));
      return;
    }
    if (!isCantrip && counts.spells >= effectiveSpellLimit) {
      ui.notifications?.warn(t('Spells.SpellLimitReached'));
      return;
    }
    
    // Double-check that we're not adding duplicates
    const spellId = getSpellSelectionKey(spell);
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

  function isLockedAutoSelectedSpell(spell) {
    const spellLevel = spell?.system?.level || 0;
    return hasAllSpellsAccess && spellLevel > 0;
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

  $: cantripCountAtLimit = $currentSpellCounts.cantrips >= $spellLimits.cantrips
  $: spellCountAtLimit = $currentSpellCounts.spells >= displaySpellLimit
  $: shouldHideSpellSearch = hasAllSpellsAccess && spellCountAtLimit
  $: shouldHideAvailableSpellsPanel = hasAllSpellsAccess && spellCountAtLimit && $spellLimits.cantrips === 0
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
          span.capitalise {characterClassName}s have access to all spells of appropriate level. At level {$newLevelValueForExistingClass}, you still have access to the same spell levels (1-{effectiveMaxSpellLevel}) as before.
        p 
          em Your spell selection is complete - no changes needed.
    +elseif("shouldShowAllSpellsNotice")
      .info-message.all-spells-notice
        p
          strong.capitalise {characterClassName}s 
          +if("$isLevelUp")
            | automatically gain all newly available spells for this level.
            +else()
              | automatically gain all available spells for this level.
        p
          +if("$spellLimits.cantrips")
            em {displaySpellLimit} spells are auto-selected. You only need to choose cantrips.
            +else()
              em {displaySpellLimit} spells are auto-selected.
        +if("$spellLimits.cantrips")
          p 
            em Note: You still need to select your cantrips as they cannot be changed later.
  +if("!isDisabled")
    .sticky-header(class:hidden="{!scrolled}")
      SpellCounterGrid(
        cantripLabel="{t('Spells.Cantrips')}"
        spellLabel="{t('Spells.Spells')}"
        cantripCount="{$currentSpellCounts.cantrips}"
        cantripLimit="{$spellLimits.cantrips}"
        spellCount="{$currentSpellCounts.spells}"
        spellLimit="{displaySpellLimit}"
        cantripCountAtLimit="{cantripCountAtLimit}"
        spellCountAtLimit="{spellCountAtLimit}"
      )
    .spells-tab
      +if("$spellLimits.cantrips || displaySpellLimit")
        SelectedSpellsPanel(
          scrolled="{scrolled}"
          cantripCountAtLimit="{cantripCountAtLimit}"
          spellCountAtLimit="{spellCountAtLimit}"
          currentCantrips="{$currentSpellCounts.cantrips}"
          currentSpells="{$currentSpellCounts.spells}"
          cantripLimit="{$spellLimits.cantrips}"
          spellLimit="{displaySpellLimit}"
          selectedSpellsList="{selectedSpellsList}"
          isDisabled="{isDisabled}"
          isLockedAutoSelectedSpell="{isLockedAutoSelectedSpell}"
          removeFromSelection="{removeFromSelection}"
          getEnrichedName="{getEnrichedName}"
          getSpellLevelDisplay="{getSpellLevelDisplay}"
          getSchoolName="{getSchoolName}"
        )

      AvailableSpellsPanel(
        className="{characterClassName}"
        loading="{loading}"
        isDisabled="{isDisabled}"
        shouldHideAvailableSpellsPanel="{shouldHideAvailableSpellsPanel}"
        shouldHideSpellSearch="{shouldHideSpellSearch}"
        keywordFilter="{keywordFilter}"
        filteredSpells="{filteredSpells}"
        spellLevels="{spellLevels}"
        spellsByLevel="{spellsByLevel}"
        expandedLevels="{expandedLevels}"
        cantripCountAtLimit="{cantripCountAtLimit}"
        spellCountAtLimit="{spellCountAtLimit}"
        hasAllSpellsAccess="{hasAllSpellsAccess}"
        spellCountAtLimitForNotice="{spellCountAtLimit}"
        onKeywordFilter="{handleKeywordFilter}"
        toggleSpellLevel="{toggleSpellLevel}"
        addToSelection="{addToSelection}"
        getEnrichedName="{getEnrichedName}"
        getSchoolName="{getSchoolName}"
        getCastingTimeDisplay="{getCastingTimeDisplay}"
      )
</template>

<style lang="sass">
  @import "../../../../../styles/Mixins.sass"

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
</style>