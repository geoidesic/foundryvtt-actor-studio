import { writable } from 'svelte/store';

// Store structure will track selections by group
// { 
//   groupId: { 
//     selectedItemId: string, 
//     selectedItem: object, 
//     completed: boolean, 
//     inProgress: boolean,
//     granularSelection: string | null // UUID for tool/weapon/armor/focus specific selection
//   } 
// }
export const equipmentSelections = writable({});

const GRANULAR_TYPES = ['tool', 'weapon', 'armor', 'focus'];

// Helper functions to manage selections
export function selectEquipment(groupId, itemId) {
  equipmentSelections.update(selections => {
    const group = selections[groupId];
    if (!group) return selections;

    // Find the selected item from the group's items
    const selectedItem = group.items.find(item => item._id === itemId);
    if (!selectedItem) return selections;

    // Find the next uncompleted group
    const sortedGroups = Object.values(selections)
      .sort((a, b) => (a.sort || 0) - (b.sort || 0));
    const nextGroup = sortedGroups.find(g => 
      !g.completed && g.id !== groupId
    );

    // Mark this group as completed and no longer in progress
    // If it's a special type, set completed to false until granular selection is made
    const needsGranularSelection = GRANULAR_TYPES.includes(selectedItem.type);

    return {
      ...selections,
      [groupId]: {
        ...group,
        selectedItemId: itemId,
        selectedItem,
        completed: !needsGranularSelection,
        inProgress: needsGranularSelection,
        granularSelection: null
      },
      ...(nextGroup && !needsGranularSelection ? {
        [nextGroup.id]: {
          ...nextGroup,
          inProgress: true
        }
      } : {})
    };
  });
}

// Add new function to handle granular selection
export function setGranularSelection(groupId, uuid) {
  equipmentSelections.update(selections => {
    const group = selections[groupId];
    if (!group || !group.selectedItem) return selections;

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
        granularSelection: uuid,
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