<script>
  import { getContext, createEventDispatcher } from "svelte";
  import { localize as t, updateSource, getItemSourcesFromActor, enrichHTML, deleteActorItem } from "~/src/helpers/Utility";
  import { MODULE_ID } from "~/src/helpers/constants.ts";

  const actor = getContext("#doc");

  export let magicItems = [];
  export let title = "Generated Magic Items";
  export let showAddButtons = true;
  const dispatch = createEventDispatcher();



  /**
   * Add a magic item to the actor
   * @param {Object} item - The magic item to add
   */
  async function addMagicItemToActor(item) {
    try {
      if (!actor) {
        ui.notifications.error('No actor available to add items to');
        return;
      }

      // Get the UUID from the correct property
      const itemUuid = item.uuid || item.value;
      if (!itemUuid) {
        ui.notifications.error(`Item ${item.label} has no valid UUID`);
        return;
      }

      // Import the item from the compendium
      const importedItem = await fromUuid(itemUuid);
      if (!importedItem) {
        ui.notifications.error(`Failed to import item: ${item.label}`);
        return;
      }

      // Create a copy of the item data
      const itemData = importedItem.toObject();
      
      // Ensure a fresh ID is generated on the in-memory actor
      if (itemData && itemData._id) delete itemData._id;
      
      // Store the original compendium UUID under our module namespace
      try {
        const srcUuid = item?.uuid || itemUuid;
        const fu = (globalThis?.foundry && globalThis.foundry.utils) ? globalThis.foundry.utils : undefined;
        if (fu?.setProperty) {
          fu.setProperty(itemData, `flags.${MODULE_ID}.sourceUuid`, srcUuid);
          fu.setProperty(itemData, `flags.${MODULE_ID}.sourceId`, srcUuid);
        } else {
          const existingFlags = itemData.flags && typeof itemData.flags === 'object' ? itemData.flags : {};
          const moduleFlags = existingFlags[MODULE_ID] && typeof existingFlags[MODULE_ID] === 'object' ? existingFlags[MODULE_ID] : {};
          itemData.flags = {
            ...existingFlags,
            [MODULE_ID]: {
              ...moduleFlags,
              sourceUuid: srcUuid,
              sourceId: srcUuid
            }
          };
        }
      } catch (_) {}
      
      // Get current items from actor and add the new item
      const currentItems = getItemSourcesFromActor($actor);
      currentItems.push(itemData);
      
      // Add the item to the actor using updateSource
      await updateSource($actor, { items: currentItems });
      
      ui.notifications.info(`Added ${item.label} to ${$actor.name}`);
      
      // Remove the item from the generated list by dispatching an event
      dispatch('itemAdded', { item, remainingItems: magicItems.filter(i => (i.uuid || i.value) !== itemUuid) });
      
    } catch (error) {
      console.error('Error adding magic item to actor:', error);
      ui.notifications.error(`Failed to add ${item.label}: ${error.message}`);
    }
  }

  /**
   * Add all magic items to the actor
   */
  async function addAllMagicItems() {
    try {
      if (!actor) {
        ui.notifications.error('No actor available to add items to');
        return;
      }

      const itemsToAdd = [...magicItems];
      
      for (const item of itemsToAdd) {
        await addMagicItemToActor(item);
      }
      
      ui.notifications.info(`Added ${itemsToAdd.length} magic items to ${actor.name}`);
      
    } catch (error) {
      console.error('Error adding all magic items:', error);
      ui.notifications.error(`Failed to add some items: ${error.message}`);
    }
  }

  /**
   * Clear all generated magic items
   */
  function clearMagicItems() {
    magicItems = [];
  }

  /**
   * Get magic items currently on the actor
   */
  $: actorMagicItems = (() => {
    if (!$actor?.items) return [];
    
    try {
      const items = getItemSourcesFromActor($actor);
      return items.filter(item => {
        // Only show items that are actually magical
        return item.system?.properties?.includes('mgc');
      }).map(item => {
        // Add rarity color and label for display
        const rarity = item.system?.rarity;
        const rarityColor = getRarityColor(rarity);
        const rarityLabel = rarity;
        
        // Get the source UUID for enrichment
        const sourceUuid = item.flags?.[MODULE_ID]?.sourceUuid || 
                          item.flags?.core?.sourceId || 
                          item.system?.sourceId || 
                          item.uuid;
        
        return {
          ...item,
          rarity,
          rarityColor,
          rarityLabel,
          sourceUuid
        };
      });
    } catch (error) {
      console.error('Error getting actor magic items:', error);
      return [];
    }
  })();

  /**
   * Get color for rarity display
   */
  function getRarityColor(rarity) {
    const colors = {
      common: '#b0b0b0',
      uncommon: '#1a9850',
      rare: '#2b83ba',
      veryRare: '#7b3294',
      legendary: '#d73027'
    };
    return colors[rarity] || colors.common;
  }

  /**
   * Remove a magic item from the actor
   * @param {Object} item - The magic item to remove
   */
  async function removeMagicItemFromActor(item) {
    try {
      if (!actor) {
        ui.notifications.error('No actor available to remove items from');
        return;
      }

      // Find the item on the actor by name and type
      const actorItem = $actor.items.find(i => i.name === item.name && i.type === item.type);
      
      if (!actorItem) {
        ui.notifications.error(`Item ${item.name} not found on actor`);
        return;
      }
      
      // Use the utility function to delete the item from the actor
      const success = await deleteActorItem($actor, actorItem.id);
      
      if (success) {
        ui.notifications.info(`Removed ${item.name} from ${$actor.name}`);
        
        // Debug: Log the item structure to understand what we're working with
        console.log('Removed item structure:', item);
        console.log('Actor item structure:', actorItem);
        console.log('Module flags:', actorItem.flags);
        
        // Format the removed item to match the structure expected by generated items list
        const formattedRemovedItem = {
          label: actorItem.name,
          name: actorItem.name,
          img: actorItem.img,
          type: actorItem.type,
          uuid: actorItem.flags?.[MODULE_ID]?.sourceUuid || actorItem.uuid,
          value: actorItem.flags?.[MODULE_ID]?.sourceUuid || actorItem.uuid,
          rarity: actorItem.system?.rarity,
          rarityLabel: actorItem.system?.rarity,
          rarityColor: getRarityColor(actorItem.system?.rarity),
          packLabel: actorItem.flags?.[MODULE_ID]?.sourceUuid ? 'From Actor' : undefined
          // Don't include system property to match original generated items structure
        };
        
        console.log('Formatted removed item:', formattedRemovedItem);
        
        // Dispatch an event to notify the parent component that an item was removed
        // This allows the parent to move the item back to the generated items list
        console.log('Dispatching itemRemoved event with:', { item: formattedRemovedItem, remainingActorItems: Array.from($actor.items.values()).filter(i => {
          // Check if properties exists and is an array before calling includes
          const properties = i.system?.properties;
          return properties && Array.isArray(properties) && properties.includes('mgc');
        }) });
        
        dispatch('itemRemoved', { 
          item: formattedRemovedItem, 
          remainingActorItems: Array.from($actor.items.values()).filter(i => {
            // Check if properties exists and is an array before calling includes
            const properties = i.system?.properties;
            return properties && Array.isArray(properties) && properties.includes('mgc');
          })
        });
        
        console.log('Event dispatched successfully');
      } else {
        ui.notifications.error(`Failed to remove ${item.name} from actor`);
      }
      
    } catch (error) {
      console.error('Error removing magic item from actor:', error);
      ui.notifications.error(`Failed to remove ${item.name}: ${error.message}`);
    }
  }

  /**
   * Regenerate magic items (this will be handled by the parent component)
   */
  function regenerateItems() {
    // Dispatch an event to the parent component
    dispatch('regenerate');
  }
