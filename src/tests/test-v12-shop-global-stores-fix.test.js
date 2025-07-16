import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('v12 Shop Gold Global Store Fix', () => {
  beforeEach(() => {
    // Clear global state
    if (global.window?.GAS) {
      delete global.window.GAS;
    }
    
    // Mock window
    global.window = global.window || {};
    
    // Clear module cache to force re-execution
    vi.resetModules();
  });

  it('should expose totalGoldFromChoices to window.GAS when goldChoices module is loaded', async () => {
    // Import the goldChoices module which should expose stores to window.GAS
    await import('~/src/stores/goldChoices.js');
    
    // Verify that window.GAS exists
    expect(global.window.GAS).toBeDefined();
    
    // Verify that totalGoldFromChoices is exposed
    expect(global.window.GAS.totalGoldFromChoices).toBeDefined();
    expect(typeof global.window.GAS.totalGoldFromChoices.subscribe).toBe('function');
    
    // Verify that goldRoll is also exposed
    expect(global.window.GAS.goldRoll).toBeDefined();
    expect(typeof global.window.GAS.goldRoll.subscribe).toBe('function');
  });

  it('should make stores available for WorkflowStateMachine access', async () => {
    // Import the goldChoices module
    await import('~/src/stores/goldChoices.js');
    
    // Simulate the WorkflowStateMachine accessing the stores
    const totalGoldFromChoices = global.window.GAS?.totalGoldFromChoices;
    const goldRoll = global.window.GAS?.goldRoll;
    
    // Verify the stores can be accessed as expected by WorkflowStateMachine
    expect(totalGoldFromChoices).toBeDefined();
    expect(goldRoll).toBeDefined();
    
    // Verify they are Svelte stores with required methods
    expect(typeof totalGoldFromChoices.subscribe).toBe('function');
    expect(typeof goldRoll.subscribe).toBe('function');
    expect(typeof goldRoll.set).toBe('function');
  });

  it('should not interfere with existing window.GAS properties', async () => {
    // Set up some existing window.GAS properties
    global.window.GAS = {
      existingProperty: 'test',
      log: { d: vi.fn() }
    };
    
    // Import the goldChoices module
    await import('~/src/stores/goldChoices.js');
    
    // Verify existing properties are preserved
    expect(global.window.GAS.existingProperty).toBe('test');
    expect(global.window.GAS.log.d).toBeDefined();
    
    // Verify new stores are added
    expect(global.window.GAS.totalGoldFromChoices).toBeDefined();
    expect(global.window.GAS.goldRoll).toBeDefined();
  });
});
