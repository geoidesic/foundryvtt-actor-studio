<script>
  import { localize } from "#runtime/svelte/helper";
  import { getContext, onDestroy, onMount, tick } from "svelte";
  import { equipmentSelections, selectEquipment } from "~/src/stores/equipmentSelections";
  import { MODULE_ID } from "~/src/helpers/constants";

  export let startingEquipment = [];

  // Check if equipment selection is enabled in settings
  $: equipmentSelectionEnabled = game.settings.get(MODULE_ID, "enableEquipmentSelection");

  // Process and group equipment
  $: processedGroups = startingEquipment.reduce((acc, entry) => {
    if (entry.type === 'OR') {
      // Create a new choice group
      acc[entry._id] = {
        id: entry._id,
        sort: entry.sort,
        type: 'choice',
        items: [],
        key: entry.key
      };
    } else if (entry.group) {
      // Add item to existing group
      if (acc[entry.group]) {
        acc[entry.group].items.push(entry);
      }
    } else {
      // Standalone items
      if (!acc.standalone) {
        acc.standalone = {
          id: 'standalone',
          type: 'standalone',
          items: [],
          key: entry.key
        };
      }
      acc.standalone.items.push(entry);
    }
    return acc;
  }, {});

  
  // Sort groups by their sort value
  $: sortedGroups = Object.values(processedGroups)
  .sort((a, b) => (a.sort || 0) - (b.sort || 0));
  
  $: window.GAS.log.d("StartingEquipment equipmentSelections", $equipmentSelections);
  $: window.GAS.log.d("StartingEquipment processedGroups", processedGroups);
  $: window.GAS.log.d("StartingEquipment sortedGroups", sortedGroups);

  async function getItemName(key) {
    if (!key) return 'Unknown Item';
    if (key === 'arcane') return 'Arcane Focus';
    
    const item = await fromUuid(key);
    return item?.name || 'Unknown Item';
  }

  function getEquipmentIcon(type) {
    switch(type) {
      case 'focus':
        return 'icons/svg/book.svg';
      case 'linked':
        return 'icons/svg/item-bag.svg';
      case 'OR':
        return 'icons/svg/dice-target.svg';
      default:
        return 'icons/svg/item-bag.svg';
    }
  }

  function handleSelection(groupId, itemId) {
    window.GAS.log.d("[Starting Equipment] handleSelection", { groupId, itemId });
    selectEquipment(groupId, itemId);
  }

  onMount(async () => {
    window.GAS.log.d("StartingEquipment", startingEquipment);
  });

</script>

<template lang="pug">
  +if("startingEquipment?.length")
    section.starting-equipment
      .flexrow
        .flex0.required(class="{equipmentSelectionEnabled ? 'active' : ''}") *
        .flex3
          h2.left {localize('GAS.StartingEquipment')}
      
      +if("equipmentSelectionEnabled")

        //- Process each group
        +each("sortedGroups as group")
          +if("group.type === 'choice'")
            .equipment-group
              span.group-label Choose one...
              .options
                +each("group.items as item")
                  button.option(
                    class="{$equipmentSelections[group.id]?.selectedItemId === item._id ? 'selected' : ''}"
                    on:click="{handleSelection(group.id, item._id)}"
                  )
                    .flexrow.justify-flexrow-vertical
                      .flex0.mr-sm
                        img.icon(src="{getEquipmentIcon(item.type)}" alt="{item.type}")
                      .flex2.left.name {item.label}
                    +if("item.count")
                      span.count (x{item.count})
            +else()
              +each("group.items as item")
                .equipment-item.option.selected(class="{item.type === 'focus' ? 'focus' : ''}")
                  .flexrow.justify-flexrow-vertical
                    .flex0.mr-sm
                      img.icon(src="{getEquipmentIcon(item.type)}" alt="{item.type}")
                    .flex2.left.name {item.label}
                    +if("item.count")
                      span.count (x{item.count})
        +else()
          //- Show read-only list when equipment selection is disabled
          +each("sortedGroups as group")
            .equipment-group
              +if("group.type === 'choice'")
                span.group-label Choose one from... 
                +each("group.items as item")
                  .equipment-item
                    .flexrow.justify-flexrow-vertical
                      .flex0.mr-sm
                        img.icon(src="{getEquipmentIcon(item.type)}" alt="{item.type}")
                      .flex2.left.name {item.label}
                      +if("item.count")
                        span.count (x{item.count})
                +else()
                  +each("group.items as item")
                    .equipment-item(class="{item.type === 'focus' ? 'focus' : ''}")
                      .flexrow.justify-flexrow-vertical
                        .flex0.mr-sm
                          img.icon(src="{getEquipmentIcon(item.type)}" alt="{item.type}")
                        .flex2.left.name {item.label}
                        +if("item.count")
                          span.count (x{item.count})
</template>

<style lang="sass">
.starting-equipment
  background: rgba(0, 0, 0, 0.2)
  border-radius: var(--border-radius)
  padding: 0.5rem
  margin-top: 1rem

.section-header
  font-size: 1.2em
  font-weight: bold
  margin-bottom: 1rem
  color: var(--color-text-highlight)
  border-bottom: 1px solid rgba(255, 255, 255, 0.1)
  padding-bottom: 0.5rem

.equipment-group
  margin-bottom: 0.75rem
  background: rgba(0, 0, 0, 0.3)
  padding: 0.5rem
  border-radius: var(--border-radius)
  
  &:last-child
    margin-bottom: 0

.group-label
  display: block
  font-size: 1em
  color: var(--color-text-dark-secondary)
  margin-bottom: 0.5rem
  font-style: italic

.options
  display: grid
  grid-template-columns: repeat(1, 1fr)
  gap: 0.5rem

.option, .equipment-item
  display: flex
  padding: 0.3rem 0.75rem
  border: 1px solid rgba(255, 255, 255, 0.1)
  border-radius: 4px
  background: rgba(0, 0, 0, 0.4)
  color: var(--li-background-color)
  transition: all 0.2s ease

.option
  cursor: pointer
  
  &:hover
    background: rgba(0, 0, 0, 0.6)
    border-color: rgba(255, 255, 255, 0.2)

  &.selected
    background: rgba(0, 0, 0, 0.8)
    border-color: #b59e54
    box-shadow: 0 0 10px rgba(181, 158, 84, 0.2)

.equipment-item
  margin-bottom: 0.5rem
  
  &.focus
    border-left: 3px solid var(--color-text-highlight)

.icon
  width: 32px
  height: 32px
  margin-right: 0.75rem
  filter: brightness(1) drop-shadow(0 2px 3px rgba(0, 0, 0, 0.5))
  border: none
  min-width: 32px

.name
  flex: 1
  font-size: 1.1em

.count
  margin-left: 0.75rem
  color: var(--color-text-dark-secondary)
  font-size: 0.9em
</style> 