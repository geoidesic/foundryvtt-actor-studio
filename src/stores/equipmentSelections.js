import { writable, derived, get } from 'svelte/store';

// Store structure will track selections by group
// { 
//   groupId: { 
//     selectedItemId: string, 
//     selectedItem: object, 
//     completed: boolean, 
//     inProgress: boolean,
//     granularSelections: {
//       // For special types (tool, weapon, armor, focus)
//       self?: string[], // UUIDs from equipment packs
//       // For subgroups (AND/OR)
//       children?: {
//         [childId: string]: {
//           type: string, // The special type if any
//           selections: string[] // UUIDs from equipment packs
//         }
//       }
//     }
//   } 
// }
export const equipmentSelections = writable({});

const GRANULAR_TYPES = ['tool', 'weapon', 'armor', 'focus'];
const SUBGROUP_TYPES = ['AND', 'OR'];

export function getRequiredSelectionsCount(item) {
  return item.count || 1;
}

export function getEquipmentItemClasses(group, item, disabled) {
  const classes = [];
  
  // Add 'selected' class for linked items OR if the group is completed
  if (item.type === 'linked' || group.completed) {
    classes.push('selected');
  }
  
  if (item.type === 'focus') classes.push('focus');
  if (disabled) classes.push('disabled');
  if (group.inProgress && item.type !== 'linked') classes.push('in-progress');
  
  // Debug logging for musical instrument item
  if (item.type === 'tool') {
    window.GAS.log.d('[getEquipmentItemClasses] Tool item classes:', {
      itemId: item._id,
      itemType: item.type,
      itemLabel: item.label,
      groupId: group.id,
      groupCompleted: group.completed,
      groupInProgress: group.inProgress,
      finalClasses: classes,
      hasGranularSelections: !!group.granularSelections,
      granularSelections: group.granularSelections
    });
  }
  
  return classes.join(' ');
}

export function getOptionClasses(disabled, group, item) {
  const classes = [];
  if (group.selectedItemId === item._id) classes.push('selected');
  if (isOptionDisabled(disabled, group, item)) classes.push('disabled');
  if (group.completed) classes.push('completed');
  if (group.inProgress && !isOptionDisabled(disabled, group, item)) classes.push('in-progress');
  return classes.join(' ');
}

export function isOptionDisabled(disabled, group, item) {
  return disabled || (group.inProgress && group.selectedItemId && group.selectedItemId !== item._id);
}


export function handleSelection(disabled, groupId, item) {
  const selections = get(equipmentSelections);

  window.GAS.log.d('[StartingEquipment] handleSelection ENTRY', {
    groupId,
    itemDetails: {
      id: item?._id,
      type: item?.type,
      label: item?.label
    },
    groupState: {
      type: selections[groupId]?.type,
      inProgress: selections[groupId]?.inProgress,
      completed: selections[groupId]?.completed,
      selectedItem: selections[groupId]?.selectedItem,
      items: selections[groupId]?.items?.map(i => ({
        id: i._id,
        type: i.type,
        isAND: i.type === 'AND'
      }))
    }
  });

  if (disabled) return;

  const group = selections[groupId];

  window.GAS.log.d('[StartingEquipment] Group evaluation', {
    isStandalone: group?.type === 'standalone',
    hasItems: !!group?.items?.length,
    firstItemType: group?.items?.[0]?.type,
    isFirstItemAND: group?.items?.[0]?.type === 'AND',
    isChoiceGroup: group?.type === 'choice'
  });

  // For standalone groups with AND items
  if (group?.type === 'standalone' && group.items[0]?.type === 'AND') {
    window.GAS.log.d('[StartingEquipment] Handling standalone AND group', {
      andItemDetails: {
        id: group.items[0]._id,
        children: group.items[0].children?.map(c => ({
          id: c._id,
          type: c.type,
          label: c.label
        }))
      },
      currentGranularSelections: group.granularSelections
    });
    selectEquipment(groupId, group.items[0]._id);
  }
  // For choice groups
  else if (group?.type === 'choice') {
    window.GAS.log.d('[StartingEquipment] Handling choice group', {
      groupId,
      selectedItemId: item._id,
      selectedItemType: item.type,
      isSelectedItemAND: item.type === 'AND',
      groupItems: group.items.map(i => ({
        id: i._id,
        type: i.type
      }))
    });
    selectEquipment(groupId, item._id);
  }
}

