/**
 * Test for workflow state management and tab removal in PCAppShell
 * Tests that the Advancements tab is removed when workflow moves past processing_advancements
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { get } from 'svelte/store';

// Mock all store modules
vi.mock('~/src/stores/index', () => ({
  tabs: {
    subscribe: vi.fn(),
    update: vi.fn(),
    set: vi.fn()
  },
  activeTab: {
    subscribe: vi.fn(),
    set: vi.fn()
  },
  characterClass: { subscribe: vi.fn() },
  characterSubClass: { subscribe: vi.fn() },
  resetStores: vi.fn(),
  isLevelUp: { subscribe: vi.fn() },
  levelUpTabs: { subscribe: vi.fn() },
  actorInGame: { subscribe: vi.fn() },
  readOnlyTabs: { subscribe: vi.fn() }
}));

// Mock workflow state machine
const mockWorkflowStateMachine = {
  currentState: {
    subscribe: vi.fn()
  },
  getState: vi.fn(),
  transition: vi.fn(),
  reset: vi.fn()
};

vi.mock('~/src/helpers/WorkflowStateMachine', () => ({
  workflowStateMachine: mockWorkflowStateMachine
}));

// Mock other dependencies
vi.mock('@typhonjs-fvtt/runtime/svelte/component/application', () => ({
  ApplicationShell: vi.fn()
}));

vi.mock('~/src/components/molecules/Tabs.svelte', () => ({
  default: vi.fn()
}));

vi.mock('~/src/components/molecules/Footer.svelte', () => ({
  default: vi.fn()
}));

vi.mock('~/src/components/organisms/dnd5e/Tabs/Spells.svelte', () => ({
  default: vi.fn()
}));

vi.mock('~/src/components/organisms/dnd5e/Tabs/Equipment.svelte', () => ({
  default: vi.fn()
}));

vi.mock('~/src/helpers/Utility', () => ({
  log: vi.fn()
}));

vi.mock('~/src/helpers/constants', () => ({
  MODULE_ID: 'foundryvtt-actor-studio'
}));

// Mock config
vi.mock('~/config/systems/dnd5e.json', () => ({}));

// Mock Svelte context functions
vi.mock('svelte', () => ({
  setContext: vi.fn(),
  getContext: vi.fn(() => ({
    '#external': { application: {} }
  })),
  onMount: vi.fn((callback) => callback()),
  onDestroy: vi.fn(),
  get: vi.fn()
}));

// Mock global Hooks
global.Hooks = {
  once: vi.fn(),
  on: vi.fn(),
  off: vi.fn()
};

// Mock game settings
global.game = {
  settings: {
    get: vi.fn(() => '500px')
  }
};

import { tabs, activeTab } from '~/src/stores/index';

describe('PCAppShell Workflow State Management', () => {
  let stateSubscribeCallback;
  let mockTabs;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Set up mock tabs including advancements
    mockTabs = [
      { label: "Summary", id: "summary", component: "Summary" },
      { label: "Race", id: "race", component: "Race" },
      { label: "Class", id: "class", component: "Class" },
      { label: "Advancements", id: "advancements", component: "Advancements" },
      { label: "Equipment", id: "equipment", component: "Equipment" }
    ];

    // Mock tabs store
    vi.mocked(tabs.subscribe).mockImplementation((callback) => {
      callback(mockTabs);
      return () => {};
    });

    vi.mocked(tabs.update).mockImplementation((updateFn) => {
      mockTabs = updateFn(mockTabs);
      return mockTabs;
    });

    // Mock activeTab store
    vi.mocked(activeTab.subscribe).mockImplementation((callback) => {
      callback('advancements');
      return () => {};
    });

    // Capture the workflow state subscription callback
    vi.mocked(mockWorkflowStateMachine.currentState.subscribe).mockImplementation((callback) => {
      stateSubscribeCallback = callback;
      return () => {};
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should remove advancements tab when workflow moves to selecting_equipment', async () => {
    // Import the component to trigger onMount
    await import('~/src/app/PCAppShell.svelte');

    // Verify that workflow state subscription was set up
    expect(mockWorkflowStateMachine.currentState.subscribe).toHaveBeenCalled();

    // Simulate workflow state change to selecting_equipment
    stateSubscribeCallback('selecting_equipment');

    // Verify that tabs.update was called to remove advancements tab
    expect(tabs.update).toHaveBeenCalled();

    // Check that the update function would filter out advancements
    const updateFn = vi.mocked(tabs.update).mock.calls[0][0];
    const filteredTabs = updateFn(mockTabs);
    
    expect(filteredTabs).not.toContain(
      expect.objectContaining({ id: 'advancements' })
    );
    expect(filteredTabs).toContain(
      expect.objectContaining({ id: 'equipment' })
    );
  });

  it('should remove advancements tab when workflow moves to selecting_spells', async () => {
    // Import the component to trigger onMount
    await import('~/src/app/PCAppShell.svelte');

    // Simulate workflow state change to selecting_spells
    stateSubscribeCallback('selecting_spells');

    // Verify that tabs.update was called
    expect(tabs.update).toHaveBeenCalled();

    // Check that advancements tab would be removed
    const updateFn = vi.mocked(tabs.update).mock.calls[0][0];
    const filteredTabs = updateFn(mockTabs);
    
    expect(filteredTabs).not.toContain(
      expect.objectContaining({ id: 'advancements' })
    );
  });

  it('should not remove advancements tab when in processing_advancements state', async () => {
    // Import the component to trigger onMount
    await import('~/src/app/PCAppShell.svelte');

    // Simulate workflow state change to processing_advancements
    stateSubscribeCallback('processing_advancements');

    // Verify that tabs.update was NOT called since advancements should remain
    expect(tabs.update).not.toHaveBeenCalled();
  });

  it('should not remove advancements tab when in creating_character state', async () => {
    // Import the component to trigger onMount
    await import('~/src/app/PCAppShell.svelte');

    // Simulate workflow state change to creating_character
    stateSubscribeCallback('creating_character');

    // Verify that tabs.update was NOT called since advancements should remain
    expect(tabs.update).not.toHaveBeenCalled();
  });

  it('should switch active tab when advancements tab is removed and was active', async () => {
    // Set up active tab as advancements initially
    vi.mocked(activeTab.subscribe).mockImplementation((callback) => {
      callback('advancements');
      return () => {};
    });

    // Import the component to trigger onMount
    await import('~/src/app/PCAppShell.svelte');

    // Simulate workflow state change to selecting_equipment
    stateSubscribeCallback('selecting_equipment');

    // Verify that tabs.update was called
    expect(tabs.update).toHaveBeenCalled();

    // Verify that activeTab.set was called to switch away from advancements
    expect(activeTab.set).toHaveBeenCalled();
  });

  it('should add spells tab when workflow moves to selecting_spells', async () => {
    // Start with tabs that don't include spells
    const tabsWithoutSpells = [
      { label: "Summary", id: "summary", component: "Summary" },
      { label: "Race", id: "race", component: "Race" },
      { label: "Class", id: "class", component: "Class" }
    ];

    vi.mocked(tabs.subscribe).mockImplementation((callback) => {
      callback(tabsWithoutSpells);
      return () => {};
    });

    // Import the component to trigger onMount
    await import('~/src/app/PCAppShell.svelte');

    // Simulate workflow state change to selecting_spells
    stateSubscribeCallback('selecting_spells');

    // Verify that tabs.update was called to add spells tab
    expect(tabs.update).toHaveBeenCalled();
    expect(activeTab.set).toHaveBeenCalledWith('spells');
  });

  it('should add shop tab when workflow moves to shopping', async () => {
    // Start with tabs that don't include shop
    const tabsWithoutShop = [
      { label: "Summary", id: "summary", component: "Summary" },
      { label: "Equipment", id: "equipment", component: "Equipment" }
    ];

    vi.mocked(tabs.subscribe).mockImplementation((callback) => {
      callback(tabsWithoutShop);
      return () => {};
    });

    // Import the component to trigger onMount
    await import('~/src/app/PCAppShell.svelte');

    // Simulate workflow state change to shopping
    stateSubscribeCallback('shopping');

    // Verify that tabs.update was called to add shop tab
    expect(tabs.update).toHaveBeenCalled();
    expect(activeTab.set).toHaveBeenCalledWith('shop');
  });
});
