<script>
  import { getContext, createEventDispatcher } from "svelte";
  import { localize as t, updateSource, getItemSourcesFromActor } from "~/src/helpers/Utility";

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
      
      // Get current items from actor and add the new item
      const currentItems = getItemSourcesFromActor($actor);
      currentItems.push(itemData);
      
      // Add the item to the actor using updateSource
      await updateSource($actor, { items: currentItems });
      
      ui.notifications.info(`Added ${item.label} to ${$actor.name}`);
      
      // Remove the item from the generated list
      magicItems = magicItems.filter(i => (i.uuid || i.value) !== itemUuid);
      
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
  function getActorMagicItems() {
    if (!$actor?.items) return [];
    
    try {
      const items = getItemSourcesFromActor($actor);
      return items.filter(item => {
        // Check if item has magic properties
        return item.system?.properties?.includes('mgc') || 
               item.system?.rarity?.value || 
               item.type === 'weapon' || 
               item.type === 'armor' || 
               item.type === 'consumable';
      }).map(item => {
        // Add rarity color and label for display
        const rarity = item.system?.rarity?.value || 'common';
        const rarityColor = getRarityColor(rarity);
        const rarityLabel = rarity.charAt(0).toUpperCase() + rarity.slice(1);
        
        return {
          ...item,
          rarity,
          rarityColor,
          rarityLabel
        };
      });
    } catch (error) {
      console.error('Error getting actor magic items:', error);
      return [];
    }
  }

  /**
   * Get color for rarity display
   */
  function getRarityColor(rarity) {
    const colors = {
      common: '#b0b0b0',
      uncommon: '#1a9850',
      rare: '#2b83ba',
      very_rare: '#7b3294',
      legendary: '#d73027'
    };
    return colors[rarity] || colors.common;
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
            i.fas.fa-plus-double

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
                .item-name {item.label}
                .item-rarity(
                  style!="color: {item.rarityColor}"
                ) {item.rarityLabel}
                +if("item.packLabel")
                  .item-source {item.packLabel}
            
            +if("showAddButtons")
              button.add-item-btn(
                on:click!="{() => addMagicItemToActor(item)}"
                title="Add {item.label} to actor"
              )
                i.fas.fa-plus

          +if("item.system?.description?.value")
            .item-description {@html item.system.description.value}

  +if("magicItems.length > 0")
    .footer
      .item-count
        span Generated {magicItems.length} magic item{magicItems.length === 1 ? '' : 's'}
      +if("showAddButtons")
        .footer-actions
          button.add-all-btn(on:click!="{addAllMagicItems}")
            i.fas.fa-plus-double
            span Add All to Actor

  // Actor's current magic items section
  +if("$actor?.items?.size > 0")
    .actor-magic-items
      h4 Actor's Magic Items
      .actor-items-list
        +each("getActorMagicItems() as item, index")
          .actor-item(
            class!="{item.rarity}"
            style!="border-left-color: {item.rarityColor}"
          )
            .item-header
              .item-info
                +if("item.img")
                  img.item-image(src="{item.img}" alt="{item.name}")
                .item-details
                  .item-name {item.name}
                  .item-type {item.type}
                  .item-rarity {item.rarity}
            .item-description
              span This item is already on the actor
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
                text-transform: uppercase
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
                  text-transform: uppercase
                  letter-spacing: 0.5px

          .item-description
            font-size: 0.75rem
            color: rgba(255, 255, 255, 0.6)
            font-style: italic
</style>