function needsGranularSelection(item) {
  return GRANULAR_TYPES.includes(item.type) || SUBGROUP_TYPES.includes(item.type);
}

// Add this function to check if an item requires multiple selections
export function getRequiredSelections(item) {
  // If the item has a count > 1 and is not an AND type, it requires multiple selections
  return item.count > 1 && item.type !== 'AND' ? item.count : 1;
}

// Helper functions to manage selections
export function selectEquipment(groupId, itemId) {
  window.GAS.log.d('SELECT EQUIPMENT | Entry', {
    groupId,
    itemId,
    currentState: get(equipmentSelections)
  });

  equipmentSelections.update(state => {
    const group = state[groupId];
    if (!group) return state;

    // Prevent additional selections if:
    // 1. The group is completed and not being edited
    // 2. The group has a selected item and is in progress (handling granular selection)
    if ((group.completed && !group.inProgress) ||
      (group.selectedItemId && group.inProgress)) {
      return state;
    }

    const selectedItem = group.items.find(i => i._id === itemId);
    if (!selectedItem) return state;

    window.GAS.log.d('SELECT EQUIPMENT | Processing selection', {
      selectedItem,
      isAND: selectedItem.type === 'AND',
      hasGranularChildren: selectedItem.type === 'AND' &&
        selectedItem.children?.some(child => GRANULAR_TYPES.includes(child.type))
    });

    // For granular types (weapon, armor, tool, focus), keep the group in progress
    if (GRANULAR_TYPES.includes(selectedItem.type)) {
      window.GAS.log.d('SELECT EQUIPMENT | Granular type selection', {
        type: selectedItem.type,
        groupId,
        itemId
      });

      return {
        ...state,
        [groupId]: {
          ...group,
          selectedItemId: itemId,
          selectedItem,
          completed: false,
          inProgress: true,
          granularSelections: { self: [], children: {} } // Reset granular selections
        }
      };
    }

    // Find next group for progression
    const sortedGroups = Object.values(state)
      .sort((a, b) => (a.sort || 0) - (b.sort || 0));
    const nextGroup = sortedGroups.find(g =>
      !g.completed && g.id !== groupId
    );

    // For regular linked items or AND groups, use the original simple selection logic
    if (selectedItem.type === 'linked' || selectedItem.type === 'AND') {
      const hasGranularChildren = selectedItem.type === 'AND' &&
        selectedItem.children?.some(child => GRANULAR_TYPES.includes(child.type));

      window.GAS.log.d('SELECT EQUIPMENT | AND/linked processing', {
        type: selectedItem.type,
        hasGranularChildren,
        children: selectedItem.children
      });

      return {
        ...state,
        [groupId]: {
          ...group,
          selectedItemId: itemId,
          selectedItem,
          completed: !hasGranularChildren,
          inProgress: hasGranularChildren,
          granularSelections: hasGranularChildren ? { self: [], children: {} } : null // Reset granular selections for AND groups
        },
        ...((!hasGranularChildren && nextGroup) ? {
          [nextGroup.id]: {
            ...nextGroup,
            inProgress: true
          }
        } : {})
      };
    }

    // For granular children in an AND group
    if (group.selectedItem?.type === 'AND' && GRANULAR_TYPES.includes(selectedItem.type)) {
      window.GAS.log.d('SELECT EQUIPMENT | Granular child in AND group', {
        groupId,
        selectedItem,
        parentGroup: group
      });

      // Keep the group in progress and maintain the current selectedItem (the AND group)
      return {
        ...state,
        [groupId]: {
          ...group,
          inProgress: true,
          completed: false
        }
      };
    }

    // For weapon/armor/tool selections that need multiple of the same item
    if (selectedItem.count > 1 && GRANULAR_TYPES.includes(selectedItem.type)) {
      if (!group.selectedItemId) {
        // First selection
        return {
          ...state,
          [groupId]: {
            ...group,
            selectedItemId: itemId,
            selectedItem,
            inProgress: true,
            completed: false,
            remainingSelections: selectedItem.count - 1,
            selections: [{ itemId, count: 1 }],
            granularSelections: { self: [], children: {} } // Reset granular selections
          }
        };
      }

      // Subsequent selections
      const selections = [...(group.selections || [])];
      const existingSelection = selections.find(s => s.itemId === itemId);

      if (existingSelection) {
        existingSelection.count++;
      } else {
        selections.push({ itemId, count: 1 });
      }

      const remainingSelections = group.remainingSelections - 1;
      const completed = remainingSelections === 0;

      return {
        ...state,
        [groupId]: {
          ...group,
          selections,
          remainingSelections,
          completed,
          inProgress: !completed
        },
        ...(completed && nextGroup ? {
          [nextGroup.id]: {
            ...nextGroup,
            inProgress: true
          }
        } : {})
      };
    }

    // Default case - single selection
    return {
      ...state,
      [groupId]: {
        ...group,
        selectedItemId: itemId,
        selectedItem,
        completed: true,
        inProgress: false,
        granularSelections: null // Reset granular selections
      },
      ...(nextGroup ? {
        [nextGroup.id]: {
          ...nextGroup,
          inProgress: true
        }
      } : {})
    };
  });
}

