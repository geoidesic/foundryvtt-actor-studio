<script>
  import { getPacksFromSettings, 
    extractItemsFromPacksAsync, illuminatedDescription, 
    getAndSetActorItems, copyNpcStatsToActor, getItemsArray } from "~/src/helpers/Utility.js";
  import { getContext, onMount, tick } from "svelte";
  import { writable } from "svelte/store";
  import { activeTab, npcTabs, selectedNpcBase, readOnlyTabs } from "~/src/stores/index";
  import IconSearchSelect from "~/src/components/atoms/select/IconSearchSelect.svelte";
  import IconSelect from "~/src/components/atoms/select/IconSelect.svelte";
  import StandardTabLayout from "~/src/components/organisms/StandardTabLayout.svelte";
  import FeatureItemList from "~/src/components/molecules/dnd5e/NPC/FeatureItemList.svelte";


  // Add NPCStatBlock import
  import NPCStatBlock from "~/src/components/molecules/dnd5e/NPC/NPCStatBlock.svelte";

  const actor = getContext("#doc");

  // Store for selected NPC item
  export let selectedNpc = writable(null);
  let active = null, value = null;
  let placeHolder = "Select an NPC...";
  let packs = getPacksFromSettings("npcs");
  let allItems = [];
  let itemDefinitions = [];

  // Load NPC data with system fields
  const loadNpcData = async () => {
    try {
      allItems = await extractItemsFromPacksAsync(packs, [
        "name->label",
        "img",
        "type",
        "folder",
        "uuid->value",
        "_id"
      ], [
        "system.details.type.value",
        "system.details.alignment", 
        "system.traits.size"
      ]);
      
      itemDefinitions = allItems
        .filter((x) => x.type == "npc")
        .sort((a, b) => a.label.localeCompare(b.label));
        
      // window.GAS.log.d('NPC data loaded:', {
      //   totalItems: allItems.length,
      //   npcItems: itemDefinitions.length,
      //   sampleNpc: itemDefinitions[0],
      //   sampleSystemFields: itemDefinitions[0] ? {
      //     type: itemDefinitions[0].system?.details?.type?.value,
      //     alignment: itemDefinitions[0].system?.details?.alignment,
      //     size: itemDefinitions[0].system?.traits?.size
      //   } : null
      // });
    } catch (err) {
      console.error('Failed to load NPC data:', err);
      // window.GAS.log.e('Failed to load NPC data:', err);
    }
  };

  // $: window.GAS.log.d('allItems', allItems);

  // Filter states
  let selectedType = "";
  let selectedAlignment = "";
  let selectedSize = "";
  let showFilters = false;

  // D&D 5e creature type options
  const typeOptions = [
    { value: 'aberration', label: 'Aberration' },
    { value: 'beast', label: 'Beast' },
    { value: 'celestial', label: 'Celestial' },
    { value: 'construct', label: 'Construct' },
    { value: 'dragon', label: 'Dragon' },
    { value: 'elemental', label: 'Elemental' },
    { value: 'fey', label: 'Fey' },
    { value: 'fiend', label: 'Fiend' },
    { value: 'giant', label: 'Giant' },
    { value: 'humanoid', label: 'Humanoid' },
    { value: 'monstrosity', label: 'Monstrosity' },
    { value: 'ooze', label: 'Ooze' },
    { value: 'plant', label: 'Plant' },
    { value: 'undead', label: 'Undead' }
  ];
  
  // D&D 5e alignment options
  const alignmentOptions = [
    { value: 'Lawful Good', label: 'Lawful Good' },
    { value: 'Neutral Good', label: 'Neutral Good' },
    { value: 'Chaotic Good', label: 'Chaotic Good' },
    { value: 'Lawful Neutral', label: 'Lawful Neutral' },
    { value: 'Neutral', label: 'Neutral' },
    { value: 'Chaotic Neutral', label: 'Chaotic Neutral' },
    { value: 'Lawful Evil', label: 'Lawful Evil' },
    { value: 'Neutral Evil', label: 'Neutral Evil' },
    { value: 'Chaotic Evil', label: 'Chaotic Evil' },
    { value: 'Unaligned', label: 'Unaligned' },
    { value: 'Any Alignment', label: 'Any Alignment' }
  ];

  // D&D 5e size options
  const sizeOptions = [
    { value: 'tiny', label: 'Tiny' },
    { value: 'sm', label: 'Small' },
    { value: 'med', label: 'Medium' },
    { value: 'lg', label: 'Large' },
    { value: 'huge', label: 'Huge' },
    { value: 'grg', label: 'Gargantuan' }
  ];

  // Filter NPCs based on selected filters
  $: filteredOptions = itemDefinitions.filter(npc => {
    // Debug logging to see what we're actually getting
    if (selectedType || selectedAlignment || selectedSize) {
      // console.log('Filtering NPC:', npc.name || npc.label, {
      //   type: npc.system?.details?.type?.value,
      //   alignment: npc.system?.details?.alignment,
      //   size: npc.system?.traits?.size,
      //   selectedType,
      //   selectedAlignment,
      //   selectedSize,
      //   // Log the full npc object to see the structure
      //   fullNpc: npc
      // });
    }
    
    // Filter by type - access the nested system structure
    if (selectedType && npc.system?.details?.type?.value !== selectedType) {
      // console.log(`NPC ${npc.name || npc.label} filtered out by type: ${npc.system?.details?.type?.value} !== ${selectedType}`);
      return false;
    }
    
    // Filter by alignment - access the nested system structure
    if (selectedAlignment && npc.system?.details?.alignment !== selectedAlignment) {
      // console.log(`NPC ${npc.name || npc.label} filtered out by alignment: ${npc.system?.details?.alignment} !== ${selectedAlignment}`);
      return false;
    }
    
    // Filter by size - access the nested system structure
    if (selectedSize && npc.system?.traits?.size !== selectedSize) {
      // console.log(`NPC ${npc.name || npc.label} filtered out by size: ${npc.system?.traits?.size} !== ${selectedSize}`);
      return false;
    }
    
    // console.log(`NPC ${npc.name || npc.label} passed all filters`);
    return true;
  });

  // Clear all filters
  const clearFilters = () => {
    selectedType = "";
    selectedAlignment = "";
    selectedSize = "";
  };

  $: options = filteredOptions;
  
  // Log filtering results
  $: if (selectedType || selectedAlignment || selectedSize) {
    // console.log('Filtering Summary:', {
    //   totalNPCs: itemDefinitions.length,
    //   filteredCount: filteredOptions.length,
    //   activeFilters: {
    //     type: selectedType,
    //     alignment: selectedAlignment,
    //     size: selectedSize
    //   },
    //   sampleResults: filteredOptions.slice(0, 3).map(npc => ({
    //     name: npc.name || npc.label,
    //     type: npc.system?.details?.type?.value,
    //     alignment: npc.system?.details?.alignment,
    //     size: npc.system?.traits?.size
    //   }))
    // });
  }
  $: html = $selectedNpc?.system?.details?.biography.value || "";
  let richHTML = "";

  const selectNpcHandler = async (option) => {
    const selected = await fromUuid(option);
    window.GAS.log.p('selected NPC', selected)
    $selectedNpc = selected;
    selectedNpcBase.set(selected);
    active = option;
    if (!value) value = option;
    await tick();
    
    // Copy NPC stats (ability scores, hit points, armor class, etc.) to the in-memory actor
    await copyNpcStatsToActor($selectedNpcBase, $actor);
    
    // Copy NPC items/features to the in-memory actor
    await getAndSetActorItems($selectedNpcBase, $actor, selected.name);
    
    richHTML = await illuminatedDescription(html, $selectedNpc);
    Hooks.call('gas.richhtmlReady', richHTML);
  };

  // Footer handles progress and advancing to features via its own button

  onMount(async () => {
    await loadNpcData();
    if ($selectedNpc?.uuid) {
      await selectNpcHandler($selectedNpc.uuid);
    }
  });

  // Keep local selection in sync with globally persisted selection
  $: if ($selectedNpcBase?.uuid && (!$selectedNpc || $selectedNpc?.uuid !== $selectedNpcBase.uuid)) {
    // Use handler to normalize active/value and compute richHTML; safe to re-fetch
    selectNpcHandler($selectedNpcBase.uuid);
  }
  $: itemsArray = getItemsArray($selectedNpc?.items);
