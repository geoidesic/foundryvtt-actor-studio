/**
 * Test script to verify that destroyAdvancementManagers is called when transitioning to equipment state
 * This tests the live behavior rather than mocked test environment
 */

const { beforeEach, afterEach, test, expect, vi, describe } = await import('vitest');

// Mock FoundryVTT game object
global.game = {
  settings: {
    get: vi.fn().mockImplementation((moduleId, setting) => {
      if (setting === 'disableAdvancementCapture') {
        return true; // Enable advancement capture disabled for this test
      }
      return false;
    })
  }
};

global.MODULE_ID = 'actor-studio';

// Mock global window objects
global.window = global.window || {};
global.window.GAS = {
  log: {
    d: vi.fn()
  }
};

global.Hooks = {
  call: vi.fn()
};

// Import the FSM
const { workflowFSM, workflowFSMContext } = await import('./src/helpers/WorkflowStateMachine.js');

describe('Live Equipment Transition', () => {
  let destroyAdvancementManagersCalled = false;
  
  beforeEach(() => {
    destroyAdvancementManagersCalled = false;
    
    // Mock the AdvancementManager import dynamically to track calls
    vi.doMock('./src/helpers/AdvancementManager.js', () => ({
      destroyAdvancementManagers: vi.fn(() => {
        destroyAdvancementManagersCalled = true;
        console.log('[TEST] destroyAdvancementManagers was called!');
      })
    }));
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  test('should call destroyAdvancementManagers when entering selecting_equipment state with advancement capture disabled', async () => {
    // Make sure FSM is in idle state
    if (workflowFSM.getCurrentState() !== 'idle') {
      workflowFSM.handle('reset');
    }
    
    console.log('[TEST] Starting test - current state:', workflowFSM.getCurrentState());
    console.log('[TEST] Advancement capture disabled:', game.settings.get('actor-studio', 'disableAdvancementCapture'));
    
    // Manually transition to selecting_equipment state to trigger onEnter handler
    console.log('[TEST] Transitioning to selecting_equipment state...');
    
    // We need to manually enter the selecting_equipment state since the FSM is complex
    // Let's directly test the onEnter handler
    const selectingEquipmentState = workflowFSM.getStates().find(s => s.name === 'selecting_equipment');
    if (selectingEquipmentState && selectingEquipmentState.onEnter) {
      console.log('[TEST] Found selecting_equipment state, calling onEnter handler...');
      await selectingEquipmentState.onEnter(workflowFSMContext);
    } else {
      console.log('[TEST] Could not find selecting_equipment state or onEnter handler');
    }
    
    // Give some time for async operations
    await new Promise(resolve => setTimeout(resolve, 100));
    
    console.log('[TEST] destroyAdvancementManagers called:', destroyAdvancementManagersCalled);
    
    // Verify that destroyAdvancementManagers was called
    expect(destroyAdvancementManagersCalled).toBe(true);
  });
});
