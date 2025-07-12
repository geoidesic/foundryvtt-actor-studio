





import { get } from 'svelte/store';
import AdvancementManager from '~/src/stores/AdvancementManager';
import * as Utility from '~/src/helpers/Utility';









// Mock external dependencies
jest.mock('~/src/helpers/Utility', () => ({
  delay: vi.fn(() => Promise.resolve()),
}));









































































describe('AdvancementManager', () => {
  let mockStore;
  let mockInProcessStore;
  let advancementManager;
  let mockPanel;

  beforeEach(() => {
































































































































































    // Mock global game object with settings
    window.GAS = { log: { d: vi.fn() } };
    game.settings.get = vi.fn().mockImplementation((moduleId, settingName) => {
      if (settingName === 'advancementCaptureTimerThreshold') {
        return 500;

      }
      if (settingName === 'disableAdvancementCapture') {
        return false; // enabled by default
      }
    });










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
      // Create a mock panel that is always empty
      const alwaysEmptyPanel = { html: () => '' };
      const emptyManager = createTestAdvancementManager(mockStore, mockInProcessStore, '', () => alwaysEmptyPanel);
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
  });
});