</script>

<template lang="pug">
StandardTabLayout(title="NPC Select" showTitle="true" tabName="npc-select")
  div(slot="left")
    //- Filter controls
    .filter-section
      .filter-header
        h3 Filters
        .filter-actions
          +if("selectedType || selectedAlignment || selectedSize")
            button.clear-filters(on:click!="{clearFilters}")
              i.fas.fa-times
          button.toggle-filters(on:click!="{() => showFilters = !showFilters}")
            +if("showFilters")
              i.fas.fa-chevron-up
              +else()
              i.fas.fa-chevron-down
      
      +if("showFilters")
        .filter-controls
          .filter-row
            IconSelect.icon-select(
              options="{typeOptions}"
              placeHolder="Type"
              handler!="{option => selectedType = option}"
              id="type-filter"
              bind:value="{selectedType}"
            )
            IconSelect.icon-select(
              options="{alignmentOptions}"
              placeHolder="Alignment"
              handler!="{option => selectedAlignment = option}"
              id="alignment-filter"
              bind:value="{selectedAlignment}"
            )
            IconSelect.icon-select(
              options="{sizeOptions}"
              placeHolder="Size"
              handler!="{option => selectedSize = option}"
              id="size-filter"
              bind:value="{selectedSize}"
            )
          
          //- Debug info
          //- +if("selectedType || selectedAlignment || selectedSize")
          //-   .filter-debug
          //-     .debug-info
          //-       span Found {filteredOptions.length} of {itemDefinitions.length} NPCs
          //-       +if("selectedType")
          //-         span Type: {selectedType}
          //-       +if("selectedAlignment")
          //-         span Alignment: {selectedAlignment}
          //-       +if("selectedSize")
          //-         span Size: {selectedSize}
    
    .flexrow
      .flex0.required(class="{$selectedNpc ? '' : 'active'}") *
      .flex3
        IconSearchSelect.icon-select({options} {active} {placeHolder} handler="{selectNpcHandler}" id="npc-select" bind:value)
    
    +if("$selectedNpc")
      NPCStatBlock(
        name="{$selectedNpc.name}"
        npc="{$selectedNpc}"
      )

      +if("itemsArray?.length")
        h3.mt-sm Features
        FeatureItemList(items="{itemsArray}")
  div(slot="right") 
    //- pre {$actor.items.toArray()}
    //- FeatureItemList(trashable="{true}")
    //- pre item count {$actor?.items.size}
    //- +if("$actor?.items.size > 0")
    //-   +each("$actor?.items as item")
    //-     pre {item.name}
    +if("$selectedNpc")
      div {@html richHTML ||  'No biography provided'}