export const flattenedSelections = derived(equipmentSelections, ($equipmentSelections) => {
  const result = Object.values($equipmentSelections)
    .filter(group => {
      const hasSelection = !!group.selectedItem || group.type === 'standalone';
      window.GAS.log.d('[FlattenedSelections] Group filtering', {
        groupId: group.id,
        type: group.type,
        hasSelection,
        items: group.items
      });
      return hasSelection;
    })
    .flatMap(group => {
      window.GAS.log.d('[FlattenedSelections] Processing group', {
        groupId: group.id,
        groupType: group.type,
        items: group.items?.map(item => ({
          id: item._id,
          type: item.type,
          key: item.key,
          count: item.count,
          isAND: item.type === 'AND',
          children: item.type === 'AND' ? item.children?.map(c => ({
            id: c._id,
            type: c.type,
            key: c.key,
            count: c.count
          })) : null
        })),
        selectedItem: group.selectedItem,
        granularSelections: group.granularSelections
      });

      const selections = [];

      // For standalone groups, process all items
      if (group.type === 'standalone') {
        group.items.forEach(item => {
          // If it's an AND group, process its children
          if (item.type === 'AND') {
            window.GAS.log.d('[FlattenedSelections] Processing AND item in standalone', {
              itemId: item._id,
              children: item.children
            });

            item.children.forEach(child => {
              if (child.type === 'linked') {
                // For linked children, add them directly
                const count = child.count || 1;
                for (let i = 0; i < count; i++) {
                  selections.push({
                    type: child.type,
                    key: child.key
                  });
                }
              } else if (GRANULAR_TYPES.includes(child.type)) {
                // For configurable children, check granular selections
                const childSelections = group.granularSelections?.children?.[child._id]?.selections || [];
                childSelections.forEach(uuid => {
                  selections.push({
                    type: child.type,
                    key: uuid
                  });
                });
              }
            });
          } else if (item.type === 'linked') {
            // Handle regular linked items
            const count = item.count || 1;
            for (let i = 0; i < count; i++) {
              selections.push({
                type: item.type,
                key: item.key
              });
            }
          }
        });

        window.GAS.log.d('[FlattenedSelections] Standalone group selections', {
          groupId: group.id,
          selections: selections.map(s => ({
            type: s.type,
            key: s.key
          }))
        });

        return selections;
      }

      // For choice groups with a selected item
      if (group.selectedItem) {
        if (GRANULAR_TYPES.includes(group.selectedItem.type)) {
          if (group.granularSelections?.self?.length) {
            group.granularSelections.self.forEach(uuid => {
              selections.push({
                type: group.selectedItem.type,
                key: uuid
              });
            });
          }
        } else if (group.selectedItem.type === 'linked') {
          const count = group.selectedItem.count || 1;
          for (let i = 0; i < count; i++) {
            selections.push({
              type: group.selectedItem.type,
              key: group.selectedItem.key
            });
          }
        } else if (group.selectedItem.type === 'AND') {
          // Process AND group children
          group.selectedItem.children.forEach(child => {
            if (child.type === 'linked') {
              // For linked children, add them directly
              const count = child.count || 1;
              for (let i = 0; i < count; i++) {
                selections.push({
                  type: child.type,
                  key: child.key
                });
              }
            } else if (GRANULAR_TYPES.includes(child.type)) {
              // For configurable children, check granular selections
              const childSelections = group.granularSelections?.children?.[child._id]?.selections || [];
              childSelections.forEach(uuid => {
                selections.push({
                  type: child.type,
                  key: uuid
                });
              });
            }
          });
        }
        return selections;
      }

      return [];
    });

  window.GAS.log.d('[FlattenedSelections] Final flattened result', {
    resultCount: result.length,
    items: result.map(item => ({
      type: item.type,
      key: item.key
    }))
  });

  return result;
});

