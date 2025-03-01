<script>
import { getContext, onMount } from "svelte";
import { equipmentSelections, addGranularSelection, removeGranularSelection, getEquipmentIcon, initializeGroup, addChildGranularSelection, getRequiredSelectionsCount } from "~/src/stores/equipmentSelections";
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
  //- accumulate the items by group type
  if (!acc[type]) {
    acc[type] = allEquipmentItemsFromPacks
      .filter(item => {
        if (item.type !== type) return false;
        if (item.type === 'weapon' && group.selectedItem?.key) {
          if (['martialM', 'martialR', 'simpleM', 'simpleR'].includes(group.selectedItem.key)) {
            //- filter out magical items for starter equipment at level 1
            return item.system?.type?.value === group.selectedItem.key && !item.system?.magicalBonus && !item.system.properties?.includes('mgc');
          }
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

// Create a handler factory function
function createSelectionHandler(groupId, parentGroup) {
  return function selectionHandler(option) {
    handleSelection(groupId, option, parentGroup);
  }
}
</script>

<template lang="pug">
section.equipment-selector-detail
  .flexrow
    .flex3
      h2.left {localize('GAS.Equipment.ConfigureLabel')}
  
  +if("configurableSelections.length === 0")
    p.empty-state
      span {localize('GAS.Equipment.NoItemsToConfig')}

  +if("configurableSelections.length > 0")
    +each("configurableSelections as group")
      .equipment-config-item
        .flexrow.justify-flexrow-vertical.no-wrap
          .flex0.relative.icon
            img.icon(
              src="{getEquipmentIcon(group.selectedItem.type)}" 
              alt="{group.selectedItem.type}"
            )
          .flex2.left.name
            span {group.selectedItem.label}
        
        .equipment-select
          +if("group.parentGroup")
            IconSelect.mb-md.icon-select(
              options="{equipmentByType[group.selectedItem.type] || []}"
              active="{group.parentGroup.granularSelections?.children?.[group.selectedItem._id]?.selections?.[0]}"
              placeHolder="Select {group.selectedItem.type}"
              handler="{createSelectionHandler(group.selectedItem._id, group.parentGroup)}"
              id="equipment-select-{group.selectedItem._id}"
            )
          +if("!group.parentGroup")
            IconSelect.mb-md.icon-select(
              options="{equipmentByType[group.selectedItem.type] || []}"
              active="{group.granularSelections?.self?.[0]}"
              placeHolder="Select {group.selectedItem.type}"
              handler="{createSelectionHandler(group.selectedItem._id)}"
              id="equipment-select-{group.selectedItem._id}"
            )
</template>

<style lang="sass">
.equipment-selector-detail
  background: rgba(0, 0, 0, 0.2)
  border-radius: var(--border-radius)
  padding: 1rem
  height: 100%

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
  padding: 0.75rem
  margin-bottom: 0.75rem

  &:last-child
    margin-bottom: 0

.icon
  width: 32px
  height: 32px
  margin-right: 0.5rem
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
  margin-top: 0.75rem
  padding-top: 0.75rem
  border-top: 1px solid rgba(255, 255, 255, 0.1)

.equipment-select
  margin-top: 0.75rem
  padding-top: 0.75rem
  border-top: 1px solid rgba(255, 255, 255, 0.1)

:global(.icon-select)
  position: relative
</style>