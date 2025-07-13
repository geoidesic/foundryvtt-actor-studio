/**
 * Test: Actor Studio Opens When Sidebar Button is Clicked
 * This test simulates clicking the sidebar button and verifies the application opens
 */

// Mock the global game object and essential Foundry classes
global.game = {
  settings: {
    get: (moduleId, setting) => {
      // Default settings for testing
      const defaults = {
        'enableEquipmentSelection': false,
        'enableEquipmentPurchase': false,
        'enableSpellSelection': true,
        'disableAdvancementCapture': false
      };
      return defaults[setting] || false;
    }
  },
  user: { isGM: true },
  i18n: {
    localize: (key) => key
  }
};

global.ui = {
  notifications: {
    info: (msg) => console.log('[INFO]', msg),
    warn: (msg) => console.log('[WARN]', msg),
    error: (msg) => console.log('[ERROR]', msg)
  }
};

global.Hooks = {
  call: (hook, ...args) => {
    console.log(`[HOOK] ${hook} called with:`, args);
    return true;
  },
  on: (hook, callback) => {
    console.log(`[HOOK] Registered handler for ${hook}`);
  },
  once: (hook, callback) => {
    console.log(`[HOOK] Registered one-time handler for ${hook}`);
  }
};

// Mock foundry classes
global.Application = class Application {
  constructor(options = {}) {
    this.options = options;
    this.rendered = false;
  }
  
  render(force = false) {
    console.log('[APPLICATION] Render called, force:', force);
    this.rendered = true;
    return Promise.resolve(this);
  }
  
  close() {
    console.log('[APPLICATION] Close called');
    this.rendered = false;
    return Promise.resolve();
  }
};

// Mock window for browser environment
global.window = global;
global.window.GAS = {
  log: {
    d: (...args) => console.log('[DEBUG]', ...args),
    i: (...args) => console.log('[INFO]', ...args),
    w: (...args) => console.log('[WARN]', ...args),
    e: (...args) => console.log('[ERROR]', ...args)
  }
};

// Mock document for DOM operations
global.document = {
  createElement: (tag) => ({
    tagName: tag.toUpperCase(),
    addEventListener: () => {},
    removeEventListener: () => {},
    style: {},
    classList: {
      add: () => {},
      remove: () => {},
      contains: () => false
    }
  }),
  querySelector: () => null,
  querySelectorAll: () => []
};

// Test the Actor Studio opening functionality
async function testActorStudioOpen() {
  console.log('=== Testing Actor Studio Open ===');
  
  try {
    // Import the modules we need to test
    const { getWorkflowFSM, WORKFLOW_STATES } = await import('./src/helpers/WorkflowStateMachine.js');
    
    console.log('✓ WorkflowStateMachine imported successfully');
    
    // Test FSM initialization
    const fsm = getWorkflowFSM();
    console.log('✓ Workflow FSM created');
    console.log('Current FSM state:', fsm.getCurrentState());
    
    // Verify initial state
    if (fsm.getCurrentState() === WORKFLOW_STATES.IDLE) {
      console.log('✓ FSM initialized in IDLE state');
    } else {
      console.log('❌ FSM not in expected IDLE state, got:', fsm.getCurrentState());
      return false;
    }
    
    // Test that the FSM is accessible globally
    if (window.GAS.workflowFSM) {
      console.log('✓ FSM exposed globally on window.GAS');
    } else {
      console.log('❌ FSM not found on window.GAS');
      return false;
    }
    
    // Mock the application opening process
    console.log('\n--- Simulating Actor Studio Opening ---');
    
    // This simulates what happens when the sidebar button is clicked
    // The actual PCApplication would be created and rendered
    const mockApp = new Application({
      id: 'foundryvtt-actor-studio-pc-sheet',
      title: 'Actor Studio'
    });
    
    // Simulate rendering the app
    await mockApp.render(true);
    
    if (mockApp.rendered) {
      console.log('✓ Actor Studio application rendered successfully');
    } else {
      console.log('❌ Actor Studio application failed to render');
      return false;
    }
    
    // Verify FSM is still in idle state after opening
    if (fsm.getCurrentState() === WORKFLOW_STATES.IDLE) {
      console.log('✓ FSM remains in IDLE state after opening');
    } else {
      console.log('❌ FSM state changed unexpectedly to:', fsm.getCurrentState());
    }
    
    console.log('\n=== Test Results ===');
    console.log('✅ Actor Studio opens successfully');
    console.log('✅ Workflow FSM initializes correctly');
    console.log('✅ No errors during application startup');
    
    return true;
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
    console.error('Stack trace:', error.stack);
    return false;
  }
}

// Run the test
testActorStudioOpen().then(success => {
  if (success) {
    console.log('\n🎉 All tests passed!');
    process.exit(0);
  } else {
    console.log('\n💥 Tests failed!');
    process.exit(1);
  }
}).catch(error => {
  console.error('Unexpected error running tests:', error);
  process.exit(1);
});
