import { writable, derived, get } from 'svelte/store';
import { characterClass, background } from './storeDefinitions';
import { parsedEquipmentGold, updateGoldFromEquipmentChoice, clearEquipmentGoldChoices } from './equipmentGold';

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
  
  // Check if this item needs granular selection
  const needsGranular = GRANULAR_TYPES.includes(item.type);
  
  // Add 'selected' class for:
  // - linked items (always selected)
  // - completed group items that don't need granular selection
  // - granular items that have been configured (have granular selections)
  if (item.type === 'linked' || 
      (group.completed && !needsGranular) ||
      (needsGranular && group.granularSelections?.children?.[item._id]?.selections?.length > 0)) {
    classes.push('selected');
  }
  
  // Add 'in-progress' class for granular items that need configuration
  if (needsGranular && group.selectedItem?.type === 'AND' && 
      (!group.granularSelections?.children?.[item._id]?.selections?.length)) {
    classes.push('in-progress');
  }
  
  if (item.type === 'focus') classes.push('focus');
  if (disabled) classes.push('disabled');
  
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

  window.GAS.log.d('[handleSelection] Entry', {
    groupId,
    itemType: item?.type,
    itemLabel: item?.label,
    groupType: selections[groupId]?.type,
    isChoiceGroup: selections[groupId]?.type === 'choice'
  });

  if (disabled || !item) {
    return;
  }

  // Handle choice groups
  if (selections[groupId]?.type === 'choice') {
    window.GAS.log.d('[handleSelection] Processing choice group selection', {
      groupId,
      selectedItemType: item.type,
      selectedItemLabel: item.label,
      isToolType: item.type === 'tool'
    });
    
    selectEquipment(groupId, item._id);
    return;
  }

  window.GAS.log.d('[StartingEquipment] handleSelection ENTRY', {
    groupId,
    itemDetails: {
      id: item?._id,
      type: item?.type,
      label: item?.label,
      key: item?.key,
      fullItem: item
    },
    groupState: {
      type: selections[groupId]?.type,
      inProgress: selections[groupId]?.inProgress,
      completed: selections[groupId]?.completed,
      selectedItem: selections[groupId]?.selectedItem,
      items: selections[groupId]?.items?.map(i => ({
        id: i._id,
        type: i.type,
        key: i.key,
        label: i.label,
        isAND: i.type === 'AND'
      }))
    },
    disabled,
    isToolType: item?.type === 'tool'
  });

  if (disabled) {
    window.GAS.log.d('[StartingEquipment] Selection disabled, returning early');
    return;
  }

  const group = selections[groupId];

  if (!group) {
    window.GAS.log.d('[StartingEquipment] No group found for groupId:', groupId);
    return;
  }

  window.GAS.log.d('[StartingEquipment] Group evaluation', {
    isStandalone: group?.type === 'standalone',
    hasItems: !!group?.items?.length,
    firstItemType: group?.items?.[0]?.type,
    isFirstItemAND: group?.items?.[0]?.type === 'AND',
    isChoiceGroup: group?.type === 'choice',
    selectedItemType: item?.type,
    willCallSelectEquipment: true
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
      currentGranularSelections: group.granularSelections,
      clickedItem: item
    });
    
    // If a specific granular item (tool, weapon, armor, focus) was clicked, handle it directly
    if (item && GRANULAR_TYPES.includes(item.type)) {
      window.GAS.log.d('[StartingEquipment] Granular item clicked in AND group', {
        itemType: item.type,
        itemId: item._id,
        itemLabel: item.label,
        willSelectANDGroupFirst: true
      });
      
      // First, ensure the AND group is selected
      if (!group.selectedItemId) {
        selectEquipment(groupId, group.items[0]._id);
      }
      
      // Then handle the granular item selection
      // This will be handled by the granular selection UI
      return;
    }
    
    // For non-granular items or general AND group selection
    selectEquipment(groupId, group.items[0]._id);
  }
  // For choice groups
  else if (group?.type === 'choice') {
    window.GAS.log.d('[StartingEquipment] Handling choice group', {
      groupId,
      selectedItemId: item._id,
      selectedItemType: item.type,
      selectedItemKey: item.key,
      selectedItemLabel: item.label,
      isSelectedItemAND: item.type === 'AND',
      isSelectedItemTool: item.type === 'tool',
      groupItems: group.items.map(i => ({
        id: i._id,
        type: i.type,
        key: i.key,
        label: i.label
      })),
      aboutToCallSelectEquipment: true
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
        itemId,
        groupType: group.type,
        isChoiceGroup: group.type === 'choice',
        willStayInProgress: true
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

      const newState = {
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
        } : {}),
        // When completing an AND group, also activate any OR choice groups that depend on it
        ...(!hasGranularChildren ? Object.values(state).reduce((acc, otherGroup) => {
          if (otherGroup.type === 'choice' && otherGroup.parentGroup === groupId) {
            acc[otherGroup.id] = {
              ...otherGroup,
              inProgress: true
            };
          }
          return acc;
        }, {}) : {})
      };

      // Update gold for variable gold equipment choices when AND group is completed
      if (!hasGranularChildren) {
        updateGoldForEquipmentChoice(groupId, selectedItem);
      }

      return newState;
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
    const newState = {
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

    // Update gold for variable gold equipment choices
    updateGoldForEquipmentChoice(groupId, selectedItem);

    return newState;
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
          let granularSelections = [];
          
          // Check if this group has a parentGroup (child choice group)
          if (group.parentGroup) {
            // Look up granular selections from the parent group
            const parentGroup = $equipmentSelections[group.parentGroup];
            granularSelections = parentGroup?.granularSelections?.children?.[group.id]?.selections || [];
          } else {
            // Look up granular selections from the group itself
            granularSelections = group.granularSelections?.self || [];
          }
          
          granularSelections.forEach(uuid => {
            selections.push({
              type: group.selectedItem.type,
              key: uuid
            });
          });
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

    window.GAS.log.d('[addGranularSelection] Adding granular selection', {
      groupId,
      uuid,
      groupType: group.type,
      requiredCount: getRequiredSelectionsCount(group.selectedItem),
      isComplete
    });

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
      !g.completed && g.id !== groupId && g.id !== childId
    ) : null;

    // Check if the specific child is now complete
    const childSelections = updatedSelections.children?.[childId]?.selections || [];
    const childIsComplete = childSelections.length >= getRequiredSelectionsCount(childItem);

    window.GAS.log.d('AND GROUP DEBUG | Child completion check', {
      childId,
      childSelections,
      requiredCount: getRequiredSelectionsCount(childItem),
      childIsComplete,
      childGroupExists: !!selections[childId]
    });

    // Debug the child update logic
    window.GAS.log.d('AND GROUP DEBUG | Child update logic', {
      childId,
      childIsComplete,
      childGroupExists: !!selections[childId],
      originalChild: selections[childId] ? {
        id: selections[childId].id,
        completed: selections[childId].completed,
        inProgress: selections[childId].inProgress
      } : null,
      updateObject: selections[childId] ? {
        ...selections[childId],
        completed: childIsComplete,
        inProgress: !childIsComplete
      } : null
    });

    // Build the result object step by step to ensure proper updates
    const result = {
      ...selections,
      [groupId]: {
        ...group,
        granularSelections: updatedSelections,
        completed: isComplete,
        inProgress: stillInProgress
      }
    };

    // Update the child choice group state if it exists
    if (selections[childId]) {
      result[childId] = {
        ...selections[childId],
        completed: childIsComplete,
        inProgress: !childIsComplete
      };
      window.GAS.log.d('AND GROUP DEBUG | Explicitly updating child group', {
        childId,
        beforeUpdate: {
          completed: selections[childId].completed,
          inProgress: selections[childId].inProgress
        },
        afterUpdate: {
          completed: childIsComplete,
          inProgress: !childIsComplete
        },
        childIsComplete,
        notChildIsComplete: !childIsComplete
      });
      
      window.GAS.log.d('AND GROUP DEBUG | Result after child update', {
        childId,
        resultChildGroup: result[childId],
        resultChildCompleted: result[childId]?.completed,
        resultChildInProgress: result[childId]?.inProgress
      });
    }

    // Add next group if needed
    if (nextGroup) {
      window.GAS.log.d('AND GROUP DEBUG | Next group logic', {
        nextGroupId: nextGroup.id,
        childId,
        isNextGroupSameAsChild: nextGroup.id === childId,
        nextGroupDetails: {
          id: nextGroup.id,
          type: nextGroup.type,
          completed: nextGroup.completed,
          inProgress: nextGroup.inProgress
        }
      });
      
      result[nextGroup.id] = {
        ...nextGroup,
        inProgress: true
      };
      
      window.GAS.log.d('AND GROUP DEBUG | After next group update', {
        childId,
        resultChildAfterNextGroup: result[childId],
        resultChildCompleted: result[childId]?.completed,
        resultChildInProgress: result[childId]?.inProgress
      });
    }

    window.GAS.log.d('AND GROUP DEBUG | addChildGranularSelection final state', result);
    window.GAS.log.d('AND GROUP DEBUG | Child group final state', {
      childId,
      childGroupInResult: result[childId],
      childCompleted: result[childId]?.completed,
      childInProgress: result[childId]?.inProgress
    });
    window.GAS.log.d('AND GROUP DEBUG | Final result keys', Object.keys(result));

    return result;
  });
}

