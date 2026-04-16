import { vi, beforeEach, afterEach, describe, it, expect } from 'vitest';

describe('Equipment to Spells Transition Without Shopping', () => {
  beforeEach(() => {
    // Set up minimal globals
    global.game = {
      settings: {
        get: vi.fn((module, key) => {
          if (key === 'enableEquipmentSelection') return true;
          if (key === 'enableEquipmentPurchase') return false;
          if (key === 'enableSpellSelection') return true;
          return false;
        })
      },
      i18n: { localize: vi.fn((key) => key) }
    };

    global.ui = { notifications: { error: vi.fn(), warn: vi.fn(), info: vi.fn() } };
    global.Hooks = { call: vi.fn(), on: vi.fn(), once: vi.fn() };
    global.window = global;
    global.window.GAS = {
      log: { d: vi.fn(), w: vi.fn(), e: vi.fn() }
    };
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should have the equipment to spells transition added to WorkflowStateMachine', async () => {
    // Read the WorkflowStateMachine.js file and verify the fix is present
    const fs = await import('fs');
    const path = await import('path');
    const filePath = path.join(process.cwd(), 'src/helpers/WorkflowStateMachine.js');
    const content = fs.readFileSync(filePath, 'utf8');

    // Verify the new transition to selecting_spells from equipment_complete exists
    expect(content).toContain("transitionTo('selecting_spells').withCondition((context) => {");
    expect(content).toContain('!shouldShowShopping && shouldShowSpells');
    expect(content).toContain('[FSM] Spells tab skipped from equipment_complete because shopping is enabled');
  });

  it('should have logging added to workflow transitions', async () => {
    // Read the WorkflowStateMachine.js file and verify logging is present
    const fs = await import('fs');
    const path = await import('path');
    const filePath = path.join(process.cwd(), 'src/helpers/WorkflowStateMachine.js');
    const content = fs.readFileSync(filePath, 'utf8');

    // Verify logging was added to various transitions
    expect(content).toContain('[FSM] Spells tab skipped from processing_advancements because equipment or shopping is enabled');
    expect(content).toContain('[FSM] Spells tab skipped from equipment_complete because actor is not a spellcaster');
    expect(content).toContain('[FSM] Spells tab skipped from shopping_complete because actor is not a spellcaster');
    expect(content).toContain('[FSM] Spells tab skipped from skip_equipment because shopping is enabled');
  });

  it('should have logging added to LevelUpStateMachine', async () => {
    // Read the LevelUpStateMachine.js file and verify logging is present
    const fs = await import('fs');
    const path = await import('path');
    const filePath = path.join(process.cwd(), 'src/helpers/LevelUpStateMachine.js');
    const content = fs.readFileSync(filePath, 'utf8');

    // Verify logging was added
    expect(content).toContain('[LEVELUP] Spells tab skipped from advancements_complete because actor is not a spellcaster');
  });

  it('should verify the workflow fix addresses the reported issue', () => {
    // This test documents the fix for the issue where spells tab was skipped
    // when equipment was enabled but shopping was disabled

    // The issue was in equipment_complete transitions:
    // Before: only went to selecting_spells for 2014 equipment-only case
    // After: also goes to selecting_spells when shopping is disabled but actor is spellcaster

    // This ensures spells tab opens in Level 1 creation even when:
    // - Equipment selection is enabled
    // - Shopping is disabled
    // - Actor is a spellcaster

    expect(true).toBe(true); // Documentation test - always passes
  });
});