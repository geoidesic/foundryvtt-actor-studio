<script>
import { getContext, onMount } from "svelte";
import { equipmentSelections, addGranularSelection, removeGranularSelection, getEquipmentIcon, initializeGroup, addChildGranularSelection, getRequiredSelectionsCount, editGroup } from "~/src/stores/equipmentSelections";
import { readOnlyTabs } from "~/src/stores/index";
import { localize } from "#runtime/svelte/helper";
import IconSelect from "~/src/components/atoms/select/IconSelect.svelte";
import { extractItemsFromPacksAsync, getPacksFromSettings } from "~/src/helpers/Utility.js";
import { MODULE_ID } from "~/src/helpers/constants";

// Types that need additional configuration
const CONFIGURABLE_TYPES = ['tool', 'weapon', 'armor', 'focus'];

// Check if equipment tab is readonly
$: isDisabled = $readOnlyTabs.includes("equipment");

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

  window.GAS.log.d('EquipmentSelectorDetail mounted', { 
    configurableSelections, 
    equipmentByType,
    allEquipmentItemsFromPacks: allEquipmentItemsFromPacks.filter(item => item.type === 'focus')
  });
});

const showPackLabelInSelect = game.settings.get(MODULE_ID, 'showPackLabelInSelect');

// Get the currently selected items that need configuration
$: configurableSelections = Object.values($equipmentSelections).filter(group => {
  // Log all groups for debugging
  window.GAS.log.d('[EquipmentSelectorDetail] Evaluating group', {
    groupId: group.id,
    groupType: group.type,
    hasSelectedItem: !!group.selectedItem,
    selectedItemType: group.selectedItem?.type,
    inProgress: group.inProgress,
    completed: group.completed
  });

  // Only include groups that have a selected item and are configurable
  if (!group.selectedItem || !group.inProgress) {
    return false;
  }

  // Debug logging for all groups being evaluated
  if (group.selectedItem && (CONFIGURABLE_TYPES.includes(group.selectedItem?.type) || group.selectedItem?.type === 'AND')) {
    window.GAS.log.d('[EquipmentSelectorDetail] Configurable group found', {
      groupId: group.id,
      selectedItemType: group.selectedItem.type,
      inProgress: group.inProgress,
      isAND: group.selectedItem.type === 'AND',
      hasConfigurableChildren: group.selectedItem?.type === 'AND' && 
        group.selectedItem?.children?.some(child => CONFIGURABLE_TYPES.includes(child.type))
    });
  }

  // Include groups that are directly configurable OR are AND groups with configurable children
  return CONFIGURABLE_TYPES.includes(group.selectedItem?.type) || 
         (group.selectedItem?.type === 'AND' && 
          group.selectedItem?.children?.some(child => CONFIGURABLE_TYPES.includes(child.type)));
}).flatMap(group => {
  // Handle AND groups with configurable children
  if (group.selectedItem?.type === 'AND' && group.selectedItem?.children) {
    window.GAS.log.d('[EquipSelect DETAIL] Processing AND group with children', {
      groupId: group.id,
      children: group.selectedItem.children.map(child => ({
        type: child.type,
        label: child.label,
        _id: child._id
      }))
    });
    
    return group.selectedItem.children
      .filter(child => CONFIGURABLE_TYPES.includes(child.type))
      .map(child => ({ ...group, selectedItem: child, parentGroup: group }));
  }

  // If this group has a parentGroup that's a string ID, resolve it to the actual group object
  if (group.parentGroup && typeof group.parentGroup === 'string') {
    const parentGroupObject = $equipmentSelections[group.parentGroup];
    window.GAS.log.d('[EquipmentSelectorDetail] Resolving parentGroup from string ID', {
      groupId: group.id,
      parentGroupId: group.parentGroup,
      parentGroupObject: parentGroupObject ? {
        id: parentGroupObject.id,
        type: parentGroupObject.type,
        label: parentGroupObject.label
      } : null,
      resolved: !!parentGroupObject
    });
    return [{ ...group, parentGroup: parentGroupObject }];
  }

  return [group];
});

