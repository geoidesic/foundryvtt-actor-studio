import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('Level Up Button DDB Importer Integration', () => {
  let mockActor;
  let mockApp;
  let mockPCApplication;

  beforeEach(() => {
    // Mock Dialog
    global.Dialog = {
      confirm: vi.fn()
    };

    // Mock actor
    mockActor = {
      name: 'Test Character',
      flags: {},
      getFlag: vi.fn(),
      setFlag: vi.fn()
    };

    // Mock app
    mockApp = {
      actor: mockActor,
      close: vi.fn()
    };

    // Mock PCApplication
    mockPCApplication = vi.fn().mockImplementation(function() {
      this.render = vi.fn();
    });

    // Mock document.querySelector
    global.document.querySelector = vi.fn();

    // Mock MODULE_ID
    vi.mock('~/src/helpers/constants', () => ({
      MODULE_ID: 'foundryvtt-actor-studio'
    }));
  });

  it('should allow level-up for non-DDB Importer character without warning', async () => {
    // Import utility functions
    const { isDDBImportedCharacter, showDDBImporterWarning } = await import('~/src/helpers/Utility.js');
    
    // Actor without DDB Importer flags
    mockActor.flags = {};
    
    // Check if DDB Importer warning should be shown
    const isDDB = isDDBImportedCharacter(mockActor);
    expect(isDDB).toBe(false);
    
    // Verify Dialog.confirm is not called for non-DDB character
    if (isDDB) {
      await showDDBImporterWarning(mockActor);
    }
    
    expect(global.Dialog.confirm).not.toHaveBeenCalled();
  });

  it('should show warning and respect user choice for DDB Importer character', async () => {
    const { isDDBImportedCharacter, showDDBImporterWarning } = await import('~/src/helpers/Utility.js');
    
    // Actor with DDB Importer flags
    mockActor.flags = {
      ddbimporter: {
        dndbeyond: {
          characterId: '12345'
        }
      }
    };
    
    const isDDB = isDDBImportedCharacter(mockActor);
    expect(isDDB).toBe(true);
    
    // Test user chooses NOT to proceed
    global.Dialog.confirm.mockResolvedValueOnce(false);
    const proceedNo = await showDDBImporterWarning(mockActor);
    expect(proceedNo).toBe(false);
    
    // Test user chooses TO proceed
    global.Dialog.confirm.mockResolvedValueOnce(true);
    const proceedYes = await showDDBImporterWarning(mockActor);
    expect(proceedYes).toBe(true);
  });

  it('should display appropriate warning content for DDB character', async () => {
    const { isDDBImportedCharacter, showDDBImporterWarning } = await import('~/src/helpers/Utility.js');
    
    mockActor.flags = {
      ddbimporter: {
        dndbeyond: {
          characterId: '67890'
        }
      }
    };
    
    global.Dialog.confirm.mockResolvedValueOnce(true);
    
    if (isDDBImportedCharacter(mockActor)) {
      await showDDBImporterWarning(mockActor);
    }
    
    expect(global.Dialog.confirm).toHaveBeenCalled();
    const confirmCall = global.Dialog.confirm.mock.calls[0][0];
    
    // Check warning content
    expect(confirmCall.title).toContain('D&D Beyond');
    expect(confirmCall.content).toContain('Character ID: 67890');
    expect(confirmCall.content).toContain('incompatibilities');
    expect(confirmCall.content).toContain('Feature advancements');
    expect(confirmCall.content).toContain('Spell selections');
    expect(confirmCall.content).toContain('Equipment assignments');
    expect(confirmCall.content).toContain('DDB Importer');
  });

  it('should simulate complete level-up button flow for non-DDB character', async () => {
    const { isDDBImportedCharacter, showDDBImporterWarning } = await import('~/src/helpers/Utility.js');
    
    // Setup: non-DDB character
    mockActor.flags = {};
    global.document.querySelector.mockReturnValue(null); // No Actor Studio open
    
    // Simulate button click flow
    const studioIsOpen = !!document.querySelector('#foundryvtt-actor-studio-pc-sheet');
    expect(studioIsOpen).toBe(false);
    
    // Check DDB Importer
    const isDDB = isDDBImportedCharacter(mockActor);
    expect(isDDB).toBe(false);
    
    // No warning should be shown
    let shouldProceed = true;
    if (isDDB) {
      shouldProceed = await showDDBImporterWarning(mockActor);
    }
    
    expect(shouldProceed).toBe(true);
    expect(global.Dialog.confirm).not.toHaveBeenCalled();
  });

  it('should simulate complete level-up button flow for DDB character choosing to proceed', async () => {
    const { isDDBImportedCharacter, showDDBImporterWarning } = await import('~/src/helpers/Utility.js');
    
    // Setup: DDB character
    mockActor.flags = {
      ddbimporter: {
        dndbeyond: {
          characterId: '99999'
        }
      }
    };
    global.document.querySelector.mockReturnValue(null); // No Actor Studio open
    global.Dialog.confirm.mockResolvedValue(true); // User chooses to proceed
    
    // Simulate button click flow
    const studioIsOpen = !!document.querySelector('#foundryvtt-actor-studio-pc-sheet');
    expect(studioIsOpen).toBe(false);
    
    // Check DDB Importer
    const isDDB = isDDBImportedCharacter(mockActor);
    expect(isDDB).toBe(true);
    
    // Warning should be shown
    const shouldProceed = await showDDBImporterWarning(mockActor);
    
    expect(shouldProceed).toBe(true);
    expect(global.Dialog.confirm).toHaveBeenCalled();
  });

  it('should simulate complete level-up button flow for DDB character choosing NOT to proceed', async () => {
    const { isDDBImportedCharacter, showDDBImporterWarning } = await import('~/src/helpers/Utility.js');
    
    // Setup: DDB character
    mockActor.flags = {
      ddbimporter: {
        dndbeyond: {
          characterId: '11111'
        }
      }
    };
    global.document.querySelector.mockReturnValue(null); // No Actor Studio open
    global.Dialog.confirm.mockResolvedValue(false); // User chooses NOT to proceed
    
    // Simulate button click flow
    const studioIsOpen = !!document.querySelector('#foundryvtt-actor-studio-pc-sheet');
    expect(studioIsOpen).toBe(false);
    
    // Check DDB Importer
    const isDDB = isDDBImportedCharacter(mockActor);
    expect(isDDB).toBe(true);
    
    // Warning should be shown
    const shouldProceed = await showDDBImporterWarning(mockActor);
    
    expect(shouldProceed).toBe(false);
    expect(global.Dialog.confirm).toHaveBeenCalled();
    
    // Level-up should be aborted - PCApplication should NOT be created
    // This would be handled by the return statement in the actual button handler
  });
});
