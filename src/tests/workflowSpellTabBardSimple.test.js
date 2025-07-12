// Simple isolated test for the bard spell tab workflow issue
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the entire workflow state machine to avoid import issues
const mockWorkflowStateMachine = {
  currentState: { subscribe: vi.fn(), set: vi.fn() },
  context: { subscribe: vi.fn(), set: vi.fn() },
  isProcessing: { subscribe: vi.fn(), set: vi.fn() },
  
  getState: vi.fn(),
  reset: vi.fn(),
  transition: vi.fn(),
  
  // Mock the state transition logic
  _mockState: 'idle',
  _mockTransitions: {},
};

// Mock workflow states and events
const WORKFLOW_STATES = {
  IDLE: 'idle',
  CREATING_CHARACTER: 'creating_character',
  PROCESSING_ADVANCEMENTS: 'processing_advancements',
  SELECTING_EQUIPMENT: 'selecting_equipment',
  SELECTING_SPELLS: 'selecting_spells',
  SHOPPING: 'shopping',
  COMPLETED: 'completed',
  ERROR: 'error'
};

const WORKFLOW_EVENTS = {
  START_CHARACTER_CREATION: 'start_character_creation',
  CHARACTER_CREATED: 'character_created',
  ADVANCEMENTS_COMPLETE: 'advancements_complete',
  EQUIPMENT_COMPLETE: 'equipment_complete',
  SPELLS_COMPLETE: 'spells_complete',
  SHOPPING_COMPLETE: 'shopping_complete',
  SKIP_EQUIPMENT: 'skip_equipment',
  SKIP_SPELLS: 'skip_spells',
  SKIP_SHOPPING: 'skip_shopping',
  ERROR: 'error',
  RESET: 'reset'
};

// Mock the workflow logic including the bug
function mockWorkflowLogic(currentState, event, context = {}) {
  const { actor } = context;
  
  // Mock game settings
  const mockGame = {
    settings: {
      get: vi.fn((module, key) => {
        if (key === 'enableEquipmentSelection') return true;
        if (key === 'enableSpellSelection') return true;
        if (key === 'enableEquipmentPurchase') return true;
        return false;
      })
    }
  };
  global.game = mockGame;
  
  // Simulate the workflow transitions with the bug
  switch (currentState) {
    case WORKFLOW_STATES.IDLE:
      if (event === WORKFLOW_EVENTS.START_CHARACTER_CREATION) {
        return WORKFLOW_STATES.CREATING_CHARACTER;
      }
      break;
      
    case WORKFLOW_STATES.CREATING_CHARACTER:
      if (event === WORKFLOW_EVENTS.CHARACTER_CREATED) {
        return WORKFLOW_STATES.PROCESSING_ADVANCEMENTS;
      }
      break;
      
    case WORKFLOW_STATES.PROCESSING_ADVANCEMENTS:
      if (event === WORKFLOW_EVENTS.ADVANCEMENTS_COMPLETE) {
        // Check if equipment selection is enabled and actor has starting equipment
        const equipmentEnabled = mockGame.settings.get('test-module', 'enableEquipmentSelection');
        if (equipmentEnabled && actor?.classes) {
          return WORKFLOW_STATES.SELECTING_EQUIPMENT;
        }
        // Skip to spells or completion
        const spellsEnabled = mockGame.settings.get('test-module', 'enableSpellSelection');
        if (spellsEnabled && isSpellcaster(actor)) {
          return WORKFLOW_STATES.SELECTING_SPELLS;
        }
        return WORKFLOW_STATES.COMPLETED;
      }
      break;
      
    case WORKFLOW_STATES.SELECTING_EQUIPMENT:
      if (event === WORKFLOW_EVENTS.EQUIPMENT_COMPLETE) {
        // Check if shopping is enabled
        const shoppingEnabled = mockGame.settings.get('test-module', 'enableEquipmentPurchase');
        if (shoppingEnabled) {
          return WORKFLOW_STATES.SHOPPING;
        }
        // Skip to spells or completion
        const spellsEnabled = mockGame.settings.get('test-module', 'enableSpellSelection');
        if (spellsEnabled && isSpellcaster(actor)) {
          return WORKFLOW_STATES.SELECTING_SPELLS;
        }
        return WORKFLOW_STATES.COMPLETED;
      }
      break;
      
    case WORKFLOW_STATES.SHOPPING:
      if (event === WORKFLOW_EVENTS.SHOPPING_COMPLETE) {
        // THIS IS WHERE THE BUG IS: should check for spells but doesn't
        // The bug: it goes directly to COMPLETED instead of checking for spells
        return WORKFLOW_STATES.COMPLETED; // BUG: should check for spells first
        
        // Correct logic should be:
        // const spellsEnabled = mockGame.settings.get('test-module', 'enableSpellSelection');
        // if (spellsEnabled && isSpellcaster(actor)) {
        //   return WORKFLOW_STATES.SELECTING_SPELLS;
        // }
        // return WORKFLOW_STATES.COMPLETED;
      }
      break;
      
    case WORKFLOW_STATES.SELECTING_SPELLS:
      if (event === WORKFLOW_EVENTS.SPELLS_COMPLETE) {
        return WORKFLOW_STATES.COMPLETED;
      }
      break;
  }
  
  return currentState; // No transition
}

