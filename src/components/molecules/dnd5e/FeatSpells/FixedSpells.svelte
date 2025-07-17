<script>
  export let featRequirements = [];
</script>
<template lang='pug'>
  .component
    +each("featRequirements as requirement")
      +if("requirement.fixedSpells && requirement.fixedSpells.length > 0")
        .fixed-spells-section
          h4 {requirement.featName} - Granted Spells
          .fixed-spells
            +each("requirement.fixedSpells as spellName")
              .fixed-spell
                i.fas.fa-magic
                span {spellName}
</template>
<style lang='sass'>
  @import '../../../../../styles/Mixins.sass'
</style>