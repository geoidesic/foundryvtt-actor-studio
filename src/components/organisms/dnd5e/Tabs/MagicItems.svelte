<script>
  import { getContext, onMount } from "svelte";
  import { getPacksFromSettings } from "~/src/helpers/Utility.js";
  import StandardTabLayout from "~/src/components/organisms/StandardTabLayout.svelte";
  import MagicItemDisplay from "~/src/components/molecules/dnd5e/MagicItemDisplay.svelte";
  import NPCCurrencyDisplay from "~/src/components/molecules/dnd5e/NPC/NPCCurrencyDisplay.svelte";
  import { localize as t } from "~/src/helpers/Utility";
  import { selectedNpcBase, magicItemsState, npcCurrency } from "~/src/stores/index";
  import { autoRollGold } from "~/src/stores/npc";

  const actor = getContext("#doc");

  // Equipment packs for magic item generation
  let equipmentPacks = getPacksFromSettings("equipment");
  
  // Magic item generation state
  let isGeneratingMagicItems = false;
  
  // Local party level for hoard generation - initialize from store
  let localPartyLevel = $magicItemsState.partyLevel;
  
  // Update store when local party level changes
  $: if (localPartyLevel !== $magicItemsState.partyLevel) {
    $magicItemsState.partyLevel = localPartyLevel;
  }
  
  // Watch for changes in the selected NPC base
  $: if ($selectedNpcBase) {
    $magicItemsState.manualNpcName = $selectedNpcBase.name || "";
    $magicItemsState.manualNpcCR = $selectedNpcBase.system?.details?.cr ?? 0;
    $magicItemsState.manualNpcType = $selectedNpcBase.system?.details?.type?.value || "";
    
    // Auto-roll gold when NPC is selected (regardless of current currency values)
    console.log('[Treasure] NPC selected, auto-rolling gold for:', $selectedNpcBase.name);
    autoRollGold($selectedNpcBase);
  }

  onMount(async () => {
    // Initialize equipment packs
    equipmentPacks = getPacksFromSettings("equipment");
    console.log('MagicItems mounted, equipment packs:', equipmentPacks);
    
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
    if (!npcToUse && $magicItemsState.manualNpcName && $magicItemsState.manualNpcCR >= 0) {
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
      
      // Get treasure categories from the NPC if available
      const treasureCategories = npcToUse.system?.details?.treasure?.value || [];
      console.log('Treasure categories from NPC:', treasureCategories);
      console.log('Treasure categories type:', typeof treasureCategories);
      console.log('Treasure categories is array:', Array.isArray(treasureCategories));
      
      console.log('Calling generateIndividualMagicItemObjectsWithCategories...');
      const items = await MagicItemGenerator.generateIndividualMagicItemObjectsWithCategories(npcToUse, equipmentPacks, treasureCategories);
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
    if ($magicItemsState.generationType === "individual") {
      if ($selectedNpcBase) {
        return `CR ${$magicItemsState.manualNpcCR}: Magic item generation based on challenge rating`;
      } else {
        return `Individual monster magic item generation (select an NPC or enter details)`;
      }
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

  // Handle item being added to actor from MagicItemDisplay
  function handleItemAdded(event) {
    console.log('=== handleItemAdded DEBUG ===');
    console.log('Event detail:', event.detail);
    const { remainingItems } = event.detail;
    console.log('Remaining items:', remainingItems);
    console.log('Current store state before update:', $magicItemsState.generatedMagicItems);
    
    $magicItemsState.generatedMagicItems = remainingItems;
    
    console.log('Store updated. New state:', $magicItemsState.generatedMagicItems);
    console.log('Store length:', $magicItemsState.generatedMagicItems.length);
  }

  // Handle item being removed from actor from MagicItemDisplay
  function handleItemRemoved(event) {
    console.log('=== handleItemRemoved DEBUG ===');
    console.log('Event detail:', event.detail);
    const { item, remainingActorItems } = event.detail;
    console.log('Removed item:', item);
    console.log('Remaining actor items:', remainingActorItems);
    
    // Add the removed item back to the generated items list
    $magicItemsState.generatedMagicItems = [...$magicItemsState.generatedMagicItems, item];
    
    console.log('Item moved back to generated list. New state:', $magicItemsState.generatedMagicItems);
    console.log('Generated items length:', $magicItemsState.generatedMagicItems.length);
  }
</script>

<template lang="pug">
StandardTabLayout(title="Treasure Generation" showTitle="true" tabName="magic-items")
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
          p.description Generate treasure for a treasure hoard based on party tier (DMG tables)
          
          // Currency Display Section for Hoard
          NPCCurrencyDisplay(showRollButton="{true}" hoardMode="{true}" partyLevel="{localPartyLevel}" sheet="{$actor?.id}")
          
          .hoard-info
            .control-group
              label Party Level:
              select.party-tier-select(
                bind:value="{localPartyLevel}"
                on:change!="{e => console.log('Select changed to:', e.target.value)}"
              )
                option(value="{1}") 1-4
                option(value="{5}") 5-10
                option(value="{11}") 11-16
                option(value="{17}") 17+
            
            .generation-button
              button.generate-hoard-btn(
                on:click!="{generateHoardMagicItems}"
                disabled="{isGeneratingMagicItems || !equipmentPacks.length}"
                title="Generate magic items for levels {localPartyLevel === 1 ? '1-4' : localPartyLevel === 5 ? '5-10' : localPartyLevel === 11 ? '11-16' : '17+'} hoard"
              )
                +if("isGeneratingMagicItems")
                  i.fas.fa-spinner.fa-spin
                  +else()
                    i.fas.fa-treasure-chest
                    span Roll Magic Items

      //- Individual Monster Generation Controls
      +if("$magicItemsState.generationType === 'individual'")
        .individual-controls
          h4 Individual Treasure Generation
          p.description Generate treasure based on Challenge Rating
          
          // Currency Display Section
          NPCCurrencyDisplay(showRollButton="{true}" sheet="{$actor?.id}")

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
                      i.fas.fa-dice
                      span Generate Items
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
                      on:input!="{e => $magicItemsState.manualNpcCR = parseFloat(e.target.value) ?? 0}"
                    )
                    input.npc-type-input(
                      type="text"
                      placeholder="Type (e.g., dragon, humanoid)"
                      value="{$magicItemsState.manualNpcType}"
                      on:input!="{e => $magicItemsState.manualNpcType = e.target.value}"
                    )
                    
                    +if("$magicItemsState.manualNpcName && $magicItemsState.manualNpcCR >= 0")
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
        //- .debug-section
        //-   h4 Debug Info
        //-   .debug-info
        //-     +if("$magicItemsState.generationType === 'hoard'")
        //-       span Party Level: {$magicItemsState.partyLevel}
        //-     +if("$magicItemsState.generationType === 'individual'")
        //-       span NPC CR: {$magicItemsState.manualNpcCR ?? 'None'}
        //-     span Equipment Packs: {equipmentPacks.length}
        //-     span Selected NPC: {$selectedNpcBase ? $selectedNpcBase.name : 'None'}
        //-     span Generated Items: {$magicItemsState.generatedMagicItems.length}
        //-   button.test-btn(
        //-     on:click!="{() => console.log('Test button clicked, current state:', { generationType: $magicItemsState.generationType, partyLevel: $magicItemsState.partyLevel, npcCR: $magicItemsState.manualNpcCR, equipmentPacks: equipmentPacks.length, selectedNpc: $selectedNpcBase, generatedItems: $magicItemsState.generatedMagicItems.length })}"
        //-   ) Test State

  div(slot="right")
    MagicItemDisplay(
      magicItems="{$magicItemsState.generatedMagicItems}"
      title="Magic Items"
      showAddButtons="{true}"
      on:regenerate="{handleRegenerate}"
      on:itemAdded!="{handleItemAdded}"
      on:itemRemoved!="{handleItemRemoved}"
    )

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

        .party-tier-select
          width: 120px
          padding: 0.25rem 0.5rem
          border: 1px solid rgba(255, 255, 255, 0.3)
          border-radius: 4px
          background: rgba(0, 0, 0, 0.3)
          color: white
          font-size: 0.875rem

      .currency-section
        margin-bottom: 1rem
        padding: 0.75rem 1rem
        background: rgba(0, 0, 0, 0.1)
        border-radius: 6px
        border: 1px solid rgba(255, 255, 255, 0.1)

        h4
          margin-top: 0
          margin-bottom: 0.5rem
          font-size: 1rem

        .description
          margin-bottom: 0.5rem
          color: #ff6b6b
          font-size: 0.875rem
          line-height: 1.4
          font-weight: 500

      .hoard-info
        margin: 1rem 0
        padding: 1rem
        background: rgba(0, 0, 0, 0.05)
        border-radius: var(--border-radius)
        border: 1px solid var(--color-border-light-tertiary)

      .npc-info

        margin: 1rem 0
        padding: 1rem
        background: rgba(0, 0, 0, 0.05)
        border-radius: var(--border-radius)
        border: 1px solid var(--color-border-light-tertiary)
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
          border-radius: 3px
          background: var(--color-success, #28a745)
          color: white
          cursor: pointer
          font-size: 1rem
          font-weight: 600
          transition: all 0.2s ease
          min-width: 180px
          justify-content: center

          &:disabled
            opacity: 0.6
            cursor: not-allowed

          &:hover:not(:disabled)
            background: var(--color-success-hover, #218838)
            transform: translateY(-1px)
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2)

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
