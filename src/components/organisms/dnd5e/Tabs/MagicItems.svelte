<script>
  import { getContext, onMount } from "svelte";
  import { getPacksFromSettings } from "~/src/helpers/Utility.js";
  import StandardTabLayout from "~/src/components/organisms/StandardTabLayout.svelte";
  import MagicItemDisplay from "~/src/components/molecules/dnd5e/MagicItemDisplay.svelte";
  import { localize as t } from "~/src/helpers/Utility";
  import { selectedNpcBase, magicItemsState } from "~/src/stores/index";

  const actor = getContext("#doc");

  // Equipment packs for magic item generation
  let equipmentPacks = getPacksFromSettings("equipment");
  
  // Magic item generation state
  let isGeneratingMagicItems = false;
  
  // Debug logging
  console.log('MagicItems component initialized with partyLevel:', $magicItemsState.partyLevel);
  
  // Watch for changes in the selected NPC base
  $: if ($selectedNpcBase) {
    $magicItemsState.manualNpcName = $selectedNpcBase.name || "";
    $magicItemsState.manualNpcCR = $selectedNpcBase.system?.details?.cr || 0;
    $magicItemsState.manualNpcType = $selectedNpcBase.system?.details?.type?.value || "";
  }
  
  // Watch for changes in party level
  $: console.log('Party level changed to:', $magicItemsState.partyLevel);

  onMount(async () => {
    // Initialize equipment packs
    equipmentPacks = getPacksFromSettings("equipment");
    console.log('MagicItems mounted, equipment packs:', equipmentPacks);
    console.log('MagicItems initial state:', $magicItemsState);
    
    // Test import of MagicItemGenerator
    try {
      const { MagicItemGenerator } = await import("~/src/helpers/MagicItemGenerator.js");
      console.log('MagicItemGenerator imported successfully on mount');
    } catch (error) {
      console.error('Failed to import MagicItemGenerator on mount:', error);
    }
  });

  // Magic item generation functions
  async function generateIndividualMagicItems() {
    console.log('=== GENERATE INDIVIDUAL MAGIC ITEMS START ===');
    console.log('Generating individual magic items');
    console.log('Equipment packs available:', equipmentPacks.length);
    console.log('Selected NPC base:', $selectedNpcBase);
    console.log('Manual NPC details:', { 
      manualNpcName: $magicItemsState.manualNpcName, 
      manualNpcCR: $magicItemsState.manualNpcCR, 
      manualNpcType: $magicItemsState.manualNpcType 
    });
    console.log('Current magicItemsState:', $magicItemsState);
    
    if (!equipmentPacks.length) {
      ui.notifications.warn('No equipment packs configured. Please configure equipment sources in settings.');
      return;
    }
    
    // Use the selected NPC base or create a mock NPC object from manual input
    let npcToUse = $selectedNpcBase;
    if (!npcToUse && $magicItemsState.manualNpcName && $magicItemsState.manualNpcCR > 0) {
      npcToUse = {
        name: $magicItemsState.manualNpcName,
        system: {
          details: {
            cr: $magicItemsState.manualNpcCR,
            type: { value: $magicItemsState.manualNpcType || 'unknown' }
          }
        }
      };
      console.log('Created mock NPC object:', npcToUse);
    }
    
    if (!npcToUse) {
      ui.notifications.warn('Please select an NPC or enter NPC details to generate individual magic items.');
      return;
    }
    
    try {
      console.log('Setting isGeneratingMagicItems to true');
      isGeneratingMagicItems = true;
      
      // Import the MagicItemGenerator dynamically
      console.log('Importing MagicItemGenerator...');
      const { MagicItemGenerator } = await import("~/src/helpers/MagicItemGenerator.js");
      
      console.log('MagicItemGenerator imported successfully');
      console.log('MagicItemGenerator object:', MagicItemGenerator);
      
      // Debug: Check what rarity results we get
      console.log('Calling generateIndividualMagicItems...');
      const rarityResults = MagicItemGenerator.generateIndividualMagicItems(npcToUse);
      console.log('Rarity results:', rarityResults);
      
      // Debug: Check what items we can find for each rarity
      console.log('Getting items for each rarity...');
      for (const result of rarityResults) {
        const itemsForRarity = await MagicItemGenerator.getMagicItemsByRarity(equipmentPacks, result.rarity);
        console.log(`Items for ${result.rarity} rarity:`, itemsForRarity.length, itemsForRarity);
      }
      
      console.log('Calling generateIndividualMagicItemObjects...');
      const items = await MagicItemGenerator.generateIndividualMagicItemObjects(npcToUse, equipmentPacks);
      console.log('Generated items:', items);
      
      console.log('Updating store with generated items...');
      $magicItemsState.generatedMagicItems = items;
      console.log('Store updated. New generatedMagicItems:', $magicItemsState.generatedMagicItems);
      
      if (items.length > 0) {
        ui.notifications.info(`Generated ${items.length} magic items for ${$magicItemsState.manualNpcName} (CR ${$magicItemsState.manualNpcCR})`);
      } else {
        ui.notifications.warn(`No magic items generated for ${$magicItemsState.manualNpcName} (CR ${$magicItemsState.manualNpcCR})`);
      }
      
    } catch (error) {
      console.error('Error generating individual magic items:', error);
      ui.notifications.error(`Failed to generate magic items: ${error.message}`);
    } finally {
      console.log('Setting isGeneratingMagicItems to false');
      isGeneratingMagicItems = false;
    }
  }

  async function generateHoardMagicItems() {
    console.log('Generating hoard magic items for level:', $magicItemsState.partyLevel);
    console.log('Equipment packs available:', equipmentPacks.length);
    
    if (!equipmentPacks.length) {
      ui.notifications.warn('No equipment packs configured. Please configure equipment sources in settings.');
      return;
    }
    
    try {
      isGeneratingMagicItems = true;
      
      // Import the MagicItemGenerator dynamically
      const { MagicItemGenerator } = await import("~/src/helpers/MagicItemGenerator.js");
      
      console.log('MagicItemGenerator imported successfully');
      const items = await MagicItemGenerator.generateHoardMagicItemObjects($magicItemsState.partyLevel, equipmentPacks);
      console.log('Generated items:', items);
      
      $magicItemsState.generatedMagicItems = items;
      
      if (items.length > 0) {
        ui.notifications.info(`Generated ${items.length} magic items for level ${$magicItemsState.partyLevel} hoard`);
      } else {
        ui.notifications.warn(`No magic items generated for level ${$magicItemsState.partyLevel} hoard`);
      }
      
    } catch (error) {
      console.error('Error generating hoard magic items:', error);
      ui.notifications.error(`Failed to generate magic items: ${error.message}`);
    } finally {
      isGeneratingMagicItems = false;
    }
  }

  function clearGeneratedMagicItems() {
    $magicItemsState.generatedMagicItems = [];
  }



  // Get description of what will be generated
  function getGenerationDescription() {
    if ($magicItemsState.generationType === "individual" && $selectedNpcBase) {
      return `CR ${$magicItemsState.manualNpcCR}: Magic item generation based on challenge rating`;
    } else {
      return `Level ${$magicItemsState.partyLevel}: Magic item generation for hoard`;
    }
  }

  // Handle regeneration from MagicItemDisplay
  function handleRegenerate() {
    if ($magicItemsState.generationType === "individual") {
      generateIndividualMagicItems();
    } else {
      generateHoardMagicItems();
    }
  }
