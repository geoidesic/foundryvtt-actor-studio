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

export function getRequiredSelectionsCount(item) {
  return item.count || 1;
}

function needsGranularSelection(item) {
  return GRANULAR_TYPES.includes(item.type) || SUBGROUP_TYPES.includes(item.type);
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
    // window.GAS.log.d('[EquipSelect STORE] selectEquipment selectedItem', selectedItem);
    if (!selectedItem) return selections;

    // Find the next uncompleted group
    const sortedGroups = Object.values(selections)
      .sort((a, b) => (a.sort || 0) - (b.sort || 0));
    const nextGroup = sortedGroups.find(g => 
      !g.completed && g.id !== groupId
    );

    const requiresGranular = GRANULAR_TYPES.includes(selectedItem.type);
    const isSubgroup = SUBGROUP_TYPES.includes(selectedItem.type);
    
    // Initialize granular selections structure only for direct granular types
    let granularSelections;
    if (requiresGranular) {
      granularSelections = { self: [] };
    } else if (isSubgroup && selectedItem.type !== 'AND') {
      granularSelections = { children: {} };
    }

    // For AND types, we don't pre-initialize the granularSelections
    // They will be created as selections are made

    const result = {
      ...selections,
      [groupId]: {
        ...group,
        selectedItem,
        selectedItemId: itemId,
        // AND is complete only if all children that need selections have them
        completed: !requiresGranular && (
          selectedItem.type !== 'AND' || 
          !selectedItem.children?.some(child => 
            GRANULAR_TYPES.includes(child.type) && 
            (!group.granularSelections?.children?.[child._id]?.selections?.length || 
             group.granularSelections.children[child._id].selections.length < getRequiredSelectionsCount(child))
          )
        ),
        inProgress: requiresGranular || (
          selectedItem.type === 'AND' && 
          selectedItem.children?.some(child => 
            GRANULAR_TYPES.includes(child.type) && 
            (!group.granularSelections?.children?.[child._id]?.selections?.length || 
             group.granularSelections.children[child._id].selections.length < getRequiredSelectionsCount(child))
          )
        ),
        granularSelections: granularSelections || group.granularSelections
      },
      ...(nextGroup && !requiresGranular && 
          (selectedItem.type !== 'AND' || !selectedItem.children?.some(child => GRANULAR_TYPES.includes(child.type))) ? {
        [nextGroup.id]: {
          ...nextGroup,
          inProgress: true
        }
      } : {})
    };
    // window.GAS.log.d('[EquipSelect STORE] selectEquipment result', result);
    return result;
  });
}

export const flattenedSelections = derived(equipmentSelections, ($equipmentSelections) => {
  const result = Object.values($equipmentSelections)
    .filter(group => {
      const hasSelection = !!group.selectedItem || group.type === 'standalone';

      return hasSelection;
    })
    .flatMap(group => {

      if(group.type === 'standalone') {
        const selections = [];
        for(const item of group.items) {
          if(item.type === 'linked') {
            window.GAS.log.d('[EquipSelect STORE] flattenedSelections standalone AND group child', item);
            alert('linked')
          } 
          if(item.type === 'AND') {
            for(const child of item.children) {
              window.GAS.log.d('[EquipSelect STORE] flattenedSelections standalone AND group child', child);
              if(child.type === 'linked') {
                selections.push({
                  type: child.type,
                  key: child.key,
                })
              }
            }
          }
        }
        return selections;
      }

      const selectedItem = group.selectedItem;
      
      // For AND types, include all children (either direct or through granular selection)
      if (selectedItem.type === 'AND' && selectedItem.children) {
        const selections = [];
        // window.GAS.log.d('[EquipSelect STORE] flattenedSelections AND group')
        selectedItem.children.forEach(child => {
          if (GRANULAR_TYPES.includes(child.type)) {
            // window.GAS.log.d('[EquipSelect STORE] flattenedSelections AND group child', child);
            // For granular type children, include their selections
            const childSelections = group.granularSelections?.children?.[child._id]?.selections || [];
            
            // Convert UUIDs to objects with type and key properties
            selections.push(...childSelections.map(uuid => ({
              type: child.type,
              key: uuid
            })));
          } else {
            // For non-granular children (like linked), include them directly
            selections.push(child);
          }
        });
        return selections;
      }

      // If no granular selections needed, just return the selected item
      if (!group.granularSelections) {
        return [selectedItem];
      }

      // Handle granular selections
      const selections = [];
      
      // Add self selections if they exist, converting UUIDs to objects
      if (group.granularSelections.self?.length) {
        selections.push(...group.granularSelections.self.map(uuid => ({
          type: selectedItem.type,
          key: uuid
        })));
      }
      
      // Add children selections if they exist
      if (group.granularSelections.children) {
        Object.entries(group.granularSelections.children).forEach(([childId, child]) => {
          if (child.selections?.length) {
            selections.push(...child.selections.map(uuid => ({
              type: child.type,
              key: uuid
            })));
          }
        });
      }
      
      // If we have granular selections, return those, otherwise return the selected item
      return selections.length ? selections : [selectedItem];
    });

  // window.GAS.log.d('[EquipSelect STORE] flattenedSelections FINAL', {
  //   result
  // });
  
  return result;
});

// Add granular selection for special types
export function addGranularSelection(groupId, uuid) {
  alert('o')
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
  window.GAS.log.d('[EquipSelect STORE] addChildGranularSelection ENTRY', { groupId, childId, uuid });
  
  equipmentSelections.update(selections => {
    const group = selections[groupId];
    // window.GAS.log.d('[EquipSelect STORE] addChildGranularSelection group', { 
    //   group,
    //   hasSelectedItem: !!group?.selectedItem,
    //   selectedItemType: group?.selectedItem?.type,
    //   children: group?.selectedItem?.children
    // });

    if (!group?.selectedItem) return selections;

    // Get the actual child from the AND group's children
    const childItem = group.selectedItem.children?.find(c => c._id === childId);
    // window.GAS.log.d('[EquipSelect STORE] addChildGranularSelection childItem', { 
    //   childItem,
    //   childId,
    //   allChildren: group.selectedItem.children
    // });

    if (!childItem) return selections;

    // Initialize or update the granular selections structure
    const updatedSelections = {
      ...group.granularSelections,
      children: {
        ...group.granularSelections?.children,
        [childId]: {
          type: childItem.type,
          selections: [uuid]
        }
      }
    };

    // For AND types, check if all children that need selections have them
    const isComplete = group.selectedItem.type === 'AND' ?
      group.selectedItem.children.every(child => {
        const needsSelection = GRANULAR_TYPES.includes(child.type);
        const childSelections = updatedSelections.children?.[child._id]?.selections || [];
        const hasEnoughSelections = childSelections.length >= getRequiredSelectionsCount(child);
        
        window.GAS.log.d('[EquipSelect STORE] addChildGranularSelection completion check for child', {
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

    window.GAS.log.d('[EquipSelect STORE] addChildGranularSelection completion status', {
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

    // window.GAS.log.d('[EquipSelect STORE] addChildGranularSelection final state', {
    //   previousGroup: group,
    //   updatedGroup: result[groupId],
    //   fullResult: result
    // });
    window.GAS.log.d('[EquipSelect STORE] addChildGranularSelection final state', result);

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