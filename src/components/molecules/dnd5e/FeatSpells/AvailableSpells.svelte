<script>
  import { localize as t } from "~/src/helpers/Utility";

  export let allAvailableSpells = [];
  export let filteredSpells = [];
  export let spellsByLevel = {};
  export let spellLevels = [];
  export let expandedLevels = {};
  export let toggleSpellLevel = () => {};
  export let isSpellSelected = () => false;
  export let addToSelection = () => {};
  export let getEnrichedName = () => Promise.resolve("");
  export let getSchoolName = () => "";
  export let getCastingTimeDisplay = () => "";
  export let keywordFilter = "";
</script>

<template lang='pug'>
  .component
    +if("allAvailableSpells.length === 0")
      .empty-state
        p No spells available for selection
      +elseif("filteredSpells.length === 0")
        .empty-state
          p {keywordFilter ? t('Spells.NoMatchingSpells') : 'No spells match your filter'}
        +else()
          +each("spellLevels as spellLevel")
            .spell-level-group
              h4.left.mt-sm.flexrow.spell-level-header.pointer(
                on:click!="{() => toggleSpellLevel(spellLevel)}"
              )
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
                                  div Activation:
                                  .badge {getCastingTimeDisplay(spell)}

                      .spell-actions.mx-sm
                        +if("isSpellSelected(spell)")
                          .spell-selected
                            i.fas.fa-check
                          +else()
                            button.add-btn(
                              on:click|preventDefault!="{() => addToSelection(spell)}"
                            )
                              i.fas.fa-plus
</template>

<style lang='sass'>
  @import "../../../../../styles/Mixins.sass"
  
  .badge
    +badge(var(--color-cool-3), 0.5rem)
    margin-top: -2px
    margin-left: -8px

  ul.blank
    padding: 0 

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

  // Dark theme support
  :global(.GAS.theme-dark) .component
    .spell-level-header
      background: var(--color-bg-dark-secondary, #2a2a2a)
      border-color: var(--color-border-dark, #444)

      &:hover
        background: var(--color-bg-dark-tertiary, #3a3a3a)

    .spell-row
      background: var(--color-bg-dark-secondary, #2a2a2a)
      border-color: var(--color-border-dark, #444)
</style>
