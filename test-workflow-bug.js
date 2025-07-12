#!/usr/bin/env node

// Simple Node.js script to test the workflow bug without Vitest/import complications
console.log('=== Testing Workflow Spell Tab Bug ===');
console.log('Starting test script...');

// Mock the required globals
global.game = {
  settings: {
    get: (module, key) => {
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

// Mock Svelte stores
const mockWritable = (initialValue) => {
  let value = initialValue;
  return {
    subscribe: () => {},
    set: (newValue) => { value = newValue; },
    update: (fn) => { value = fn(value); },
    get: () => value
  };
};

// Mock the workflow states and events
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
  RESET: 'reset'
};

// Simplified workflow state machine
class TestWorkflowStateMachine {
  constructor() {
    this.currentState = mockWritable(WORKFLOW_STATES.IDLE);
    this.context = mockWritable({});
    this._state = WORKFLOW_STATES.IDLE;
  }
  
  getState() {
    return this._state;
  }
  
  reset() {
    this._state = WORKFLOW_STATES.IDLE;
    console.log('Reset to IDLE');
  }
  
  async transition(event, contextData = {}) {
    const currentState = this._state;
    console.log(`\nTransition: ${event} from ${currentState}`);
    
    // Update context
    this.context.update(ctx => ({ ...ctx, ...contextData }));
    
    let nextState;
    
    switch (currentState) {
      case WORKFLOW_STATES.IDLE:
        if (event === WORKFLOW_EVENTS.START_CHARACTER_CREATION) {
          nextState = WORKFLOW_STATES.CREATING_CHARACTER;
        }
        break;
        
      case WORKFLOW_STATES.CREATING_CHARACTER:
        if (event === WORKFLOW_EVENTS.CHARACTER_CREATED) {
          nextState = WORKFLOW_STATES.PROCESSING_ADVANCEMENTS;
        }
        break;
        
      case WORKFLOW_STATES.PROCESSING_ADVANCEMENTS:
        if (event === WORKFLOW_EVENTS.ADVANCEMENTS_COMPLETE) {
          nextState = await this._determineNextAfterAdvancements(contextData);
        }
        break;
        
      case WORKFLOW_STATES.SELECTING_EQUIPMENT:
        if (event === WORKFLOW_EVENTS.EQUIPMENT_COMPLETE) {
          nextState = await this._determineNextAfterEquipment(contextData);
        }
        break;
        
      case WORKFLOW_STATES.SHOPPING:
        if (event === WORKFLOW_EVENTS.SHOPPING_COMPLETE) {
          nextState = await this._determineNextAfterShopping(contextData);
        }
        break;
        
      case WORKFLOW_STATES.SELECTING_SPELLS:
        if (event === WORKFLOW_EVENTS.SPELLS_COMPLETE) {
          nextState = WORKFLOW_STATES.COMPLETED;
        }
        break;
    }
    
    if (nextState) {
      this._state = nextState;
      console.log(`  -> ${nextState}`);
    } else {
      console.log(`  -> No transition (staying in ${currentState})`);
    }
    
    return nextState;
  }
  
  async _determineNextAfterAdvancements(context) {
    const { actor } = context;
    console.log('  Checking after advancements...');
    
    if (this._shouldShowEquipmentSelection(context)) {
      console.log('    Equipment enabled -> SELECTING_EQUIPMENT');
      return WORKFLOW_STATES.SELECTING_EQUIPMENT;
    }
    
    if (this._shouldShowShopping()) {
      console.log('    Shopping enabled -> SHOPPING');
      return WORKFLOW_STATES.SHOPPING;
    }
    
    if (this._shouldShowSpellSelection(actor)) {
      console.log('    Spells enabled -> SELECTING_SPELLS');
      return WORKFLOW_STATES.SELECTING_SPELLS;
    }
    
    console.log('    Nothing enabled -> COMPLETED');
    return WORKFLOW_STATES.COMPLETED;
  }
  
  async _determineNextAfterEquipment(context) {
    const { actor } = context;
    console.log('  Checking after equipment...');
    
    if (this._shouldShowShopping()) {
      console.log('    Shopping enabled -> SHOPPING');
      return WORKFLOW_STATES.SHOPPING;
    }
    
    if (this._shouldShowSpellSelection(actor)) {
      console.log('    Spells enabled -> SELECTING_SPELLS');
      return WORKFLOW_STATES.SELECTING_SPELLS;
    }
    
    console.log('    Nothing else -> COMPLETED');
    return WORKFLOW_STATES.COMPLETED;
  }
  
  async _determineNextAfterShopping(context) {
    const { actor } = context;
    console.log('  Checking after shopping...');
    
    if (this._shouldShowSpellSelection(actor)) {
      console.log('    Spells enabled -> SELECTING_SPELLS');
      return WORKFLOW_STATES.SELECTING_SPELLS;
    }
    
    console.log('    No spells -> COMPLETED');
    return WORKFLOW_STATES.COMPLETED;
  }
  
  _shouldShowEquipmentSelection(context) {
    const enabled = global.game.settings.get('test-module', 'enableEquipmentSelection');
    console.log(`    Equipment selection enabled: ${enabled}`);
    return enabled;
  }
  
  _shouldShowShopping() {
    const enabled = global.game.settings.get('test-module', 'enableEquipmentPurchase');
    console.log(`    Shopping enabled: ${enabled}`);
    return enabled;
  }
  
  _shouldShowSpellSelection(actor) {
    const enabled = global.game.settings.get('test-module', 'enableSpellSelection');
    console.log(`    Spell selection enabled: ${enabled}`);
    
    if (!enabled) return false;
    if (!actor) {
      console.log('    No actor provided');
      return false;
    }
    
    const classes = actor.classes || {};
    if (!Object.keys(classes).length) {
      console.log('    No classes found');
      return false;
    }
    
    const isSpellcaster = Object.values(classes).some(cls => 
      cls.system?.spellcasting?.progression && 
      cls.system.spellcasting.progression !== "none"
    );
    
    console.log(`    Actor is spellcaster: ${isSpellcaster}`);
    return isSpellcaster;
  }
}

// Test the workflow
async function testWorkflow() {
  const workflow = new TestWorkflowStateMachine();
  
  // Create a bard actor
  const bardActor = {
    name: 'Test Bard',
    classes: {
      bard: {
        system: {
          spellcasting: {
            progression: 'full'
          }
        }
      }
    }
  };
  
  console.log('Testing workflow with Bard (spellcaster)...');
  console.log('Settings: Equipment=true, Shopping=true, Spells=true\n');
  
  // Go through the workflow
  await workflow.transition(WORKFLOW_EVENTS.START_CHARACTER_CREATION);
  await workflow.transition(WORKFLOW_EVENTS.CHARACTER_CREATED, { actor: bardActor });
  await workflow.transition(WORKFLOW_EVENTS.ADVANCEMENTS_COMPLETE, { actor: bardActor });
  await workflow.transition(WORKFLOW_EVENTS.EQUIPMENT_COMPLETE, { actor: bardActor });
  await workflow.transition(WORKFLOW_EVENTS.SHOPPING_COMPLETE, { actor: bardActor });
  
  const finalState = workflow.getState();
  console.log(`\n=== RESULT ===`);
  console.log(`Final state: ${finalState}`);
  console.log(`Expected: ${WORKFLOW_STATES.SELECTING_SPELLS}`);
  console.log(`Bug exists: ${finalState === WORKFLOW_STATES.COMPLETED ? 'YES' : 'NO'}`);
  
  if (finalState === WORKFLOW_STATES.COMPLETED) {
    console.log('\n❌ BUG CONFIRMED: Workflow skipped spells tab after shopping!');
  } else if (finalState === WORKFLOW_STATES.SELECTING_SPELLS) {
    console.log('\n✅ Workflow correctly shows spells tab after shopping');
  } else {
    console.log(`\n⚠️  Unexpected state: ${finalState}`);
  }
}

testWorkflow().catch(console.error);
