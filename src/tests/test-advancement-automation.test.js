/**
 * Test for the automated advancement clicking feature in debug mode.
 * This feature automatically clicks through advancement dialog steps when window.GAS.debug is true.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock all required modules first
vi.mock('svelte/store', () => ({
  writable: (value) => ({
    set: vi.fn(),
    update: vi.fn(),
    subscribe: vi.fn((fn) => {
      fn(value);
      return () => {};
    })
  }),
  derived: vi.fn(() => ({ subscribe: vi.fn() })),
  get: vi.fn((store) => store?.value || [])
}));

vi.mock('~/src/stores/index', () => ({
  activeTab: { set: vi.fn(), update: vi.fn(), subscribe: vi.fn() },
  tabs: { 
    update: vi.fn(),
    subscribe: vi.fn()
  },
  isLevelUp: { set: vi.fn(), update: vi.fn(), subscribe: vi.fn() },
  newLevelValueForExistingClass: { set: vi.fn(), update: vi.fn(), subscribe: vi.fn() },
  currentCharacter: { set: vi.fn(), update: vi.fn(), subscribe: vi.fn() }
}));

vi.mock('~/src/helpers/constants', () => ({
  MODULE_ID: 'foundryvtt-actor-studio'
}));

vi.mock('~/src/helpers/Utility', () => ({
  delay: vi.fn(),
  prepareItemForDrop: vi.fn(),
  dropItemOnCharacter: vi.fn()
}));

vi.mock('~/src/stores/startingEquipment', () => ({
  compatibleStartingEquipment: { subscribe: vi.fn() }
}));

vi.mock('~/src/stores/storeDefinitions', () => ({
  goldRoll: { set: vi.fn(), update: vi.fn(), subscribe: vi.fn() },
  characterClass: { set: vi.fn(), update: vi.fn(), subscribe: vi.fn() },
  background: { set: vi.fn(), update: vi.fn(), subscribe: vi.fn() }
}));

vi.mock('~/src/stores/goldChoices', () => ({
  goldChoices: {
    set: vi.fn(),
    update: vi.fn(),
    subscribe: vi.fn((fn) => {
      fn({ fromClass: { choice: null, goldValue: 0 }, fromBackground: { choice: null, goldValue: 0 } });
      return () => {};
    })
  },
  totalGoldFromChoices: { set: vi.fn(), update: vi.fn(), subscribe: vi.fn() }
}));

// Mock the PC WorkflowStateMachine to avoid importing heavy lib/workflow chain
vi.mock('~/src/helpers/PC/WorkflowStateMachine', () => ({
  getWorkflowFSM: vi.fn(() => ({ handle: vi.fn(), getCurrentState: vi.fn(() => 'idle') })),
  WORKFLOW_EVENTS: {}
}));

// Also mock lib/workflow to be safe if anything imports it indirectly
vi.mock('~/src/lib/workflow.js', () => ({
  handleAdvancementCompletion: vi.fn(),
  finalizeSpellSelection: vi.fn()
}));

// Mock FoundryVTT globals
global.game = {
  settings: { get: vi.fn() }
};

// Mock jQuery
const mockJQuery = (selector) => {
  const elements = mockJQuery.mockElements.filter(el => 
    el.selector === selector || el.matches === selector
  );
  
  const result = {
    length: elements.length,
    find: (subSelector) => mockJQuery(subSelector),
    each: (callback) => {
      elements.forEach((el, index) => callback(index, el));
      return result;
    },
    filter: (filterFn) => {
      const filtered = elements.filter(filterFn);
      return {
        ...result,
        length: filtered.length,
        first: () => filtered.length > 0 ? filtered[0] : { length: 0 }
      };
    },
    first: () => elements.length > 0 ? elements[0] : { length: 0 },
    prop: vi.fn(),
    click: vi.fn(),
    text: vi.fn(() => 'Next'),
    html: vi.fn(() => '<div>Some content</div>')
  };
  
  return result;
};

// Store mock elements that jQuery will find
mockJQuery.mockElements = [];

global.$ = mockJQuery;

// Mock window.GAS
global.window = {
  GAS: {
    debug: true,
    log: {
      d: vi.fn(),
      e: vi.fn()
    }
  }
};

describe('Advancement Automation in Debug Mode', () => {
  let AdvancementManager;
  
  beforeEach(async () => {
    vi.clearAllMocks();
    mockJQuery.mockElements = [];
    
    // Import after mocks are set up
    const { AdvancementManager: AM } = await import('~/src/helpers/AdvancementManager.js');
    AdvancementManager = AM;
  });

  afterEach(() => {
    vi.clearAllMocks();
    mockJQuery.mockElements = [];
  });

  it('should automatically click next buttons when in debug mode', () => {
    const nextButtonClickSpy = vi.fn();
    
    // Mock $ global function to return our mock elements
    global.$ = vi.fn((selector) => {
      if (selector === dialog) {
        return {
          find: (subSelector) => {
            if (subSelector === '[data-action="next"]') {
              return {
                length: 1,
                first: () => ({
                  length: 1,
                  prop: (prop) => prop === 'disabled' ? false : undefined,
                  click: nextButtonClickSpy
                })
              };
            }
            return { length: 0, first: () => ({ length: 0 }) };
          }
        };
      }
      return { length: 0 };
    });
    
    const dialog = { mockDialog: true };
    const mockPanel = {
      length: 1,
      find: (selector) => {
        if (selector === '.gas-advancements') {
          return {
            length: 1,
            each: (callback) => {
              callback(0, dialog);
            }
          };
        }
        return { length: 0 };
      },
      html: () => '<div>Some content</div>'
    };
    
    const manager = new AdvancementManager(
      { length: 1 },
      { set: vi.fn() },
      () => mockPanel
    );
    
    window.GAS.debug = true;
    
    manager.autoAdvanceSteps();
    
    expect(nextButtonClickSpy).toHaveBeenCalled();
    expect(window.GAS.log.d).toHaveBeenCalledWith(
      expect.stringContaining('[AUTO-ADVANCE] Clicking next button'),
      expect.any(Number)
    );
  });

  it('should automatically click complete buttons when no next button is available', () => {
    const completeButtonClickSpy = vi.fn();
    
    // Mock $ global function to return our mock elements
    const dialog = { mockDialog: true };
    global.$ = vi.fn((selector) => {
      if (selector === dialog) {
        return {
          find: (subSelector) => {
            if (subSelector === '[data-action="next"]') {
              return { length: 0, first: () => ({ length: 0 }) };
            }
            if (subSelector === '[data-action="complete"]') {
              return {
                length: 1,
                first: () => ({
                  length: 1,
                  prop: (prop) => prop === 'disabled' ? false : undefined,
                  click: completeButtonClickSpy
                })
              };
            }
            return { length: 0, first: () => ({ length: 0 }) };
          }
        };
      }
      return { length: 0 };
    });
    
    const mockPanel = {
      length: 1,
      find: (selector) => {
        if (selector === '.gas-advancements') {
          return {
            length: 1,
            each: (callback) => {
              callback(0, dialog);
            }
          };
        }
        return { length: 0 };
      },
      html: () => '<div>Some content</div>'
    };
    
    const manager = new AdvancementManager(
      { length: 1 },
      { set: vi.fn() },
      () => mockPanel
    );
    
    window.GAS.debug = true;
    
    manager.autoAdvanceSteps();
    
    expect(completeButtonClickSpy).toHaveBeenCalled();
    expect(window.GAS.log.d).toHaveBeenCalledWith(
      expect.stringContaining('[AUTO-ADVANCE] Clicking complete button'),
      expect.any(Number)
    );
  });

  it('should fall back to text-based button detection when no data-action buttons found', () => {
    const textButtonClickSpy = vi.fn();
    
    // Mock $ global function to return our mock elements
    const dialog = { mockDialog: true };
    global.$ = vi.fn((selector) => {
      if (selector === dialog) {
        return {
          find: (subSelector) => {
            if (subSelector === '[data-action="next"]' || subSelector === '[data-action="complete"]') {
              return { length: 0, first: () => ({ length: 0 }) };
            }
            if (subSelector === 'button') {
              return {
                length: 1,
                filter: (filterFn) => {
                  // Simulate a button that matches the text filter
                  const mockButton = {
                    text: () => 'Continue'
                  };
                  // Test if the filter function returns true for this button
                  const text = mockButton.text().toLowerCase().trim();
                  const matches = text.includes('next') || text.includes('continue') || text.includes('complete') || text.includes('finish');
                  
                  if (matches) {
                    return {
                      length: 1,
                      filter: () => ({
                        length: 1,
                        first: () => ({
                          length: 1,
                          text: () => 'Continue',
                          click: textButtonClickSpy
                        })
                      })
                    };
                  }
                  return { length: 0 };
                }
              };
            }
            return { length: 0, first: () => ({ length: 0 }) };
          }
        };
      }
      return { length: 0 };
    });
    
    const mockPanel = {
      length: 1,
      find: (selector) => {
        if (selector === '.gas-advancements') {
          return {
            length: 1,
            each: (callback) => {
              callback(0, dialog);
            }
          };
        }
        return { length: 0 };
      },
      html: () => '<div>Some content</div>'
    };
    
    const manager = new AdvancementManager(
      { length: 1 },
      { set: vi.fn() },
      () => mockPanel
    );
    
    window.GAS.debug = true;
    
    manager.autoAdvanceSteps();
    
    expect(textButtonClickSpy).toHaveBeenCalled();
    expect(window.GAS.log.d).toHaveBeenCalledWith(
      expect.stringContaining('[AUTO-ADVANCE] Clicking text-based button:'),
      'Continue'
    );
  });

  it('should not run automation when debug mode is disabled', () => {
    window.GAS.debug = false;
    
    const manager = new AdvancementManager(
      { length: 1 },
      { set: vi.fn() },
      () => mockPanel
    );
    
    manager.autoAdvanceSteps();
    
    // Should not have called any debug logs since debug is false
    expect(window.GAS.log.d).not.toHaveBeenCalledWith(
      expect.stringContaining('[AUTO-ADVANCE]')
    );
  });

  it('should handle errors gracefully in autoAdvanceSteps', () => {
    // Create a panel that throws an error during find
    const errorPanel = {
      length: 1,
      find: () => {
        throw new Error('Test error');
      },
      html: () => '<div>Some content</div>'
    };
    
    const manager = new AdvancementManager(
      { length: 1 },
      { set: vi.fn() },
      () => errorPanel
    );
    
    window.GAS.debug = true;
    
    // Should not throw
    expect(() => manager.autoAdvanceSteps()).not.toThrow();
    
    // Should log the error
    expect(window.GAS.log.e).toHaveBeenCalledWith(
      '[AUTO-ADVANCE] Error in autoAdvanceSteps:',
      expect.any(Error)
    );
  });

  it('should integrate with checkTabContent to run during advancement monitoring', () => {
    const mockPanel = {
      length: 1,
      find: () => ({ length: 0 }),
      html: () => '<div>Some content</div>'
    };
    
    const manager = new AdvancementManager(
      { length: 1 },
      { set: vi.fn() },
      () => mockPanel
    );
    
    // Mock the autoAdvanceSteps method to track if it's called
    const autoAdvanceStepsSpy = vi.spyOn(manager, 'autoAdvanceSteps');
    
    window.GAS.debug = true;
    
    // Simulate checkTabContent when tab is not empty
    const mockResolve = vi.fn();
    
    // Mock isTabContentEmpty to return false (not empty)
    vi.spyOn(manager, 'isTabContentEmpty').mockReturnValue(false);
    
    // Call checkTabContent
    manager.checkTabContent(mockResolve, 'advancements', 100);
    
    // Should have called autoAdvanceSteps
    expect(autoAdvanceStepsSpy).toHaveBeenCalled();
  });
});
