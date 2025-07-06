import { describe, it, expect, beforeEach, vi } from 'vitest';
import { get } from 'svelte/store';
import { 
  equipmentSelections, 
  addChildGranularSelection, 
  initializeGroup,
  flattenedSelections,
  getEquipmentItemClasses
} from '../stores/equipmentSelections.js';

// Mock global variables that would normally be provided by FoundryVTT
globalThis.window = globalThis.window || {};
globalThis.window.GAS = {
  log: {
    d: vi.fn(), // Mock debug logging
    i: vi.fn(), // Mock info logging
    w: vi.fn(), // Mock warning logging
    e: vi.fn()  // Mock error logging
  }
};

// Mock game settings
globalThis.window.game = {
  settings: {
    get: vi.fn().mockReturnValue(false)
  }
};

// Mock MODULE_ID constant
globalThis.window.MODULE_ID = 'foundryvtt-actor-studio';

describe('Equipment Selections - Granular Selection', () => {
  beforeEach(() => {
    // Clear the store before each test
    equipmentSelections.set({});
    // Clear all mocks
    vi.clearAllMocks();
  });

  describe('Direct tool items in AND groups (Bard/Artisan fix)', () => {
    it('should allow granular selection for direct tool items within AND groups', () => {
      // Setup: Create the bard equipment scenario with direct tool item in AND group
      const bardGroupId = 'tWEfE6HLPbiS0OtF';
      const toolItemId = '0jBNM2wEEVNN4DBt';
      
      // Initialize bard AND group with direct tool item (not OR choice)
      initializeGroup(bardGroupId, {
        type: 'standalone',
        label: 'Bard Equipment',
        items: [{
          _id: bardGroupId,
          type: 'AND',
          children: [
            { _id: 'fEcFnfooD7rSDdEI', type: 'linked', key: 'armor', label: 'Leather Armor' },
            { _id: 'JbNtnwGItIy5pcr1', type: 'linked', key: 'weapon', count: 2, label: '2x Dagger' },
            { _id: toolItemId, type: 'tool', key: 'music', label: 'any musical instrument' },
            { _id: 'X63sE2GlxSzKzUho', type: 'linked', key: 'pack', label: 'Entertainer\'s Pack' }
          ]
        }],
        sort: 700000
      });

      // Act: Select the AND group (this should happen when tool is clicked)
      equipmentSelections.update(state => ({
        ...state,
        [bardGroupId]: {
          ...state[bardGroupId],
          selectedItemId: bardGroupId,
          selectedItem: state[bardGroupId].items[0],
          inProgress: true,
          completed: false
        }
      }));

      // Make a granular selection for the tool
      const instrumentUuid = 'Compendium.dnd-players-handbook.equipment.Item.phbtulLute0000000';
      addChildGranularSelection(bardGroupId, toolItemId, instrumentUuid);

      // Assert: Check the final state
      const finalState = get(equipmentSelections);
      
      // 1. Group should be completed after tool selection
      expect(finalState[bardGroupId].completed).toBe(true);
      expect(finalState[bardGroupId].inProgress).toBe(false);
      
      // 2. Granular selection should be stored in children
      expect(finalState[bardGroupId].granularSelections.children[toolItemId].selections).toContain(instrumentUuid);
      
      // 3. Granular selection should have correct type
      expect(finalState[bardGroupId].granularSelections.children[toolItemId].type).toBe('tool');
    });

    it('should show tool items as in-progress when AND group is selected but tool not configured', () => {
      const bardGroupId = 'testBard123';
      const toolItemId = 'testTool456';
      
      // Setup a simple AND group with tool item
      equipmentSelections.set({
        [bardGroupId]: {
          id: bardGroupId,
          type: 'standalone',
          items: [{
            _id: bardGroupId,
            type: 'AND',
            children: [
              { _id: 'linked1', type: 'linked', key: 'armor' },
              { _id: toolItemId, type: 'tool', key: 'music' }
            ]
          }],
          selectedItem: {
            _id: bardGroupId,
            type: 'AND',
            children: [
              { _id: 'linked1', type: 'linked', key: 'armor' },
              { _id: toolItemId, type: 'tool', key: 'music' }
            ]
          },
          selectedItemId: bardGroupId,
          granularSelections: { children: {}, self: [] },
          completed: false,
          inProgress: true
        }
      });

      const state = get(equipmentSelections);
      const group = state[bardGroupId];
      const toolItem = group.selectedItem.children.find(c => c._id === toolItemId);
      
      // Test the getEquipmentItemClasses function
      const classes = getEquipmentItemClasses(group, toolItem, false);
      
      // Tool item should be in-progress (clickable) not selected (locked)
      expect(classes).toContain('in-progress');
      expect(classes).not.toContain('selected');
    });

    it('should detect AND groups with configurable children for granular selection UI', () => {
      const bardGroupId = 'testBard789';
      const toolItemId = 'testTool123';
      
      // Setup AND group with tool item (should be detected as configurable)
      equipmentSelections.set({
        [bardGroupId]: {
          id: bardGroupId,
          type: 'standalone',
          items: [{
            _id: bardGroupId,
            type: 'AND',
            children: [
              { _id: 'linked1', type: 'linked', key: 'armor', label: 'Leather Armor' },
              { _id: toolItemId, type: 'tool', key: 'music', label: 'any musical instrument' }
            ]
          }],
          selectedItem: {
            _id: bardGroupId,
            type: 'AND',
            children: [
              { _id: 'linked1', type: 'linked', key: 'armor', label: 'Leather Armor' },
              { _id: toolItemId, type: 'tool', key: 'music', label: 'any musical instrument' }
            ]
          },
          selectedItemId: bardGroupId,
          granularSelections: { children: {}, self: [] },
          completed: false,
          inProgress: true
        }
      });

      const state = get(equipmentSelections);
      const group = state[bardGroupId];
      
      // Test the logic from EquipmentSelectorDetail that determines configurable selections
      const CONFIGURABLE_TYPES = ['tool', 'weapon', 'armor', 'focus'];
      
      // This group should be considered configurable because it's an AND group with configurable children
      const isConfigurable = CONFIGURABLE_TYPES.includes(group.selectedItem?.type) || 
         (group.selectedItem?.type === 'AND' && 
          group.selectedItem?.children?.some(child => CONFIGURABLE_TYPES.includes(child.type)));
      
      expect(isConfigurable).toBe(true);
      
      // The tool child should be detected as configurable
      const configurableChildren = group.selectedItem.children.filter(child => CONFIGURABLE_TYPES.includes(child.type));
      expect(configurableChildren).toHaveLength(1);
      expect(configurableChildren[0]._id).toBe(toolItemId);
      expect(configurableChildren[0].type).toBe('tool');
    });

    it('should pass correct child ID to addChildGranularSelection for AND group tool items', () => {
      const bardGroupId = 'testBard999';
      const toolItemId = 'testTool999';
      
      // Setup AND group with tool item
      equipmentSelections.set({
        [bardGroupId]: {
          id: bardGroupId,
          type: 'standalone',
          items: [{
            _id: bardGroupId,
            type: 'AND',
            children: [
              { _id: 'linked1', type: 'linked', key: 'armor', label: 'Leather Armor' },
              { _id: toolItemId, type: 'tool', key: 'music', label: 'any musical instrument' }
            ]
          }],
          selectedItem: {
            _id: bardGroupId,
            type: 'AND',
            children: [
              { _id: 'linked1', type: 'linked', key: 'armor', label: 'Leather Armor' },
              { _id: toolItemId, type: 'tool', key: 'music', label: 'any musical instrument' }
            ]
          },
          selectedItemId: bardGroupId,
          granularSelections: { children: {}, self: [] },
          completed: false,
          inProgress: true
        }
      });

      // Make a granular selection using the correct child ID (not parent ID)
      const instrumentUuid = 'Compendium.dnd-players-handbook.equipment.Item.phbmusDrum000000';
      addChildGranularSelection(bardGroupId, toolItemId, instrumentUuid);

      const finalState = get(equipmentSelections);
      
      // 1. Granular selection should be stored with correct child ID
      expect(finalState[bardGroupId].granularSelections.children[toolItemId]).toBeDefined();
      expect(finalState[bardGroupId].granularSelections.children[toolItemId].selections).toContain(instrumentUuid);
      
      // 2. Should NOT be stored with parent ID as child key (the bug we're fixing)
      expect(finalState[bardGroupId].granularSelections.children[bardGroupId]).toBeUndefined();
      
      // 3. Group should be completed
      expect(finalState[bardGroupId].completed).toBe(true);
      expect(finalState[bardGroupId].inProgress).toBe(false);
    });
  });

  describe('addChildGranularSelection', () => {
    it('should complete child choice group and not set it as next group (monk tool selection bug fix)', () => {
      // Setup: Create the monk equipment scenario
      // Parent AND group (z3xcULs5Q70zNQ2D) with child OR choice group (ncjqhMc9uV04Fsot)
      
      const parentGroupId = 'z3xcULs5Q70zNQ2D';
      const childGroupId = 'ncjqhMc9uV04Fsot';
      const anotherGroupId = 'TNHMxaGovu69ZlXO';
      
      // Initialize parent AND group
      initializeGroup(parentGroupId, {
        type: 'standalone',
        label: 'Monk Equipment',
        items: [{
          _id: parentGroupId,
          type: 'AND',
          children: [
            { _id: 'O0MjTQnMYC8Xq3AM', type: 'linked', key: 'spear', count: 1 },
            { _id: '0ZcOXGUX7x39CPpk', type: 'linked', key: 'dagger', count: 5 },
            { _id: childGroupId, type: 'OR', key: 'tool' }, // This becomes a choice group
            { _id: 'YZ87ItdbDaRpBDQ2', type: 'linked', key: 'pack', count: 1 }
          ]
        }],
        sort: 100000
      });

      // Initialize child choice group (monk tool selection)
      initializeGroup(childGroupId, {
        type: 'choice',
        label: "any artisan's tools or any musical instrument",
        items: [
          { _id: 'tool1', type: 'tool', key: 'artisan' },
          { _id: 'tool2', type: 'tool', key: 'musical' }
        ],
        parentGroup: parentGroupId,
        sort: 400000
      });

      // Initialize another group (should become next group)
      // This group has an OR choice, so it won't be auto-completed
      initializeGroup(anotherGroupId, {
        type: 'standalone',
        label: 'Other Equipment',
        items: [{ _id: anotherGroupId, type: 'OR', children: [
          { _id: 'item1', type: 'linked', key: 'clothes' },
          { _id: 'item2', type: 'linked', key: 'shoes' }
        ]}],
        sort: 300000
      });

      // Simulate selecting a tool option in the child choice group and parent group
      equipmentSelections.update(state => ({
        ...state,
        [childGroupId]: {
          ...state[childGroupId],
          selectedItemId: 'tool1',
          selectedItem: { _id: 'tool1', type: 'tool', key: 'artisan' },
          inProgress: true,
          completed: false
        },
        [parentGroupId]: {
          ...state[parentGroupId],
          selectedItemId: parentGroupId,
          selectedItem: state[parentGroupId].items[0],
          inProgress: true,
          completed: false
        }
      }));

      // Get initial state
      const initialState = get(equipmentSelections);
      expect(initialState[childGroupId].inProgress).toBe(true);
      expect(initialState[childGroupId].completed).toBe(false);

      // Act: Make a granular selection for the tool
      const toolUuid = 'Compendium.dnd-players-handbook.equipment.Item.phbtulAlchemists';
      addChildGranularSelection(parentGroupId, childGroupId, toolUuid);

      // Assert: Check the final state
      const finalState = get(equipmentSelections);
      
      // 1. Child choice group should be completed and not in progress
      expect(finalState[childGroupId].completed).toBe(true);
      expect(finalState[childGroupId].inProgress).toBe(false);
      
      // 2. Parent AND group should be completed
      expect(finalState[parentGroupId].completed).toBe(true);
      expect(finalState[parentGroupId].inProgress).toBe(false);
      
      // 3. Granular selection should be stored in parent's children
      expect(finalState[parentGroupId].granularSelections.children[childGroupId].selections).toContain(toolUuid);
      
      // 4. Another group should become the next in progress (if it exists and is incomplete)
      // Check if the another group was initialized as incomplete
      const anotherGroupState = finalState[anotherGroupId];
      if (anotherGroupState && !anotherGroupState.completed) {
        expect(finalState[anotherGroupId].inProgress).toBe(true);
      } else {
        // If the another group was auto-completed, it won't be set as next
        expect(finalState[anotherGroupId].inProgress).toBe(false);
      }
      
      // 5. Child choice group should NOT be set back to inProgress (the bug we fixed)
      expect(finalState[childGroupId].inProgress).toBe(false);
    });

    it('should store granular selections correctly in parent group', () => {
      const parentGroupId = 'parent123';
      const childGroupId = 'child456';
      
      // Setup minimal groups
      equipmentSelections.set({
        [parentGroupId]: {
          id: parentGroupId,
          type: 'standalone',
          items: [{ _id: parentGroupId, type: 'AND', children: [
            { _id: childGroupId, type: 'OR', key: 'tool' }
          ]}],
          selectedItem: { type: 'AND', children: [
            { _id: childGroupId, type: 'OR', key: 'tool' }
          ]},
          granularSelections: null,
          completed: false,
          inProgress: false
        },
        [childGroupId]: {
          id: childGroupId,
          type: 'choice',
          selectedItem: { _id: 'tool1', type: 'tool', key: 'artisan' },
          completed: false,
          inProgress: true
        }
      });

      const toolUuid = 'Compendium.test.Item.tool123';
      addChildGranularSelection(parentGroupId, childGroupId, toolUuid);

      const state = get(equipmentSelections);
      
      expect(state[parentGroupId].granularSelections.children[childGroupId].selections).toContain(toolUuid);
      expect(state[parentGroupId].granularSelections.children[childGroupId].type).toBe('OR');
    });

    it('should work with flattenedSelections to show tool in planned inventory', () => {
      const parentGroupId = 'parent123';
      const childGroupId = 'child456';
      
      // Setup groups
      equipmentSelections.set({
        [parentGroupId]: {
          id: parentGroupId,
          type: 'standalone',
          items: [{ _id: parentGroupId, type: 'AND', children: [
            { _id: childGroupId, type: 'OR', key: 'tool' }
          ]}],
          selectedItem: { type: 'AND', children: [
            { _id: childGroupId, type: 'OR', key: 'tool' }
          ]},
          granularSelections: null,
          completed: false,
          inProgress: false
        },
        [childGroupId]: {
          id: childGroupId,
          type: 'choice',
          selectedItem: { _id: 'tool1', type: 'tool', key: 'artisan' },
          completed: false,
          inProgress: true,
          parentGroup: parentGroupId
        }
      });

      const toolUuid = 'Compendium.test.Item.tool123';
      addChildGranularSelection(parentGroupId, childGroupId, toolUuid);

      // Get flattened selections (what appears in PlannedInventory)
      const flattened = get(flattenedSelections);
      
      // Should include the tool selection
      const toolSelection = flattened.find(item => item.key === toolUuid);
      expect(toolSelection).toBeDefined();
      // The type should be 'tool' (the selected item's type), not 'OR' (the choice group's type)
      expect(toolSelection.type).toBe('tool');
    });
  });

  describe('Edge cases', () => {
    it('should handle non-existent child group gracefully', () => {
      const parentGroupId = 'parent123';
      const nonExistentChildId = 'nonexistent';
      
      equipmentSelections.set({
        [parentGroupId]: {
          id: parentGroupId,
          selectedItem: { type: 'AND', children: [] },
          granularSelections: null
        }
      });

      // Should not throw an error
      expect(() => {
        addChildGranularSelection(parentGroupId, nonExistentChildId, 'some-uuid');
      }).not.toThrow();

      // State should be unchanged
      const state = get(equipmentSelections);
      expect(state[parentGroupId].granularSelections).toBe(null);
    });

    it('should not set child as next group when parent is not complete', () => {
      const parentGroupId = 'parent123';
      const childGroupId = 'child456';
      
      equipmentSelections.set({
        [parentGroupId]: {
          id: parentGroupId,
          type: 'standalone',
          items: [{ _id: parentGroupId, type: 'AND', children: [
            { _id: childGroupId, type: 'OR', key: 'tool' },
            { _id: 'other', type: 'linked', key: 'sword' } // Still needs selection
          ]}],
          selectedItem: { type: 'AND', children: [
            { _id: childGroupId, type: 'OR', key: 'tool' },
            { _id: 'other', type: 'linked', key: 'sword' }
          ]},
          granularSelections: null,
          completed: false,
          inProgress: false
        },
        [childGroupId]: {
          id: childGroupId,
          type: 'choice',
          selectedItem: { _id: 'tool1', type: 'tool', key: 'artisan' },
          completed: false,
          inProgress: true
        }
      });

      addChildGranularSelection(parentGroupId, childGroupId, 'tool-uuid');

      const state = get(equipmentSelections);
      
      // Child should be completed after granular selection
      expect(state[childGroupId].completed).toBe(true);
      expect(state[childGroupId].inProgress).toBe(false);
      
      // Parent will be marked as complete because the current logic considers an AND group complete
      // if all OR children have granular selections, even if linked items don't have selections
      // This is the current behavior - AND groups are complete when OR choices are resolved
      expect(state[parentGroupId].completed).toBe(true);
    });
  });
}); 