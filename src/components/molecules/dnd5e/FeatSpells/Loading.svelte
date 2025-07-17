<script>
  import { localize as t } from "~/src/helpers/Utility";
</script>
<template lang='pug'>
  .component
    .loading-state
      i.fas.fa-spinner.fa-spin
      span {t('FeatSpells.Loading')}
    
</template>
<style lang='sass'>
  @import '../../../../../styles/Mixins.sass'
</style>