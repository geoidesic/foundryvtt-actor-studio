<script>
  import { createEventDispatcher } from 'svelte';
  import { SpellGrantDetection } from '~/src/helpers/SpellGrantDetection.js';
  
  export let grantInfo;
  export let selectedSpells = [];
  export let allSpells = [];
  
  const dispatch = createEventDispatcher();
  
  let expandedLevels = { 'Cantrips': true, 'Level 1': true }; // Start with cantrips and level 1 expanded
  
  $: availableSpells = filterAvailableSpells(allSpells, grantInfo);
  $: expectedCount = calculateExpectedCount(grantInfo);
  $: isComplete = selectedSpells.length === expectedCount;
  $: validation = SpellGrantDetection.validateSpellSelection(grantInfo, selectedSpells);
  $: spellsByLevel = groupSpellsByLevel(availableSpells);
  $: spellLevels = Object.keys(spellsByLevel);
  
  function calculateExpectedCount(grant) {
    const config = grant.configuration;
    if (!config.choices) return 1;
    
    if (Array.isArray(config.choices)) {
      return config.choices.reduce((sum, choice) => {
        return sum + (typeof choice === 'object' ? (choice.count || 1) : choice);
      }, 0);
    }
    
    return config.choices;
  }
  
  function filterAvailableSpells(spells, grant) {
    const restriction = grant.configuration.restriction;
    if (!restriction) return spells;
    
    // NOTE: Class filtering is already done by loadAvailableSpells()
    // We only need to filter by level and school here
    
    return spells.filter(spell => {
      const spellLevel = spell.system?.level ?? 0;
      
      // Check spell level
      if (restriction.level) {
        const maxLevel = restriction.level.max ?? 9;
        const minLevel = restriction.level.min ?? 0;
        if (spellLevel > maxLevel || spellLevel < minLevel) {
          return false;
        }
      }
      
      // Check school
      if (restriction.school && restriction.school.length > 0) {
        const schools = Array.isArray(restriction.school) ? restriction.school : [restriction.school];
        if (!schools.includes(spell.system?.school)) return false;
      }
      
      return true;
    });
  }
  
  function groupSpellsByLevel(spells) {
    const grouped = {};
    
    spells.forEach(spell => {
      const level = spell.system?.level ?? 0;
      const key = level === 0 ? 'Cantrips' : `Level ${level}`;
      
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(spell);
    });
    
    // Sort each level's spells alphabetically
    Object.keys(grouped).forEach(key => {
      grouped[key].sort((a, b) => a.name.localeCompare(b.name));
    });
    
    return grouped;
  }
  
  function toggleSpell(spell) {
    const index = selectedSpells.findIndex(s => s.id === spell.id || s._id === spell._id);
    
    if (index >= 0) {
      // Remove spell
      const newSelections = [...selectedSpells];
      newSelections.splice(index, 1);
      dispatch('change', newSelections);
    } else if (selectedSpells.length < expectedCount) {
      // Add spell
      dispatch('change', [...selectedSpells, spell]);
    }
  }
  
  function removeSpell(spell) {
    const newSelections = selectedSpells.filter(s => s.id !== spell.id && s._id !== spell._id);
    dispatch('change', newSelections);
  }
  
  function isSelected(spell) {
    return selectedSpells.some(s => (s.id === spell.id) || (s._id === spell._id));
  }
  
  function getSpellLevelText(spell) {
    const level = spell.system?.level ?? 0;
    return level === 0 ? 'Cantrip' : `Level ${level}`;
  }
  
  function toggleSpellLevel(level) {
    expandedLevels[level] = !expandedLevels[level];
    expandedLevels = expandedLevels; // Trigger reactivity
  }
</script>