// Add granular selection for special types
export function addGranularSelection(groupId, uuid) {
  equipmentSelections.update(selections => {
    const group = selections[groupId];
    if (!group?.selectedItem) return selections;

    // Initialize granularSelections if it doesn't exist
    const currentGranularSelections = group.granularSelections || { self: [], children: {} };

    const updatedSelections = {
      ...currentGranularSelections,
      self: [...(currentGranularSelections.self || []), uuid]
    };

    const isComplete = updatedSelections.self.length >= getRequiredSelectionsCount(group.selectedItem);

    // Find next group if complete
    const sortedGroups = Object.values(selections)
      .sort((a, b) => (a.sort || 0) - (b.sort || 0));
    const nextGroup = isComplete ? sortedGroups.find(g =>
      !g.completed && g.id !== groupId
    ) : null;

    return {
      ...selections,
      [groupId]: {
        ...group,
        granularSelections: updatedSelections,
        completed: isComplete,
        inProgress: !isComplete
      },
      ...(nextGroup ? {
        [nextGroup.id]: {
          ...nextGroup,
          inProgress: true
        }
      } : {})
    };
  });
}

// Add granular selection for subgroup children
export function addChildGranularSelection(groupId, childId, uuid) {
  window.GAS.log.d('AND GROUP DEBUG | addChildGranularSelection called:', {
    groupId,
    childId,
    uuid,
    currentStore: get(equipmentSelections)
  });

  equipmentSelections.update(selections => {
    const group = selections[groupId];
    window.GAS.log.d('AND GROUP DEBUG | Current group state:', {
      group,
      selectedItem: group?.selectedItem,
      children: group?.selectedItem?.children,
      granularSelections: group?.granularSelections
    });

    if (!group?.selectedItem) return selections;

    const childItem = group.selectedItem.children?.find(c => c._id === childId);
    window.GAS.log.d('AND GROUP DEBUG | Found child item:', {
      childItem,
      allChildren: group.selectedItem.children
    });

    if (!childItem) return selections;

    // Initialize the granular selections structure if it doesn't exist
    const currentGranularSelections = group.granularSelections || { self: [], children: {} };
    window.GAS.log.d('AND GROUP DEBUG | Current granular selections:', currentGranularSelections);

    const updatedSelections = {
      ...currentGranularSelections,
      children: {
        ...currentGranularSelections.children,
        [childId]: {
          type: childItem.type,
          selections: [uuid]
        }
      }
    };

    window.GAS.log.d('AND GROUP DEBUG | Updated selections:', updatedSelections);

    // For AND types, check if all children that need selections have them
    const isComplete = group.selectedItem.type === 'AND' ?
      group.selectedItem.children.every(child => {
        const needsSelection = GRANULAR_TYPES.includes(child.type);
        const childSelections = updatedSelections.children?.[child._id]?.selections || [];
        const hasEnoughSelections = childSelections.length >= getRequiredSelectionsCount(child);

        window.GAS.log.d('AND GROUP DEBUG | addChildGranularSelection completion check for child', {
          childId: child._id,
          childType: child.type,
          needsSelection,
          selections: childSelections,
          required: getRequiredSelectionsCount(child),
          hasEnough: hasEnoughSelections
        });

        return !needsSelection || hasEnoughSelections;
      }) : false;

    const stillInProgress = group.selectedItem.type === 'AND' ?
      group.selectedItem.children.some(child =>
        GRANULAR_TYPES.includes(child.type) &&
        (!updatedSelections.children?.[child._id]?.selections?.length ||
          updatedSelections.children[child._id].selections.length < getRequiredSelectionsCount(child))
      ) : false;

    window.GAS.log.d('AND GROUP DEBUG | addChildGranularSelection completion status', {
      isComplete,
      stillInProgress,
      groupType: group.selectedItem.type
    });

    // Find next group if complete
    const sortedGroups = Object.values(selections)
      .sort((a, b) => (a.sort || 0) - (b.sort || 0));
    const nextGroup = isComplete ? sortedGroups.find(g =>
      !g.completed && g.id !== groupId
    ) : null;

    const result = {
      ...selections,
      [groupId]: {
        ...group,
        granularSelections: updatedSelections,
        completed: isComplete,
        inProgress: stillInProgress
      },
      ...(nextGroup ? {
        [nextGroup.id]: {
          ...nextGroup,
          inProgress: true
        }
      } : {})
    };

    window.GAS.log.d('AND GROUP DEBUG | addChildGranularSelection final state', result);

    return result;
  });
}