</script>

<template lang="pug">
.magic-item-display
  .header
    h3 {title}
    .header-actions
      +if("magicItems.length > 0")
        button.regenerate-btn(on:click!="{regenerateItems}" title="Regenerate magic items")
          i.fas.fa-dice
        button.clear-btn(on:click!="{clearMagicItems}" title="Clear all items")
          i.fas.fa-trash
        +if("showAddButtons && magicItems.length > 1")
          button.add-all-btn(on:click!="{addAllMagicItems}" title="Add all items to actor")
            i.fas.fa-folder-plus

  +if("magicItems.length === 0")
    .no-items
      span No magic items generated yet.
      +if("showAddButtons")
        button.regenerate-btn(on:click!="{regenerateItems}")
          i.fas.fa-dice
          span Generate Items

  +if("magicItems.length > 0")
    .magic-items-list
      +each("magicItems as item, index")
        .magic-item(
          class!="{item.rarity}"
          style!="border-left-color: {item.rarityColor}"
        )
          .item-header
            .item-info
              +if("item.img")
                img.item-image(src="{item.img}" alt="{item.label}")
              .item-details
                +if("item.uuid || item.value")
                  +await("enrichHTML(`@UUID[${item.uuid || item.value}]{${item.label}}`)")
                    +then("Html")
                      .item-name {@html Html}
                  +else()
                    .item-name {item.label}
                .item-rarity(
                  style!="color: {item.rarityColor}"
                ) {item.rarityLabel}
                +if("item.packLabel")
                  .item-source {item.packLabel}
            
            +if("showAddButtons")
              button.add-item-btn.ml-xs(
                on:click!="{() => addMagicItemToActor(item)}"
                title="Add {item.label} to actor"
              )
                i.fas.fa-plus

  +if("magicItems.length > 0")
    .footer
      .item-count
        span {magicItems.length} magic item{magicItems.length === 1 ? '' : 's'}
      +if("showAddButtons")
        .footer-actions
          button.add-all-btn(on:click!="{addAllMagicItems}")
            i.fas.fa-folder-plus
            span Add All

  // Actor's current magic items section
  +if("actorMagicItems.length > 0")
    .actor-magic-items
      h4 Actor's Magic Items
      .actor-items-list
        +each("actorMagicItems as item, index")
          .actor-item(
            class!="{item.rarity}"
            style!="border-left-color: {item.rarityColor}"
          )
            .item-header
              .item-info
                +if("item.img")
                  img.item-image(src="{item.img}" alt="{item.name}")
                .item-details
                  +if("item.sourceUuid")
                    +await("enrichHTML(`@UUID[${item.sourceUuid}]{${item.name}}`)")
                      +then("Html")
                        .item-name {@html Html}
                    +else()
                      .item-name {item.name}
                  .item-type {item.type}
                  .item-rarity {item.rarity}
              button.remove-item-btn(
                on:click!="{() => removeMagicItemFromActor(item)}"
                title="Remove {item.name} from actor"
              )
                i.fas.fa-trash

