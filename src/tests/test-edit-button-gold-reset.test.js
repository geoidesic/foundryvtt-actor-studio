import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('Edit Button Gold Reset Fix', () => {
  let clearEquipmentGoldChoicesMock;
  let editGroup;

  beforeEach(() => {
    // Mock the clearEquipmentGoldChoices function
    clearEquipmentGoldChoicesMock = vi.fn();
    
    // Mock the equipmentSelections store
    const mockEquipmentSelections = {
      update: vi.fn((fn) => {
        const mockSelections = {
          'group1': { type: 'choice', selectedItemId: 'item1' }
        };
        fn(mockSelections);
      })
    };

    // Mock the module with our mocked function
    vi.doMock('~/src/stores/equipmentGold', () => ({
      clearEquipmentGoldChoices: clearEquipmentGoldChoicesMock,
      parsedEquipmentGold: { subscribe: vi.fn() },
      updateGoldFromEquipmentChoice: vi.fn()
    }));

    vi.doMock('svelte/store', () => ({
      writable: vi.fn(() => mockEquipmentSelections),
      derived: vi.fn(),
      get: vi.fn()
    }));

    vi.doMock('~/src/stores/storeDefinitions', () => ({
      characterClass: { subscribe: vi.fn() },
      background: { subscribe: vi.fn() }
    }));

    // Mock window.GAS.log
    global.window = { GAS: { log: { d: vi.fn() } } };
  });

  it('should call clearEquipmentGoldChoices when editGroup is called', async () => {
    // Import the function after mocking
    const { editGroup } = await import('~/src/stores/equipmentSelections');
    
    // Call editGroup
    editGroup('group1');
    
    // Verify that clearEquipmentGoldChoices was called
    expect(clearEquipmentGoldChoicesMock).toHaveBeenCalledOnce();
  });
});