</script>

<template lang="pug">
StandardTabLayout(title="Magic Item Generation" showTitle="true" tabName="magic-items")
  div(slot="left")
    .generation-section
      h3 Generation Type
      
      .generation-type-selector
        .radio-group
          input#hoard-type(
            type="radio" 
            name="generationType" 
            value="hoard" 
            bind:group="{$magicItemsState.generationType}"
          )
          label(for="hoard-type") Hoard Generation
          
        .radio-group
          input#individual-type(
            type="radio" 
            name="generationType" 
            value="individual" 
            bind:group="{$magicItemsState.generationType}"
          )
          label(for="individual-type") Individual Monster

            //- Hoard Generation Controls
      +if("$magicItemsState.generationType === 'hoard'")
        .hoard-controls
          h4 Hoard Generation
          p.description Generate magic items for a treasure hoard based on party level (DMG tables)
          
          .control-group
            label Party Level:
            input.party-level-input(
              type="number"
              min="1"
              max="20"
              value="{$magicItemsState.partyLevel}"
              on:input!="{e => $magicItemsState.partyLevel = parseInt(e.target.value) || 5}"
              placeholder="5"
            )
          
          .generation-button
            button.generate-hoard-btn(
              on:click!="{generateHoardMagicItems}"
              disabled="{isGeneratingMagicItems || !equipmentPacks.length}"
              title="Generate magic items for a level {$magicItemsState.partyLevel} hoard"
            )
              +if("isGeneratingMagicItems")
                i.fas.fa-spinner.fa-spin
                +else()
                i.fas.fa-treasure-chest
              span Generate Hoard (Level {$magicItemsState.partyLevel})

      //- Individual Monster Generation Controls
      +if("$magicItemsState.generationType === 'individual'")
        .individual-controls
          h4 Individual Monster Generation
          p.description Generate magic items for a specific monster based on their Challenge Rating
          
          .npc-info
            +if("$selectedNpcBase")
              .npc-details
                .npc-name {$magicItemsState.manualNpcName}
                .npc-stats
                  span Type: {$magicItemsState.manualNpcType}
                  span CR: {$magicItemsState.manualNpcCR}
              
              .generation-button
                button.generate-individual-btn(
                  on:click!="{generateIndividualMagicItems}"
                  disabled="{isGeneratingMagicItems || !equipmentPacks.length}"
                  title="Generate magic items based on {$magicItemsState.manualNpcName}'s CR"
                )
                  +if("isGeneratingMagicItems")
                    i.fas.fa-spinner.fa-spin
                    +else()
                      i.fas.fa-magic
                  span Generate for {$magicItemsState.manualNpcName}
              +else()
                .no-npc-selected
                  p No NPC selected. Select an NPC from the NPC Select tab to generate individual magic items.
                  .placeholder-npc
                    .placeholder-info
                      span You can also manually enter NPC details below for testing:
                    .manual-npc-inputs
                    input.npc-name-input(
                      type="text"
                      placeholder="NPC Name"
                      value="{$magicItemsState.manualNpcName}"
                      on:input!="{e => $magicItemsState.manualNpcName = e.target.value}"
                    )
                    input.npc-cr-input(
                      type="number"
                      min="0"
                      max="30"
                      step="0.5"
                      placeholder="CR"
                      value="{$magicItemsState.manualNpcCR}"
                      on:input!="{e => $magicItemsState.manualNpcCR = parseFloat(e.target.value) || 0}"
                    )
                    input.npc-type-input(
                      type="text"
                      placeholder="Type (e.g., dragon, humanoid)"
                      value="{$magicItemsState.manualNpcType}"
                      on:input!="{e => $magicItemsState.manualNpcType = e.target.value}"
                    )
                    
                    +if("$magicItemsState.manualNpcName && $magicItemsState.manualNpcCR > 0")
                      .generation-button
                        button.generate-manual-btn(
                          on:click!="{generateIndividualMagicItems}"
                          disabled="{isGeneratingMagicItems || !equipmentPacks.length}"
                          title="Generate magic items for manually entered NPC"
                        )
                          +if("isGeneratingMagicItems")
                            i.fas.fa-spinner.fa-spin
                            +else()
                              i.fas.fa-magic
                          span Generate for {$magicItemsState.manualNpcName}

      //- Generation Description
      +if("$magicItemsState.generationType")
        .generation-description
          h4 What Will Be Generated
          .description-content
            span {getGenerationDescription()}

      //- Equipment Pack Status
      .equipment-packs-status
        h4 Equipment Sources
        +if("equipmentPacks.length > 0")
          .packs-list
            +each("equipmentPacks as pack")
              .pack-item
                span.pack-name {pack.metadata?.label || pack.metadata?.name || 'Unknown Pack'}
                span.pack-count {pack.index?.size || 0} items
          +else()
            .no-packs
              span No equipment packs configured. 
              a(href="#" on:click!="{() => game.settings.open(MODULE_ID)}") Configure equipment sources
        
        //- Debug section
        .debug-section
          h4 Debug Info
          .debug-info
            span Party Level: {$magicItemsState.partyLevel}
            span Equipment Packs: {equipmentPacks.length}
            span Selected NPC: {$selectedNpcBase ? $selectedNpcBase.name : 'None'}
            span Generated Items: {$magicItemsState.generatedMagicItems.length}
          button.test-btn(
            on:click!="{() => console.log('Test button clicked, current state:', { partyLevel: $magicItemsState.partyLevel, equipmentPacks: equipmentPacks.length, selectedNpc: $selectedNpcBase, generatedItems: $magicItemsState.generatedMagicItems.length })}"
          ) Test State

  div(slot="right")
    +if("$magicItemsState.generatedMagicItems.length > 0")
      MagicItemDisplay(
        magicItems="{$magicItemsState.generatedMagicItems}"
        title="Generated Magic Items"
        showAddButtons="{true}"
        on:regenerate="{handleRegenerate}"
      )
      +else()
        .no-items-placeholder
          .placeholder-content
            i.fas.fa-magic
            h3 No Magic Items Generated
            p Select a generation type and click generate to create magic items.
            p Magic items will be pulled from your configured equipment sources and filtered by rarity based on the generation method.
