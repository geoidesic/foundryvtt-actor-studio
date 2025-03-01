import { writable, derived } from 'svelte/store';

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

function needsGranularSelection(item) {
  return GRANULAR_TYPES.includes(item.type) || SUBGROUP_TYPES.includes(item.type);
}

function getRequiredSelectionsCount(item) {
  return item.count || 1;
}

// Helper functions to manage selections
export function selectEquipment(groupId, itemId) {
  equipmentSelections.update(selections => {
    const group = selections[groupId];
    window.GAS.log.d('[EquipSelect STORE] selectEquipment group', group);
    if (!group) return selections;
    
    // Return early if group is not in progress
    if (!group.inProgress) return selections;

    // Find the selected item from the group's items
    const selectedItem = group.items.find(item => item._id === itemId);
    window.GAS.log.d('[EquipSelect STORE] selectEquipment selectedItem', selectedItem);
    if (!selectedItem) return selections;

    // Find the next uncompleted group
    const sortedGroups = Object.values(selections)
      .sort((a, b) => (a.sort || 0) - (b.sort || 0));
    const nextGroup = sortedGroups.find(g => 
      !g.completed && g.id !== groupId
    );

    const requiresGranular = GRANULAR_TYPES.includes(selectedItem.type);
    const isSubgroup = SUBGROUP_TYPES.includes(selectedItem.type);
    
    // Initialize granular selections structure based on item type
    // AND types don't need granular selections since they include all items
    const granularSelections = requiresGranular ? { self: [] } : 
                              (isSubgroup && selectedItem.type !== 'AND') ? { children: {} } : 
                              undefined;

    // For subgroups, initialize children structure
    if (isSubgroup && selectedItem.items) {
      selectedItem.items.forEach(item => {
        granularSelections.children[item._id] = {
          type: item.type,
          selections: []
        };
      });
    }

    const result = {
      ...selections,
      [groupId]: {
        ...group,
        selectedItem,
        selectedItemId: itemId,
        // AND types are completed immediately since they include all items
        completed: !requiresGranular && (selectedItem.type === 'AND' || !isSubgroup),
        inProgress: requiresGranular || (isSubgroup && selectedItem.type !== 'AND'),
        granularSelections
      },
      ...(nextGroup && (!requiresGranular && (selectedItem.type === 'AND' || !isSubgroup)) ? {
        [nextGroup.id]: {
          ...nextGroup,
          inProgress: true
        }
      } : {})
    };
    window.GAS.log.d('[EquipSelect STORE] selectEquipment result', result);
    return result;
  });
}

export const flattenedSelections = derived(equipmentSelections, ($equipmentSelections) => {
  window.GAS.log.d('[EquipSelect STORE] flattenedSelections equipmentSelections', $equipmentSelections);
  
  return Object.values($equipmentSelections)
    .filter(group => group.selectedItem) // Only include groups with selections
    .flatMap(group => {
      const selectedItem = group.selectedItem;
      
      // For AND types, include all their children
      if (selectedItem.type === 'AND' && selectedItem.children) {
        return selectedItem.children;
      }

      // If no granular selections needed, just return the selected item
      if (!group.granularSelections) {
        return [selectedItem];
      }

      // Handle granular selections
      const selections = [];
      
      // Add self selections if they exist
      if (group.granularSelections.self?.length) {
        selections.push(...group.granularSelections.self);
      }
      
      // Add children selections if they exist
      if (group.granularSelections.children) {
        Object.values(group.granularSelections.children).forEach(child => {
          if (child.selections?.length) {
            selections.push(...child.selections);
          }
        });
      }
      
      // If we have granular selections, return those, otherwise return the selected item
      return selections.length ? selections : [selectedItem];
    });
});

// Add granular selection for special types
export function addGranularSelection(groupId, uuid) {
  equipmentSelections.update(selections => {
    const group = selections[groupId];
    if (!group?.selectedItem) return selections;

    const updatedSelections = {
      ...group.granularSelections,
      self: [...(group.granularSelections.self || []), uuid]
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
  equipmentSelections.update(selections => {
    const group = selections[groupId];
    if (!group?.selectedItem || !group.granularSelections.children?.[childId]) return selections;

    const updatedChildren = {
      ...group.granularSelections.children,
      [childId]: {
        ...group.granularSelections.children[childId],
        selections: [...group.granularSelections.children[childId].selections, uuid]
      }
    };

    // Check if all children have required selections
    const isComplete = Object.entries(updatedChildren).every(([_, child]) => {
      const childItem = group.selectedItem.items.find(item => item._id === childId);
      return child.selections.length >= getRequiredSelectionsCount(childItem);
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
        granularSelections: {
          ...group.granularSelections,
          children: updatedChildren
        },
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

export function initializeGroup(groupId, groupData) {
  equipmentSelections.update(selections => {
    // Only initialize if group doesn't exist or has different items
    if (!selections[groupId] || 
        JSON.stringify(selections[groupId].items) !== JSON.stringify(groupData.items)) {
      
      // Set inProgress true only for the first unfinished group
      const isFirstUnfinished = !Object.values(selections).some(group => 
        !group.completed || group.inProgress
      );

      return {
        ...selections,
        [groupId]: {
          id: groupId,
          ...groupData,
          selectedItemId: null,
          selectedItem: null,
          completed: false,
          inProgress: isFirstUnfinished
        }
      };
    }
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

    // Then set the target group to in progress and incomplete
    if (updatedSelections[groupId]) {
      updatedSelections[groupId] = {
        ...updatedSelections[groupId],
        inProgress: true,
        completed: false,
        selectedItemId: null,
        selectedItem: null
      };
    }

    return updatedSelections;
  });
}

export function clearEquipmentSelections() {
  equipmentSelections.set({});
}

// Add getEquipmentIcon function to the store
export function getEquipmentIcon(type) {
  switch(type) {
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