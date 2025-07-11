import { describe, it, expect, beforeEach, vi } from 'vitest';
import { get } from 'svelte/store';
import { WorkflowStateMachine, WORKFLOW_EVENTS, WORKFLOW_STATES } from '~/src/helpers/WorkflowStateMachine.js';

// Mock stores and their data
const mockStoreData = {
  preAdvancementSelections: {
    class: {
      name: 'Barbarian',
      system: {
        startingEquipment: ['leather armor', 'handaxe'],
        wealth: 100
      }
    },
    race: { name: 'Orc' },
    background: { name: 'Artisan' }
  },
  compatibleStartingEquipment: [
    { name: 'leather armor', type: 'armor' },
    { name: 'handaxe', type: 'weapon' }
  ]
};

// Mock the get function from svelte/store, but use the real writable
import * as svelteStore from 'svelte/store';
vi.mock('svelte/store', async (importOriginal) => {
  const original = await importOriginal();
  return {
    ...original,
    get: vi.fn((store) => {
      if (store && store._mockType === 'preAdvancementSelections') {
        return mockStoreData.preAdvancementSelections;
      }
      if (store && store._mockType === 'compatibleStartingEquipment') {
        return mockStoreData.compatibleStartingEquipment;
      }
      return original.get(store);
    }),
    // Use the real writable for store creation
    writable: original.writable
  };
});

// Mock the required stores with proper Svelte store interface
vi.mock('~/src/stores/index', () => {
  const createMockStore = (initialValue = {}) => {
    const subscribers = new Set();
    let value = initialValue;
    
    return {
      subscribe: vi.fn((callback) => {
        if (callback) callback(value);
        const unsubscribe = () => subscribers.delete(callback);
        subscribers.add(callback);
        return { unsubscribe };
      }),
      set: vi.fn((newValue) => {
        value = newValue;
        subscribers.forEach(callback => callback(value));
      }),
      update: vi.fn((updater) => {
        value = updater(value);
        subscribers.forEach(callback => callback(value));
      })
    };
  };

  return {
    preAdvancementSelections: {
      ...createMockStore({
        class: {
          name: 'Barbarian',
          system: {
            startingEquipment: ['leather armor', 'handaxe'],
            wealth: 100
          }
        },
        race: { name: 'Orc' },
        background: { name: 'Artisan' }
      }),
      _mockType: 'preAdvancementSelections'
    },
    activeTab: createMockStore(0),
    tabs: createMockStore([]),
    readOnlyTabs: createMockStore([])
  };
});

vi.mock('~/src/stores/startingEquipment', () => {
  const createMockStore = (initialValue = {}) => {
    const subscribers = new Set();
    let value = initialValue;
    
    return {
      subscribe: vi.fn((callback) => {
        if (callback) callback(value);
        const unsubscribe = () => subscribers.delete(callback);
        subscribers.add(callback);
        return { unsubscribe };
      }),
      set: vi.fn((newValue) => {
        value = newValue;
        subscribers.forEach(callback => callback(value));
      }),
      update: vi.fn((updater) => {
        value = updater(value);
        subscribers.forEach(callback => callback(value));
      })
    };
  };

  return {
    compatibleStartingEquipment: {
      ...createMockStore([
        { name: 'leather armor', type: 'armor' },
        { name: 'handaxe', type: 'weapon' }
      ]),
      _mockType: 'compatibleStartingEquipment'
    }
  };
});

