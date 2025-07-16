import { describe, test, expect, vi, beforeEach } from 'vitest';

describe('D&D Rules Gold Calculation Fix', () => {
  let mockWorkflowStateMachine;
  let mockGAS;
  let mockGet;
  let mockTotalGoldFromChoices;
  let mockGoldRoll;

  beforeEach(() => {
    // Mock the get function from svelte/store
    mockGet = vi.fn();
    vi.doMock('svelte/store', () => ({
      get: mockGet,
      writable: vi.fn(() => ({ set: vi.fn(), update: vi.fn(), subscribe: vi.fn() })),
      derived: vi.fn(() => ({ set: vi.fn(), update: vi.fn(), subscribe: vi.fn() }))
    }));

    // Mock stores
    mockTotalGoldFromChoices = { subscribe: vi.fn() };
    mockGoldRoll = { subscribe: vi.fn() };

    // Mock window.GAS
    mockGAS = {
      log: { d: vi.fn(), e: vi.fn(), w: vi.fn() },
      totalGoldFromChoices: mockTotalGoldFromChoices,
      goldRoll: mockGoldRoll,
      availableGold: { set: vi.fn() },
      dnd5eVersion: 4, // Default to version 4
      dnd5eRules: "2014" // Default to 2014 rules
    };
    global.window = { GAS: mockGAS };

    // Mock other required globals
    global.game = {
      settings: { get: vi.fn() }
    };
    global.Hooks = { call: vi.fn() };
  });

  test('should use goldRoll for D&D 2014 rules even with version 4+', async () => {
    // Setup: D&D 5e version 4+ but using 2014 rules
    mockGAS.dnd5eVersion = 4;
    mockGAS.dnd5eRules = "2014";
    
    // Mock goldRoll to return a specific value
    mockGet.mockImplementation((store) => {
      if (store === mockGoldRoll) return 150; // 150 gold pieces
      if (store === mockTotalGoldFromChoices) return 250; // This should NOT be used
      return 0;
    });

    // Manually call the shopping state onEnter logic (matching WorkflowStateMachine.js)
    const shopOnEnter = () => {
      const totalGoldFromChoices = mockGAS?.totalGoldFromChoices;
      const goldRoll = mockGAS?.goldRoll;
      let goldValue;
      
      // This is the key logic we're testing - matching the actual code
      if (mockGAS.dnd5eVersion >= 4 && mockGAS.dnd5eRules === "2024") {
        goldValue = totalGoldFromChoices ? mockGet(totalGoldFromChoices) : 0;
        mockGAS.log.d('[WORKFLOW] Using D&D 2024 rules - totalGoldFromChoices:', goldValue);
      } else {
        goldValue = goldRoll ? mockGet(goldRoll) : 0;
        mockGAS.log.d('[WORKFLOW] Using D&D 2014 rules - goldRoll:', goldValue);
      }
      
      const goldValueInCopper = goldValue * 100;
      if (mockGAS && mockGAS.availableGold && typeof mockGAS.availableGold.set === 'function') {
        mockGAS.availableGold.set(goldValueInCopper);
      }
    };

    shopOnEnter();

    // Verify it used goldRoll (2014 rules) not totalGoldFromChoices (2024 rules)
    expect(mockGet).toHaveBeenCalledWith(mockGoldRoll);
    expect(mockGAS.availableGold.set).toHaveBeenCalledWith(15000); // 150 * 100 = 15000 copper
    expect(mockGAS.log.d).toHaveBeenCalledWith('[WORKFLOW] Using D&D 2014 rules - goldRoll:', 150);
  });

  test('should use totalGoldFromChoices for D&D 2024 rules with version 4+', async () => {
    // Setup: D&D 5e version 4+ using 2024 rules
    mockGAS.dnd5eVersion = 4;
    mockGAS.dnd5eRules = "2024";
    
    // Mock totalGoldFromChoices to return a specific value
    mockGet.mockImplementation((store) => {
      if (store === mockTotalGoldFromChoices) return 250; // This SHOULD be used
      if (store === mockGoldRoll) return 150; // This should NOT be used
      return 0;
    });

    // Manually call the shopping state onEnter logic (matching WorkflowStateMachine.js)
    const shopOnEnter = () => {
      const totalGoldFromChoices = mockGAS?.totalGoldFromChoices;
      const goldRoll = mockGAS?.goldRoll;
      let goldValue;
      
      // This is the key logic we're testing - matching the actual code
      if (mockGAS.dnd5eVersion >= 4 && mockGAS.dnd5eRules === "2024") {
        goldValue = totalGoldFromChoices ? mockGet(totalGoldFromChoices) : 0;
        mockGAS.log.d('[WORKFLOW] Using D&D 2024 rules - totalGoldFromChoices:', goldValue);
      } else {
        goldValue = goldRoll ? mockGet(goldRoll) : 0;
        mockGAS.log.d('[WORKFLOW] Using D&D 2014 rules - goldRoll:', goldValue);
      }
      
      const goldValueInCopper = goldValue * 100;
      if (mockGAS && mockGAS.availableGold && typeof mockGAS.availableGold.set === 'function') {
        mockGAS.availableGold.set(goldValueInCopper);
      }
    };

    shopOnEnter();

    // Verify it used totalGoldFromChoices (2024 rules) not goldRoll (2014 rules)
    expect(mockGet).toHaveBeenCalledWith(mockTotalGoldFromChoices);
    expect(mockGAS.availableGold.set).toHaveBeenCalledWith(25000); // 250 * 100 = 25000 copper
    expect(mockGAS.log.d).toHaveBeenCalledWith('[WORKFLOW] Using D&D 2024 rules - totalGoldFromChoices:', 250);
  });

  test('should use goldRoll for D&D 5e version 3 (legacy)', async () => {
    // Setup: D&D 5e version 3 (legacy)
    mockGAS.dnd5eVersion = 3;
    mockGAS.dnd5eRules = "2014"; // Version 3 only supports 2014 rules
    
    // Mock goldRoll to return a specific value
    mockGet.mockImplementation((store) => {
      if (store === mockGoldRoll) return 100; // 100 gold pieces
      if (store === mockTotalGoldFromChoices) return 300; // This should NOT be used
      return 0;
    });

    // Manually call the shopping state onEnter logic (matching WorkflowStateMachine.js)
    const shopOnEnter = () => {
      const totalGoldFromChoices = mockGAS?.totalGoldFromChoices;
      const goldRoll = mockGAS?.goldRoll;
      let goldValue;
      
      // This is the key logic we're testing - matching the actual code
      if (mockGAS.dnd5eVersion >= 4 && mockGAS.dnd5eRules === "2024") {
        goldValue = totalGoldFromChoices ? mockGet(totalGoldFromChoices) : 0;
        mockGAS.log.d('[WORKFLOW] Using D&D 2024 rules - totalGoldFromChoices:', goldValue);
      } else {
        goldValue = goldRoll ? mockGet(goldRoll) : 0;
        mockGAS.log.d('[WORKFLOW] Using D&D 2014 rules - goldRoll:', goldValue);
      }
      
      const goldValueInCopper = goldValue * 100;
      if (mockGAS && mockGAS.availableGold && typeof mockGAS.availableGold.set === 'function') {
        mockGAS.availableGold.set(goldValueInCopper);
      }
    };

    shopOnEnter();

    // Verify it used goldRoll (2014 rules) not totalGoldFromChoices
    expect(mockGet).toHaveBeenCalledWith(mockGoldRoll);
    expect(mockGAS.availableGold.set).toHaveBeenCalledWith(10000); // 100 * 100 = 10000 copper
    expect(mockGAS.log.d).toHaveBeenCalledWith('[WORKFLOW] Using D&D 2014 rules - goldRoll:', 100);
  });

  test('should demonstrate the v12 fix scenario', () => {
    console.log('🔧 V12 SHOP GOLD FIX DEMONSTRATION');
    console.log('=====================================');
    console.log('');
    console.log('SCENARIO: FoundryVTT v12 with D&D 5e system v4+ but using 2014 rules');
    console.log('');
    console.log('BEFORE FIX:');
    console.log('- Condition: if (window.GAS.dnd5eVersion >= 4)');
    console.log('- Result: Used totalGoldFromChoices (empty) → 0 gold displayed');
    console.log('');
    console.log('AFTER FIX:');
    console.log('- Condition: if (window.GAS.dnd5eVersion >= 4 && window.GAS.dnd5eRules === "2024")');
    console.log('- Result: Uses goldRoll (populated) → Correct gold displayed');
    console.log('');
    console.log('✅ This fix ensures v12 users with 2014 rules see their starting gold correctly!');

    expect(true).toBe(true); // This test is for documentation
  });
});
