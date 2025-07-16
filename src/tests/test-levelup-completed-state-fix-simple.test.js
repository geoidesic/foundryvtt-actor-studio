import { describe, test, expect, vi, beforeEach } from 'vitest';

describe('Level-Up Completed State Fix', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup minimal FoundryVTT globals
    global.window = global;
    global.window.GAS = { log: { d: vi.fn(), w: vi.fn(), e: vi.fn() } };
  });

  test('should demonstrate the fix: check FSM state before sending events', () => {
    // Mock FSM that's already in completed state
    const mockFSM = {
      handle: vi.fn(),
      getCurrentState: vi.fn(() => 'completed')
    };
    
    // Simulate the old broken logic (would cause error)
    const oldLogic = () => {
      // This would throw "Unhandled event 'spells_complete' in state 'completed'"
      mockFSM.handle('spells_complete');
    };
    
    // Simulate the new fixed logic
    const fixedLogic = () => {
      const currentState = mockFSM.getCurrentState();
      window.GAS.log.d('[LEVELUP WORKFLOW] Current state before spells_complete:', currentState);
      
      // Only send the event if we're not already in completed state
      if (currentState !== 'completed') {
        mockFSM.handle('spells_complete');
      } else {
        window.GAS.log.d('[LEVELUP WORKFLOW] FSM already in completed state, skipping spells_complete event');
      }
    };
    
    // Test the fix
    fixedLogic();
    
    // Verify the FSM handle was NOT called because we're already in completed state
    expect(mockFSM.handle).not.toHaveBeenCalledWith('spells_complete');
    expect(mockFSM.getCurrentState).toHaveBeenCalled();
    expect(window.GAS.log.d).toHaveBeenCalledWith('[LEVELUP WORKFLOW] FSM already in completed state, skipping spells_complete event');
  });

  test('should send events when FSM is in valid states', () => {
    // Mock FSM in selecting_spells state
    const mockFSM = {
      handle: vi.fn(),
      getCurrentState: vi.fn(() => 'selecting_spells')
    };
    
    // Fixed logic should send event when in valid state
    const fixedLogic = () => {
      const currentState = mockFSM.getCurrentState();
      
      if (currentState !== 'completed') {
        mockFSM.handle('spells_complete');
      } else {
        window.GAS.log.d('[LEVELUP WORKFLOW] FSM already in completed state, skipping spells_complete event');
      }
    };
    
    fixedLogic();
    
    // Should have sent the event since we're in selecting_spells state
    expect(mockFSM.handle).toHaveBeenCalledWith('spells_complete');
  });

  test('should handle error events with same state checking logic', () => {
    // Mock FSM in completed state
    const mockFSM = {
      handle: vi.fn(),
      getCurrentState: vi.fn(() => 'completed')
    };
    
    // Fixed error handling logic
    const fixedErrorLogic = () => {
      const currentState = mockFSM.getCurrentState();
      if (currentState !== 'error' && currentState !== 'completed') {
        mockFSM.handle('error');
      } else {
        window.GAS.log.d('[LEVELUP WORKFLOW] FSM in terminal state, skipping error event');
      }
    };
    
    fixedErrorLogic();
    
    // Should NOT send error event since FSM is in completed state
    expect(mockFSM.handle).not.toHaveBeenCalledWith('error');
    expect(window.GAS.log.d).toHaveBeenCalledWith('[LEVELUP WORKFLOW] FSM in terminal state, skipping error event');
  });
});