// Remove granular selection (works for both special types and subgroup children)
export function removeGranularSelection(groupId, uuid, childId = null) {
  equipmentSelections.update(selections => {
    const group = selections[groupId];
    if (!group) return selections;

    let updatedSelections = { ...group.granularSelections };

    if (childId) {
      // Remove from child selections
      updatedSelections.children = {
        ...updatedSelections.children,
        [childId]: (updatedSelections.children?.[childId] || []).filter(id => id !== uuid)
      };
    } else {
      // Remove from self selections
      updatedSelections.self = (updatedSelections.self || []).filter(id => id !== uuid);
    }

    window.GAS.log.d('[removeGranularSelection] Removing granular selection', {
      groupId,
      uuid,
      groupType: group.type
    });

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
  window.GAS.log.d('AND GROUP DEBUG | initializeGroup called', {
    groupId,
    groupType: groupData.type,
    existingGroup: equipmentSelections ? get(equipmentSelections)[groupId] : null
  });
  
  equipmentSelections.update(selections => {
    // Flatten single-child OR groups before processing
    const ENABLE_FLATTENING = true; // Enable to fix single-child OR display
    
    // Only apply flattening to standalone groups, not choice groups
    const flattenedGroupData = (ENABLE_FLATTENING && groupData.type === 'standalone') ? {
      ...groupData,
      items: flattenSingleChildORs(groupData.items)
    } : groupData;
    
    // Force re-initialization when flattening is enabled to apply the flattening (only for standalone groups)
    const needsInitialization = !selections[groupId] || 
      (ENABLE_FLATTENING && groupData.type === 'standalone') ||
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
        // Check if the group is already completed - if so, don't reset it to in progress
        const existingGroup = selections[groupId];
        if (existingGroup && existingGroup.completed) {
          shouldBeInProgress = false; // Don't reset completed choice groups
        } else {
          // Choice groups with a parent should only be in progress if their parent is completed
          if (flattenedGroupData.parentGroup) {
            const parentGroup = selections[flattenedGroupData.parentGroup];
            shouldBeInProgress = parentGroup && parentGroup.completed && !hasChoiceGroupInProgress;
          } else {
            shouldBeInProgress = !hasChoiceGroupInProgress; // Only one choice group in progress at a time
          }
        }
      } else {
        shouldBeInProgress = false; // Default fallback
      }

      // Return the updated selections object, initializing or updating this group
      // If auto-complete, set selectedItem and mark as completed
      // If auto-complete, also set the next group as inProgress
      
              // Check if existing group is completed and preserve that state
        const existingGroup = selections[groupId];
        const shouldBeCompleted = isAutoComplete || (existingGroup && existingGroup.completed);
        
        window.GAS.log.d('AND GROUP DEBUG | initializeGroup update', {
          groupId,
          groupType: flattenedGroupData.type,
          existingCompleted: existingGroup?.completed || false,
          existingInProgress: existingGroup?.inProgress || false,
          shouldBeCompleted,
          shouldBeInProgress,
          willOverrideExisting: !!existingGroup
        });
        
        return {
          ...selections,
          [groupId]: {
            id: groupId,
            ...flattenedGroupData,
            selectedItemId: isAutoComplete ? flattenedGroupData.items[0]._id : (existingGroup?.selectedItemId || null),
            selectedItem: isAutoComplete ? flattenedGroupData.items[0] : (existingGroup?.selectedItem || null),
            completed: shouldBeCompleted,
            inProgress: shouldBeInProgress,
            granularSelections: existingGroup?.granularSelections || null
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
    window.GAS.log.d('[editGroup] Editing group', {
      groupId,
      groupType: selections[groupId]?.type
    });

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
  
  // Clear equipment gold choices when editing any equipment group
  // This ensures that gold calculations are reset when equipment selections are cleared
  clearEquipmentGoldChoices();
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
  // Also clear equipment gold choices when clearing equipment selections
  clearEquipmentGoldChoices();
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

// Helper function to update gold when equipment choices are made
function updateGoldForEquipmentChoice(groupId, selectedItem) {
  // Get the current character class and background
  const currentClass = get(characterClass);
  const currentBackground = get(background);
  
  // Get parsed equipment gold data
  const equipmentGold = get(parsedEquipmentGold);
  
  let source = null;
  let goldAmount = 0;
  let choiceId = null;
  
  // For variable gold classes like Fighter, we need to map the equipment selection to gold amounts
  // This requires analyzing the equipment selection context and matching it to the parsed gold options
  
  if (equipmentGold.fromClass.hasVariableGold && currentClass) {
    // For Fighter class, look for patterns that indicate which choice was made
    // This would need to be enhanced based on the actual data structure of equipment choices
    
    // Try to extract choice information from the selectedItem
    // The choice might be encoded in the item's key, description, or group structure
    
    // For now, we'll try a simple pattern match
    // In a real implementation, you'd want more sophisticated logic here
    if (selectedItem.key) {
      const keyLower = selectedItem.key.toLowerCase();
      
      // Look for indicators in the equipment key that might map to gold choices
      for (const option of equipmentGold.fromClass.goldOptions) {
        // This is a simplified matching approach
        // You'd want to enhance this based on your actual data structure
        if (keyLower.includes(option.choice.toLowerCase()) || 
            keyLower.includes(`choice${option.choice.toLowerCase()}`) ||
            keyLower.includes(`option${option.choice.toLowerCase()}`)) {
          source = 'fromClass';
          goldAmount = option.goldAmount;
          choiceId = option.choice;
          break;
        }
      }
      
      // If no direct match, try to infer from equipment content
      if (!source && selectedItem.label) {
        const labelLower = selectedItem.label.toLowerCase();
        // Try to match based on equipment types that might correlate with gold amounts
        // This is very basic - you'd want more sophisticated mapping
        if (labelLower.includes('chain') || labelLower.includes('mail')) {
          // Assume this is a lower gold option
          const lowestOption = equipmentGold.fromClass.goldOptions.reduce((min, opt) => 
            opt.goldAmount < min.goldAmount ? opt : min);
          source = 'fromClass';
          goldAmount = lowestOption.goldAmount;
          choiceId = lowestOption.choice;
        } else if (labelLower.includes('leather')) {
          // Assume this is a middle gold option
          const sortedOptions = [...equipmentGold.fromClass.goldOptions].sort((a, b) => a.goldAmount - b.goldAmount);
          if (sortedOptions.length > 1) {
            source = 'fromClass';
            goldAmount = sortedOptions[1].goldAmount;
            choiceId = sortedOptions[1].choice;
          }
        }
      }
    }
  }
  
  // Similar logic could be applied for background equipment with variable gold
  if (!source && equipmentGold.fromBackground.hasVariableGold && currentBackground) {
    // Background variable gold logic would go here
  }
  
  // Update gold if we found a match
  if (source && goldAmount > 0) {
    updateGoldFromEquipmentChoice(source, choiceId, goldAmount);
    window.GAS.log.d('[EquipmentSelections] Updated gold for equipment choice:', {
      source,
      choiceId,
      goldAmount,
      selectedItem: selectedItem.label || selectedItem.key,
      groupId
    });
  } else {
    // Log when we couldn't match an equipment choice to gold
    window.GAS.log.d('[EquipmentSelections] Could not determine gold amount for equipment choice:', {
      selectedItem: selectedItem.label || selectedItem.key,
      groupId,
      hasVariableGold: equipmentGold.fromClass.hasVariableGold || equipmentGold.fromBackground.hasVariableGold
    });
  }
}

// Call updateGoldForEquipmentChoice in the appropriate places