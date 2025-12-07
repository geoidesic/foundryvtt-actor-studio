import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('DDB Importer Character Detection', () => {
  let isDDBImportedCharacter;
  let showDDBImporterWarning;

  beforeEach(async () => {
    // Mock global Dialog for warning tests
    global.Dialog = {
      confirm: vi.fn()
    };

    // Import the functions
    const module = await import('~/src/helpers/Utility.js');
    isDDBImportedCharacter = module.isDDBImportedCharacter;
    showDDBImporterWarning = module.showDDBImporterWarning;
  });

  it('should detect DDB Importer character by characterId flag', () => {
    const actor = {
      flags: {
        ddbimporter: {
          dndbeyond: {
            characterId: '12345'
          }
        }
      }
    };

    expect(isDDBImportedCharacter(actor)).toBe(true);
  });

  it('should detect DDB Importer character by presence of ddbimporter flag', () => {
    const actor = {
      flags: {
        ddbimporter: {
          someOtherFlag: true
        }
      }
    };

    expect(isDDBImportedCharacter(actor)).toBe(true);
  });

  it('should not detect non-DDB Importer character', () => {
    const actor = {
      flags: {
        someOtherModule: {
          data: true
        }
      }
    };

    expect(isDDBImportedCharacter(actor)).toBe(false);
  });

  it('should handle actor with no flags', () => {
    const actor = {
      name: 'Test Actor'
    };

    expect(isDDBImportedCharacter(actor)).toBe(false);
  });

  it('should handle null/undefined actor', () => {
    expect(isDDBImportedCharacter(null)).toBe(false);
    expect(isDDBImportedCharacter(undefined)).toBe(false);
  });

  it('should call Dialog.confirm with appropriate warning for DDB character with ID', async () => {
    const actor = {
      flags: {
        ddbimporter: {
          dndbeyond: {
            characterId: '12345'
          }
        }
      }
    };

    global.Dialog.confirm.mockResolvedValue(true);

    const result = await showDDBImporterWarning(actor);

    expect(global.Dialog.confirm).toHaveBeenCalled();
    const confirmCall = global.Dialog.confirm.mock.calls[0][0];
    expect(confirmCall.title).toContain('D&D Beyond');
    expect(confirmCall.content).toContain('Character ID: 12345');
    expect(confirmCall.content).toContain('incompatibilities');
    expect(result).toBe(true);
  });

  it('should call Dialog.confirm with appropriate warning for DDB character without ID', async () => {
    const actor = {
      flags: {
        ddbimporter: {
          someFlag: true
        }
      }
    };

    global.Dialog.confirm.mockResolvedValue(false);

    const result = await showDDBImporterWarning(actor);

    expect(global.Dialog.confirm).toHaveBeenCalled();
    const confirmCall = global.Dialog.confirm.mock.calls[0][0];
    expect(confirmCall.content).not.toContain('Character ID:');
    expect(confirmCall.content).toContain('incompatibilities');
    expect(result).toBe(false);
  });

  it('should return user choice from dialog', async () => {
    const actor = {
      flags: {
        ddbimporter: {
          dndbeyond: {
            characterId: '12345'
          }
        }
      }
    };

    // Test user choosing to proceed
    global.Dialog.confirm.mockResolvedValueOnce(true);
    let result = await showDDBImporterWarning(actor);
    expect(result).toBe(true);

    // Test user choosing not to proceed
    global.Dialog.confirm.mockResolvedValueOnce(false);
    result = await showDDBImporterWarning(actor);
    expect(result).toBe(false);
  });
});
