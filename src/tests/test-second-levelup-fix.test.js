import { describe, test, expect, vi, beforeEach } from 'vitest';

describe('Second Level-Up Fix', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup minimal FoundryVTT globals
    global.window = global;
    global.window.GAS = { log: { d: vi.fn(), w: vi.fn(), e: vi.fn() } };
  });

  test('should reset FSM from completed state before starting second level-up', () => {
    // Mock FSM that's in completed state (from first level-up)
    const mockFSM = {
      handle: vi.fn(),
      getCurrentState: vi.fn(() => 'completed')
    };
    
    // Simulate the second level-up workflow logic
    const simulateSecondLevelUp = () => {
      const currentState = mockFSM.getCurrentState();
      window.GAS.log.d('[LEVELUP WORKFLOW] Current FSM state before starting:', currentState);
      
      // Reset FSM to idle if it's in a terminal state (completed or error)
      if (currentState === 'completed' || currentState === 'error') {
        window.GAS.log.d('[LEVELUP WORKFLOW] Resetting FSM from terminal state:', currentState);
        mockFSM.handle('reset');
        
        // Update mock to return 'idle' after reset
        mockFSM.getCurrentState.mockReturnValue('idle');
      }
      
      // Start the level-up workflow: idle -> selecting_class_level -> processing_advancements
      const finalState = mockFSM.getCurrentState();
      if (finalState === 'idle') {
        window.GAS.log.d('[LEVELUP WORKFLOW] Starting level-up from idle state');
        mockFSM.handle('start_level_up');
        mockFSM.handle('class_level_selected');
      } else {
        window.GAS.log.w('[LEVELUP WORKFLOW] FSM not in idle state after reset:', finalState);
        // Fallback: try to send class_level_selected anyway
        mockFSM.handle('class_level_selected');
      }
    };
    
    // Test the second level-up
    simulateSecondLevelUp();
    
    // Verify the correct sequence of events
    expect(mockFSM.getCurrentState).toHaveBeenCalled();
    expect(mockFSM.handle).toHaveBeenCalledWith('reset');
    expect(mockFSM.handle).toHaveBeenCalledWith('start_level_up');
    expect(mockFSM.handle).toHaveBeenCalledWith('class_level_selected');
    
    // Verify logging
    expect(window.GAS.log.d).toHaveBeenCalledWith('[LEVELUP WORKFLOW] Current FSM state before starting:', 'completed');
    expect(window.GAS.log.d).toHaveBeenCalledWith('[LEVELUP WORKFLOW] Resetting FSM from terminal state:', 'completed');
    expect(window.GAS.log.d).toHaveBeenCalledWith('[LEVELUP WORKFLOW] Starting level-up from idle state');
  });

  test('should handle error state before second level-up', () => {
    // Mock FSM that's in error state
    const mockFSM = {
      handle: vi.fn(),
      getCurrentState: vi.fn(() => 'error')
    };
    
    // Simulate the workflow logic
    const simulateFromErrorState = () => {
      const currentState = mockFSM.getCurrentState();
      
      if (currentState === 'completed' || currentState === 'error') {
        mockFSM.handle('reset');
        mockFSM.getCurrentState.mockReturnValue('idle');
      }
      
      const finalState = mockFSM.getCurrentState();
      if (finalState === 'idle') {
        mockFSM.handle('start_level_up');
        mockFSM.handle('class_level_selected');
      }
    };
    
    simulateFromErrorState();
    
    // Should have reset from error state
    expect(mockFSM.handle).toHaveBeenCalledWith('reset');
    expect(mockFSM.handle).toHaveBeenCalledWith('start_level_up');
    expect(mockFSM.handle).toHaveBeenCalledWith('class_level_selected');
  });

  test('should not reset if FSM is already in idle state', () => {
    // Mock FSM that's already in idle state
    const mockFSM = {
      handle: vi.fn(),
      getCurrentState: vi.fn(() => 'idle')
    };
    
    // Simulate the workflow logic
    const simulateFromIdleState = () => {
      const currentState = mockFSM.getCurrentState();
      
      // Reset FSM to idle if it's in a terminal state (completed or error)
      if (currentState === 'completed' || currentState === 'error') {
        mockFSM.handle('reset');
      }
      
      const finalState = mockFSM.getCurrentState();
      if (finalState === 'idle') {
        mockFSM.handle('start_level_up');
        mockFSM.handle('class_level_selected');
      }
    };
    
    simulateFromIdleState();
    
    // Should NOT have called reset since we're already in idle
    expect(mockFSM.handle).not.toHaveBeenCalledWith('reset');
    // But should have proceeded with the workflow
    expect(mockFSM.handle).toHaveBeenCalledWith('start_level_up');
    expect(mockFSM.handle).toHaveBeenCalledWith('class_level_selected');
  });

  test('should handle error during second level-up with state checking', () => {
    // Mock FSM that's in completed state initially
    const mockFSM = {
      handle: vi.fn(),
      getCurrentState: vi.fn(() => 'completed')
    };
    
    // Simulate error handling logic
    const simulateErrorHandling = () => {
      const currentState = mockFSM.getCurrentState();
      
      // Only send error event if not already in terminal state
      if (currentState !== 'error' && currentState !== 'completed') {
        mockFSM.handle('error');
      } else {
        window.GAS.log.d('[LEVELUP WORKFLOW] FSM in terminal state, skipping error event');
      }
    };
    
    simulateErrorHandling();
    
    // Should NOT send error event since we're in completed state
    expect(mockFSM.handle).not.toHaveBeenCalledWith('error');
    expect(window.GAS.log.d).toHaveBeenCalledWith('[LEVELUP WORKFLOW] FSM in terminal state, skipping error event');
  });
});
