<script>
import { getContext, onMount } from "svelte";
import { equipmentSelections, addGranularSelection, removeGranularSelection, getEquipmentIcon, initializeGroup, addChildGranularSelection, getRequiredSelectionsCount, editGroup } from "~/src/stores/equipmentSelections";
import { localize } from "#runtime/svelte/helper";
import IconSelect from "~/src/components/atoms/select/IconSelect.svelte";
import { extractItemsFromPacksAsync, getPacksFromSettings } from "~/src/helpers/Utility.js";
import { MODULE_ID } from "~/src/helpers/constants";

// Types that need additional configuration
const CONFIGURABLE_TYPES = ['tool', 'weapon', 'armor', 'focus'];

// Get equipment sources
let packs = getPacksFromSettings("equipment");
let allEquipmentItemsFromPacks = [];

onMount(async () => {
  // Fetch full item data including system data
  const rawItems = await extractItemsFromPacksAsync(packs, [
    "name->label",
    "img",
    "type",
    "folder",
    "uuid->value",
    "_id"
  ], ["system.type", "system.magicalBonus", "system.properties"]);

  // Process items to only keep the needed system fields
  allEquipmentItemsFromPacks = rawItems.map(item => ({
    ...item,
    system: item.system ? {
      type: item.system.type,
      magicalBonus: item.system.magicalBonus,
      properties: item.system.properties
    } : undefined
  }));

  // window.GAS.log.d('EquipmentSelectorDetail mounted', { 
  //   configurableSelections, 
  //   equipmentByType,
  //   allEquipmentItemsFromPacks: allEquipmentItemsFromPacks.filter(item => item.type === 'focus')
  // });
});

const showPackLabelInSelect = game.settings.get(MODULE_ID, 'showPackLabelInSelect');

// Get the currently selected items that need configuration
$: configurableSelections = Object.values($equipmentSelections)
  .filter(group => {
    // Check if this is an AND group with configurable children
    if (group.selectedItem?.type === 'AND' && group.selectedItem.children) {
      // Only include AND groups that have children needing configuration AND are in progress
      return group.selectedItem.children.some(child => 
        CONFIGURABLE_TYPES.includes(child.type) && 
        (!group.granularSelections?.children?.[child._id]?.selections?.length || 
         group.granularSelections.children[child._id].selections.length < getRequiredSelectionsCount(child))
      ) && group.inProgress;
    }
    
    // Regular check for configurable items - only include if they need selection
    return group.selectedItem && 
           CONFIGURABLE_TYPES.includes(group.selectedItem.type) && 
           group.inProgress &&
           (!group.granularSelections?.self?.length ||
            group.granularSelections.self.length < getRequiredSelectionsCount(group.selectedItem));
  })
  .flatMap(group => {
    // If this is an AND group, create a config entry for each configurable child that needs selection
    if (group.selectedItem?.type === 'AND' && group.selectedItem.children) {
      return group.selectedItem.children
        .filter(child => 
          CONFIGURABLE_TYPES.includes(child.type) &&
          (!group.granularSelections?.children?.[child._id]?.selections?.length ||
           group.granularSelections.children[child._id].selections.length < getRequiredSelectionsCount(child))
        )
        .map(child => ({
          ...group,
          selectedItem: child,
          parentGroup: group
        }));
    }
    return [group];
  });

// Filter equipment items by type for each configurable selection
$: equipmentByType = configurableSelections.reduce((acc, group) => {
  const type = group.selectedItem.type;
  window.GAS.log.d('EQUIPMENT DETAIL | Equipment By Type:', { type, group });
  //- accumulate the items by group type
  if (!acc[type]) {
    acc[type] = allEquipmentItemsFromPacks
      .filter(item => {
        window.GAS.log.d('EQUIPMENT DETAIL | Item matches type:', item, item.type, type );
        if (item.type !== type) return false;
        if (item.type === 'weapon' && group.selectedItem?.key) {
          // Handle composite weapon types
          if (group.selectedItem.key === 'sim') {
            return ['simpleM', 'simpleR'].includes(item.system?.type?.value) && !item.system?.magicalBonus && !item.system.properties?.includes('mgc');
          }
          if (group.selectedItem.key === 'mar') {
            return ['martialM', 'martialR'].includes(item.system?.type?.value) && !item.system?.magicalBonus && !item.system.properties?.includes('mgc');
          }
          // Handle specific weapon types
          if (['martialM', 'martialR', 'simpleM', 'simpleR'].includes(group.selectedItem.key)) {
            return item.system?.type?.value === group.selectedItem.key && !item.system?.magicalBonus && !item.system.properties?.includes('mgc');
          }
          // Handle base item matching
          return item.system?.baseItem === group.selectedItem.key;
        }
        return true;
      })
      .sort((a, b) => a.label.localeCompare(showPackLabelInSelect ? b.compoundLabel : b.label));
  }
  return acc;
}, {});

