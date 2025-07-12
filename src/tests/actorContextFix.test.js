import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('Actor Context Preservation Fix', () => {
  let mockGame;
  let workflowStateMachine;

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

    // Create a minimal workflow state machine with our fixed logic
    workflowStateMachine = {
      _shouldShowSpellSelection(inGameActor, context = null) {
        const enableSpellSelection = game.settings.get('test-module', 'enableSpellSelection');
        if (!enableSpellSelection) return false;

        // CONTEXT-AWARE DECISION: Use pre-creation actor for spell decision if available
        let actorForDecision = inGameActor;
        
        if (context?.preCreationActor) {
          console.log('Using pre-creation actor for spell decision logic');
          actorForDecision = context.preCreationActor;
        } else {
          console.log('No pre-creation actor, using in-game actor for decision');
        }
        
        if (!actorForDecision) return false;

        // Check if actor is a spellcaster
        const classes = actorForDecision.classes || {};
        const classKeys = Object.keys(classes);

        if (!classKeys.length) {
          // FALLBACK: If we're checking a post-creation actor and it has no classes,
          // try to check the pre-creation actor instead
          if (actorForDecision === context?.postCreationActor && context?.preCreationActor) {
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

  it('should reproduce the original bug (without context preservation)', () => {
    // Create a post-creation actor with empty classes (the bug scenario)
    const inGameBard = {
      id: 'Actor.xyz123',
      name: 'In-Game Bard',
      type: 'character',
      classes: {}, // Empty classes - this causes the bug!
      system: {
        details: { class: 'bard' },
        spells: {}
      }
    };

    // Without context, this should fail (reproducing the bug)
    const result = workflowStateMachine._shouldShowSpellSelection(inGameBard);
    
    expect(result).toBe(false); // Bug reproduced: should show spells but doesn't
  });

  it('should fix the bug with context preservation', () => {
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
    const inGameBard = {
      id: 'Actor.xyz123',
      name: 'In-Game Bard',
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
      postCreationActor: inGameBard,
      actor: inGameBard // Current actor is post-creation
    };

    // With context preservation, this should work
    const result = workflowStateMachine._shouldShowSpellSelection(inGameBard, context);
    
    expect(result).toBe(true); // Fix works: uses pre-creation actor for decision
  });

  it('should handle the critical workflow scenario (_determineNextAfterShopping)', () => {
    // This simulates the exact scenario where the bug occurs
    const preCreationBard = {
      name: 'Test Bard',
      classes: { bard: { system: { spellcasting: { progression: 'full' } } } }
    };

    const inGameBard = {
      id: 'Actor.xyz123',
      name: 'Test Bard',
      classes: {} // Empty after Foundry creation - BUG!
    };

    // Simulate the workflow context after shopping
    const workflowContext = {
      preCreationActor: preCreationBard,
      postCreationActor: inGameBard,
      actor: inGameBard // Current actor passed to _determineNextAfterShopping
    };

    // This simulates _determineNextAfterShopping calling _shouldShowSpellSelection
    // with the in-game actor and the preserved context
    const shouldShowSpells = workflowStateMachine._shouldShowSpellSelection(
      workflowContext.actor,  // Pass the in-game actor (as it should be)
      workflowContext         // Pass the full context (preserves pre-creation data)
    );

    expect(shouldShowSpells).toBe(true);
    expect(mockGame.settings.get).toHaveBeenCalledWith('test-module', 'enableSpellSelection');
  });

  it('should work with different spellcaster types', () => {
    const testCases = [
      {
        name: 'wizard with progression',
        preCreationActor: {
          classes: { wizard: { system: { spellcasting: { progression: 'full' } } } }
        },
        expected: true
      },
      {
        name: 'cleric without progression (uses failsafe)',
        preCreationActor: {
          classes: { cleric: {} }
        },
        expected: true
      },
      {
        name: 'fighter (non-spellcaster)',
        preCreationActor: {
          classes: { fighter: {} }
        },
        expected: false
      }
    ];

    testCases.forEach(testCase => {
      const inGameActor = { id: 'Actor123', classes: {} }; // Always empty classes
      const context = { preCreationActor: testCase.preCreationActor };
      
      const result = workflowStateMachine._shouldShowSpellSelection(inGameActor, context);
      expect(result).toBe(testCase.expected);
    });
  });
});
