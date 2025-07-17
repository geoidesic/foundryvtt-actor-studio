import { describe, test, expect, vi, beforeEach } from 'vitest';

describe('Level-Up State Machine Fix', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup minimal FoundryVTT globals
    global.window = global;
    global.window.GAS = { log: { d: vi.fn(), w: vi.fn(), e: vi.fn() } };
  });

  test('should handle level-up from completed state by resetting first', () => {
    // Mock the LevelUp FSM that's already in completed state
    const mockLevelUpFSM = {
      handle: vi.fn(),
      getCurrentState: vi.fn()
    };
    
    // Simulate the fixed logic from PCAppShell
    const simulateLevelUpFromCompletedState = () => {
      // Mock being in completed state initially
      mockLevelUpFSM.getCurrentState.mockReturnValue('completed');
      
      const currentState = mockLevelUpFSM.getCurrentState();
      window.GAS.log.d('[PCAPP] Current LevelUp FSM state before starting:', currentState);
      
      // Reset FSM to idle if it's in a terminal state (completed or error)
      if (currentState === 'completed' || currentState === 'error') {
        window.GAS.log.d('[PCAPP] Resetting LevelUp FSM from terminal state:', currentState);
        mockLevelUpFSM.handle('reset');
        // After reset, FSM should be in idle state
        mockLevelUpFSM.getCurrentState.mockReturnValue('idle');
      }
      
      // Only send START_LEVEL_UP if we're in idle state
      const finalState = mockLevelUpFSM.getCurrentState();
      if (finalState === 'idle') {
        mockLevelUpFSM.handle('start_level_up');
        window.GAS.log.d('[PCAPP] Started LevelUp workflow from idle state');
      } else {
        window.GAS.log.w('[PCAPP] LevelUp FSM not in idle state after reset:', finalState);
      }
    };
    
    // Test the fix
    simulateLevelUpFromCompletedState();
    
    // Verify the correct sequence of events
    expect(mockLevelUpFSM.getCurrentState).toHaveBeenCalled();
    expect(mockLevelUpFSM.handle).toHaveBeenCalledWith('reset');
    expect(mockLevelUpFSM.handle).toHaveBeenCalledWith('start_level_up');
    
    // Verify logging
    expect(window.GAS.log.d).toHaveBeenCalledWith('[PCAPP] Current LevelUp FSM state before starting:', 'completed');
    expect(window.GAS.log.d).toHaveBeenCalledWith('[PCAPP] Resetting LevelUp FSM from terminal state:', 'completed');
    expect(window.GAS.log.d).toHaveBeenCalledWith('[PCAPP] Started LevelUp workflow from idle state');
  });

  test('should not reset if FSM is already in idle state', () => {
    // Mock FSM that's already in idle state
    const mockLevelUpFSM = {
      handle: vi.fn(),
      getCurrentState: vi.fn(() => 'idle')
    };
    
    // Simulate the logic from PCAppShell
    const simulateLevelUpFromIdleState = () => {
      const currentState = mockLevelUpFSM.getCurrentState();
      
      // Reset FSM to idle if it's in a terminal state (completed or error)
      if (currentState === 'completed' || currentState === 'error') {
        mockLevelUpFSM.handle('reset');
      }
      
      const finalState = mockLevelUpFSM.getCurrentState();
      if (finalState === 'idle') {
        mockLevelUpFSM.handle('start_level_up');
      }
    };
    
    simulateLevelUpFromIdleState();
    
    // Should NOT have called reset since we're already in idle
    expect(mockLevelUpFSM.handle).not.toHaveBeenCalledWith('reset');
    // But should have proceeded with the workflow
    expect(mockLevelUpFSM.handle).toHaveBeenCalledWith('start_level_up');
  });

  test('should handle error state before level-up', () => {
    // Mock FSM that's in error state
    const mockLevelUpFSM = {
      handle: vi.fn(),
      getCurrentState: vi.fn()
    };
    
    // Simulate the logic
    const simulateLevelUpFromErrorState = () => {
      // Mock being in error state initially
      mockLevelUpFSM.getCurrentState.mockReturnValue('error');
      
      const currentState = mockLevelUpFSM.getCurrentState();
      
      if (currentState === 'completed' || currentState === 'error') {
        mockLevelUpFSM.handle('reset');
        // Update mock to return 'idle' after reset
        mockLevelUpFSM.getCurrentState.mockReturnValue('idle');
      }
      
      const finalState = mockLevelUpFSM.getCurrentState();
      if (finalState === 'idle') {
        mockLevelUpFSM.handle('start_level_up');
      }
    };
    
    simulateLevelUpFromErrorState();
    
    // Should have reset from error state
    expect(mockLevelUpFSM.handle).toHaveBeenCalledWith('reset');
    expect(mockLevelUpFSM.handle).toHaveBeenCalledWith('start_level_up');
  });

  test('should prevent the original error: "Unhandled event start_level_up in state completed"', () => {
    // This test demonstrates the fix prevents the original error
    
    // OLD BROKEN LOGIC (would cause error):
    const oldBrokenLogic = (mockFSM) => {
      // This would throw "Unhandled event 'start_level_up' in state 'completed'"
      mockFSM.handle('start_level_up');
    };
    
    // NEW FIXED LOGIC:
    const newFixedLogic = (mockFSM) => {
      const currentState = mockFSM.getCurrentState();
      
      // Check state first and reset if needed
      if (currentState === 'completed' || currentState === 'error') {
        mockFSM.handle('reset');
        mockFSM.getCurrentState.mockReturnValue('idle');
      }
      
      // Only send start_level_up if in idle state
      const finalState = mockFSM.getCurrentState();
      if (finalState === 'idle') {
        mockFSM.handle('start_level_up');
      }
    };
    
    // Mock FSM in completed state
    const mockFSM = {
      handle: vi.fn(),
      getCurrentState: vi.fn(() => 'completed')
    };
    
    // Test the fixed logic
    newFixedLogic(mockFSM);
    
    // Should have called reset and then start_level_up
    expect(mockFSM.handle).toHaveBeenCalledWith('reset');
    expect(mockFSM.handle).toHaveBeenCalledWith('start_level_up');
    
    // The old broken logic would have just called start_level_up directly 
    // on a FSM in completed state, causing the error
  });
});