<template lang="pug">
.spell-grant-selector
  .spell-selector-layout
    .left-panel
      .panel-header-grid
        .grid-item.label Grant:
        .grid-item.value {grantInfo.itemName}
        .grid-item.label Selected:
        .grid-item.value(class:at-limit!="{isComplete}") {selectedSpells.length}/{expectedCount}
      
      .grant-description {grantInfo.description}
      
      +if("!validation.valid && selectedSpells.length > 0")
        .grant-errors
          +each("validation.errors as error")
            .error-message {error}
      
      h3 Selected Spells
      .selected-spells
        +if("selectedSpells.length === 0")
          .empty-selection
            p No spells selected yet
          +else
            +each("selectedSpells as spell")
              .selected-spell
                .spell-col1
                  img.spell-icon(src!="{spell.img}" alt!="{spell.name}")
                .spell-col2.left
                  .spell-name {spell.name}
                  .spell-subdetails
                    span.spell-level {getSpellLevelText(spell)}
                .spell-col3
                  button.remove-btn(on:click!="{() => removeSpell(spell)}")
                    i.fas.fa-trash
    
    .right-panel.spell-list
      h3 Available Spells
      +if("availableSpells.length === 0")
        .empty-state
          p No available spells match the grant requirements
        +else
          +each("spellLevels as spellLevel")
            .spell-level-group
              h4.left.mt-sm.flexrow.spell-level-header.pointer(on:click!="{() => toggleSpellLevel(spellLevel)}")
                .flex0.mr-xs
                  +if("expandedLevels[spellLevel]")
                    span [-]
                    +else
                      span [+]
                .flex1 {spellLevel} ({spellsByLevel[spellLevel].length})
              
              +if("expandedLevels[spellLevel]")
                ul.blank
                  +each("spellsByLevel[spellLevel] as spell (spell.uuid || spell._id)")
                    li.flexrow.spell-row.justify-flexrow-vertical
                      .flex0.spell-details
                        img.spell-icon.cover(src!="{spell.img}" alt!="{spell.name}")
                      
                      .flex1.spell-info
                        .flexrow
                          .flex1.left.spell-name.gold {spell.name}
                        .flexrow.smalltext
                          .flex1.left.spell-meta
                            span.spell-level {getSpellLevelText(spell)}
                      
                      .spell-actions.mx-sm
                        button.add-btn(
                          on:click|preventDefault!="{() => toggleSpell(spell)}"
                          disabled!="{!isSelected(spell) && selectedSpells.length >= expectedCount}"
                        )
                          +if("isSelected(spell)")
                            i.fas.fa-check
                            +else
                              i.fas.fa-plus
</template><style lang="sass">
  .spell-grant-selector
    height: 100%
    width: 100%
    display: flex
    flex-direction: column

  .spell-selector-layout
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
    
    h3
      margin-bottom: 0.5rem
    
    .grant-description
      color: var(--color-text-dark-5)
      font-size: 0.85rem
      font-style: italic
      margin-bottom: 1rem
      padding: 0.5rem
      background: rgba(0, 0, 0, 0.03)
      border-radius: 4px
    
    .grant-errors
      margin-bottom: 1rem
      padding: 0.75rem
      background: rgba(255, 0, 0, 0.1)
      border-radius: 4px
      border: 1px solid rgba(255, 0, 0, 0.3)
      
      .error-message
        color: var(--color-text-dark-primary)
        font-size: 0.85rem
        margin: 0.25rem 0
  
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
      
      &.left
        text-align: left
    
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
      
      .spell-level
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
  
  .empty-state
    text-align: center
    color: #666
    font-style: italic
    padding: 2rem
  
  ul.blank
    list-style: none
    padding: 0
    margin: 0
  
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
        
        &.cover
          object-fit: cover

        img
          border: none
    
    .spell-info
      .spell-name
        font-weight: bold
        
        &.gold
          color: var(--dnd5e-color-gold, #b59e54)
      
      .spell-meta
        font-size: 0.85em
        color: #666
        display: flex
        gap: 0.5rem
  
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

      i
        margin-right: 0
        margin-left: 0

      &:hover
        background: darken(#b59e54, 10%)

      &:disabled
        opacity: 0.5
        cursor: not-allowed
        &:hover
          background: var(--dnd5e-color-gold, #b59e54)

  .pointer
    cursor: pointer

  .panel-header-grid
    display: grid
    grid-template-columns: 1fr 0.4fr 1fr 0.4fr
    grid-template-rows: repeat(2, auto)
    padding: 0.6rem 1.3rem 0.3rem 1.1rem
    gap: 4px
    margin-bottom: 1rem
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
        color: #0a0
</style>
