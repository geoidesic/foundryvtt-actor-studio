<script>
import { getContext, onMount } from "svelte";
import { equipmentSelections, addGranularSelection, removeGranularSelection, getEquipmentIcon, initializeGroup } from "~/src/stores/equipmentSelections";
import { localize } from "#runtime/svelte/helper";
import IconSelect from "~/src/components/atoms/select/IconSelect.svelte";
import { extractItemsFromPacksAsync, getPacksFromSettings } from "~/src/helpers/Utility.js";
import { MODULE_ID } from "~/src/helpers/constants";

// Types that need additional configuration
const CONFIGURABLE_TYPES = ['tool', 'weapon', 'armor', 'focus'];

// Get equipment sources
let packs = getPacksFromSettings("equipment");
let allEquipmentItems = [];

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
  allEquipmentItems = rawItems.map(item => ({
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
  //   allEquipmentItems: allEquipmentItems.filter(item => item.type === 'focus')
  // });
});

const showPackLabelInSelect = game.settings.get(MODULE_ID, 'showPackLabelInSelect');

// Get the currently selected items that need configuration
$: configurableSelections = Object.values($equipmentSelections)
  .filter(group => {
    // Pass allEquipmentItems to the store for this group if not already present
    if (!group.allEquipmentItems) {
      initializeGroup(group.id, { ...group, allEquipmentItems });
    }
    
    // window.GAS.log.d('EQUIPMENT DETAIL | Filtering group:', { 
    //   group,
    //   hasSelectedItem: !!group.selectedItem,
    //   selectedItemType: group.selectedItem?.type,
    //   isConfigurable: group.selectedItem ? CONFIGURABLE_TYPES.includes(group.selectedItem.type) : false
    // });
    return group.selectedItem && 
           CONFIGURABLE_TYPES.includes(group.selectedItem.type) && 
           group.inProgress;
  });

// Filter equipment items by type for each configurable selection
$: equipmentByType = configurableSelections.reduce((acc, group) => {
  const type = group.selectedItem.type;
  // window.GAS.log.d('EQUIPMENT DETAIL | Building equipment by type:', {
  //   type,
  //   itemCount: allEquipmentItems.filter(item => item.type === type).length,
  //   group,
  // });
  if (!acc[type]) {
    acc[type] = allEquipmentItems
      .filter(item => {
        // Basic type filter
        // window.GAS.log.d('EQUIPMENT DETAIL | Filtering item:', item);
        // window.GAS.log.d('EQUIPMENT DETAIL | type mismatch:', item.type !== type);
        if (item.type !== type) return false;
        
        // window.GAS.log.d('EQUIPMENT DETAIL | type:', type);
        // window.GAS.log.d('EQUIPMENT DETAIL | group:', group);
        // Additional weapon type filter
        if (item.type === 'weapon' && group.selectedItem?.key) {
          // window.GAS.log.d('EQUIPMENT DETAIL | Weapon filtering');
          
          // For martial/simple weapons, check if the key matches the weapon type
          if (['martialM', 'martialR', 'simpleM', 'simpleR'].includes(group.selectedItem.key)) {
            // window.GAS.log.d('EQUIPMENT DETAIL | Martial/simple weapon:', item.system?.type?.value, group.selectedItem.key);
            // Match exactly against system.type.value
            return item.system?.type?.value === group.selectedItem.key && !item.system?.magicalBonus && !item.system.properties?.includes('mgc');
          }
          // For specific weapon types (like 'shortsword'), match exactly
          return item.system?.baseItem === group.selectedItem.key;
        }
        return true;
      })
      .sort((a, b) => a.label.localeCompare(showPackLabelInSelect ? b.compoundLabel : b.label));
  }
  return acc;
}, {});

function handleSelection(groupId, option) {
  window.GAS.log.d('EQUIPMENT DETAIL | Selection Change:', { groupId, option });
  addGranularSelection(groupId, option.uuid || option.value);
}

// Create a handler factory function
function createSelectionHandler(groupId) {
  return function selectionHandler(option) {
    handleSelection(groupId, option);
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
            img.icon(src="{getEquipmentIcon(group.selectedItem.type)}" alt="{group.selectedItem.type}")
          .flex2.left.name
            span {group.selectedItem.label}
        
        .equipment-select
          IconSelect.mb-md.icon-select(
            options="{equipmentByType[group.selectedItem.type] || []}"
            active="{group.granularSelections?.self?.[0]}"
            placeHolder="{`Select ${group.selectedItem.type}`}"
            handler="{createSelectionHandler(group.id)}"
            id="equipment-select-{group.id}"
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