describe('Orc Artisan Barbarian Workflow Bug Analysis', () => {
  let workflowStateMachine;
  let mockSettings;
  let mockHooks;
  let gasCloseSpy;

  beforeEach(() => {
    // Reset global state
    vi.clearAllMocks();
    
    // Mock game settings - Equipment ENABLED
    mockSettings = vi.fn((moduleName, setting) => {
      if (moduleName === 'foundryvtt-actor-studio') {
        if (setting === 'enableEquipmentSelection') return true;  // ENABLED
        if (setting === 'enableEquipmentPurchase') return false;
        if (setting === 'enableSpellSelection') return false;
      }
      return false;
    });

    // Mock Hooks.call
    gasCloseSpy = vi.fn();
    mockHooks = {
      call: vi.fn((hookName, ...args) => {
        console.log(`🪝 Hook called: ${hookName}`, args);
        if (hookName === 'gas.close') {
          gasCloseSpy();
        }
      })
    };

    // Mock window and GAS
    global.window = { 
      GAS: { 
        log: { d: vi.fn(), w: vi.fn(), e: vi.fn() },
        availableGold: { set: vi.fn() },
        totalGoldFromChoices: { subscribe: vi.fn() },
        goldRoll: { subscribe: vi.fn() },
        dnd5eVersion: 4
      }
    };

    // Setup global mocks
    global.game = { 
      settings: { get: mockSettings },
      actors: { 
        get: vi.fn().mockReturnValue({
          sheet: { render: vi.fn() }
        })
      }
    };
    global.Hooks = mockHooks;

    // Create fresh workflow state machine
    workflowStateMachine = new WorkflowStateMachine();
  });

  it('🐛 REPRODUCES THE ACTUAL BUG: Race condition between advancements_complete and character_created', async () => {
    console.log('🧪 Reproducing the race condition from the logs...');
    
    const mockActor = {
      name: 'Test Orc Barbarian',
      classes: { barbarian: { identifier: 'barbarian', levels: 1 } },
      sheet: { render: vi.fn() }
    };

    // Debug: Print initial state
    const initialState = workflowStateMachine.getState ? workflowStateMachine.getState() : 'unknown';
    console.log('🔎 Initial workflow state:', initialState);
    if (initialState !== WORKFLOW_STATES.IDLE && workflowStateMachine.currentState) {
      workflowStateMachine.currentState.set(WORKFLOW_STATES.IDLE);
      console.log('🔄 Reset workflow state to IDLE');
    }

    // 1. Start character creation
    let result = await workflowStateMachine.transition(WORKFLOW_EVENTS.START_CHARACTER_CREATION);
    expect(result).toBe(true);
    expect(workflowStateMachine.getState()).toBe(WORKFLOW_STATES.CREATING_CHARACTER);
    console.log('✅ State: creating_character');

    // 2. Character gets created and embedded, which should transition to processing_advancements
    result = await workflowStateMachine.transition(WORKFLOW_EVENTS.CHARACTER_CREATED, { actor: mockActor });
    expect(result).toBe(true);
    expect(workflowStateMachine.getState()).toBe(WORKFLOW_STATES.PROCESSING_ADVANCEMENTS);
    console.log('✅ State: processing_advancements');

    // 3. AdvancementManager processes and calls advancements_complete
    // This transitions to selecting_equipment (good!)
    result = await workflowStateMachine.transition(WORKFLOW_EVENTS.ADVANCEMENTS_COMPLETE, { actor: mockActor });
    expect(result).toBe(true);
    expect(workflowStateMachine.getState()).toBe(WORKFLOW_STATES.SELECTING_EQUIPMENT);
    console.log('✅ State: selecting_equipment');

    // 4. BUT THEN - the main workflow tries to call character_created AGAIN
    // This is the bug! It's already been called but gets called again
    result = await workflowStateMachine.transition(WORKFLOW_EVENTS.CHARACTER_CREATED, { actor: mockActor });
    
    // This should fail - this IS the bug from the logs
    expect(result).toBe(false);
    console.log('❌ BUG REPRODUCED: character_created called again from selecting_equipment state');
    
    // The workflow is now stuck in selecting_equipment but can't proceed properly
    expect(workflowStateMachine.getState()).toBe(WORKFLOW_STATES.SELECTING_EQUIPMENT);
    console.log('❌ Workflow stuck in selecting_equipment due to invalid transition');
  });

  it('✅ SHOWS CORRECT SINGLE-CALL WORKFLOW', async () => {
    console.log('🧪 Testing proper workflow without double character_created calls...');
    
    const mockActor = {
      name: 'Test Barbarian',
      classes: { barbarian: { identifier: 'barbarian', levels: 1 } },
      sheet: { render: vi.fn() }
    };

    // Debug: Print initial state
    const initialState = workflowStateMachine.getState ? workflowStateMachine.getState() : 'unknown';
    console.log('🔎 Initial workflow state:', initialState);
    if (initialState !== WORKFLOW_STATES.IDLE && workflowStateMachine.currentState) {
      workflowStateMachine.currentState.set(WORKFLOW_STATES.IDLE);
      console.log('🔄 Reset workflow state to IDLE');
    }

    // Proper sequence - each event called only ONCE
    console.log('1️⃣ START');
    let result = await workflowStateMachine.transition(WORKFLOW_EVENTS.START_CHARACTER_CREATION);
    expect(result).toBe(true);
    expect(workflowStateMachine.getState()).toBe(WORKFLOW_STATES.CREATING_CHARACTER);

    console.log('2️⃣ CHARACTER_CREATED (only once)');
    result = await workflowStateMachine.transition(WORKFLOW_EVENTS.CHARACTER_CREATED, { actor: mockActor });
    expect(result).toBe(true);
    expect(workflowStateMachine.getState()).toBe(WORKFLOW_STATES.PROCESSING_ADVANCEMENTS);

    console.log('3️⃣ ADVANCEMENTS_COMPLETE');
    result = await workflowStateMachine.transition(WORKFLOW_EVENTS.ADVANCEMENTS_COMPLETE, { actor: mockActor });
    expect(result).toBe(true);
    expect(workflowStateMachine.getState()).toBe(WORKFLOW_STATES.SELECTING_EQUIPMENT);

    console.log('4️⃣ EQUIPMENT_COMPLETE');
    result = await workflowStateMachine.transition(WORKFLOW_EVENTS.EQUIPMENT_COMPLETE, { actor: mockActor });
    expect(result).toBe(true);
    expect(workflowStateMachine.getState()).toBe(WORKFLOW_STATES.COMPLETED);

    // Wait for gas.close
    await new Promise(resolve => setTimeout(resolve, 1700));
    expect(gasCloseSpy).toHaveBeenCalled();
    
    console.log('✅ Complete workflow executed successfully');
  });

  it('📊 Analyzes the timing issue from logs', () => {
    console.log('📊 Log Analysis:');
    console.log('1. AdvancementManager.closeOrEquip calls advancements_complete ✅');
    console.log('2. Workflow transitions: processing_advancements → selecting_equipment ✅');  
    console.log('3. Equipment tab opens ✅');
    console.log('4. BUT THEN workflow.js calls character_created AGAIN ❌');
    console.log('5. Invalid transition: character_created from selecting_equipment ❌');
    console.log('6. This causes flaky behavior - sometimes works, sometimes doesn\'t');
    
    // The issue is that workflow.js calls CHARACTER_CREATED after the advancement manager
    // has already transitioned the state. This suggests a coordination problem.
    expect(true).toBe(true); // Just documenting the analysis
  });
});
