#!/usr/bin/env node

// Test script to reproduce the real workflow bug using the actual WorkflowStateMachine
// This will help us see the enhanced logging output

console.log('=== Testing Real Workflow with Enhanced Logging ===');

// Mock the Foundry environment
global.game = {
  settings: {
    get: (module, key) => {
      console.log(`[MOCK] game.settings.get('${module}', '${key}')`);
      if (key === 'enableEquipmentSelection') return true;
      if (key === 'enableSpellSelection') return true;
      if (key === 'enableEquipmentPurchase') return true;
      return false;
    }
  }
};

global.window = {
  GAS: {
    log: {
      d: (...args) => console.log('[DEBUG]', ...args),
      w: (...args) => console.warn('[WARN]', ...args),
      e: (...args) => console.error('[ERROR]', ...args),
      i: (...args) => console.info('[INFO]', ...args)
    }
  }
};

// Mock Svelte stores - we need to recreate the store structure
const createMockStore = (initialValue) => {
  let value = initialValue;
  const subscribers = [];
  
  return {
    subscribe: (fn) => {
      subscribers.push(fn);
      fn(value);
      return () => {
        const index = subscribers.indexOf(fn);
        if (index !== -1) subscribers.splice(index, 1);
      };
    },
    set: (newValue) => {
      value = newValue;
      subscribers.forEach(fn => fn(value));
    },
    update: (updater) => {
      value = updater(value);
      subscribers.forEach(fn => fn(value));
    }
  };
};

// Mock the get function from svelte/store
global.get = (store) => {
  let currentValue;
  const unsubscribe = store.subscribe(value => currentValue = value);
  unsubscribe();
  return currentValue;
};

// Mock the stores that the WorkflowStateMachine imports
const mockStores = {
  activeTab: createMockStore('basics'),
  tabs: createMockStore([]),
  readOnlyTabs: createMockStore([]),
  compatibleStartingEquipment: createMockStore([]),
  preAdvancementSelections: createMockStore({
    class: {
      system: {
        startingEquipment: ['sword', 'shield'],
        wealth: 100
      }
    }
  })
};

// Mock the modules that import these stores
const Module = require('module');
const originalRequire = Module.prototype.require;
Module.prototype.require = function(id) {
  if (id === 'svelte/store') {
    return {
      writable: createMockStore,
      get: global.get
    };
  }
  if (id === '~/src/helpers/constants') {
    return { MODULE_ID: 'foundryvtt-actor-studio' };
  }
  if (id === '~/src/stores/index') {
    return mockStores;
  }
  if (id === '~/src/stores/startingEquipment') {
    return { compatibleStartingEquipment: mockStores.compatibleStartingEquipment };
  }
  return originalRequire.apply(this, arguments);
};

async function testRealWorkflow() {
  try {
    // Import the real WorkflowStateMachine
    const { WorkflowStateMachine, WORKFLOW_EVENTS } = require('./src/helpers/WorkflowStateMachine.js');
    
    console.log('✅ Successfully imported real WorkflowStateMachine');
    
    const workflow = new WorkflowStateMachine();
    
    // Create a realistic bard actor that matches Foundry's structure
    const bardActor = {
      name: 'Test Bard',
      type: 'character',
      classes: {
        bard: {
          system: {
            levels: 1,
            spellcasting: {
              progression: 'full',
              ability: 'cha'
            }
          }
        }
      }
    };
    
    console.log('\n🎭 Testing workflow with realistic Bard actor...');
    console.log('📋 Actor structure:', JSON.stringify(bardActor, null, 2));
    
    // Go through the workflow step by step
    console.log('\n▶️  Starting character creation...');
    await workflow.transition(WORKFLOW_EVENTS.START_CHARACTER_CREATION);
    
    console.log('\n▶️  Character created...');
    await workflow.transition(WORKFLOW_EVENTS.CHARACTER_CREATED, { actor: bardActor });
    
    console.log('\n▶️  Advancements complete...');
    await workflow.transition(WORKFLOW_EVENTS.ADVANCEMENTS_COMPLETE, { actor: bardActor });
    
    console.log('\n▶️  Equipment complete...');
    await workflow.transition(WORKFLOW_EVENTS.EQUIPMENT_COMPLETE, { actor: bardActor });
    
    console.log('\n▶️  Shopping complete (this is where the bug happens)...');
    await workflow.transition(WORKFLOW_EVENTS.SHOPPING_COMPLETE, { actor: bardActor });
    
    const finalState = global.get(workflow.currentState);
    console.log('\n' + '='.repeat(50));
    console.log('🎯 FINAL RESULT:');
    console.log(`Final state: ${finalState}`);
    console.log(`Expected: selecting_spells`);
    console.log(`Bug reproduced: ${finalState === 'completed' ? 'YES ❌' : 'NO ✅'}`);
    console.log('='.repeat(50));
    
  } catch (error) {
    console.error('❌ Error testing real workflow:', error);
    console.error('Stack trace:', error.stack);
  }
}

testRealWorkflow();
