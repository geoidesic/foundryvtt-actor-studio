import { writable } from 'svelte/store';

// Store structure will track selections by group
// { groupId: { selectedItemId: string, count: number } }
export const equipmentSelections = writable({});

// Helper functions to manage selections
export function selectEquipment(groupId, itemId, count = null) {
  equipmentSelections.update(selections => ({
    ...selections,
    [groupId]: { selectedItemId: itemId, count }
  }));
}

export function clearEquipmentSelections() {
  equipmentSelections.set({});
} 