// Remove granular selection (works for both special types and subgroup children)
export function removeGranularSelection(groupId, uuid, childId = null) {
  equipmentSelections.update(selections => {
    const group = selections[groupId];
    if (!group?.selectedItem) return selections;

    let updatedSelections;
    if (childId) {
      // Remove from child selections
      updatedSelections = {
        ...group.granularSelections,
        children: {
          ...group.granularSelections.children,
          [childId]: {
            ...group.granularSelections.children[childId],
            selections: group.granularSelections.children[childId].selections.filter(id => id !== uuid)
          }
        }
      };
    } else {
      // Remove from self selections
      updatedSelections = {
        ...group.granularSelections,
        self: (group.granularSelections.self || []).filter(id => id !== uuid)
      };
    }

    return {
      ...selections,
      [groupId]: {
        ...group,
        granularSelections: updatedSelections,
        completed: false,
        inProgress: true
      }
    };
  });
}

/**
 * Initializes or updates a group in the equipmentSelections store.
 *
 * @param {string} groupId - The unique identifier for the group.
 * @param {object} groupData - The data describing the group (type, items, etc).
 */
// Helper function to flatten single-child OR groups
function flattenSingleChildORs(items) {
  const result = items.map(item => {
    
    if (item.type === 'OR' && item.children && Array.isArray(item.children) && item.children.length === 1) {
      // Flatten single-child OR - return the child instead
      const child = item.children[0];
      
      // Only flatten if the child is valid
      if (child && typeof child === 'object') {
        const flattened = {
          ...child,
          // Preserve the original OR's _id if child doesn't have one
          _id: child._id || item._id,
          // Use the child's label, or fallback to the OR's label if child has no label
          label: child.label || item.label,
          // IMPORTANT: Preserve the OR's group, not the child's group
          // This ensures the flattened item stays in the correct parent group
          group: item.group,
          // If the child is an AND, flatten its children too
          children: child.children ? flattenSingleChildORs(child.children) : undefined
        };
        
        return flattened;
      }
    }
    
    if (item.type === 'AND' && item.children) {
      // Recursively flatten children in AND groups
      const processed = {
        ...item,
        children: flattenSingleChildORs(item.children)
      };
      
      return processed;
    }
    
    return item;
  });
  
  return result;
}

