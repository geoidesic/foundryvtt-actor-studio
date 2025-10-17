import { describe, it, expect, vi, beforeEach } from 'vitest';
import { determineSpellListClass, parseSpellcastingFromDescription } from '~/src/helpers/LevelUpStateMachine';

describe('determineSpellListClass', () => {
  beforeEach(() => {
    // Mock window.GAS.log for testing
    global.window = {
      GAS: {
        log: {
          d: vi.fn(),
          w: vi.fn(),
          e: vi.fn()
        }
      }
    };
  });

  it('should return Wizard for Eldritch Knight subclass via droppedItems', () => {
    const mockActor = {
      name: 'Test Fighter',
      getFlag: vi.fn().mockReturnValue({
        subclass: [
          {
            type: 'subclass',
            uuid: 'Compendium.dnd5e.classfeatures.eldritch-knight'
          }
        ]
      }),
      items: [],
      system: {
        classes: {}
      }
    };

    // Mock fromUuidSync to return a mock Eldritch Knight subclass item
    const mockEldritchKnightItem = {
      name: 'Eldritch Knight',
      system: {
        description: {
          value: 'You learn spells from the Wizard spell list.'
        }
      }
    };

    // Mock foundry.utils.fromUuidSync
    global.foundry = {
      utils: {
        fromUuidSync: vi.fn().mockReturnValue(mockEldritchKnightItem)
      }
    };

    const result = determineSpellListClass(mockActor);
    expect(result).toBe('Wizard');
  });

  it('should return Wizard for Eldritch Knight subclass via actor items', () => {
    const mockActor = {
      name: 'Test Fighter',
      getFlag: vi.fn().mockReturnValue(null),
      items: [
        {
          type: 'subclass',
          name: 'Eldritch Knight',
          system: {
            identifier: 'eldritch-knight',
            description: {
              value: 'You learn spells from the Wizard spell list.'
            }
          }
        }
      ],
      system: {
        classes: {}
      }
    };

    // Mock foundry.utils.fromUuidSync
    global.foundry = {
      utils: {
        fromUuidSync: vi.fn().mockReturnValue(null)
      }
    };

    const result = determineSpellListClass(mockActor);
    expect(result).toBe('Wizard');
  });

  it('should return Wizard for Eldritch Knight subclass via class data', () => {
    const mockActor = {
      name: 'Test Fighter',
      getFlag: vi.fn().mockReturnValue(null),
      items: [],
      system: {
        classes: {
          fighter: {
            system: {
              subclass: 'eldritchknight'
            }
          }
        }
      }
    };

    // Mock foundry.utils.fromUuidSync
    global.foundry = {
      utils: {
        fromUuidSync: vi.fn().mockReturnValue(null)
      }
    };

    const result = determineSpellListClass(mockActor);
    expect(result).toBe('Wizard');
  });

  it('should return Sorcerer for Aberrant Mind subclass', () => {
    const mockActor = {
      name: 'Test Sorcerer',
      getFlag: vi.fn().mockReturnValue(null),
      items: [
        {
          type: 'subclass',
          name: 'Aberrant Mind',
          system: {
            identifier: 'aberrant-mind',
            description: {
              value: 'You learn spells from the Sorcerer spell list.'
            }
          }
        }
      ],
      system: {
        classes: {}
      }
    };

    // Mock foundry.utils.fromUuidSync
    global.foundry = {
      utils: {
        fromUuidSync: vi.fn().mockReturnValue(null)
      }
    };

    const result = determineSpellListClass(mockActor);
    expect(result).toBe('Sorcerer');
  });

  it('should return base class when no subclass is found', () => {
    const mockActor = {
      name: 'Test Wizard',
      getFlag: vi.fn().mockReturnValue(null),
      items: [],
      system: {
        classes: {
          wizard: {
            system: {
              subclass: null
            }
          }
        }
      }
    };

    // Mock foundry.utils.fromUuidSync
    global.foundry = {
      utils: {
        fromUuidSync: vi.fn().mockReturnValue(null)
      }
    };

    const result = determineSpellListClass(mockActor);
    expect(result).toBe('wizard');
  });

  it('should return null when no actor is provided', () => {
    const result = determineSpellListClass(null);
    expect(result).toBe(null);
  });

  it('should return null when actor has no system data', () => {
    const mockActor = {
      name: 'Test Actor',
      getFlag: vi.fn().mockReturnValue(null),
      items: []
    };

    const result = determineSpellListClass(mockActor);
    expect(result).toBe(null);
  });
});

describe('parseSpellcastingFromDescription', () => {
  it('should parse Wizard spell list from description', () => {
    const mockItem = {
      system: {
        description: {
          value: 'You learn spells from the Wizard spell list.'
        }
      }
    };

    const result = parseSpellcastingFromDescription(mockItem);
    expect(result).toBe('Wizard');
  });

  it('should parse Sorcerer spell list from description', () => {
    const mockItem = {
      system: {
        description: {
          value: 'You learn spells from the Sorcerer spell list.'
        }
      }
    };

    const result = parseSpellcastingFromDescription(mockItem);
    expect(result).toBe('Sorcerer');
  });

  it('should parse Bard spell list from description', () => {
    const mockItem = {
      system: {
        description: {
          value: 'You learn spells from the Bard spell list.'
        }
      }
    };

    const result = parseSpellcastingFromDescription(mockItem);
    expect(result).toBe('Bard');
  });

  it('should return null when no description is found', () => {
    const mockItem = {
      system: {}
    };

    const result = parseSpellcastingFromDescription(mockItem);
    expect(result).toBe(null);
  });

  it('should return null when no spell list is mentioned', () => {
    const mockItem = {
      system: {
        description: {
          value: 'This is just a regular feature with no spellcasting.'
        }
      }
    };

    const result = parseSpellcastingFromDescription(mockItem);
    expect(result).toBe(null);
  });

  it('should handle case-insensitive matching', () => {
    const mockItem = {
      system: {
        description: {
          value: 'You learn spells from the WIZARD SPELL LIST.'
        }
      }
    };

    const result = parseSpellcastingFromDescription(mockItem);
    expect(result).toBe('Wizard');
  });
});
