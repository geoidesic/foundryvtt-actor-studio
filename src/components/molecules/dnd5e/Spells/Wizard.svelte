<script>
  import { getContext, onMount, tick } from "svelte";
  import { extractItemsFromPacksAsync, getPacksFromSettings } from "~/src/helpers/Utility.js";
  import { characterClass } from "~/src/stores/index.js";
  import { TJSSelect } from "@typhonjs-fvtt/standard/component/form";

  const actor = getContext("#doc");
  let allSpells = [];
  let cantrips = [];
  let level1Spells = [];
  let selectedCantrips = [];
  let selectedLevel1Spells = [];

  const maxCantrips = 3;
  const maxLevel1Spells = 6;

  onMount(async () => {
    const spellPacks = getPacksFromSettings("spells");
    allSpells = await extractItemsFromPacksAsync(spellPacks, ["name->label", "img", "type", "folder", "uuid->value", "system.level"]);
    
    // Filter for wizard spells - this is a simplification. A real implementation would need to check the class spell list.
    // For now, we'll just filter by level for demonstration.
    cantrips = allSpells.filter(spell => spell.system.level === 0);
    level1Spells = allSpells.filter(spell => spell.system.level === 1);
  });

</script>

<template lang="pug">
  .wizard-spells
    h2 Wizard Spell Selection
    
    .spell-selection-group
      h3 Cantrips (Select {maxCantrips})
      .flexrow
        .flex3
          SvelteSelect(items="{cantrips}" bind:value="{selectedCantrips}" multiple="{true}" placeholder="Select Cantrips")
      p Selected: {selectedCantrips.length} / {maxCantrips}

    .spell-selection-group
      h3 1st-Level Spells (Select {maxLevel1Spells})
      .flexrow
        .flex3
          SvelteSelect(items="{level1Spells}" bind:value="{selectedLevel1Spells}" multiple="{true}" placeholder="Select 1st-Level Spells")
      p Selected: {selectedLevel1Spells.length} / {maxLevel1Spells}

</template>

<style lang="sass">
.wizard-spells
  padding: 10px

.spell-selection-group
  margin-bottom: 20px

</style>
