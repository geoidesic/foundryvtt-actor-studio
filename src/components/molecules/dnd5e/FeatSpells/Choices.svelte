<script>
  import { getAvailableSpellsForFeat } from "~/src/helpers/FeatSpellParser";

  export let featRequirements = [];
  export let selectedClasses = new Map();
  export let availableSpells = new Map(); // Map of featId -> available spell choices
  export let selectedSpells = new Map(); // Map of featId -> selected spells
  export let actor = null;
  export let onClassSelected = () => {}; // Function passed from parent

  /**
   * Handle class selection for generic feats like Magic Initiate
   */
  async function handleClassSelection(featId, className) {
    // Call the parent's onClassSelected function
    await onClassSelected(featId, className);
  }
</script>
<template lang='pug'>
  .component
    
    //- Class selection areas for feats that require it
    +each("featRequirements as requirement")
      +if("requirement.requiresClassSelection")
        .class-selection-section
          h4 {requirement.featName}
          .class-selection
            label.filter-label(for="class-select-{requirement.featId}") Choose Spell Class:
            select.filter-select(
              id="class-select-{requirement.featId}"
              value="{selectedClasses.get(requirement.featId) || ''}"
              on:change!="{(e) => handleClassSelection(requirement.featId, e.target.value)}"
            )
              option(value="") Select a class...
              +each("requirement.availableClasses as className")
                option(value="{className}") {className.charAt(0).toUpperCase() + className.slice(1)}
</template>
<style lang='sass'>
  @import '../../../../../styles/Mixins.sass'
</style>