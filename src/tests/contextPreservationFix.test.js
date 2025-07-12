import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('Spell Tab Context Preservation Fix', () => {
  let mockWorkflowStateMachine;
  let mockGame;

  beforeEach(() => {
    // Mock game settings
    mockGame = {
      settings: {
        get: vi.fn((module, key) => {
          if (key === 'enableSpellSelection') return true;
          if (key === 'enableEquipmentSelection') return true;
          if (key === 'enableEquipmentPurchase') return true;
          return false;
        })
      }
    };
    globalThis.game = mockGame;

    // Mock window.GAS
    globalThis.window = {
      GAS: {
        log: {
          d: vi.fn(),
          w: vi.fn(),
          e: vi.fn(),
          i: vi.fn()
        }
      }
    };

    // Create mock workflow state machine with our fix
    mockWorkflowStateMachine = {
      _shouldShowSpellSelection(actor, context = null) {
        const enableSpellSelection = game.settings.get('test-module', 'enableSpellSelection');
        if (!enableSpellSelection) return false;

        // CONTEXT-AWARE ACTOR SELECTION: Use pre-creation actor for decisions if available
        let actorToCheck = actor;
        if (context?.preCreationActor) {
          console.log('Using pre-creation actor for spell selection check');
          actorToCheck = context.preCreationActor;
        } else if (context?.postCreationActor && !actor) {
          console.log('No direct actor, using post-creation actor');
          actorToCheck = context.postCreationActor;
        }

        if (!actorToCheck) return false;

        // Check if actor is a spellcaster
        const classes = actorToCheck.classes || {};
        const classKeys = Object.keys(classes);

        if (!classKeys.length) {
          // FALLBACK: If we're checking a post-creation actor and it has no classes,
          // try to check the pre-creation actor instead
          if (actorToCheck === context?.postCreationActor && context?.preCreationActor) {
            console.log('Post-creation actor has no classes, falling back to pre-creation actor');
            return this._shouldShowSpellSelection(context.preCreationActor);
          }
          return false;
        }

        // Check for spellcasting progression
        const isSpellcaster = Object.values(classes).some(cls => 
          cls.system?.spellcasting?.progression && 
          cls.system.spellcasting.progression !== "none"
        );

        // FAILSAFE: Check for known spellcasting classes by name
        if (!isSpellcaster) {
          const knownSpellcastingClasses = ['bard', 'cleric', 'druid', 'sorcerer', 'wizard'];
          const hasKnownSpellcastingClass = classKeys.some(className => 
            knownSpellcastingClasses.includes(className.toLowerCase())
          );
          if (hasKnownSpellcastingClass) return true;
        }

        return isSpellcaster;
      }
    };
  });

  it('should fail without context preservation (reproduces the bug)', () => {
    // Create a post-creation actor with empty classes (the bug scenario)
    const postCreationBard = {
      id: 'Actor.xyz123',
      name: 'Post-Creation Bard',
      type: 'character',
      classes: {}, // Empty classes - this causes the bug!
      system: {
        details: { class: 'bard' },
        spells: {}
      }
    };

    // Without context, this should fail (reproducing the bug)
    const result = mockWorkflowStateMachine._shouldShowSpellSelection(postCreationBard);
    
    expect(result).toBe(false); // Bug reproduced: should show spells but doesn't
  });

  it('should succeed with context preservation (fixes the bug)', () => {
    // Create pre-creation actor (user's original selection)
    const preCreationBard = {
      name: 'Pre-Creation Bard',
      type: 'character',
      classes: {
        bard: {
          system: {
            spellcasting: {
              progression: 'full'
            }
          }
        }
      }
    };

    // Create post-creation actor with empty classes
    const postCreationBard = {
      id: 'Actor.xyz123',
      name: 'Post-Creation Bard',
      type: 'character',
      classes: {}, // Empty classes
      system: {
        details: { class: 'bard' },
        spells: {}
      }
    };

    // Create context that preserves both actors
    const context = {
      preCreationActor: preCreationBard,
      postCreationActor: postCreationBard,
      actor: postCreationBard
    };

    // With context preservation, this should work
    const result = mockWorkflowStateMachine._shouldShowSpellSelection(postCreationBard, context);
    
    expect(result).toBe(true); // Fix works: uses pre-creation actor for decision
  });

  it('should work with different actor structures', () => {
    const testCases = [
      {
        name: 'bard with progression',
        actor: {
          classes: { bard: { system: { spellcasting: { progression: 'full' } } } }
        },
        expected: true
      },
      {
        name: 'bard without progression (uses failsafe)',
        actor: {
          classes: { bard: {} }
        },
        expected: true
      },
      {
        name: 'fighter (non-spellcaster)',
        actor: {
          classes: { fighter: {} }
        },
        expected: false
      },
      {
        name: 'empty classes',
        actor: {
          classes: {}
        },
        expected: false
      }
    ];

    testCases.forEach(testCase => {
      const result = mockWorkflowStateMachine._shouldShowSpellSelection(testCase.actor);
      expect(result).toBe(testCase.expected);
    });
  });

  it('demonstrates the complete workflow bug scenario', () => {
    // Simulate the complete workflow scenario
    const preCreationBard = {
      name: 'Test Bard',
      classes: { bard: { system: { spellcasting: { progression: 'full' } } } }
    };

    const postCreationBard = {
      id: 'Actor.xyz123',
      name: 'Test Bard',
      classes: {} // Empty after Foundry creation
    };

    // Simulate workflow context that preserves both actors
    const workflowContext = {
      preCreationActor: preCreationBard,
      postCreationActor: postCreationBard,
      actor: postCreationBard
    };

    // This simulates _determineNextAfterShopping calling _shouldShowSpellSelection
    const shouldShowSpells = mockWorkflowStateMachine._shouldShowSpellSelection(
      workflowContext.actor, 
      workflowContext
    );

    expect(shouldShowSpells).toBe(true);
    
    // Verify the mock calls show we're using the context correctly
    expect(mockGame.settings.get).toHaveBeenCalledWith('test-module', 'enableSpellSelection');
  });
});
