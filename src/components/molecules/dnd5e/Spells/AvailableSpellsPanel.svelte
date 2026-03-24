<script>
  import { localize as t } from "~/src/helpers/Utility";

  export let className = '';
  export let loading = false;
  export let isDisabled = false;
  export let shouldHideAvailableSpellsPanel = false;
  export let shouldHideSpellSearch = false;
  export let keywordFilter = '';
  export let filteredSpells = [];
  export let spellLevels = [];
  export let spellsByLevel = {};
  export let expandedLevels = {};
  export let cantripCountAtLimit = false;
  export let spellCountAtLimit = false;
  export let hasAllSpellsAccess = false;
  export let spellCountAtLimitForNotice = false;

  export let onKeywordFilter = () => {};
  export let toggleSpellLevel = () => {};
  export let addToSelection = () => {};
  export let getEnrichedName = () => Promise.resolve('');
  export let getSchoolName = () => '';
  export let getCastingTimeDisplay = () => '';

  function shouldDisableButton(spell) {
    if (isDisabled) return true;
    const spellLevel = spell.system?.level || 0;
    const isCantrip = spellLevel === 0;
    if (isCantrip && cantripCountAtLimit) return true;
    if (!isCantrip && spellCountAtLimit) return true;
    return false;
  }
</script>

<template lang="pug">
.right-panel.spell-list
  +if("keywordFilter")
    input(type="hidden" value="{keywordFilter}")

  h3 {t('Spells.AvailableSpells')} | {className}
  +if("shouldHideAvailableSpellsPanel")
    .empty-state
      p All available spells selected.
    +else()
      +if("!shouldHideSpellSearch && !loading && (spellLevels.length > 0 || keywordFilter)")
        .filter-container.mb-sm
          input.keyword-filter(type="text" value="{keywordFilter}" on:input!="{onKeywordFilter}" placeholder="{t('Spells.FilterPlaceholder')}" disabled="{isDisabled}")
      +if("loading")
        .loading {t('Spells.Loading')}
        +else()
          +if("filteredSpells.length === 0")
            .empty-state
              +if("hasAllSpellsAccess && spellCountAtLimitForNotice")
                p All available spells are already selected.
                +else()
                  p {keywordFilter ? t('Spells.NoMatchingSpells') : t('Spells.NoSpells')}
            +else()
              +each("spellLevels as spellLevel")
                +if("(spellLevel == 'Cantrips' && !cantripCountAtLimit) || (spellLevel != 'Cantrips' && !spellCountAtLimit)")
                  .spell-level-group
                    // svelte-ignore a11y-click-events-have-key-events a11y-no-noninteractive-element-interactions
                    h4.left.mt-sm.flexrow.spell-level-header.pointer(on:click!="{ () => toggleSpellLevel(spellLevel) }")
                      .flex0.mr-xs
                        +if("expandedLevels[spellLevel]")
                          span [-]
                          +else()
                            span [+]
                      .flex1 {spellLevel} ({spellsByLevel[spellLevel].length})

                    +if("expandedLevels[spellLevel]")
                      ul.blank.spell-rows
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
                              .spell-meta.mt-xs
                                +if("getSchoolName(spell, true)")
                                  .flexrow
                                    div.label School:
                                    .badge {getSchoolName(spell, true)}
                                    div.label Activation:
                                    .badge {getCastingTimeDisplay(spell)}

                            .spell-actions.mx-sm
                              button.add-btn(on:click|preventDefault!="{ () => addToSelection(spell) }" disabled="{shouldDisableButton(spell)}")
                                i.fas.fa-plus
                +else()
                  .spell-level-group
                    p.left.mt-sm.flexrow.positive
                      i.fa.fa-check.getParentClasses
                      | {spellLevel} selection completed
</template>

<style lang="sass">
  @import "../../../../../styles/Mixins.sass"

  ul.blank
    padding: 0

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
        min-width: 0

        .spell-name
          font-weight: bold

        .spell-meta
          font-size: 0.75em
          color: #999
          display: flex
          align-items: center
          flex-wrap: wrap

          .label
            font-weight: 500
            color: var(--dnd5e-color-gold)
            white-space: nowrap
            margin-right: 0.35rem

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

  .badge
    +badge(var(--color-cool-3), 0.5rem)
    margin-top: -2px
    white-space: nowrap
    margin-right: 0.75rem

  .spell-icon.cover
    width: 48px
    height: 48px
    object-fit: cover
    border-radius: 4px
    border: 1px solid var(--color-border-light-tertiary)

  :global(.GAS.theme-dark .spell-row .spell-meta .spell-school)
    color: silver
</style>