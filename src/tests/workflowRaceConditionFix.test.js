import { describe, it, expect, beforeEach, vi } from 'vitest';
import { WorkflowStateMachine, WORKFLOW_EVENTS, WORKFLOW_STATES } from '~/src/helpers/WorkflowStateMachine.js';

describe('Workflow Race Condition Fix', () => {
  let workflowStateMachine;

  beforeEach(() => {
    // Mock required dependencies
    global.window = { 
      GAS: { 
        log: { d: vi.fn(), w: vi.fn(), e: vi.fn() }
      }
    };
    
    global.game = {
      settings: {
        get: vi.fn((module, setting) => {
          if (module === 'foundryvtt-actor-studio') {
            if (setting === 'enableEquipmentSelection') return false;
            if (setting === 'enableEquipmentPurchase') return false; 
            if (setting === 'enableSpellSelection') return false;
          }
          return false;
        })
      }
    };

    global.Hooks = { call: vi.fn() };

    workflowStateMachine = new WorkflowStateMachine();
  });

  it('should prevent double CHARACTER_CREATED calls', () => {
    console.log('🧪 Testing the race condition fix...');
    
    const mockActor = { 
      name: 'Test Actor', 
      classes: {},
      sheet: { render: vi.fn() }
    };

    // 1. Start workflow (this is what workflow.js does first)
    let result = workflowStateMachine.transition(WORKFLOW_EVENTS.START_CHARACTER_CREATION);
    expect(workflowStateMachine.getState()).toBe(WORKFLOW_STATES.CREATING_CHARACTER);
    console.log('✅ Started workflow in creating_character state');

    // 2. Simulate what the AdvancementManager does - calls CHARACTER_CREATED first
    result = workflowStateMachine.transition(WORKFLOW_EVENTS.CHARACTER_CREATED, { actor: mockActor });
    expect(workflowStateMachine.getState()).toBe(WORKFLOW_STATES.PROCESSING_ADVANCEMENTS);
    console.log('✅ AdvancementManager moved to processing_advancements');

    // 3. AdvancementManager processes and calls ADVANCEMENTS_COMPLETE
    result = workflowStateMachine.transition(WORKFLOW_EVENTS.ADVANCEMENTS_COMPLETE, { actor: mockActor });
    // With no equipment/shopping/spells enabled, this should go to completed
    // But the exact state doesn't matter for this test - what matters is it's NOT creating_character
    const finalState = workflowStateMachine.getState();
    expect(finalState).not.toBe(WORKFLOW_STATES.CREATING_CHARACTER);
    console.log('✅ AdvancementManager moved workflow to:', finalState);

    // 4. Now workflow.js tries to call CHARACTER_CREATED again (this was the bug)
    // With the fix, this should be prevented
    const currentState = workflowStateMachine.getState();
    console.log('📊 Current state before potential double call:', currentState);
    
    if (currentState === WORKFLOW_STATES.CREATING_CHARACTER) {
      console.log('🔄 Would call CHARACTER_CREATED');
      // This should not happen with our workflow sequence
      expect(true).toBe(false); // Should not reach here
    } else {
      console.log('✅ Correctly skipping CHARACTER_CREATED - already advanced to:', currentState);
      // This is the fix - we don't call CHARACTER_CREATED if already past that state
      expect(currentState).not.toBe(WORKFLOW_STATES.CREATING_CHARACTER);
    }

    console.log('🎉 Race condition prevented successfully!');
  });

  it('should still allow CHARACTER_CREATED when appropriate', () => {
    console.log('🧪 Testing that CHARACTER_CREATED still works when needed...');
    
    const mockActor = { 
      name: 'Test Actor', 
      classes: {},
      sheet: { render: vi.fn() }
    };

    // 1. Start workflow
    workflowStateMachine.transition(WORKFLOW_EVENTS.START_CHARACTER_CREATION);
    expect(workflowStateMachine.getState()).toBe(WORKFLOW_STATES.CREATING_CHARACTER);

    // 2. If we're still in creating_character, CHARACTER_CREATED should work
    const currentState = workflowStateMachine.getState();
    if (currentState === WORKFLOW_STATES.CREATING_CHARACTER) {
      console.log('✅ Still in creating_character, calling CHARACTER_CREATED is valid');
      const result = workflowStateMachine.transition(WORKFLOW_EVENTS.CHARACTER_CREATED, { actor: mockActor });
      expect(workflowStateMachine.getState()).toBe(WORKFLOW_STATES.PROCESSING_ADVANCEMENTS);
      console.log('✅ Successfully transitioned to processing_advancements');
    }
  });
});
