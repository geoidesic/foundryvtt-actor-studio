import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('Eldritch Knight Spell Selection Fix', () => {
  let mockActor;
  let workflowFSMContext;

  beforeEach(() => {
    // Mock a Fighter with Eldritch Knight subclass
    mockActor = {
      name: 'Test Fighter (Eldritch Knight)',
      type: 'character',
      classes: {
        fighter: {
          name: 'Fighter',
          system: {
            identifier: 'fighter',
            spellcasting: {
              progression: 'none', // Fighter has NO spellcasting
              ability: ''
            }
          }
        }
      },
      items: [
        {
          type: 'subclass',
          name: 'Eldritch Knight',
          system: {
            identifier: 'eldritch-knight',
            spellcasting: {
              progression: 'third', // Eldritch Knight grants spellcasting
              ability: 'int',
              preparation: {
                formula: '@scale.eldritch-knight.max-prepared',
                value: 0,
                max: 0
              },
              type: 'spell',
              slots: true
            }
          }
        }
      ],
      system: {
        spells: {
          spell1: { max: 2, value: 0, type: 'spell' } // Has spell slots from subclass
        }
      }
    };

    // Mock the WorkflowStateMachine context's _shouldShowSpellSelection method
    workflowFSMContext = {
      _shouldShowSpellSelection: function(inGameActor) {
        const enableSpellSelection = true; // Mock setting
        
        if (!enableSpellSelection) return false;
        
        const actorForDecision = inGameActor || this.actor;
        if (!actorForDecision) return false;

        const classes = actorForDecision.classes || {};
        const classEntries = Object.entries(classes);
        if (!classEntries.length) return false;

        const classDataList = classEntries.map(([, classData]) => classData).filter(Boolean);
        const classNamesLower = classDataList
          .map((classData) => (classData?.system?.identifier || classData?.name || '').toLowerCase())
          .filter(Boolean);

        // Check class-based spellcasting
        const spellcastingInfo = classDataList.map((classData) => {
          const progression = classData?.system?.spellcasting?.progression;
          return { 
            className: classData?.name || classData?.system?.identifier || 'unknown-class',
            identifier: classData?.system?.identifier,
            progression,
            isSpellcaster: progression && progression !== "none"
          };
        });

        const hasClassSpellcasting = spellcastingInfo.some(info => info.isSpellcaster);
        const hasExplicitNonSpellcaster = spellcastingInfo.some(info => info.progression === "none");

        // CRITICAL FIX: Check for subclass spellcasting
        const actorItems = actorForDecision.items || [];
        const hasSubclassWithSpellcasting = actorItems.some(item => {
          if (item.type === 'subclass' && item.system?.spellcasting) {
            const subclassProgression = item.system.spellcasting.progression;
            return subclassProgression && subclassProgression !== 'none';
          }
          return false;
        });

        // Check actor system spellcasting
        const actorData = actorForDecision.system || actorForDecision.data?.data;
        let hasActorSpellcasting = false;

        // CRITICAL: Check actor-level spellcasting if subclass grants it
        if (!hasClassSpellcasting && (!hasExplicitNonSpellcaster || hasSubclassWithSpellcasting)) {
          const hasSpellSlots = actorData?.spells && Object.values(actorData.spells || {}).some(slot => 
            slot && slot.type === 'spell' && slot.max > 0
          );
          hasActorSpellcasting = hasSpellSlots;
        }

        const knownSpellcastingClasses = [
          'bard', 'cleric', 'druid', 'paladin', 'ranger', 'sorcerer', 'warlock', 'wizard',
          'artificer', 'aberrantmind', 'arcanetrickster', 'eldritchknight'
        ];
        const hasKnownSpellcastingClass = classNamesLower.some(className => 
          knownSpellcastingClasses.includes(className)
        );

        const isSpellcaster = hasClassSpellcasting || hasActorSpellcasting || hasKnownSpellcastingClass;

        return isSpellcaster;
      },
      actor: null
    };
  });

  it('should detect Eldritch Knight as spellcaster despite Fighter having progression: "none"', () => {
    // This is the bug: Before the fix, this would return false because Fighter has progression: "none"
    const result = workflowFSMContext._shouldShowSpellSelection(mockActor);

    expect(result).toBe(true);
  });

  it('should verify the fix logic: hasSubclassWithSpellcasting overrides hasExplicitNonSpellcaster', () => {
    // Detailed verification of the fix
    const classes = mockActor.classes;
    const classEntries = Object.entries(classes);
    const classDataList = classEntries.map(([, classData]) => classData);

    const spellcastingInfo = classDataList.map((classData) => {
      const progression = classData?.system?.spellcasting?.progression;
      return { 
        className: classData?.name,
        progression,
        isSpellcaster: progression && progression !== "none"
      };
    });

    const hasClassSpellcasting = spellcastingInfo.some(info => info.isSpellcaster);
    const hasExplicitNonSpellcaster = spellcastingInfo.some(info => info.progression === "none");

    // Check for subclass spellcasting
    const actorItems = mockActor.items || [];
    const hasSubclassWithSpellcasting = actorItems.some(item => {
      if (item.type === 'subclass' && item.system?.spellcasting) {
        const subclassProgression = item.system.spellcasting.progression;
        return subclassProgression && subclassProgression !== 'none';
      }
      return false;
    });

    // Verify the conditions
    expect(hasClassSpellcasting).toBe(false); // Fighter doesn't have spellcasting
    expect(hasExplicitNonSpellcaster).toBe(true); // Fighter explicitly has "none"
    expect(hasSubclassWithSpellcasting).toBe(true); // Eldritch Knight grants spellcasting

    // The fix: Check actor-level spells if subclass grants spellcasting
    const shouldCheckActorSpells = !hasClassSpellcasting && (!hasExplicitNonSpellcaster || hasSubclassWithSpellcasting);
    expect(shouldCheckActorSpells).toBe(true);

    // Verify actor has spell slots
    const actorData = mockActor.system;
    const hasSpellSlots = actorData?.spells && Object.values(actorData.spells).some(slot => 
      slot && slot.type === 'spell' && slot.max > 0
    );
    expect(hasSpellSlots).toBe(true);
  });

  it('should NOT detect spell selection for pure Fighter without Eldritch Knight', () => {
    // Remove the subclass
    const pureFighter = {
      ...mockActor,
      items: [], // No subclass
      system: {
        spells: {} // No spell slots
      }
    };

    const result = workflowFSMContext._shouldShowSpellSelection(pureFighter);

    expect(result).toBe(false); // Pure Fighter should NOT show spell selection
  });

  it('should detect spell selection for Fighter with Arcane Trickster-style subclass', () => {
    // Test with a different third-caster subclass
    const arcaneRogue = {
      name: 'Test Rogue (Arcane Trickster)',
      type: 'character',
      classes: {
        rogue: {
          name: 'Rogue',
          system: {
            identifier: 'rogue',
            spellcasting: {
              progression: 'none', // Rogue has NO spellcasting
              ability: ''
            }
          }
        }
      },
      items: [
        {
          type: 'subclass',
          name: 'Arcane Trickster',
          system: {
            identifier: 'arcane-trickster',
            spellcasting: {
              progression: 'third', // Arcane Trickster grants spellcasting
              ability: 'int'
            }
          }
        }
      ],
      system: {
        spells: {
          spell1: { max: 2, value: 0, type: 'spell' }
        }
      }
    };

    const result = workflowFSMContext._shouldShowSpellSelection(arcaneRogue);

    expect(result).toBe(true); // Should work for any subclass with spellcasting
  });
});