</template>

<style lang="sass">
  :global(.icon-select)
    position: relative

  .filter-section
    background: rgba(0, 0, 0, 0.05)
    border-radius: 8px
    padding: 0 0 0 0.5rem
    border: 1px solid rgba(0, 0, 0, 0.1)

    .filter-header
      display: flex
      justify-content: space-between
      align-items: center
      margin-bottom: 0.75rem

      h3
        margin: 0
        font-size: 1rem
        color: var(--color-text-dark-secondary)

      .filter-actions
        display: flex
        gap: 0.5rem

        .clear-filters
          background: none
          border: none
          cursor: pointer
          padding: 0.25rem 0.5rem
          border-radius: 4px
          color: var(--color-text-dark-secondary)
          transition: background-color 0.2s ease

          &:hover
            background-color: rgba(0, 0, 0, 0.1)

        .toggle-filters
          background: none
          border: none
          cursor: pointer
          padding: 0.25rem 0.5rem
          border-radius: 4px
          color: var(--color-text-dark-secondary)
          transition: background-color 0.2s ease

          &:hover
            background-color: rgba(0, 0, 0, 0.1)

      .filter-controls
        .filter-row
          display: flex
          gap: 1rem
          flex-wrap: wrap

          .icon-select
            min-width: 120px

        .filter-debug
          margin-top: 0.75rem
          padding: 0.5rem
          background: rgba(0, 0, 0, 0.1)
          border-radius: 4px
          font-size: 0.875rem

          .debug-info
            display: flex
            gap: 1rem
            flex-wrap: wrap
            color: var(--color-text-dark-secondary)

            span
              background: rgba(0, 0, 0, 0.1)
              padding: 0.25rem 0.5rem
              border-radius: 3px
  .mb-md
    margin-bottom: 1rem

  .mb-0
    margin-bottom: 0
</style>
