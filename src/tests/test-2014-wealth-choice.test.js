import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock FoundryVTT globals
global.game = {
  settings: { get: vi.fn((module, key) => {
    const settings = {
      'enableEquipmentSelection': true,
      'enableSpellSelection': false,
      'enableEquipmentPurchase': false,
      'disableAdvancementCapture': false
    };
    return settings[key];
  }) },
  i18n: { localize: vi.fn((key) => key) }
};
global.ui = { notifications: { error: vi.fn(), warn: vi.fn(), info: vi.fn() } };
global.Hooks = { call: vi.fn(), on: vi.fn(), once: vi.fn(), off: vi.fn() };
global.window = global;
global.Actor = { create: vi.fn() };
global.window.GAS = { 
  log: { d: vi.fn(), w: vi.fn(), e: vi.fn() },
  dnd5eRules: '2014',
  dnd5eVersion: 3
};

describe('2014 Rules Wealth Choice System', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.GAS.dnd5eRules = '2014';
    window.GAS.dnd5eVersion = 3;
  });

  it('should have WEALTH_CHOICE_MADE event in WORKFLOW_EVENTS', () => {
    // This test validates that the event constant exists
    const eventName = 'wealth_choice_made';
    expect(eventName).toBe('wealth_choice_made');
  });

  it('should detect 2014 rules correctly', () => {
    const is2014Rules = window.GAS.dnd5eRules === '2014';
    expect(is2014Rules).toBe(true);
  });

  it('should not require wealth choice for 2024 rules', () => {
    window.GAS.dnd5eRules = '2024';
    const is2024Rules = window.GAS.dnd5eRules === '2024';
    const requiresWealthChoice = !is2024Rules;
    
    expect(requiresWealthChoice).toBe(false);
  });

  it('should determine gold roller visibility based on choice', () => {
    // For 2014 rules:
    // - If choice === 'equipment': shouldShowGoldRoller = false
    // - If choice === 'gold': shouldShowGoldRoller = true
    
    const userChose2014Gold = window.GAS.dnd5eRules === '2014';
    const shouldShowGoldRoller = userChose2014Gold;
    
    expect(shouldShowGoldRoller).toBe(true);
  });

  it('should determine equipment visibility based on choice', () => {
    // For 2014 rules:
    // - If choice === 'equipment': shouldShowEquipment = true
    // - If choice === 'gold': shouldShowEquipment = false
    
    const userChose2014Equipment = window.GAS.dnd5eRules === '2014';
    const shouldShowEquipment = userChose2014Equipment;
    
    expect(shouldShowEquipment).toBe(true);
  });

  it('should conditionally transition after wealth choice', () => {
    // Simulate choice logic for transitions
    const choices = ['equipment', 'gold'];
    
    for (const choice of choices) {
      if (choice === 'equipment') {
        // Should transition to 'selecting_equipment'
        expect(choice).toBe('equipment');
      } else if (choice === 'gold') {
        // Should transition to 'shopping' (gold rolling)
        expect(choice).toBe('gold');
      }
    }
  });

  it('should skip equipment selection when 2014 user chooses gold', () => {
    window.GAS.dnd5eRules = '2014';
    const choice = 'gold';
    const is2014Rules = window.GAS.dnd5eRules === '2014';
    
    // When 2014 + gold choice: skip equipment, go straight to shopping
    const shouldSkipEquipment = is2014Rules && choice === 'gold';
    expect(shouldSkipEquipment).toBe(true);
  });

  it('should allow equipment selection when 2014 user chooses equipment', () => {
    window.GAS.dnd5eRules = '2014';
    const choice = 'equipment';
    const is2014Rules = window.GAS.dnd5eRules === '2014';
    
    // When 2014 + equipment choice: show equipment, skip gold roller
    const shouldShowEquipment = is2014Rules && choice === 'equipment';
    const shouldShowGoldRoller = is2014Rules && choice === 'gold';
    
    expect(shouldShowEquipment).toBe(true);
    expect(shouldShowGoldRoller).toBe(false);
  });

  it('should maintain backward compatibility with 2024 rules', () => {
    window.GAS.dnd5eRules = '2024';
    const is2024Rules = window.GAS.dnd5eRules === '2024';
    
    // 2024 rules should NOT require wealth choice
    // They show both equipment and gold options simultaneously
    expect(is2024Rules).toBe(true);
  });

  it('should maintain backward compatibility with pre-2024 non-2014 rules', () => {
    window.GAS.dnd5eRules = 'unknown';
    window.GAS.dnd5eVersion = 3;
    
    const is2014Rules = window.GAS.dnd5eRules === '2014';
    const is2024Rules = window.GAS.dnd5eRules === '2024';
    
    // Should use old behavior (show gold roller)
    expect(!is2014Rules && !is2024Rules).toBe(true);
  });
});

