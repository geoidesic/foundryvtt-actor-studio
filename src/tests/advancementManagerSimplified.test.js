/**
 * Test for the simplified AdvancementManager closeOrEquip logic
 * Tests that the ADVANCEMENTS_COMPLETE transition is called correctly
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock the stores
vi.mock('~/src/stores/index', () => ({
  activeTab: { 
    subscribe: vi.fn(), 
    set: vi.fn(), 
    update: vi.fn() 
  },
  preAdvancementSelections: { subscribe: vi.fn() }
}));

// Mock workflow state machine
vi.mock('~/src/helpers/WorkflowStateMachine', () => ({
  workflowStateMachine: {
    getState: vi.fn(),
    transition: vi.fn(),
    currentState: {
      subscribe: vi.fn()
    }
  },
  WORKFLOW_EVENTS: {
    ADVANCEMENTS_COMPLETE: 'advancements_complete'
  }
}));

// Mock other dependencies
vi.mock('~/src/helpers/Utility', () => ({
  delay: vi.fn((ms) => new Promise(resolve => setTimeout(resolve, ms))),
  prepareItemForDrop: vi.fn(),
  dropItemOnCharacter: vi.fn()
}));

vi.mock('~/src/stores/startingEquipment', () => ({
  compatibleStartingEquipment: { subscribe: vi.fn() }
}));

vi.mock('~/src/stores/storeDefinitions', () => ({
  goldRoll: { subscribe: vi.fn() }
}));

// Mock global objects
global.window = {
  GAS: {
    log: {
      d: vi.fn()
    }
  }
};

global.game = {
  settings: {
    get: vi.fn((moduleId, settingName) => {
      if (settingName === 'advancementCaptureTimerThreshold') {
        return 500;
      }
      if (settingName === 'disableAdvancementCapture') {
        return false;
      }
      return null;
    })
  }
};

// Mock jQuery
global.$ = vi.fn(() => ({
  html: vi.fn(() => '') // Always return empty to simulate empty tab
}));

import { AdvancementManager, createTestAdvancementManager } from '~/src/helpers/AdvancementManager';
import { workflowStateMachine, WORKFLOW_EVENTS } from '~/src/helpers/WorkflowStateMachine';

describe('AdvancementManager closeOrEquip Simplified Logic', () => {
  let advancementManager;
  let mockStore;
  let mockInProcessStore;
  let mockActor;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Create mock stores
    mockStore = {
      subscribe: vi.fn(),
      remove: vi.fn()
    };

    mockInProcessStore = {
      set: vi.fn()
    };

    mockActor = {
      id: 'test-actor',
      classes: { fighter: { name: 'Fighter' } }
    };

    advancementManager = new AdvancementManager(mockStore, mockInProcessStore);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should always call ADVANCEMENTS_COMPLETE transition regardless of workflow state', () => {
    // Set up workflow state to be in any state (not processing_advancements)
    vi.mocked(workflowStateMachine.getState).mockReturnValue('creating_character');

    // Call closeOrEquip
    advancementManager.closeOrEquip(mockActor);

    // Verify that ADVANCEMENTS_COMPLETE transition was called
    expect(workflowStateMachine.transition).toHaveBeenCalledWith(
      'advancements_complete',
      { actor: mockActor }
    );

    // Verify logging
    expect(window.GAS.log.d).toHaveBeenCalledWith('[ADVANCEMENT MANAGER] closeOrEquip called with actor:', mockActor);
    expect(window.GAS.log.d).toHaveBeenCalledWith('[ADVANCEMENT MANAGER] About to call workflowStateMachine.transition with ADVANCEMENTS_COMPLETE');
    expect(window.GAS.log.d).toHaveBeenCalledWith('[ADVANCEMENT MANAGER] Calling ADVANCEMENTS_COMPLETE transition');
    expect(window.GAS.log.d).toHaveBeenCalledWith('[ADVANCEMENT MANAGER] closeOrEquip completed');
  });

  it('should work when workflow is already in processing_advancements state', () => {
    // Set up workflow state to be in processing_advancements
    vi.mocked(workflowStateMachine.getState).mockReturnValue('processing_advancements');

    // Call closeOrEquip
    advancementManager.closeOrEquip(mockActor);

    // Verify that ADVANCEMENTS_COMPLETE transition was called
    expect(workflowStateMachine.transition).toHaveBeenCalledWith(
      'advancements_complete',
      { actor: mockActor }
    );
  });

  it('should work when workflow is in idle state', () => {
    // Set up workflow state to be idle
    vi.mocked(workflowStateMachine.getState).mockReturnValue('idle');

    // Call closeOrEquip
    advancementManager.closeOrEquip(mockActor);

    // Verify that ADVANCEMENTS_COMPLETE transition was called
    expect(workflowStateMachine.transition).toHaveBeenCalledWith(
      'advancements_complete',
      { actor: mockActor }
    );
  });

  it('should pass correct actor data to workflow transition', () => {
    const complexActor = {
      id: 'complex-actor',
      name: 'Test Character',
      classes: { 
        warlock: { name: 'Warlock', level: 1 },
        fighter: { name: 'Fighter', level: 2 }
      }
    };

    // Call closeOrEquip with complex actor
    advancementManager.closeOrEquip(complexActor);

    // Verify that the exact actor object was passed
    expect(workflowStateMachine.transition).toHaveBeenCalledWith(
      'advancements_complete',
      { actor: complexActor }
    );

    // Verify logging includes actor classes
    expect(window.GAS.log.d).toHaveBeenCalledWith('[ADVANCEMENT MANAGER] Actor classes:', complexActor.classes);
  });

  it('should handle null actor gracefully', () => {
    // Call closeOrEquip with null actor
    advancementManager.closeOrEquip(null);

    // Verify that ADVANCEMENTS_COMPLETE transition was still called
    expect(workflowStateMachine.transition).toHaveBeenCalledWith(
      'advancements_complete',
      { actor: null }
    );

    // Verify logging handles null actor
    expect(window.GAS.log.d).toHaveBeenCalledWith('[ADVANCEMENT MANAGER] closeOrEquip called with actor:', null);
    expect(window.GAS.log.d).toHaveBeenCalledWith('[ADVANCEMENT MANAGER] Actor classes:', undefined);
  });
});

describe('AdvancementManager Integration with DOM Watcher', () => {
  let advancementManager;
  let mockStore;
  let mockInProcessStore;

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockStore = {
      subscribe: vi.fn((callback) => {
        callback([]); // Empty queue
        return () => {};
      }),
      remove: vi.fn()
    };

    mockInProcessStore = {
      set: vi.fn()
    };

    // Use injected test helper for AdvancementManager
    advancementManager = createTestAdvancementManager(mockStore, mockInProcessStore, '');
  });

  it('should advance queue and call closeOrEquip when DOM watcher detects empty tab', async () => {
    const mockActor = { id: 'test-actor', classes: {} };
    
    // Mock get function to return actor from inProcessStore
    const mockGet = vi.fn((store) => {
      if (store === mockInProcessStore) {
        return { actor: mockActor };
      }
      return [];
    });
    
    // Mock the get function from svelte/store
    vi.doMock('svelte/store', () => ({
      get: mockGet
    }));

    // Spy on closeOrEquip method
    const closeOrEquipSpy = vi.spyOn(advancementManager, 'closeOrEquip');

    // Call watchAdvancementManager which should detect empty tab and advance queue
    await advancementManager.watchAdvancementManager();

    // Verify that closeOrEquip was called with the correct actor
    expect(closeOrEquipSpy).toHaveBeenCalledWith(mockActor);
    
    // Verify that workflow transition was called
    expect(workflowStateMachine.transition).toHaveBeenCalledWith(
      'advancements_complete',
      { actor: mockActor }
    );
  });

  it('should respect advancementCaptureTimerThreshold setting', async () => {
    const { delay } = await import('~/src/helpers/Utility');
    
    // Call watchAdvancementManager
    await advancementManager.watchAdvancementManager();

    // Verify that delay was called with the threshold setting
    expect(delay).toHaveBeenCalledWith(500);
    expect(game.settings.get).toHaveBeenCalledWith('foundryvtt-actor-studio', 'advancementCaptureTimerThreshold');
  });

  it('should reset monitoring promise after completion', async () => {
    // Initially monitoring promise should be null
    expect(advancementManager.monitoringPromise).toBe(null);
    
    // Call watchAdvancementManager
    await advancementManager.watchAdvancementManager();
    
    // After completion, monitoring promise should be reset to null
    expect(advancementManager.monitoringPromise).toBe(null);
  });
});
