import { writable } from 'svelte/store';

// Store structure will track selections by group
// { groupId: { selectedItemId: string, selectedItem: object, count: number } }
export const equipmentSelections = writable({});

// Helper functions to manage selections
export function selectEquipment(groupId, itemId) {
  equipmentSelections.update(selections => {
    const group = selections[groupId];
    if (!group) return selections;

    // Find the selected item from the group's items
    const selectedItem = group.items.find(item => item._id === itemId);
    if (!selectedItem) return selections;

    return {
      ...selections,
      [groupId]: {
        ...group,
        selectedItemId: itemId,
        selectedItem
      }
    };
  });
}

export function initializeGroup(groupId, groupData) {
  equipmentSelections.update(selections => {
    // Only initialize if group doesn't exist or has different items
    if (!selections[groupId] || 
        JSON.stringify(selections[groupId].items) !== JSON.stringify(groupData.items)) {
      return {
        ...selections,
        [groupId]: {
          id: groupId,
          ...groupData,
          selectedItemId: null,
          selectedItem: null
        }
      };
    }
    return selections;
  });
}

export function clearEquipmentSelections() {
  equipmentSelections.set({});
} 