function handleSelection(groupId, option, parentGroup) {
  window.GAS.log.d('EQUIPMENT DETAIL | Selection Change:', { groupId, option, parentGroup });
  const value = typeof option === 'object' ? option.value : option;
  if (parentGroup) {
    // For AND group children, use addChildGranularSelection with the uuid directly
    addChildGranularSelection(parentGroup.id, groupId, value);
  } else {
    // For regular selections, pass the uuid directly
    addGranularSelection(groupId, value);
  }
}

/**
 * @description Create a handler factory function
 * @why The handler can only accept the selected value as a parameter, 
 * so to pass the remaining parameters for the group, we need to create a factory function
 * which runs on mount and returns the handler function with the group details included
 * Then once selected, the handler is called with the selected value and the group details are included
 * @param {string} groupId - The id of the group
 * @param {object} parentGroup - The parent group
 * @returns {function} - The selection handler
 */
function createSelectionHandler(groupId, parentGroup) {
  return function selectionHandler(option) {
    handleSelection(groupId, option, parentGroup);
  }
}

// Add this function to handle cancel
function handleCancelSelection(group) {
  const groupId = group.parentGroup ? group.parentGroup.id : group.id;
  editGroup(groupId);
}
</script>

<template lang="pug">
section
  +if("configurableSelections.length > 0")
    +each("configurableSelections as group")
      .equipment-config-item
        .flexrow.justify-flexrow-vertical.no-wrap
          .flex0.relative
            img.icon(
              src="{getEquipmentIcon(group.selectedItem.type)}" 
              alt="{group.selectedItem.type}"
            )
          .flex2.left.name
            span {group.selectedItem.label}
          .flex0.right
            button.cancel-button(on:click!="{handleCancelSelection(group)}")
              i.fas.fa-times
        
        .equipment-select
          +if("group.parentGroup")
            IconSelect.mb-md.icon-select(
              options="{equipmentByType[group.selectedItem.type] || []}"
              active="{group.parentGroup.granularSelections?.children?.[group.selectedItem._id]?.selections?.[0]}"
              placeHolder="Select {group.selectedItem.type}"
              handler="{createSelectionHandler(group.id, group.parentGroup)}"
              id="equipment-select-{group.selectedItem._id}"
            )
          +if("!group.parentGroup")
            IconSelect.mb-md.icon-select(
              options="{equipmentByType[group.selectedItem.type] || []}"
              active="{group.granularSelections?.self?.[0]}"
              placeHolder="Select {group.selectedItem.type}"
              handler="{createSelectionHandler(group.id)}"
              id="equipment-select-{group.selectedItem._id}"
            )
</template>

<style lang="sass">

.empty-state
  text-align: center
  color: var(--color-text-dark-secondary)
  font-style: italic
  padding: 1rem

.equipment-type-section
  margin-bottom: 1.5rem
  
  &:last-child
    margin-bottom: 0

.type-header
  color: var(--color-text-highlight)
  border-bottom: 1px solid rgba(255, 255, 255, 0.1)
  padding-bottom: 0.5rem
  margin-bottom: 1rem

.equipment-config-item
  background: rgba(0, 0, 0, 0.3)
  border-radius: var(--border-radius)
  padding: 0.3rem 1rem
  margin-bottom: 0.3rem

  &:last-child
    margin-bottom: 0

.icon
  margin-right: 2rem
  border: none
  filter: brightness(1) drop-shadow(0 2px 3px rgba(0, 0, 0, 0.5))

.name
  font-size: 1.1em
  line-height: 32px
  color: var(--color-text-dark-primary)

// Configuration section styles
.tool-config,
.armor-config,
.weapon-config,
.focus-config
  margin-top: 0.3rem
  padding-top: 0.3rem
  border-top: 1px solid rgba(255, 255, 255, 0.1)

.equipment-select
  margin-top: 0.3rem
  padding-top: 0.3  rem
  border-top: 1px solid rgba(255, 255, 255, 0.1)

:global(.icon-select)
  position: relative

.cancel-button
  background: none
  border: none
  color: var(--color-text-dark-secondary)
  padding: 0.5rem
  cursor: pointer
  transition: color 0.2s ease

  &:hover
    color: var(--color-text-highlight)

  i
    font-size: 1.2em
</style>