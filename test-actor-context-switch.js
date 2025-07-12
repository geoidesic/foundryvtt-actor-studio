// Test to reproduce the actor context switching bug
// This simulates how the actor changes from pre-creation to post-creation

console.log('=== Actor Context Switching Bug Test ===');

// Mock globals
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
    get: () => value  // Add get method
  };
};

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

// Extract the critical _shouldShowSpellSelection logic
function shouldShowSpellSelection(actor) {
  console.log('\n🔍 === SPELL SELECTION CHECK ===');
  console.log('Actor received:', JSON.stringify(actor, null, 2));
  
  const enableSpellSelection = global.game.settings.get('foundryvtt-actor-studio', 'enableSpellSelection');
  console.log('Spell selection enabled:', enableSpellSelection);
  
  if (!enableSpellSelection) {
    console.log('❌ Spell selection disabled in settings');
    return false;
  }
  
  if (!actor) {
    console.log('❌ No actor provided');
    return false;
  }
  
  // Check if actor is a spellcaster
  const classes = actor.classes || {};
  const classKeys = Object.keys(classes);
  console.log('Actor classes found:', classKeys);
  
  if (!classKeys.length) {
    console.log('❌ No classes found on actor');
    return false;
  }
  
  // Check each class for spellcasting capability
  const spellcastingInfo = Object.entries(classes).map(([className, classData]) => {
    const progression = classData?.system?.spellcasting?.progression;
    console.log(`Class ${className} spellcasting progression:`, progression);
    return { className, progression, isSpellcaster: progression && progression !== "none" };
  });
  
  const isSpellcaster = spellcastingInfo.some(info => info.isSpellcaster);
  console.log('Spellcasting analysis:', spellcastingInfo);
  
  // FAILSAFE: Check for known spellcasting classes by name if progression check fails
  if (!isSpellcaster) {
    const knownSpellcastingClasses = [
      'bard', 'cleric', 'druid', 'paladin', 'ranger', 'sorcerer', 'warlock', 'wizard',
      'artificer', 'aberrantmind', 'arcanetrickster', 'eldritchknight'
    ];
    
    const hasKnownSpellcastingClass = classKeys.some(className => 
      knownSpellcastingClasses.includes(className.toLowerCase())
    );
    
    if (hasKnownSpellcastingClass) {
      console.log('✅ FAILSAFE: Found known spellcasting class, showing spells despite progression check failure');
      return true;
    }
  }
  
  console.log('Final result:', isSpellcaster);
  return isSpellcaster;
}

// Simplified workflow state machine that tracks context switching
class ContextSwitchingWorkflow {
  constructor() {
    this.currentState = mockWritable(WORKFLOW_STATES.IDLE);
    this.context = mockWritable({});
    this._state = WORKFLOW_STATES.IDLE;
  }
  
  getState() {
    return this._state;
  }
  
  async transition(event, contextData = {}) {
    const currentState = this._state;
    console.log(`\n🔄 Transition: ${event} from ${currentState}`);
    console.log('📦 Context data received:', JSON.stringify(contextData, null, 2));
    
    // Update context - THIS IS KEY: we merge old context with new
    this.context.update(ctx => {
      const merged = { ...ctx, ...contextData };
      console.log('📦 Context after merge:', JSON.stringify(merged, null, 2));
      return merged;
    });
    
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
          nextState = await this._determineNextAfterAdvancements();
        }
        break;
        
      case WORKFLOW_STATES.SELECTING_EQUIPMENT:
        if (event === WORKFLOW_EVENTS.EQUIPMENT_COMPLETE) {
          nextState = await this._determineNextAfterEquipment();
        }
        break;
        