export function initializeGroup(groupId, groupData) {
  equipmentSelections.update(selections => {
    // Flatten single-child OR groups before processing
    const ENABLE_FLATTENING = true; // Enable to fix single-child OR display
    
    const flattenedGroupData = ENABLE_FLATTENING ? {
      ...groupData,
      items: flattenSingleChildORs(groupData.items)
    } : groupData;
    
    // Force re-initialization when flattening is enabled to apply the flattening
    const needsInitialization = !selections[groupId] || 
      ENABLE_FLATTENING ||
      JSON.stringify(selections[groupId].items) !== JSON.stringify(flattenedGroupData.items);
    
    // Only initialize if group doesn't exist or its items have changed
    if (needsInitialization) {
      // Check if any existing CHOICE group is in progress
      // Standalone groups can all be in progress simultaneously, but only one choice group at a time
      const hasChoiceGroupInProgress = Object.values(selections).some(group =>
        group.type === 'choice' && (!group.completed || group.inProgress)
      );

      // For standalone groups, check if all items are fixed (type 'linked')
      // If so, the group can be auto-completed without user input
      const isAutoComplete = flattenedGroupData.type === 'standalone' &&
        flattenedGroupData.items.reduce((canAutoComplete, item) => {
          if (!canAutoComplete) return false; // Short circuit if already false
          
          if (item.type === 'linked') return true;
          
          if (item.type === 'AND' || item.type === 'OR') {
            // For AND/OR groups, all children must also be 'linked' to auto-complete
            return item.children.reduce((childCanAutoComplete, child) => {
              if (!childCanAutoComplete) return false;
              return child.type === 'linked';
            }, true);
          }
          
          return false;
        }, true);

      // If this group auto-completes, find the next incomplete group (by sort order)
      const nextGroup = isAutoComplete ?
        Object.values(selections)
          .sort((a, b) => (a.sort || 0) - (b.sort || 0))
          .find(g => !g.completed) : null;

      // Determine if this group should be in progress
      let shouldBeInProgress;
      if (isAutoComplete) {
        shouldBeInProgress = false; // Auto-complete groups are not in progress
      } else if (flattenedGroupData.type === 'standalone') {
        shouldBeInProgress = true; // Standalone groups are always in progress (visible)
      } else if (flattenedGroupData.type === 'choice') {
        shouldBeInProgress = !hasChoiceGroupInProgress; // Only one choice group in progress at a time
      } else {
        shouldBeInProgress = false; // Default fallback
      }

      // Return the updated selections object, initializing or updating this group
      // If auto-complete, set selectedItem and mark as completed
      // If auto-complete, also set the next group as inProgress
      return {
        ...selections,
        [groupId]: {
          id: groupId,
          ...flattenedGroupData,
          selectedItemId: isAutoComplete ? flattenedGroupData.items[0]._id : null,
          selectedItem: isAutoComplete ? flattenedGroupData.items[0] : null,
          completed: isAutoComplete,
          inProgress: shouldBeInProgress,
          granularSelections: null
        },
        ...(nextGroup && isAutoComplete ? {
          [nextGroup.id]: {
            ...nextGroup,
            inProgress: true
          }
        } : {})
      };
    }
    // If the group already exists and items haven't changed, return selections unchanged
    return selections;
  });
}

export function setGroupInProgress(groupId) {
  equipmentSelections.update(selections => {
    // First, set all groups to not in progress
    const updatedSelections = Object.entries(selections).reduce((acc, [id, group]) => ({
      ...acc,
      [id]: { ...group, inProgress: false }
    }), {});

    // Then set the target group to in progress
    if (updatedSelections[groupId]) {
      updatedSelections[groupId] = {
        ...updatedSelections[groupId],
        inProgress: true
      };
    }

    return updatedSelections;
  });
}

