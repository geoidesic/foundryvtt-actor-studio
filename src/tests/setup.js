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

// Mock game settings
global.game = {
  settings: {
    get: vi.fn().mockReturnValue(false)
  }
};

// Mock MODULE_ID constant
global.MODULE_ID = 'foundryvtt-actor-studio'; 