      case WORKFLOW_STATES.SHOPPING:
        if (event === WORKFLOW_EVENTS.SHOPPING_COMPLETE) {
          nextState = await this._determineNextAfterShopping();
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
  
  async _determineNextAfterAdvancements() {
    const context = this.context.get();
    console.log('📋 After advancements - checking context:', JSON.stringify(context, null, 2));
    
    // Equipment always comes first
    return WORKFLOW_STATES.SELECTING_EQUIPMENT;
  }
  
  async _determineNextAfterEquipment() {
    const context = this.context.get();
    console.log('⚔️  After equipment - checking context:', JSON.stringify(context, null, 2));
    
    // Shopping comes after equipment
    return WORKFLOW_STATES.SHOPPING;
  }
  
  async _determineNextAfterShopping() {
    const context = this.context.get();
    console.log('🛒 After shopping - checking context:', JSON.stringify(context, null, 2));
    console.log('🛒 THIS IS WHERE THE BUG HAPPENS!');
    
    const { actor } = context;
    console.log('🛒 Actor from context:', actor);
    console.log('🛒 Actor type:', typeof actor);
    console.log('🛒 Actor constructor:', actor?.constructor?.name);
    
    const shouldShowSpells = shouldShowSpellSelection(actor);
    
    if (shouldShowSpells) {
      console.log('✅ Going to spells');
      return WORKFLOW_STATES.SELECTING_SPELLS;
    } else {
      console.log('❌ Skipping spells - BUG REPRODUCED!');
      return WORKFLOW_STATES.COMPLETED;
    }
  }
}

async function testContextSwitching() {
  console.log('\n🎭 Testing Context Switching Bug...\n');
  
  const workflow = new ContextSwitchingWorkflow();
  
  // 1. Start with pre-creation actor (what user selects)
  const preCreationBard = {
    name: 'Pre-Creation Bard',
    type: 'character',
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
  
  // 2. Post-creation actor (what Foundry creates - might be different structure)
  const postCreationBard = {
    id: 'Actor.xyz123',
    name: 'Post-Creation Bard',
    type: 'character',
    // POTENTIAL BUG: What if the classes structure is different?
    // Maybe it's classes.bard.data.spellcasting instead of classes.bard.system.spellcasting?
    // Or maybe classes is empty right after creation?
    // Or maybe the progression isn't set yet?
    classes: {}, // <-- This could be the bug!
    system: {
      details: {
        class: 'bard'
      },
      spells: {
        // spell slots etc
      }
    }
  };
  
  console.log('🏁 SCENARIO 1: Normal workflow (pre-creation actor throughout)');
  console.log('================================================');
  
  await workflow.transition(WORKFLOW_EVENTS.START_CHARACTER_CREATION);
  await workflow.transition(WORKFLOW_EVENTS.CHARACTER_CREATED, { actor: preCreationBard });
  await workflow.transition(WORKFLOW_EVENTS.ADVANCEMENTS_COMPLETE, { actor: preCreationBard });
  await workflow.transition(WORKFLOW_EVENTS.EQUIPMENT_COMPLETE, { actor: preCreationBard });
  await workflow.transition(WORKFLOW_EVENTS.SHOPPING_COMPLETE, { actor: preCreationBard });
  
  console.log(`\n📊 RESULT: ${workflow.getState()}`);
  
  console.log('\n🐛 SCENARIO 2: Context switch bug (different actor after creation)');
  console.log('================================================================');
  
  // Reset workflow
  workflow._state = WORKFLOW_STATES.IDLE;
  workflow.context.set({});
  
  await workflow.transition(WORKFLOW_EVENTS.START_CHARACTER_CREATION);
  await workflow.transition(WORKFLOW_EVENTS.CHARACTER_CREATED, { actor: preCreationBard });
  await workflow.transition(WORKFLOW_EVENTS.ADVANCEMENTS_COMPLETE, { actor: preCreationBard });
  await workflow.transition(WORKFLOW_EVENTS.EQUIPMENT_COMPLETE, { actor: preCreationBard });
  
  // THE BUG: Shopping complete gets called with the post-creation actor
  // that has a different/empty classes structure!
  console.log('\n💥 CONTEXT SWITCH: Now using post-creation actor with empty classes!');
  await workflow.transition(WORKFLOW_EVENTS.SHOPPING_COMPLETE, { actor: postCreationBard });
  
  console.log(`\n📊 RESULT: ${workflow.getState()}`);
  
  if (workflow.getState() === WORKFLOW_STATES.COMPLETED) {
    console.log('\n🐛 BUG REPRODUCED! Spells tab was skipped due to context switch!');
    console.log('The post-creation actor has empty classes, so spell selection failed.');
  }
  
  console.log('\n🔍 POTENTIAL SOLUTIONS:');
  console.log('1. Always use the original pre-creation actor for decisions');
  console.log('2. Re-check spell capabilities on the post-creation actor differently');
  console.log('3. Preserve the original actor selection data separately');
  console.log('4. Wait for the post-creation actor to be fully initialized');
}

testContextSwitching().catch(console.error);