// Filter equipment items by type for each configurable selection
$: equipmentByType = configurableSelections.reduce((acc, group) => {
  const type = group.selectedItem.type;
  //- accumulate the items by group type
  if (!acc[type]) {
    acc[type] = allEquipmentItemsFromPacks
      .filter(item => {
        if (type === 'weapon' && group.selectedItem?.key) {
          if (item.type !== type) return false;
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
        if(type === 'focus' && group.selectedItem?.key) {
          // window.GAS.log.d('EQUIPMENT DETAIL | Item matches type:', item, item.type, type );

          return item.system?.properties?.includes('foc') && !item.system.properties?.includes('mgc');
        }
        if(type === 'armor' && group.selectedItem?.key) {
          return item.system?.type?.value === group.selectedItem.key && !item.system.properties?.includes('mgc');
        }
        if(type === 'tool' && group.selectedItem?.key) {
          return item.type === type && item.system.type.value === group.selectedItem.key && !item.system.properties?.includes('mgc');
        }
        return true;
      })
      .sort((a, b) => a.label.localeCompare(showPackLabelInSelect ? b.compoundLabel : b.label));
  }
  return acc;
}, {});

$: if(configurableSelections.length > 0) {
  window.GAS.log.d('[EquipmentSelectorDetail] Configurable selections:', configurableSelections);
  window.scrollTo(0, 0);
  
  // Delay scrolling to ensure the element is rendered
  setTimeout(() => {
    const firstEquipmentSelect = document.querySelector('.equipment-select');
    if (firstEquipmentSelect) {
      firstEquipmentSelect.scrollIntoView({ behavior: 'smooth' });
    }
  }, 100); // Adjust the delay as necessary
}

function handleSelection(groupId, option, parentGroup) {
  window.GAS.log.d('[EquipmentSelectorDetail] handleSelection called', {
    groupId,
    groupIdType: typeof groupId,
    option,
    parentGroup: parentGroup ? {
      id: parentGroup.id,
      type: parentGroup.type
    } : null,
    hasParentGroup: !!parentGroup,
    willUseChildGranular: !!parentGroup
  });

  const value = typeof option === 'object' ? option.value : option;
  
  if (parentGroup) {
    window.GAS.log.d('[EquipmentSelectorDetail] Calling addChildGranularSelection', {
      parentGroupId: parentGroup.id,
      childId: groupId,
      value
    });
    addChildGranularSelection(parentGroup.id, groupId, value);
  } else {
    window.GAS.log.d('[EquipmentSelectorDetail] Calling addGranularSelection', {
      groupId,
      value
    });
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
  +if("configurableSelections.length > 0 && !isDisabled")
    +each("configurableSelections as group")
      .equipment-config-item
        .flexrow.justify-flexrow-vertical.no-wrap
          .flex0.relative
            img.icon(
              src="{getEquipmentIcon(group.selectedItem.type)}" 
              alt="{group.selectedItem.type}"
            )
          .flex2.left.name.ml-sm
            span {group.selectedItem.label}
          +if("!isDisabled")
            .flex0.right
              button.cancel-button(on:click!="{handleCancelSelection(group)}")
                i.fas.fa-times
        
        .equipment-select
          +if("group.parentGroup")
            IconSelect.mb-md.icon-select(
              options="{equipmentByType[group.selectedItem.type] || []}"
              active="{group.parentGroup.granularSelections?.children?.[group.id === group.parentGroup.id ? group.selectedItem._id : group.id]?.selections?.[0]}"
              placeHolder="Select {group.selectedItem.type}"
              handler="{createSelectionHandler(group.id === group.parentGroup.id ? group.selectedItem._id : group.id, group.parentGroup)}"
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