</template>

<style lang="sass">
  .magic-item-display
    background: rgba(255, 255, 255, 0.05)
    border-radius: 8px
    padding: 1rem
    border: 1px solid rgba(0, 0, 0, 0.1)

    .header
      display: flex
      justify-content: space-between
      align-items: center
      margin-bottom: 1rem
      padding-bottom: 0.5rem
      border-bottom: 1px solid rgba(0, 0, 0, 0.1)

      h3
        margin: 0
        font-size: 1.1rem

      .header-actions
        display: flex
        gap: 0.5rem

        button
          background: none
          border: 1px solid rgba(0, 0, 0, 0.2)
          border-radius: 4px
          padding: 0.25rem 0.5rem
          cursor: pointer
          transition: all 0.2s ease
          font-size: 0.875rem

          &:hover
            background-color: rgba(0, 0, 0, 0.1)
            border-color: rgba(0, 0, 0, 0.3)

          &.regenerate-btn
            color: #2196f3

          &.clear-btn
            color: #f44336

          &.add-all-btn
            color: #4caf50

    .no-items
      text-align: center
      padding: 2rem

      .regenerate-btn
        margin-top: 1rem
        background: #2196f3
        color: white
        border: none
        border-radius: 4px
        padding: 0.5rem 1rem
        cursor: pointer
        transition: background-color 0.2s ease

        &:hover
          background-color: #1976d2

        i
          margin-right: 0.5rem

    .magic-items-list
      .magic-item
        background: rgba(255, 255, 255, 0.02)
        border: 1px solid rgba(0, 0, 0, 0.1)
        border-left: 4px solid
        border-radius: 6px
        padding: 1rem
        margin-bottom: 1rem
        transition: all 0.2s ease

        &:hover
          background: rgba(255, 255, 255, 0.05)
          border-color: rgba(0, 0, 0, 0.2)

        &.common
          border-left-color: #9b9b9b

        &.uncommon
          border-left-color: #4caf50

        &.rare
          border-left-color: #2196f3

        &.veryRare
          border-left-color: #9c27b0

        &.legendary
          border-left-color: #ff9800

        .item-header
          display: flex
          justify-content: space-between
          align-items: flex-start
          margin-bottom: 0.75rem

          .item-info
            display: flex
            gap: 0.75rem
            flex: 1

            .item-image
              width: 40px
              height: 40px
              border-radius: 4px
              object-fit: cover

            .item-details
              .item-name
                font-weight: 600
                font-size: 1rem
                margin-bottom: 0.25rem

              .item-rarity
                font-size: 0.875rem
                font-weight: 500
                text-transform: capitalize
                letter-spacing: 0.5px
                margin-bottom: 0.25rem

              .item-source
                font-size: 0.75rem
                font-style: italic

          .add-item-btn
            background: #4caf50
            color: white
            border: none
            border-radius: 4px
            padding: 0.5rem
            cursor: pointer
            transition: background-color 0.2s ease
            min-width: 36px
            height: 36px
            display: flex
            align-items: center
            justify-content: center

            &:hover
              background-color: #388e3c

          .remove-item-btn
            background: #f44336
            color: white
            border: none
            border-radius: 4px
            padding: 0.5rem
            cursor: pointer
            transition: background-color 0.2s ease
            min-width: 36px
            height: 36px
            display: flex
            align-items: center
            justify-content: center

            &:hover
              background-color: #d32f2f

        .item-description
          font-size: 0.875rem
          line-height: 1.4
          border-top: 1px solid rgba(0, 0, 0, 0.1)
          padding-top: 0.75rem

    .footer
      display: flex
      justify-content: space-between
      align-items: center
      margin-top: 1rem
      padding-top: 1rem
      border-top: 1px solid rgba(0, 0, 0, 0.1)

      .item-count
        font-size: 0.875rem

      .footer-actions
        .add-all-btn
          background: #4caf50
          color: white
          border: none
          border-radius: 4px
          padding: 0.5rem 1rem
          cursor: pointer
          transition: background-color 0.2s ease
          font-size: 0.875rem

          &:hover
            background-color: #388e3c

          i
            margin-right: 0.5rem

    .actor-magic-items
      margin-top: 2rem
      padding-top: 1.5rem
      border-top: 2px solid rgba(0, 0, 0, 0.2)

      h4
        margin: 0 0 1rem 0
        font-size: 1.1rem
        color: rgba(255, 255, 255, 0.9)

      .actor-items-list
        .actor-item
          background: rgba(255, 255, 255, 0.03)
          border: 1px solid rgba(0, 0, 0, 0.15)
          border-left: 4px solid
          border-radius: 6px
          padding: 0.75rem
          margin-bottom: 0.75rem
          transition: all 0.2s ease

          &:hover
            background: rgba(255, 255, 255, 0.05)

          .item-header
            display: flex
            justify-content: space-between
            align-items: flex-start
            margin-bottom: 0.5rem

            .item-info
              display: flex
              gap: 0.75rem
              flex: 1

              .item-image
                width: 32px
                height: 32px
                border-radius: 4px
                object-fit: cover

              .item-details
                .item-name
                  font-weight: 600
                  font-size: 0.9rem
                  margin-bottom: 0.25rem

                .item-type
                  font-size: 0.75rem
                  color: rgba(255, 255, 255, 0.7)
                  text-transform: capitalize
                  margin-bottom: 0.25rem

                .item-rarity
                  font-size: 0.75rem
                  font-weight: 500
                  text-transform: capitalize
                  letter-spacing: 0.5px

          .item-description
            font-size: 0.75rem
            color: rgba(255, 255, 255, 0.6)
            font-style: italic
</style>