export function editGroup(groupId) {
  equipmentSelections.update(selections => {
    // First, set all groups to not in progress
    const updatedSelections = Object.entries(selections).reduce((acc, [id, group]) => ({
      ...acc,
      [id]: { ...group, inProgress: false }
    }), {});

    // Then set the target group to in progress and incomplete, and reset all selections
    if (updatedSelections[groupId]) {
      updatedSelections[groupId] = {
        ...updatedSelections[groupId],
        inProgress: true,
        completed: false,
        selectedItemId: null,
        selectedItem: null,
        granularSelections: null  // Reset granular selections
      };
    }

    return updatedSelections;
  });
}


// Helper function to check if a group belongs to a specific equipment source
export function isGroupFromSource(group, sourceEquipment) {
  if (!group?.items?.length || !sourceEquipment?.length) return false;

  window.GAS.log.d(`[isGroupFromSource] Checking group ${group.id}:`, {
    groupItems: group.items.map(item => ({
      id: item._id,
      type: item.type,
      hasChildren: !!item.children?.length,
      childrenCount: item.children?.length || 0
    })),
    sourceEquipment: sourceEquipment.map(item => ({
      id: item._id,
      type: item.type,
      group: item.group
    }))
  });

  // Check if any of the group's items match items from the source equipment
  const matches = group.items.some((groupItem) => {
    // If this is an AND/OR item, check its children
    if (groupItem.type === 'AND' || groupItem.type === 'OR') {
      return groupItem.children?.some(child => 
        sourceEquipment.some(sourceItem => 
          child._id === sourceItem._id ||
          (child.group && sourceItem._id === child.group)
        )
      );
    }
    
    // For direct items, check as before
    return sourceEquipment.some(
      (sourceItem) =>
        groupItem._id === sourceItem._id ||
        (groupItem.group && sourceItem._id === groupItem.group),
    );
  });

  window.GAS.log.d(`[isGroupFromSource] Result for group ${group.id}:`, matches);
  return matches;
}

export function isGroupNonEditable(group) {
  // Check if it's a standalone group and all items are linked type
  window.GAS.log.d('isGroupNonEditable', group);
  return (
    group.type === "standalone" &&
    group.items.every((item) => {
      if (item.type === "linked") return true;
      if (item.type === "AND" || item.type === "OR") {
        return item.children.every((child) => child.type === "linked");
      }
      return false;
    })
  );
}

export function isGroupEditable(group) {
  // Encapsulate both conditions: group must not be in progress AND must be editable
  return !group.inProgress && !isGroupNonEditable(group);
}

export function matchingGroupsForSource(sortedGroups, sourceGroup) {
  if (!sourceGroup || !sourceGroup.equipment) return [];
  return sortedGroups.filter(
    (g) =>
      (g.completed || g.inProgress) &&
      isGroupFromSource(g, sourceGroup.equipment) &&
      Array.isArray(g.items) &&
      g.items.length > 0,
  );
}

export function clearEquipmentSelections() {
  equipmentSelections.set({});
}

// Add getEquipmentIcon function to the store
export function getEquipmentIcon(type) {
  switch (type) {
    case 'armor':
      return 'icons/svg/shield.svg';
    case 'weapon':
      return 'icons/svg/sword.svg';
    case 'tool':
      return 'icons/svg/padlock.svg';
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

// Add to the store's state
const selectedItemsData = writable({});

// Add the function to update selected item data
async function updateSelectedItemData(groupId, selection) {
  if (!selection?.granularSelections?.self?.[0]) return;
  const itemData = await fromUuid(selection.granularSelections.self[0]);
  if (itemData) {
    selectedItemsData.update(data => ({
      ...data,
      [groupId]: itemData
    }));
  }
}

// Create a derived store that returns the actual data object
export const selectedItems = derived(equipmentSelections, ($equipmentSelections, set) => {
  // Get current value of selectedItemsData
  let currentData = {};
  selectedItemsData.subscribe(value => currentData = value)();

  // Update data for each group
  Object.entries($equipmentSelections).forEach(([groupId, group]) => {
    updateSelectedItemData(groupId, group);
  });

  // Return current data
  set(currentData);

  // Update when selectedItemsData changes
  return selectedItemsData.subscribe(value => set(value));
}); 