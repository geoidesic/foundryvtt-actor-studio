import { vi } from 'vitest';

// Mock Svelte stores
vi.mock('svelte/store', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    writable: vi.fn().mockImplementation((value) => ({
      subscribe: vi.fn(),
      set: vi.fn(),
      update: vi.fn(),
    })),
    readable: vi.fn().mockImplementation((value) => ({
      subscribe: vi.fn(),
    })),
    derived: vi.fn().mockImplementation((stores, fn) => ({
      subscribe: vi.fn(),
    })),
    get: vi.fn().mockReturnValue({}),
  };
});

// Mock global variables that would normally be provided by FoundryVTT
global.window = global.window || {};
global.window.GAS = {
  log: {
    d: vi.fn(), // Mock debug logging
    i: vi.fn(), // Mock info logging
    w: vi.fn(), // Mock warning logging
    e: vi.fn()  // Mock error logging
  }
};
global.GAS = global.window.GAS;

// Make window globally available
globalThis.window = global.window;

// Mock game settings
global.game = {
  settings: {
    get: vi.fn().mockReturnValue(false)
  }
};

// Mock MODULE_ID constant
global.MODULE_ID = 'foundryvtt-actor-studio';

// Mock DOM queries
global.document = {
  querySelectorAll: vi.fn().mockReturnValue([]),
};

// Mock Hooks system
global.Hooks = {
  call: vi.fn(),
  on: vi.fn(),
  off: vi.fn(),
}; 