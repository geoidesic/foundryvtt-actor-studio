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

import { AdvancementManager, createTestAdvancementManager } from '~/src/helpers/AdvancementManager';
import { activeTab } from '~/src/stores/index';

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
      // Mock active tab as something else
      vi.mocked(activeTab.subscribe).mockImplementation((callback) => {
        callback('equipment');
        return () => {};
      });

      const result = advancementManager.isTabContentEmpty('advancements');
      expect(result).toBe(false);
    });

    it('should return false when panel is not found', () => {
      global.$ = vi.fn(() => null);

      const result = advancementManager.isTabContentEmpty('advancements');
      expect(result).toBe(false);
    });

    it('should return true when panel content is empty', () => {
      mockPanel.html.mockReturnValue('   '); // whitespace only

      const result = advancementManager.isTabContentEmpty('advancements');
      expect(result).toBe(true);
    });

    it('should return false when panel has content', () => {
      mockPanel.html.mockReturnValue('<div>Some advancement content</div>');

      const result = advancementManager.isTabContentEmpty('advancements');
      expect(result).toBe(false);
    });

    it('should use correct DOM selector', () => {
      mockPanel.html.mockReturnValue('');
      
      advancementManager.isTabContentEmpty('advancements');
      
      expect(global.$).toHaveBeenCalledWith(
        '#foundryvtt-actor-studio-pc-sheet .window-content main section.a .tab-content .container .content'
      );
    });
  });

  describe('waitForEmptyTab', () => {
    it('should resolve immediately when tab is already empty', async () => {
      mockPanel.html.mockReturnValue(''); // empty content

      const startTime = Date.now();
      await advancementManager.waitForEmptyTab('advancements');
      const endTime = Date.now();

      // Should resolve quickly (within 100ms) since tab is already empty
      expect(endTime - startTime).toBeLessThan(100);
    });

    it('should wait and resolve when tab becomes empty', async () => {
      let callCount = 0;
      mockPanel.html.mockImplementation(() => {
        callCount++;
        if (callCount <= 2) {
          return '<div>Some content</div>'; // has content first 2 calls
        }
        return ''; // becomes empty on 3rd call
      });

      const startTime = Date.now();
      await advancementManager.waitForEmptyTab('advancements');
      const endTime = Date.now();

      // Should take some time (at least 600ms * 2 = 1200ms) since it had to wait
      expect(endTime - startTime).toBeGreaterThan(1000);
      expect(callCount).toBeGreaterThan(2);
    });

    it('should return existing promise if already monitoring', async () => {
      mockPanel.html.mockReturnValue('<div>Content</div>');

      // Start first monitoring
      const promise1 = advancementManager.waitForEmptyTab('advancements');
      
      // Start second monitoring - should return same promise
      const promise2 = advancementManager.waitForEmptyTab('advancements');
      
      expect(promise1).toBe(promise2);

      // Make content empty to resolve promises
      mockPanel.html.mockReturnValue('');
      
      await Promise.all([promise1, promise2]);
    });
  });

  describe('watchAdvancementManager', () => {
    it('should use advancementCaptureTimerThreshold setting', async () => {
      const { delay } = await import('~/src/helpers/Utility');
      mockPanel.html.mockReturnValue(''); // empty tab so it resolves quickly

      await advancementManager.watchAdvancementManager();

      expect(game.settings.get).toHaveBeenCalledWith('foundryvtt-actor-studio', 'advancementCaptureTimerThreshold');
      expect(delay).toHaveBeenCalledWith(500); // the mocked threshold value
    });

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
    });

    it('should wait for empty tab when advancement capture is enabled', async () => {
      mockPanel.html.mockReturnValue(''); // empty tab
      const spy = vi.spyOn(advancementManager, 'waitForEmptyTab');
      
      await advancementManager.watchAdvancementManager();

      expect(spy).toHaveBeenCalledWith('advancements');
      expect(window.GAS.log.d).toHaveBeenCalledWith('[ADVANCEMENT MANAGER] waiting for advancements tab to be empty');
      expect(window.GAS.log.d).toHaveBeenCalledWith('[ADVANCEMENT MANAGER] advancements tab is empty');
    });

    it('should reset monitoring promise after completion', async () => {
      mockPanel.html.mockReturnValue(''); // empty tab
      
      await advancementManager.watchAdvancementManager();
      
      expect(advancementManager.monitoringPromise).toBe(null);
    });
  });

  describe('Integration with workflow', () => {
    it('should advance queue after waiting for empty tab', async () => {
      mockPanel.html.mockReturnValue(''); // empty tab
      
      // Mock the store to have no items (empty queue)
      vi.mocked(mockStore.subscribe).mockImplementation((callback) => {
        callback([]); // empty queue
        return () => {};
      });

      const spy = vi.spyOn(advancementManager, 'handleEmptyQueue');
      
      await advancementManager.watchAdvancementManager();

      // Should eventually call handleEmptyQueue since queue is empty
      expect(spy).toHaveBeenCalled();
    });

    it('should close or equip when queue becomes empty', async () => {
      const mockActor = { id: 'test-actor', classes: {} };
      
      // Mock inProcessStore to have an actor
      vi.mocked(mockInProcessStore.set).mockImplementation(() => {});
      
      // Mock get function to return the actor from inProcessStore
      const originalGet = await import('svelte/store').then(m => m.get);
      vi.mocked(originalGet).mockImplementation((store) => {
        if (store === mockInProcessStore) {
          return { actor: mockActor };
        }
        return [];
      });

      const spy = vi.spyOn(advancementManager, 'closeOrEquip');
      
      advancementManager.handleEmptyQueue();

      expect(mockInProcessStore.set).toHaveBeenCalledWith(false);
      expect(spy).toHaveBeenCalledWith(mockActor);
    });
  });
});