</template>

<style lang="sass">
  .generation-section
    padding: 1rem
    background: rgba(0, 0, 0, 0.1)
    border-radius: 8px
    border: 1px solid rgba(255, 255, 255, 0.1)

    h3
      margin-top: 0
      margin-bottom: 1.5rem
      font-size: 1.2rem

    .generation-type-selector
      margin-bottom: 2rem
      
      .radio-group
        display: flex
        align-items: center
        gap: 0.5rem
        margin-bottom: 0.75rem
        
        input[type="radio"]
          margin: 0
        
        label
          font-weight: 500
          cursor: pointer

    .hoard-controls,
    .individual-controls
      margin-bottom: 2rem
      padding: 1rem
      background: rgba(255, 255, 255, 0.05)
      border-radius: 6px
      border: 1px solid rgba(255, 255, 255, 0.1)

      h4
        margin-top: 0
        margin-bottom: 0.5rem
        font-size: 1.1rem

      .description
        margin-bottom: 1rem
        color: #ff6b6b
        font-size: 0.875rem
        line-height: 1.4
        font-weight: 500

      .control-group
        display: flex
        align-items: center
        gap: 0.75rem
        margin-bottom: 1rem

        label
          font-weight: 500
          min-width: 100px

        .party-level-input
          width: 80px
          padding: 0.25rem 0.5rem
          border: 1px solid rgba(255, 255, 255, 0.3)
          border-radius: 4px
          background: rgba(0, 0, 0, 0.3)
          color: white
          font-size: 0.875rem
          
          &::placeholder
            color: rgba(255, 255, 255, 0.6)

      .npc-info
        .npc-details
          margin-bottom: 1rem
          padding: 0.75rem
          background: rgba(0, 0, 0, 0.2)
          border-radius: 4px

          .npc-name
            font-weight: 600
            font-size: 1.1rem
            margin-bottom: 0.5rem

          .npc-stats
            display: flex
            gap: 1rem
            font-size: 0.875rem

            span
              background: rgba(255, 255, 255, 0.1)
              padding: 0.25rem 0.5rem
              border-radius: 3px

        .no-npc-selected
          text-align: center
          padding: 1rem

          .placeholder-npc
            margin-top: 1rem
            text-align: left

            .placeholder-info
              margin-bottom: 0.75rem
              font-size: 0.875rem

            .manual-npc-inputs
              display: flex
              gap: 0.5rem
              margin-bottom: 1rem
              flex-wrap: wrap

              input
                padding: 0.25rem 0.5rem
                border: 1px solid rgba(255, 255, 255, 0.3)
                border-radius: 4px
                background: rgba(0, 0, 0, 0.3)
                font-size: 0.875rem
                
                &::placeholder
                  color: rgba(255, 255, 255, 0.6)

                &.npc-name-input
                  min-width: 150px

                &.npc-cr-input
                  width: 80px

                &.npc-type-input
                  min-width: 120px

      .generation-button
        button
          display: flex
          align-items: center
          gap: 0.5rem
          padding: 0.75rem 1.5rem
          border: none
          border-radius: 6px
          cursor: pointer
          font-size: 1rem
          font-weight: 500
          transition: all 0.2s ease
          min-width: 180px
          justify-content: center

          &:disabled
            opacity: 0.6
            cursor: not-allowed

          &.generate-hoard-btn
            background: #ff9800
            color: white

            &:hover:not(:disabled)
              background: #f57c00

          &.generate-individual-btn
            background: #9c27b0
            color: white

            &:hover:not(:disabled)
              background: #7b1fa2

          i
            font-size: 1.1rem

          span
            white-space: nowrap

    .generation-description
      margin-bottom: 2rem
      padding: 1rem
      background: rgba(255, 255, 255, 0.03)
      border-radius: 6px
      border: 1px solid rgba(255, 255, 255, 0.1)

      h4
        margin-top: 0
        margin-bottom: 0.75rem
        font-size: 1rem

      .description-content
        span
          font-size: 0.875rem
          color: #ff6b6b
          line-height: 1.4
          font-weight: 500

    .equipment-packs-status
      h4
        margin-top: 0
        margin-bottom: 0.75rem
        font-size: 1rem

      .packs-list
        .pack-item
          display: flex
          justify-content: space-between
          align-items: center
          padding: 0.5rem
          margin-bottom: 0.5rem
          background: rgba(0, 0, 0, 0.2)
          border-radius: 4px
          font-size: 0.875rem

          .pack-name
            font-weight: 500

          .pack-count
            background: rgba(255, 255, 255, 0.1)
            padding: 0.25rem 0.5rem
            border-radius: 3px

      .no-packs
        font-size: 0.875rem

        a
          color: #2196f3
          text-decoration: none

          &:hover
            text-decoration: underline
      
      .debug-section
        margin-top: 1rem
        padding: 1rem
        background: rgba(255, 0, 0, 0.1)
        border-radius: 6px
        border: 1px solid rgba(255, 0, 0, 0.3)

        h4
          margin-top: 0
          margin-bottom: 0.75rem
          color: #ff6b6b
          font-size: 1rem

        .debug-info
          display: flex
          gap: 1rem
          flex-wrap: wrap
          margin-bottom: 1rem

          span
            background: rgba(255, 255, 255, 0.1)
            padding: 0.25rem 0.5rem
            border-radius: 3px
            font-size: 0.875rem
            color: white

        .test-btn
          background: #ff6b6b
          color: white
          border: none
          border-radius: 4px
          padding: 0.5rem 1rem
          cursor: pointer
          font-size: 0.875rem

          &:hover
            background: #ff5252

  .no-items-placeholder
    display: flex
    align-items: center
    justify-content: center
    height: 100%
    padding: 2rem

    .placeholder-content
      text-align: center
      color: #ff6b6b

      i
        font-size: 3rem
        margin-bottom: 1rem
        color: #9c27b0

      h3
        margin: 0 0 1rem 0

      p
        margin: 0 0 0.5rem 0
        line-height: 1.4
        max-width: 400px
</style>
