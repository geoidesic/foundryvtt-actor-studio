<script>
  import { localize as t } from "~/src/helpers/Utility";
  import SpellCounterGrid from "~/src/components/atoms/dnd5e/SpellCounterGrid.svelte";

  export let scrolled = false;
  export let cantripCountAtLimit = false;
  export let spellCountAtLimit = false;
  export let currentCantrips = 0;
  export let currentSpells = 0;
  export let cantripLimit = 0;
  export let spellLimit = 0;

  export let selectedSpellsList = [];
  export let isDisabled = false;
  export let isLockedAutoSelectedSpell = () => false;
  export let removeFromSelection = () => {};
  export let getEnrichedName = () => Promise.resolve('');
  export let getSpellLevelDisplay = () => '';
  export let getSchoolName = () => '';
</script>

<template lang="pug">
.left-panel
  h3 Expected spell selections
  SpellCounterGrid(
    hidden="{scrolled}"
    cantripLabel="{t('Spells.Cantrips')}"
    spellLabel="{t('Spells.Spells')}"
    cantripCount="{currentCantrips}"
    cantripLimit="{cantripLimit}"
    spellCount="{currentSpells}"
    spellLimit="{spellLimit}"
    cantripCountAtLimit="{cantripCountAtLimit}"
    spellCountAtLimit="{spellCountAtLimit}"
  )

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
              button.remove-btn(on:click!="{ () => removeFromSelection(selectedSpell.id) }" disabled="{isDisabled || isLockedAutoSelectedSpell(selectedSpell.spell)}")
                i.fas.fa-trash
</template>

<style lang="sass">
  .left-panel
    flex: 1
    max-width: 40%
    min-width: 250px
    border-right: 1px solid var(--color-border-light-tertiary)
    padding: 1rem
    overflow-y: auto

    h3
      margin-bottom: 0.5rem

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

  :global(.GAS.theme-dark .selected-spell .spell-level)
    color: silver

  :global(.GAS.theme-dark .selected-spell .spell-school)
    color: silver !important
</style>