// Helper function to check if actor is a spellcaster
function isSpellcaster(actor) {
  if (!actor?.classes) return false;
  
  for (const [className, classData] of Object.entries(actor.classes)) {
    const progression = classData?.system?.spellcasting?.progression;
    if (progression && progression !== 'none') {
      return true;
    }
  }
  return false;
}

// Setup mock workflow state machine
mockWorkflowStateMachine.getState.mockImplementation(() => mockWorkflowStateMachine._mockState);
mockWorkflowStateMachine.reset.mockImplementation(() => {
  mockWorkflowStateMachine._mockState = WORKFLOW_STATES.IDLE;
});
mockWorkflowStateMachine.transition.mockImplementation(async (event, context = {}) => {
  const newState = mockWorkflowLogic(mockWorkflowStateMachine._mockState, event, context);
  mockWorkflowStateMachine._mockState = newState;
  return newState;
});

describe('WorkflowStateMachine - Bard Spell Tab Bug (Isolated Test)', () => {
  beforeEach(() => {
    mockWorkflowStateMachine.reset();
    vi.clearAllMocks();
  });

  it('should show spells tab after equipment and shop for a bard (spellcaster) - EXPECT TO FAIL', async () => {
    // Simulate a Bard (spellcaster) actor
    const actor = {
      name: 'Test Bard',
      classes: {
        bard: {
          system: {
            spellcasting: {
              progression: 'full'
            }
          }
        }
      },
      sheet: { render: vi.fn() }
    };

    // Go through the workflow step by step
    await mockWorkflowStateMachine.transition(WORKFLOW_EVENTS.START_CHARACTER_CREATION);
    expect(mockWorkflowStateMachine.getState()).toBe(WORKFLOW_STATES.CREATING_CHARACTER);

    await mockWorkflowStateMachine.transition(WORKFLOW_EVENTS.CHARACTER_CREATED, { actor });
    expect(mockWorkflowStateMachine.getState()).toBe(WORKFLOW_STATES.PROCESSING_ADVANCEMENTS);

    await mockWorkflowStateMachine.transition(WORKFLOW_EVENTS.ADVANCEMENTS_COMPLETE, { actor });
    expect(mockWorkflowStateMachine.getState()).toBe(WORKFLOW_STATES.SELECTING_EQUIPMENT);

    await mockWorkflowStateMachine.transition(WORKFLOW_EVENTS.EQUIPMENT_COMPLETE, { actor });
    expect(mockWorkflowStateMachine.getState()).toBe(WORKFLOW_STATES.SHOPPING);

    await mockWorkflowStateMachine.transition(WORKFLOW_EVENTS.SHOPPING_COMPLETE, { actor });
    // This is where the bug manifests: it should go to SELECTING_SPELLS, but goes to COMPLETED
    // This test should FAIL, demonstrating the bug
    expect(mockWorkflowStateMachine.getState()).toBe(WORKFLOW_STATES.SELECTING_SPELLS);
  });

  it('verifies the bug exists - workflow skips spells tab after shopping', async () => {
    // This test should PASS, showing what actually happens (the bug)
    const actor = {
      name: 'Test Bard',
      classes: {
        bard: {
          system: {
            spellcasting: {
              progression: 'full'
            }
          }
        }
      },
      sheet: { render: vi.fn() }
    };

    // Go through the workflow
    await mockWorkflowStateMachine.transition(WORKFLOW_EVENTS.START_CHARACTER_CREATION);
    await mockWorkflowStateMachine.transition(WORKFLOW_EVENTS.CHARACTER_CREATED, { actor });
    await mockWorkflowStateMachine.transition(WORKFLOW_EVENTS.ADVANCEMENTS_COMPLETE, { actor });
    await mockWorkflowStateMachine.transition(WORKFLOW_EVENTS.EQUIPMENT_COMPLETE, { actor });
    await mockWorkflowStateMachine.transition(WORKFLOW_EVENTS.SHOPPING_COMPLETE, { actor });
    
    // This should pass, showing the bug: it goes to COMPLETED instead of SELECTING_SPELLS
    expect(mockWorkflowStateMachine.getState()).toBe(WORKFLOW_STATES.COMPLETED);
  });
});
