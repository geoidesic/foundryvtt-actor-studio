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
    if (!group || !group.inProgress) return selections;
    
    const selectedItem = group.items.find(item => item._id === itemId);
    if (!selectedItem) return selections;

    // For configurable items (weapons, armor, focus) or AND groups, set up for granular selection
    if (needsGranularSelection(selectedItem)) {
      return {
        ...selections,
        [groupId]: {
          ...group,
          selectedItem,
          selectedItemId: itemId,
          completed: false,
          inProgress: true,
          granularSelections: selectedItem.type === 'AND' ? { children: {} } : { self: [] }
        }
      };
    }

    // For non-configurable items in choice groups, complete and progress
    if (group.type === 'choice') {
      // Find the next uncompleted group
      const sortedGroups = Object.values(selections)
        .sort((a, b) => (a.sort || 0) - (b.sort || 0));
      const nextGroup = sortedGroups.find(g => 
        !g.completed && g.id !== groupId
      );

      return {
        ...selections,
        [groupId]: {
          ...group,
          selectedItem,
          selectedItemId: itemId,
          completed: true,
          inProgress: false
        },
        ...(nextGroup ? {
          [nextGroup.id]: {
            ...nextGroup,
            inProgress: true
          }
        } : {})
      };
    }

    return selections;
  });
}

export const flattenedSelections = derived(equipmentSelections, ($equipmentSelections) => {
  const result = Object.values($equipmentSelections)
    .filter(group => {
      const hasSelection = !!group.selectedItem || group.type === 'standalone';
      return hasSelection;
    })
    .flatMap(group => {
      if (group.type === 'standalone') {
        const selections = [];
        for (const item of group.items) {
          if (item.type === 'linked') {
            const count = item.count || 1;
            for (let i = 0; i < count; i++) {
              selections.push({
                type: item.type,
                key: item.key,
              });
            }
          } 
          if (item.type === 'AND') {
            // Handle linked children
            for (const child of item.children) {
              if (child.type === 'linked') {
                const count = child.count || 1;
                for (let i = 0; i < count; i++) {
                  selections.push({
                    type: child.type,
                    key: child.key,
                  });
                }
              }
              // Handle granular selections for configurable children
              if (GRANULAR_TYPES.includes(child.type)) {
                const childSelections = group.granularSelections?.self || [];
                const count = child.count || 1;
                for (let i = 0; i < count; i++) {
                  childSelections.forEach(uuid => {
                    selections.push({
                      type: child.type,
                      key: uuid
                    });
                  });
                }
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
        selectedItem.children.forEach(child => {
          if (GRANULAR_TYPES.includes(child.type)) {
            const childSelections = group.granularSelections?.children?.[child._id]?.selections || [];
            // Repeat based on count
            const count = child.count || 1;
            for(let i = 0; i < count; i++) {
              selections.push(...childSelections.map(uuid => ({
                type: child.type,
                key: uuid
              })));
            }
          } else {
            // Repeat based on count
            const count = child.count || 1;
            for(let i = 0; i < count; i++) {
              selections.push(child);
            }
          }
        });
        return selections;
      }

      // If no granular selections needed, just return the selected item
      if (!group.granularSelections) {
        if(selectedItem.type === 'linked') {
          // Repeat based on count
          const count = selectedItem.count || 1;
          return Array(count).fill({
            type: selectedItem.type,
            key: selectedItem.key
          });
        }
        return [];
      }

      // Handle granular selections
      const selections = [];
      
      if (group.granularSelections.self?.length) {
        // Repeat based on count
        const count = selectedItem.count || 1;
        for(let i = 0; i < count; i++) {
          selections.push(...group.granularSelections.self.map(uuid => ({
            type: selectedItem.type,
            key: uuid
          })));
        }
      }
      
      if (group.granularSelections.children) {
        Object.entries(group.granularSelections.children).forEach(([childId, child]) => {
          if (child.selections?.length) {
            // Find the child item to get its count
            const childItem = selectedItem.children?.find(c => c._id === childId);
            const count = childItem?.count || 1;
            for(let i = 0; i < count; i++) {
              selections.push(...child.selections.map(uuid => ({
                type: child.type,
                key: uuid
              })));
            }
          }
        });
      }
      
      return selections;
    });

  return result;
});

// Add granular selection for special types
export function addGranularSelection(groupId, uuid) {
  equipmentSelections.update(selections => {
    window.GAS.log.d('[EquipSelect STORE] addGranularSelection selections', selections);
    const group = selections[groupId];
    window.GAS.log.d('[EquipSelect STORE] addGranularSelection groupId', groupId);
    window.GAS.log.d('[EquipSelect STORE] addGranularSelection group', group);
    // window.GAS.log.d('[EquipSelect STORE] addGranularSelection group.selectedItem', group.selectedItem);
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

    const result = {
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

    window.GAS.log.d('[EquipSelect STORE] addGranularSelection result', result);
    return result;
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
      
      // Check if any existing group is in progress or incomplete
      const hasGroupInProgress = Object.values(selections).some(group => 
        !group.completed || group.inProgress
      );

      // For standalone groups, check if all items are fixed (linked)
      const isAutoComplete = groupData.type === 'standalone' && 
        groupData.items.every(item => {
          if (item.type === 'linked') return true;
          if (item.type === 'AND') {
            return item.children.every(child => child.type === 'linked');
          }
          return false;
        });

      // Find the next group if this one auto-completes
      const nextGroup = isAutoComplete ? 
        Object.values(selections)
          .sort((a, b) => (a.sort || 0) - (b.sort || 0))
          .find(g => !g.completed) : null;

      return {
        ...selections,
        [groupId]: {
          id: groupId,
          ...groupData,
          selectedItemId: isAutoComplete ? groupData.items[0]._id : null,
          selectedItem: isAutoComplete ? groupData.items[0] : null,
          completed: isAutoComplete,
          inProgress: !isAutoComplete && !hasGroupInProgress,
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