/**
 * Test for the DOM watcher functionality in AdvancementManager
 * Tests that the advancement tab closes automatically when empty
 * and respects the advancementCaptureTimerThreshold setting
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { get } from 'svelte/store';

// Mock the entire stores module  
vi.mock('~/src/stores/index', () => ({
  activeTab: { 
    subscribe: vi.fn(), 
    set: vi.fn(), 
    update: vi.fn() 
  },
  preAdvancementSelections: { subscribe: vi.fn() }
}));

// Mock svelte/store get function
vi.mock('svelte/store', () => ({
  get: vi.fn()
}));

import { AdvancementManager, createTestAdvancementManager } from '~/src/helpers/AdvancementManager';
import { activeTab } from '~/src/stores/index';
import { get } from 'svelte/store';

// Mock jQuery
const mockPanel = {
  html: vi.fn()
};

global.$ = vi.fn(() => mockPanel);

// Mock game settings
global.game = {
  settings: {
    get: vi.fn((moduleId, settingName) => {
      if (settingName === 'advancementCaptureTimerThreshold') {
        return 500; // 500ms delay
      }
      if (settingName === 'disableAdvancementCapture') {
        return false; // Advancement capture is enabled
      }
      return null;
    })
  }
};

// Mock window.GAS.log
global.window = {
  GAS: {
    log: {
      d: vi.fn()
    }
  }
};

// Mock delay function
vi.mock('~/src/helpers/Utility', () => ({
  delay: vi.fn((ms) => new Promise(resolve => setTimeout(resolve, ms))),
  prepareItemForDrop: vi.fn(),
  dropItemOnCharacter: vi.fn()
}));

// Mock workflow state machine
vi.mock('~/src/helpers/WorkflowStateMachine', () => ({
  workflowStateMachine: {
    getState: vi.fn(() => 'processing_advancements'),
    transition: vi.fn(),
    currentState: {
      subscribe: vi.fn()
    }
  },
  WORKFLOW_EVENTS: {
    ADVANCEMENTS_COMPLETE: 'ADVANCEMENTS_COMPLETE'
  }
}));

// Mock stores
vi.mock('~/src/stores/startingEquipment', () => ({
  compatibleStartingEquipment: { subscribe: vi.fn() }
}));

vi.mock('~/src/stores/storeDefinitions', () => ({
  goldRoll: { subscribe: vi.fn() }
}));

describe('AdvancementManager DOM Watcher', () => {
  let advancementManager;
  let mockStore;
  let mockInProcessStore;
  let mockPanel;

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

    // Create mock stores
    mockStore = {
      subscribe: vi.fn(),
      remove: vi.fn()
    };

    mockInProcessStore = {
      set: vi.fn()
    };

    // Use injected test helper for AdvancementManager
    advancementManager = createTestAdvancementManager(mockStore, mockInProcessStore, '');
    mockPanel = { html: vi.fn(() => '') };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('isTabContentEmpty', () => {
    it('should return false when not on advancements tab', () => {
      // Mock get function to return equipment tab
      vi.mocked(get).mockReturnValue('equipment');

      const result = advancementManager.isTabContentEmpty('advancements');
      expect(result).toBe(false);
    });

    it('should return false when panel is not found', () => {
      // Create advancement manager with null panel
      const nullPanelManager = new AdvancementManager(mockStore, mockInProcessStore, () => null);
      
      // Mock get function to return advancements tab
      vi.mocked(get).mockReturnValue('advancements');

      const result = nullPanelManager.isTabContentEmpty('advancements');
      expect(result).toBe(false);
    });

    it('should return true when panel content is empty', () => {
      // Create advancement manager with empty content
      const emptyManager = createTestAdvancementManager(mockStore, mockInProcessStore, '   '); // whitespace only
      
      // Mock get function to return advancements tab
      vi.mocked(get).mockReturnValue('advancements');

      const result = emptyManager.isTabContentEmpty('advancements');
      expect(result).toBe(true);
    });

    it('should return false when panel has content', () => {
      // Create advancement manager with content
      const contentManager = createTestAdvancementManager(mockStore, mockInProcessStore, '<div>Some advancement content</div>');
      
      // Mock get function to return advancements tab
      vi.mocked(get).mockReturnValue('advancements');

      const result = contentManager.isTabContentEmpty('advancements');
      expect(result).toBe(false);
    });

    it('should use correct DOM selector', () => {
      // This test checks the default behavior when no custom getPanel is provided
      global.$ = vi.fn(() => ({ html: () => '' }));
      
      // Create advancement manager without custom getPanel
      const defaultManager = new AdvancementManager(mockStore, mockInProcessStore);
      
      // Mock get function to return advancements tab
      vi.mocked(get).mockReturnValue('advancements');
      
      defaultManager.isTabContentEmpty('advancements');
      
      expect(global.$).toHaveBeenCalledWith(
        '#foundryvtt-actor-studio-pc-sheet .window-content main section.a .tab-content .container .content'
      );
    });
  });

  describe('waitForEmptyTab', () => {
    it('should resolve immediately when tab is already empty', async () => {
      // Create manager with empty content
      const emptyManager = createTestAdvancementManager(mockStore, mockInProcessStore, '');
      vi.mocked(get).mockReturnValue('advancements');

      const startTime = Date.now();
      await emptyManager.waitForEmptyTab('advancements');
      const endTime = Date.now();

      // Should resolve quickly (within 100ms) since tab is already empty
      expect(endTime - startTime).toBeLessThan(100);
    }, 10000);

    it('should wait and resolve when tab becomes empty', async () => {
      let callCount = 0;
      const dynamicGetPanel = () => {
        callCount++;
        if (callCount <= 2) {
          return { html: () => '<div>Some content</div>' }; // has content first 2 calls
        }
        return { html: () => '' }; // becomes empty on 3rd call
      };
      const dynamicManager = createTestAdvancementManager(mockStore, mockInProcessStore, '', dynamicGetPanel);
      vi.mocked(get).mockReturnValue('advancements');

      const startTime = Date.now();
      await dynamicManager.waitForEmptyTab('advancements');
      const endTime = Date.now();

      // Should take some time (at least 500ms * 2 = 1000ms) since it had to wait
      expect(endTime - startTime).toBeGreaterThan(500);
      expect(callCount).toBeGreaterThan(2);
    }, 10000);

    it('should return existing promise if already monitoring', async () => {
      // Create a manager that will take time to resolve (has content initially)
      let callCount = 0;
      const slowGetPanel = () => {
        callCount++;
        if (callCount <= 5) {
          return { html: () => '<div>Content</div>' }; // has content for first 5 calls
        }
        return { html: () => '' }; // becomes empty after 5 calls
      };
      const contentManager = createTestAdvancementManager(mockStore, mockInProcessStore, '', slowGetPanel);
      vi.mocked(get).mockReturnValue('advancements');

      // Start first monitoring
      const promise1 = contentManager.waitForEmptyTab('advancements');
      
      // Start second monitoring immediately - should return same promise
      const promise2 = contentManager.waitForEmptyTab('advancements');
      
      expect(promise1).toBe(promise2);

      // Wait for both to complete
      await Promise.all([promise1, promise2]);
    }, 10000);
  });

  describe('watchAdvancementManager', () => {
    it('should use advancementCaptureTimerThreshold setting', async () => {
      const { delay } = await import('~/src/helpers/Utility');
      const emptyManager = createTestAdvancementManager(mockStore, mockInProcessStore, ''); // empty tab so it resolves quickly
      vi.mocked(get).mockReturnValue('advancements');

      await emptyManager.watchAdvancementManager();

      expect(game.settings.get).toHaveBeenCalledWith('foundryvtt-actor-studio', 'advancementCaptureTimerThreshold');
      expect(delay).toHaveBeenCalledWith(500); // the mocked threshold value
    }, 10000);

    it('should skip monitoring when advancement capture is disabled', async () => {
      game.settings.get.mockImplementation((moduleId, settingName) => {
        if (settingName === 'disableAdvancementCapture') {
          return true; // disabled
        }
        return 500;
      });

      const spy = vi.spyOn(advancementManager, 'waitForEmptyTab');
      
      await advancementManager.watchAdvancementManager();

      expect(spy).not.toHaveBeenCalled();
    }, 10000);

    it('should wait for empty tab when advancement capture is enabled', async () => {
      const emptyManager = createTestAdvancementManager(mockStore, mockInProcessStore, ''); // empty tab
      vi.mocked(get).mockReturnValue('advancements');
      const spy = vi.spyOn(emptyManager, 'waitForEmptyTab');
      
      await emptyManager.watchAdvancementManager();

      expect(spy).toHaveBeenCalledWith('advancements');
      expect(window.GAS.log.d).toHaveBeenCalledWith('[ADVANCEMENT MANAGER] waiting for advancements tab to be empty');
      expect(window.GAS.log.d).toHaveBeenCalledWith('[ADVANCEMENT MANAGER] advancements tab is empty');
    }, 10000);

    it('should reset monitoring promise after completion', async () => {
      const emptyManager = createTestAdvancementManager(mockStore, mockInProcessStore, ''); // empty tab
      vi.mocked(get).mockReturnValue('advancements');
      
      await emptyManager.watchAdvancementManager();
      
      expect(emptyManager.monitoringPromise).toBe(null);
    }, 10000);
  });

  describe('Integration with workflow', () => {
    it('should advance queue after waiting for empty tab', async () => {
      const emptyManager = createTestAdvancementManager(mockStore, mockInProcessStore, ''); // empty tab
      vi.mocked(get).mockReturnValue('advancements');
      
      // Mock the store's subscribe AND the store itself to return empty array
      vi.mocked(mockStore.subscribe).mockImplementation((callback) => {
        callback([]); // empty queue
        return () => {};
      });
      
      // Mock the get function to return empty array when called with the store
      vi.mocked(get).mockImplementation((store) => {
        if (store === mockStore) {
          return []; // empty queue
        }
        return 'advancements'; // default to advancements tab
      });

      const spy = vi.spyOn(emptyManager, 'handleEmptyQueue');
      
      // Call advanceQueue instead of watchAdvancementManager to trigger handleEmptyQueue
      await emptyManager.advanceQueue();

      // Should call handleEmptyQueue since queue is empty
      expect(spy).toHaveBeenCalled();
    }, 10000);

    it('should close or equip when queue becomes empty', async () => {
      const mockActor = { id: 'test-actor', classes: {} };
      
      // Mock inProcessStore to have an actor
      vi.mocked(mockInProcessStore.set).mockImplementation(() => {});
      
      // Mock get function to return the actor from inProcessStore
      vi.mocked(get).mockImplementation((store) => {
        if (store === mockInProcessStore) {
          return { actor: mockActor };
        }
        return [];
      });

      const spy = vi.spyOn(advancementManager, 'closeOrEquip');
      
      advancementManager.handleEmptyQueue();

      expect(mockInProcessStore.set).toHaveBeenCalledWith(false);
      expect(spy).toHaveBeenCalledWith(mockActor);
    }, 10000);
  });
});
