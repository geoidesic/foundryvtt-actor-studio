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
    window.GAS.log.d('[EquipSelect DETAIL] Processing group:', {
      id: group.id,
      type: group.selectedItem?.type,
      inProgress: group.inProgress,
      hasSelectedItem: !!group.selectedItem,
      selectedItemType: group.selectedItem?.type,
      hasChildren: !!group.selectedItem?.children,
      granularSelections: group.granularSelections,
      parentType: group.selectedItem?.parent?.type,
      fullGroup: group
    });

    // Skip if no selected item
    if (!group.selectedItem) {
      window.GAS.log.d('[EquipSelect DETAIL] Skipping group - no selection:', {
        groupId: group.id
      });
      return false;
    }

    // For OR groups with selected AND children, check if the AND group needs configuration
    if (group.selectedItem.parent?.type === 'OR' && group.selectedItem.type === 'AND') {
      const hasConfigurableChildren = group.selectedItem.children?.some(child => {
        const isConfigurable = CONFIGURABLE_TYPES.includes(child.type);
        const childSelections = group.granularSelections?.children?.[child._id]?.selections;
        const requiredCount = getRequiredSelectionsCount(child);
        const needsSelection = !childSelections?.length || childSelections.length < requiredCount;
        
        window.GAS.log.d('[EquipSelect DETAIL] OR->AND child evaluation:', {
          childId: child._id,
          childType: child.type,
          isConfigurable,
          hasSelections: !!childSelections?.length,
          selectionCount: childSelections?.length,
          requiredCount,
          needsSelection
        });
        
        return isConfigurable && needsSelection;
      });

      window.GAS.log.d('[EquipSelect DETAIL] OR->AND group evaluation:', {
        groupId: group.id,
        hasConfigurableChildren,
        willInclude: hasConfigurableChildren
      });

      return hasConfigurableChildren;
    }

    // For direct OR group children that are configurable
    if (group.selectedItem.parent?.type === 'OR') {
      const isConfigurable = CONFIGURABLE_TYPES.includes(group.selectedItem.type);
      const selfSelections = group.granularSelections?.self;
      const requiredCount = getRequiredSelectionsCount(group.selectedItem);
      const needsSelection = !selfSelections?.length || selfSelections.length < requiredCount;

      window.GAS.log.d('[EquipSelect DETAIL] OR direct child evaluation:', {
        groupId: group.id,
        itemType: group.selectedItem.type,
        isConfigurable,
        hasSelections: !!selfSelections?.length,
        selectionCount: selfSelections?.length,
        requiredCount,
        needsSelection,
        willInclude: isConfigurable && needsSelection
      });

      return isConfigurable && needsSelection;
    }

    // Handle AND groups with configurable children
    if (group.selectedItem.type === 'AND' && group.selectedItem.children) {
      const hasConfigurableChildren = group.selectedItem.children.some(child => {
        const isConfigurable = CONFIGURABLE_TYPES.includes(child.type);
        const childSelections = group.granularSelections?.children?.[child._id]?.selections;
        const requiredCount = getRequiredSelectionsCount(child);
        const needsSelection = !childSelections?.length || childSelections.length < requiredCount;
        
        window.GAS.log.d('[EquipSelect DETAIL] AND group child evaluation:', {
          childId: child._id,
          childType: child.type,
          isConfigurable,
          hasSelections: !!childSelections?.length,
          selectionCount: childSelections?.length,
          requiredCount,
          needsSelection
        });
        
        return isConfigurable && needsSelection;
      });

      window.GAS.log.d('[EquipSelect DETAIL] AND group evaluation result:', {
        groupId: group.id,
        hasConfigurableChildren,
        willInclude: hasConfigurableChildren
      });

      return hasConfigurableChildren;
    }
    
    // Regular check for configurable items
    const isConfigurable = CONFIGURABLE_TYPES.includes(group.selectedItem.type);
    const selfSelections = group.granularSelections?.self;
    const requiredCount = getRequiredSelectionsCount(group.selectedItem);
    const needsSelection = !selfSelections?.length || selfSelections.length < requiredCount;
    
    window.GAS.log.d('[EquipSelect DETAIL] Regular item evaluation:', {
      groupId: group.id,
      isConfigurable,
      hasSelections: !!selfSelections?.length,
      selectionCount: selfSelections?.length,
      requiredCount,
      needsSelection,
      willInclude: isConfigurable && needsSelection
    });

    return isConfigurable && needsSelection;
  })
  .flatMap(group => {
    window.GAS.log.d('[EquipSelect DETAIL] Processing filtered group for flatMap:', {
      groupId: group.id,
      type: group.selectedItem?.type,
      hasChildren: !!group.selectedItem?.children,
      fullGroup: group
    });

    // If this is an AND group, create a config entry for each configurable child that needs selection
    if (group.selectedItem?.type === 'AND' && group.selectedItem.children) {
      const configurableChildren = group.selectedItem.children
        .filter(child => {
          const isConfigurable = CONFIGURABLE_TYPES.includes(child.type);
          const childSelections = group.granularSelections?.children?.[child._id]?.selections;
          const requiredCount = getRequiredSelectionsCount(child);
          const needsSelection = !childSelections?.length || childSelections.length < requiredCount;
          
          window.GAS.log.d('[EquipSelect DETAIL] AND group child in flatMap:', {
            childId: child._id,
            childType: child.type,
            isConfigurable,
            hasSelections: !!childSelections?.length,
            selectionCount: childSelections?.length,
            requiredCount,
            needsSelection,
            willInclude: isConfigurable && needsSelection,
            fullChild: child
          });
          
          return isConfigurable && needsSelection;
        })
        .map(child => {
          const result = {
            ...group,
            selectedItem: child,
            parentGroup: group
          };
          
          window.GAS.log.d('[EquipSelect DETAIL] Created child config entry:', {
            childId: child._id,
            parentGroupId: group.id,
            fullResult: result
          });
          
          return result;
        });

      window.GAS.log.d('[EquipSelect DETAIL] AND group flatMap result:', {
        groupId: group.id,
        childCount: configurableChildren.length,
        children: configurableChildren
      });

      return configurableChildren;
    }

    // For OR groups, ensure we process the selected item
    if (group.selectedItem.parent?.type === 'OR') {
      window.GAS.log.d('[EquipSelect DETAIL] OR group item in flatMap:', {
        groupId: group.id,
        itemType: group.selectedItem.type,
        isConfigurable: CONFIGURABLE_TYPES.includes(group.selectedItem.type)
      });
    }

    window.GAS.log.d('[EquipSelect DETAIL] Regular item flatMap result:', {
      groupId: group.id,
      fullGroup: group
    });

    return [group];
  });

