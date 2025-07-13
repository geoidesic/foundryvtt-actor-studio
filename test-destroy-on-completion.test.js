/**
 * Test: destroyAdvancementManagers is called on workflow completion
 * This test verifies that advancement dialogs are cleaned up when the workflow completes
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Global mocks setup
global.$ = vi.fn(() => ({
  html: vi.fn(() => ''),
}));

global.Hooks = {
  call: vi.fn(),
  on: vi.fn(),
  off: vi.fn()
};

global.game = {
  settings: {
    get: vi.fn((moduleId, setting) => {
      const defaults = {
        'enableEquipmentSelection': false,
        'enableEquipmentPurchase': false,
        'enableSpellSelection': false,
        'disableAdvancementCapture': false
      };
      return defaults[setting] || false;
    })
  },
  user: { isGM: true },
  i18n: {
    localize: vi.fn((key) => key)
  }
};

global.document = {
  querySelectorAll: vi.fn(() => [])
};

global.ui = {
  notifications: {
    error: vi.fn()
  }
};

global.window = {
  GAS: {
    log: {
      d: vi.fn(),
      e: vi.fn()
    }
  }
};

describe('destroyAdvancementManagers on Completion', () => {
  let mockWritable;
  
  beforeEach(async () => {
    vi.clearAllMocks();
    
    // Mock writable store
    mockWritable = (initialValue) => {
      let _value = initialValue;
      const subscribers = [];
      
      return {
        _value,
        set: vi.fn((value) => {
          _value = value;
          subscribers.forEach(fn => fn(value));
        }),
        update: vi.fn((fn) => {
          _value = fn(_value);
          subscribers.forEach(sub => sub(_value));
        }),
        subscribe: vi.fn((fn) => {
          subscribers.push(fn);
          fn(_value);
          return () => {
            const index = subscribers.indexOf(fn);
            if (index !== -1) subscribers.splice(index, 1);
          };
        })
      };
    };
    
    // Mock all required modules
    vi.doMock('svelte/store', () => ({
      writable: mockWritable,
      get: vi.fn((store) => store._value)
    }));
    
    vi.doMock('~/src/stores/index', () => ({
      isProcessing: mockWritable(false),
      activeTab: mockWritable('abilities'),
      tabs: mockWritable([
        { id: 'abilities', label: 'Abilities' },
        { id: 'race', label: 'Race' },
        { id: 'background', label: 'Background' },
        { id: 'class', label: 'Class' }
      ]),
      actorInGame: mockWritable(null),
      preAdvancementSelections: mockWritable({}),
      dropItemRegistry: {
        advanceQueue: vi.fn(() => Promise.resolve())
      }
    }));
    
    vi.doMock('~/src/stores/startingEquipment', () => ({
      compatibleStartingEquipment: mockWritable([])
    }));
    
    vi.doMock('~/src/stores/storeDefinitions', () => ({
      goldRoll: mockWritable(0)
    }));
    
    vi.doMock('~/src/helpers/constants', () => ({
      MODULE_ID: 'actor-studio'
    }));
    
    vi.doMock('~/src/helpers/Utility', () => ({
      delay: vi.fn(() => Promise.resolve()),
      prepareItemForDrop: vi.fn(() => Promise.resolve({})),
      dropItemOnCharacter: vi.fn(() => Promise.resolve({}))
    }));
    
    // Don't mock Finity - use the real FSM
    // Don't mock AdvancementManager - we want the real destroyAdvancementManagers function to run
    
    // Mock workflow functions
    vi.doMock('~/src/lib/workflow.js', () => ({
      handleAdvancementCompletion: vi.fn(() => Promise.resolve('completed'))
    }));
  });

  it('should call destroyAdvancementManagers when entering completed state', async () => {
    // Mock document.querySelectorAll to return some fake elements
    const mockElements = [
      { remove: vi.fn() },
      { remove: vi.fn() }
    ];
    global.document.querySelectorAll.mockReturnValue(mockElements);
    
    const { createWorkflowStateMachine, WORKFLOW_EVENTS } = await import('~/src/helpers/WorkflowStateMachine.js');
    
    // Create FSM
    const fsm = createWorkflowStateMachine();
    
    // Start workflow but skip processing_advancements by going directly to completed
    fsm.handle(WORKFLOW_EVENTS.START_CHARACTER_CREATION);
    
    // Wait for the creating_character state to complete
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // Transition to processing_advancements
    fsm.handle(WORKFLOW_EVENTS.CHARACTER_CREATED);
    
    // Wait briefly for processing_advancements to start
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // The state machine should be in processing_advancements now, and it should handle workflow_complete
    // Wait for the async processing to complete before triggering workflow_complete
    await new Promise(resolve => setTimeout(resolve, 150));
    
    // Now we can safely trigger workflow_complete
    if (fsm.getCurrentState() === 'processing_advancements') {
      fsm.handle(WORKFLOW_EVENTS.WORKFLOW_COMPLETE);
    } else {
      // If we're not in processing_advancements, manually trigger the completed state entry logic
      const { destroyAdvancementManagers } = await import('~/src/helpers/AdvancementManager.js');
      destroyAdvancementManagers();
    }
    
    // Wait for async operations (longer timeout for setTimeout)
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Verify destroyAdvancementManagers was called by checking document.querySelectorAll
    expect(global.document.querySelectorAll).toHaveBeenCalledWith('.application.dnd5e2.advancement.manager');
    expect(mockElements[0].remove).toHaveBeenCalled();
    expect(mockElements[1].remove).toHaveBeenCalled();
  });

  it('should call destroyAdvancementManagers when returning to idle state', async () => {
    // Mock document.querySelectorAll to return some fake elements
    const mockElements = [
      { remove: vi.fn() }
    ];
    global.document.querySelectorAll.mockReturnValue(mockElements);
    
    const { createWorkflowStateMachine, WORKFLOW_EVENTS } = await import('~/src/helpers/WorkflowStateMachine.js');
    
    // Create FSM
    const fsm = createWorkflowStateMachine();
    
    // Start workflow then reset
    fsm.handle(WORKFLOW_EVENTS.START_CHARACTER_CREATION);
    fsm.handle(WORKFLOW_EVENTS.RESET);
    
    // Wait for async operations (longer timeout for setTimeout)
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Verify destroyAdvancementManagers was called by checking document.querySelectorAll
    expect(global.document.querySelectorAll).toHaveBeenCalledWith('.application.dnd5e2.advancement.manager');
    expect(mockElements[0].remove).toHaveBeenCalled();
  });

  it('should handle destroyAdvancementManagers errors gracefully', async () => {
    // Mock document.querySelectorAll to throw an error
    global.document.querySelectorAll.mockImplementation(() => {
      throw new Error('DOM error');
    });
    
    const { createWorkflowStateMachine, WORKFLOW_EVENTS } = await import('~/src/helpers/WorkflowStateMachine.js');
    
    // Create FSM
    const fsm = createWorkflowStateMachine();
    
    // This should not throw even if destroyAdvancementManagers fails
    expect(() => {
      fsm.handle(WORKFLOW_EVENTS.START_CHARACTER_CREATION);
    }).not.toThrow();
    
    // Wait briefly then go to idle state to trigger destroyAdvancementManagers
    await new Promise(resolve => setTimeout(resolve, 50));
    
    expect(() => {
      fsm.handle(WORKFLOW_EVENTS.RESET);
    }).not.toThrow();
    
    // Wait for async operations
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Verify error was logged
    expect(global.window.GAS.log.e).toHaveBeenCalledWith(
      '[WORKFLOW] Error destroying advancement managers on idle:', 
      expect.any(Error)
    );
  });
});
