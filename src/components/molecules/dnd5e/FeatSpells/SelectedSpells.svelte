<script>
  import { localize as t } from "~/src/helpers/Utility";

  export let allSelectedSpells = [];
  export let getEnrichedName = () => Promise.resolve("");
  export let getSpellLevelDisplay = () => "";
  export let getSchoolName = () => "";
  export let removeFromSelection = () => {};
</script>
<template lang='pug'>
  .component
    .selected-spells
      +if("allSelectedSpells.length === 0")
        .empty-selection
          p {t('FeatSpells.NoSpellsSelected')}
        +else()
          +each("allSelectedSpells as selectedItem")
            .selected-spell
              .spell-col1
                img.spell-icon(alt="{selectedItem.spell.name}" src="{selectedItem.spell.img}")
              .spell-col2.left
                .spell-name
                  +await("getEnrichedName(selectedItem.spell)")
                    span {selectedItem.spell.name}
                    +then("Html")
                      span {@html Html}
                    +catch("error")
                      span {selectedItem.spell.name}
                .spell-subdetails
                  span.spell-level {getSpellLevelDisplay(selectedItem.spell)}
                  span.spell-school {getSchoolName(selectedItem.spell)}
              .spell-col3
                button.remove-btn(
                  on:click!="{() => removeFromSelection(selectedItem.featId, selectedItem.spell._id)}"
                )
                  i.fas.fa-trash
</template>
<style lang='sass'>
  @import '../../../../../styles/Mixins.sass'
</style>