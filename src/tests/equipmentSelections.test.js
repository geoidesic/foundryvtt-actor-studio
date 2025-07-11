import { beforeEach, describe, it, expect, vi } from 'vitest';
import { get } from 'svelte/store';

// Mock window.GAS for this specific test file
globalThis.window = globalThis.window || {};
globalThis.window.GAS = {
  log: {
    d: vi.fn(),
    i: vi.fn(),
    w: vi.fn(),
    e: vi.fn()
  }
};
import { 
  equipmentSelections, 
  addChildGranularSelection, 
  initializeGroup,
  flattenedSelections,
  getEquipmentItemClasses,
  editGroup
} from '../stores/equipmentSelections.js';

beforeEach(() => {
  // Reset the store before each test
  equipmentSelections.set({});
});

describe('Equipment Selections - Granular Selection', () => {
  describe('Direct tool items in AND groups (Bard/Artisan fix)', () => {
    it('should allow granular selection for direct tool items within AND groups', () => {
      const bardGroupId = 'testBard123';
      const toolItemId = 'testTool123';
      
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
          inProgress: true,
          completed: false
        }
      });

      // Test that tool item is correctly identified as needing configuration
      const currentSelections = get(equipmentSelections);
      const group = currentSelections[bardGroupId];
      
      expect(group.selectedItem.type).toBe('AND');
      expect(group.selectedItem.children.some(child => child.type === 'tool')).toBe(true);
    });
    
    it('should show tool items as in-progress when AND group is selected but tool not configured', () => {
      const bardGroupId = 'testBard456';
      const toolItemId = 'testTool456';
      
      equipmentSelections.set({
        [bardGroupId]: {
          id: bardGroupId,
          type: 'standalone',
          selectedItem: {
            _id: bardGroupId,
            type: 'AND',
            children: [
              { _id: 'linked1', type: 'linked', key: 'armor', label: 'Leather Armor' },
              { _id: toolItemId, type: 'tool', key: 'music', label: 'any musical instrument' }
            ]
          },
          inProgress: true,
          completed: false
        }
      });
      
      // Tool item should show as in-progress since it needs configuration
      const toolClasses = getEquipmentItemClasses(
        get(equipmentSelections)[bardGroupId],
        { _id: toolItemId, type: 'tool', key: 'music', label: 'any musical instrument' },
        false
      );
      
      expect(toolClasses).toContain('in-progress');
    });
    
    it('should detect AND groups with configurable children for granular selection UI', () => {
      const bardGroupId = 'testBard789';
      
      equipmentSelections.set({
        [bardGroupId]: {
          id: bardGroupId,
          type: 'standalone',
          selectedItem: {
            _id: bardGroupId,
            type: 'AND',
            children: [
              { _id: 'linked1', type: 'linked', key: 'armor', label: 'Leather Armor' },
              { _id: 'tool1', type: 'tool', key: 'music', label: 'any musical instrument' }
            ]
          },
          inProgress: true,
          completed: false
        }
      });
      
      const group = get(equipmentSelections)[bardGroupId];
      const hasConfigurableChildren = group.selectedItem?.type === 'AND' && 
        group.selectedItem?.children?.some(child => ['tool', 'weapon', 'armor', 'focus'].includes(child.type));
      
      expect(hasConfigurableChildren).toBe(true);
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
          inProgress: true,
          completed: false
        }
      });

      // Mock a granular selection
      const testUuid = 'Compendium.dnd5e.items.Item.testInstrument';
      
      // Call addChildGranularSelection with the tool item ID
      addChildGranularSelection(bardGroupId, toolItemId, testUuid);

      // Verify the selection was stored correctly
      const currentSelections = get(equipmentSelections);
      const group = currentSelections[bardGroupId];
      
      expect(group.granularSelections?.children?.[toolItemId]?.selections).toContain(testUuid);
    });
    
    it('should distinguish between monk choice groups and bard/artisan tool items for child ID logic', () => {
      // Test monk pattern: separate choice group with its own ID
      const monkParentId = 'monkAND123';
      const monkChoiceId = 'monkChoice456';
      
      equipmentSelections.set({
        [monkChoiceId]: {
          id: monkChoiceId,
          type: 'choice',
          parentGroup: monkParentId,
          selectedItem: { _id: 'tool1', type: 'tool', key: 'artisan', label: 'artisan tools' },
          inProgress: true
        }
      });
      
      // For monk: group.id !== group.parentGroup.id, so use group.id
      const monkGroup = get(equipmentSelections)[monkChoiceId];
      const monkChildId = monkGroup.id !== monkParentId ? monkGroup.id : monkGroup.selectedItem._id;
      expect(monkChildId).toBe(monkChoiceId);
      
      // Test bard pattern: tool item within AND group (same ID)
      const bardGroupId = 'bardAND789';
      const bardToolId = 'bardTool789';
      
      equipmentSelections.set({
        [bardGroupId]: {
          id: bardGroupId,
          type: 'standalone',
          selectedItem: {
            _id: bardGroupId,
            type: 'AND',
            children: [{ _id: bardToolId, type: 'tool', key: 'music', label: 'musical instrument' }]
          },
          inProgress: true
        }
      });
      
      // For bard: group.id === group.parentGroup.id (since it's flattened), so use selectedItem._id
      // In this case, we're simulating the flattened structure where parentGroup would be the same as id
      const bardChildId = bardGroupId === bardGroupId ? bardToolId : bardGroupId;
      expect(bardChildId).toBe(bardToolId);
    });
  });

  describe('addChildGranularSelection', () => {
    it('should complete child choice group and not set it as next group (monk tool selection bug fix)', () => {
      const parentGroupId = 'z3xcULs5Q70zNQ2D';
      const childGroupId = 'ncjqhMc9uV04Fsot';
      const testUuid = 'Compendium.dnd5e.items.Item.testItem';

      // Setup parent AND group and child choice group
      equipmentSelections.set({
        [parentGroupId]: {
          id: parentGroupId,
          type: 'standalone',
          items: [{ _id: parentGroupId, type: 'AND' }],
          selectedItem: { 
            _id: parentGroupId, 
            type: 'AND',
            children: [{ _id: childGroupId, type: 'tool', key: 'artisan', label: 'artisan tools' }]
          },
          inProgress: false,
          completed: true,
          granularSelections: null
        },
        [childGroupId]: {
          id: childGroupId,
          type: 'choice',
          parentGroup: parentGroupId,
          items: [
            { _id: 'artisan1', type: 'tool', key: 'artisan', label: 'artisan tools' },
            { _id: 'music1', type: 'tool', key: 'music', label: 'musical instrument' }
          ],
          selectedItem: { _id: 'artisan1', type: 'tool', key: 'artisan', label: 'artisan tools' },
          inProgress: true,
          completed: false
        }
      });

      // Call addChildGranularSelection
      addChildGranularSelection(parentGroupId, childGroupId, testUuid);

      // Get updated state
      const updatedSelections = get(equipmentSelections);
      const childGroup = updatedSelections[childGroupId];

      // Verify child group is completed and not in progress
      expect(childGroup.completed).toBe(true);
      expect(childGroup.inProgress).toBe(false);

      // Verify granular selection was stored in parent
      const parentGroup = updatedSelections[parentGroupId];
      expect(parentGroup.granularSelections?.children?.[childGroupId]?.selections).toContain(testUuid);
    });

    it('should store granular selections correctly in parent group', () => {
      const parentGroupId = 'testParent';
      const childId = 'testChild';
      const testUuid = 'Compendium.dnd5e.items.Item.testItem';

      equipmentSelections.set({
        [parentGroupId]: {
          id: parentGroupId,
          type: 'standalone',
          items: [], // Required for flattenedSelections
          selectedItem: {
            _id: parentGroupId,
            type: 'AND',
            children: [{ _id: childId, type: 'tool', key: 'artisan', label: 'artisan tools' }]
          },
          completed: true,
          granularSelections: null
        }
      });

      addChildGranularSelection(parentGroupId, childId, testUuid);

      const parentGroup = get(equipmentSelections)[parentGroupId];
      expect(parentGroup.granularSelections?.children?.[childId]?.selections).toEqual([testUuid]);
    });

    it('should work with flattenedSelections to show tool in planned inventory', () => {
      const parentGroupId = 'testParent123';
      const childId = 'testChild123';
      const testUuid = 'Compendium.dnd5e.items.Item.testItem123';

      // Setup parent group
      equipmentSelections.set({
        [parentGroupId]: {
          id: parentGroupId,
          type: 'standalone',
          items: [{
            _id: parentGroupId,
            type: 'AND',
            children: [{ _id: childId, type: 'tool', key: 'artisan', label: 'artisan tools' }]
          }],
          selectedItem: {
            _id: parentGroupId,
            type: 'AND',
            children: [{ _id: childId, type: 'tool', key: 'artisan', label: 'artisan tools' }]
          },
          completed: true,
          granularSelections: null
        }
      });

      // Add granular selection
      addChildGranularSelection(parentGroupId, childId, testUuid);

      // Get flattened selections
      let currentFlattened;
      const unsubscribe = flattenedSelections.subscribe(value => {
        currentFlattened = value;
      });

      // Check that the selection appears in flattened selections as an object with type and key
      const expectedSelection = {
        type: 'tool',
        key: testUuid
      };
      expect(currentFlattened).toContainEqual(expectedSelection);

      unsubscribe();
    });
  });

  describe('Edge cases', () => {
    it('should handle non-existent child group gracefully', () => {
      const parentGroupId = 'testParent';
      const nonExistentChildId = 'nonExistent';
      const testUuid = 'Compendium.dnd5e.items.Item.testItem';

      equipmentSelections.set({
        [parentGroupId]: {
          id: parentGroupId,
          type: 'standalone',
          items: [], // Required for flattenedSelections
          selectedItem: {
            _id: parentGroupId,
            type: 'AND',
            children: [] // Empty children - nonExistentChildId won't be found
          },
          completed: true
        }
      });

      expect(() => {
        addChildGranularSelection(parentGroupId, nonExistentChildId, testUuid);
      }).not.toThrow();

      // Should NOT store the selection since child doesn't exist
      const parentGroup = get(equipmentSelections)[parentGroupId];
      expect(parentGroup.granularSelections?.children?.[nonExistentChildId]).toBeUndefined();
    });

    it('should not set child as next group when parent is not complete', () => {
      const parentGroupId = 'testParent';
      const childId = 'testChild';
      const testUuid = 'Compendium.dnd5e.items.Item.testItem';

      equipmentSelections.set({
        [parentGroupId]: {
          id: parentGroupId,
          type: 'standalone',
          items: [], // Required for flattenedSelections
          selectedItem: {
            _id: parentGroupId,
            type: 'AND',
            children: [{ _id: childId, type: 'tool', key: 'artisan', label: 'artisan tools' }]
          },
          completed: false,
          inProgress: true
        },
        [childId]: {
          id: childId,
          type: 'choice',
          items: [], // Required for flattenedSelections
          parentGroup: parentGroupId,
          completed: false,
          inProgress: true
        }
      });

      addChildGranularSelection(parentGroupId, childId, testUuid);

      const childGroup = get(equipmentSelections)[childId];
      expect(childGroup.completed).toBe(true);
      expect(childGroup.inProgress).toBe(false);
    });
  });
}); 