$: window.GAS.log.d('[EquipSelect DETAIL] Final configurableSelections:', {
  count: configurableSelections.length,
  selections: configurableSelections
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
          window.GAS.log.d('EQUIPMENT DETAIL | Item matches type:', item, item.type, type );
          return item.type === type && item.system.type.value === group.selectedItem.key && !item.system.properties?.includes('mgc');
        }
        return true;
      })
      .sort((a, b) => a.label.localeCompare(showPackLabelInSelect ? b.compoundLabel : b.label));
  }
  return acc;
}, {});

function handleSelection(groupId, option, parentGroup) {
  window.GAS.log.d('[EquipSelect DETAIL] handleSelection ENTRY', {
    groupId,
    option,
    parentGroup,
    groupIdType: typeof groupId,
    optionType: typeof option,
    optionValue: typeof option === 'object' ? option.value : option
  });

  const value = typeof option === 'object' ? option.value : option;
  
  if (parentGroup) {
    window.GAS.log.d('[EquipSelect DETAIL] Calling addChildGranularSelection with:', {
      parentGroupId: parentGroup.id,
      childId: groupId,
      value,
      fullParentGroup: parentGroup,
      fullChildGroup: groupId
    });
    addChildGranularSelection(parentGroup.id, groupId._id, value);
  } else {
    window.GAS.log.d('[EquipSelect DETAIL] Calling addGranularSelection with:', {
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
  window.GAS.log.d('[EquipSelect DETAIL] Creating selection handler', {
    groupId,
    parentGroup,
    groupIdType: typeof groupId,
    hasParentGroup: !!parentGroup,
    groupIdValue: groupId,
    parentGroupValue: parentGroup
  });
  
  return function selectionHandler(option) {
    window.GAS.log.d('[EquipSelect DETAIL] Selection handler called', {
      groupId,
      option,
      parentGroup,
      optionType: typeof option,
      groupIdValue: groupId,
      parentGroupValue: parentGroup
    });
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
          .flex2.left.name.ml-sm
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
              handler="{createSelectionHandler(group.selectedItem, group.parentGroup)}"
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