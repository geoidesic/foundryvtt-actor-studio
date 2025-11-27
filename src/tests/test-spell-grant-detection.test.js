import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SpellGrantDetection } from '~/src/helpers/SpellGrantDetection.js';

describe('SpellGrantDetection', () => {
  describe('detectSpellGrant', () => {
    it('should return null for items without advancements', () => {
      const item = { system: {} };
      const result = SpellGrantDetection.detectSpellGrant(item);
      expect(result).toBeNull();
    });

    it('should return null for items without spell-granting advancements', () => {
      const item = {
        id: 'test-id',
        name: 'Test Item',
        type: 'feat',
        system: {
          advancement: [
            {
              type: 'ItemChoice',
              configuration: {
                restriction: { type: 'equipment' }
              }
            }
          ]
        }
      };
      const result = SpellGrantDetection.detectSpellGrant(item);
      expect(result).toBeNull();
    });

    it('should detect Magic Initiate feat spell grants', () => {
      const magicInitiateFeat = {
        id: 'magic-initiate-id',
        name: 'Magic Initiate',
        type: 'feat',
        uuid: 'Compendium.dnd5e.feats.magic-initiate',
        system: {
          advancement: [
            {
              id: 'advancement-1',
              type: 'ItemChoice',
              level: 1,
              configuration: {
                choices: [{ count: 2 }],
                type: 'spell',
                restriction: {
                  type: 'spell',
                  level: { max: 0, min: 0 },
                  spellList: 'wizard'
                }
              }
            },
            {
              id: 'advancement-2',
              type: 'ItemChoice',
              level: 1,
              configuration: {
                choices: [{ count: 1 }],
                type: 'spell',
                restriction: {
                  type: 'spell',
                  level: { max: 1, min: 1 },
                  spellList: 'wizard'
                }
              }
            }
          ]
        }
      };

      const result = SpellGrantDetection.detectSpellGrant(magicInitiateFeat);
      
      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        itemId: 'magic-initiate-id',
        itemName: 'Magic Initiate',
        itemType: 'feat',
        advancementId: 'advancement-1'
      });
      expect(result[0].description).toContain('cantrip');
      expect(result[0].description).toContain('Wizard spell list');
      
      expect(result[1]).toMatchObject({
        itemId: 'magic-initiate-id',
        itemName: 'Magic Initiate',
        itemType: 'feat',
        advancementId: 'advancement-2'
      });
      expect(result[1].description).toContain('1st level');
    });

    it('should detect Druidic Warrior fighting style spell grants', () => {
      const druidicWarrior = {
        id: 'druidic-warrior-id',
        name: 'Druidic Warrior',
        type: 'class',
        uuid: 'Compendium.dnd5e.classfeatures.druidic-warrior',
        system: {
          advancement: [
            {
              id: 'advancement-1',
              type: 'ItemChoice',
              level: 2,
              configuration: {
                choices: [{ count: 2 }],
                type: 'spell',
                restriction: {
                  type: 'spell',
                  level: { max: 0, min: 0 },
                  spellList: 'druid'
                }
              }
            }
          ]
        }
      };

      const result = SpellGrantDetection.detectSpellGrant(druidicWarrior);
      
      expect(result).toHaveLength(1);
      expect(result[0].description).toContain('2 spells');
      expect(result[0].description).toContain('cantrip');
      expect(result[0].description).toContain('Druid spell list');
    });

    it('should handle advancement as object (v4 format)', () => {
      const item = {
        id: 'test-id',
        name: 'Test Feat',
        type: 'feat',
        uuid: 'test.uuid',
        system: {
          advancement: {
            'adv1': {
              _id: 'adv1',
              type: 'ItemChoice',
              level: 1,
              configuration: {
                choices: [{ count: 1 }],
                type: 'spell',
                restriction: {
                  type: 'spell',
                  level: { max: 0 },
                  spellList: 'cleric'
                }
              }
            }
          }
        }
      };

      const result = SpellGrantDetection.detectSpellGrant(item);
      
      expect(result).toHaveLength(1);
      expect(result).toBeTruthy();
      expect(result[0].advancementId).toBe('adv1');
    });
    
    it('should detect hardcoded Druidic Warrior by identifier', () => {
      const druidicWarrior = {
        id: 'test-id',
        name: 'Fighting Style',
        type: 'feat',
        uuid: 'test.uuid',
        system: {
          identifier: 'druidic-warrior',
          advancement: [] // No advancement data
        }
      };
      
      const result = SpellGrantDetection.detectSpellGrant(druidicWarrior);
      
      expect(result).toHaveLength(1);
      expect(result[0].advancementId).toBe('hardcoded-druidic-warrior');
      expect(result[0].sourceType).toBe('fightingStyle');
      expect(result[0].configuration.choices[0].count).toBe(2);
      expect(result[0].configuration.restriction.spellList).toBe('druid');
      expect(result[0].configuration.restriction.level.max).toBe(0);
      expect(result[0].description).toContain('Druid cantrip');
    });
    
    it('should detect hardcoded Blessed Warrior by identifier', () => {
      const blessedWarrior = {
        id: 'test-id',
        name: 'Fighting Style',
        type: 'feat',
        uuid: 'test.uuid',
        system: {
          identifier: 'blessed-warrior',
          advancement: []
        }
      };
      
      const result = SpellGrantDetection.detectSpellGrant(blessedWarrior);
      
      expect(result).toHaveLength(1);
      expect(result[0].advancementId).toBe('hardcoded-blessed-warrior');
      expect(result[0].configuration.restriction.spellList).toBe('cleric');
      expect(result[0].configuration.restriction.level.max).toBe(0);
    });
    

  });
  
  describe('detectSpellGrant - description parsing', () => {
    it('should parse Magic Initiate feat', () => {
      const magicInitiate = {
        id: 'test-id',
        name: 'Magic Initiate',
        type: 'feat',
        uuid: 'test.uuid',
        system: {
          identifier: 'magic-initiate',
          advancement: [],
          description: {
            value: '<p>You learn two cantrips of your choice from the @UUID[Compendium.dnd-players-handbook.content.JournalEntry.phbSpells0000000.JournalEntryPage.SkHptN2PTzFGDaEj]{Cleric}, @UUID[Compendium.dnd-players-handbook.content.JournalEntry.phbSpells0000000.JournalEntryPage.LhvuDQEyrCdg5EfU]{Druid}, or @UUID[Compendium.dnd-players-handbook.content.JournalEntry.phbSpells0000000.JournalEntryPage.6AnqLUowgdsqMFvz]{Wizard} spell list.</p>'
          }
        }
      };
      
      const result = SpellGrantDetection.detectSpellGrant(magicInitiate);
      
      expect(result).toHaveLength(1);
      expect(result[0].advancementId).toBe('parsed-magic-initiate-test-id');
      expect(result[0].configuration.choices[0].count).toBe(3); // 2 cantrips + 1 spell
      expect(result[0].configuration.restriction.spellList).toEqual(['cleric', 'druid', 'wizard']);
      expect(result[0].configuration.restriction.level.max).toBe(1);
      expect(result[0].configuration.breakdown).toHaveLength(2);
      expect(result[0].configuration.breakdown[0].count).toBe(2); // cantrips
      expect(result[0].configuration.breakdown[1].count).toBe(1); // level 1 spell
      expect(result[0].description).toContain('2 cantrips and 1 level 1 spell');
    });
    
    it('should parse "learn X [Class] cantrips" pattern', () => {
      const customFeat = {
        id: 'test-id',
        name: 'Custom Feat',
        type: 'feat',
        uuid: 'test.uuid',
        system: {
          advancement: [],
          description: {
            value: '<p>You learn two Druid cantrips of your choice.</p>'
          }
        }
      };
      
      const result = SpellGrantDetection.detectSpellGrant(customFeat);
      
      expect(result).toHaveLength(1);
      expect(result[0].advancementId).toBe('parsed-cantrip-test-id');
      expect(result[0].configuration.choices[0].count).toBe(2);
      expect(result[0].configuration.restriction.spellList).toBe('druid');
      expect(result[0].configuration.restriction.level.max).toBe(0);
      expect(result[0].description).toContain('2 Druid cantrips');
    });
    
    it('should parse "learn X [Class] spell of Xth level" pattern', () => {
      const customFeat = {
        id: 'test-id',
        name: 'Custom Feat',
        type: 'feat',
        uuid: 'test.uuid',
        system: {
          advancement: [],
          description: {
            value: '<p>You learn one Wizard spell of 1st level or lower.</p>'
          }
        }
      };
      
      const result = SpellGrantDetection.detectSpellGrant(customFeat);
      
      expect(result).toHaveLength(1);
      expect(result[0].advancementId).toBe('parsed-spell-test-id');
      expect(result[0].configuration.choices[0].count).toBe(1);
      expect(result[0].configuration.restriction.spellList).toBe('wizard');
      expect(result[0].configuration.restriction.level.max).toBe(1);
    });
  });

  describe('validateSpellSelection', () => {
    const grantInfo = {
      configuration: {
        choices: [{ count: 2 }],
        restriction: {
          type: 'spell',
          level: { max: 0, min: 0 },
          spellList: 'wizard'
        }
      }
    };

    it('should validate correct spell count', () => {
      const spells = [
        { name: 'Fire Bolt', system: { level: 0, sourceClass: ['wizard'] } },
        { name: 'Mage Hand', system: { level: 0, sourceClass: ['wizard'] } }
      ];

      const result = SpellGrantDetection.validateSpellSelection(grantInfo, spells);
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject incorrect spell count', () => {
      const spells = [
        { name: 'Fire Bolt', system: { level: 0, sourceClass: ['wizard'] } }
      ];

      const result = SpellGrantDetection.validateSpellSelection(grantInfo, spells);
      
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Expected 2'))).toBe(true);
    });

    it('should reject spells of wrong level', () => {
      const spells = [
        { name: 'Fire Bolt', system: { level: 0, sourceClass: ['wizard'] } },
        { name: 'Magic Missile', system: { level: 1, sourceClass: ['wizard'] } }
      ];

      const result = SpellGrantDetection.validateSpellSelection(grantInfo, spells);
      
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Magic Missile'))).toBe(true);
    });

    it('should reject spells from wrong list', () => {
      const spells = [
        { name: 'Fire Bolt', system: { level: 0, sourceClass: ['wizard'] } },
        { name: 'Guidance', system: { level: 0, sourceClass: ['cleric', 'druid'] } }
      ];

      const result = SpellGrantDetection.validateSpellSelection(grantInfo, spells);
      
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Guidance') && e.includes('wizard spell list'))).toBe(true);
    });

    it('should handle spell list as string', () => {
      const spells = [
        { name: 'Fire Bolt', system: { level: 0, sourceClass: 'wizard' } },
        { name: 'Mage Hand', system: { level: 0, sourceClass: 'wizard' } }
      ];

      const result = SpellGrantDetection.validateSpellSelection(grantInfo, spells);
      
      expect(result.valid).toBe(true);
    });
  });

  describe('getSpellGrantsFromQueue', () => {
    it('should extract spell grants from drop item registry', () => {
      const queueArray = [
        {
          item: {
            id: 'feat-1',
            name: 'Magic Initiate',
            type: 'feat',
            uuid: 'test.uuid',
            system: {
              advancement: [{
                id: 'adv-1',
                type: 'ItemChoice',
                level: 1,
                configuration: {
                  choices: [{ count: 2 }],
                  restriction: { type: 'spell', level: { max: 0 } }
                }
              }]
            }
          },
          timestamp: 1234567890
        }
      ];

      const result = SpellGrantDetection.getSpellGrantsFromQueue(queueArray);
      
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        itemId: 'feat-1',
        queuedAt: 1234567890
      });
    });

    it('should return empty array for registry without spell grants', () => {
      const queueArray = [
        {
          item: {
            id: 'feat-1',
            name: 'Alert',
            type: 'feat',
            uuid: 'test.uuid',
            system: { advancement: [] }
          },
          timestamp: 1234567890
        }
      ];

      const result = SpellGrantDetection.getSpellGrantsFromQueue(queueArray);
      
      expect(result).toHaveLength(0);
    });

    it('should handle null or undefined queue', () => {
      expect(SpellGrantDetection.getSpellGrantsFromQueue(null)).toEqual([]);
      expect(SpellGrantDetection.getSpellGrantsFromQueue(undefined)).toEqual([]);
    });

    it('should handle non-array queue', () => {
      expect(SpellGrantDetection.getSpellGrantsFromQueue('not an array')).toEqual([]);
      expect(SpellGrantDetection.getSpellGrantsFromQueue({})).toEqual([]);
    });
  });

  describe('_buildDescriptionFromAdvancement', () => {
    it('should handle multiple choices in array', () => {
      const item = { name: 'Test' };
      const advancement = {
        configuration: {
          choices: [{ count: 2 }, { count: 1 }],
          restriction: { type: 'spell', spellList: 'wizard' }
        }
      };

      const description = SpellGrantDetection._buildDescriptionFromAdvancement(item, advancement);
      
      expect(description).toContain('3 spells');
    });

    it('should handle level range restrictions', () => {
      const item = { name: 'Test' };
      const advancement = {
        configuration: {
          choices: [{ count: 1 }],
          restriction: { 
            type: 'spell', 
            level: { min: 1, max: 3 }
          }
        }
      };

      const description = SpellGrantDetection._buildDescriptionFromAdvancement(item, advancement);
      
      expect(description).toContain('1st to 3rd level');
    });

    it('should handle up to level restrictions', () => {
      const item = { name: 'Test' };
      const advancement = {
        configuration: {
          choices: [{ count: 2 }],
          restriction: { 
            type: 'spell', 
            level: { min: 0, max: 1 }
          }
        }
      };

      const description = SpellGrantDetection._buildDescriptionFromAdvancement(item, advancement);
      
      expect(description).toContain('up to 1st level');
    });
  });

  describe('getSpellGrantsForLevel', () => {
    it('should return grants for specific level', () => {
      const mockActor = {
        items: {
          get: (id) => ({
            id: 'class-1',
            name: 'Fighter',
            type: 'class',
            uuid: 'test.uuid',
            system: {
              advancement: [
                {
                  id: 'adv-1',
                  type: 'ItemChoice',
                  level: 3,
                  configuration: {
                    choices: [{ count: 2 }],
                    restriction: { type: 'spell' }
                  }
                }
              ]
            }
          })
        }
      };

      const result = SpellGrantDetection.getSpellGrantsForLevel(mockActor, 3, 'class-1');
      
      expect(result).toHaveLength(1);
      expect(result[0].level).toBe(3);
    });

    it('should return empty array if class not found', () => {
      const mockActor = {
        items: {
          get: () => null
        }
      };

      const result = SpellGrantDetection.getSpellGrantsForLevel(mockActor, 3, 'not-found');
      
      expect(result).toEqual([]);
    });

    it('should return empty array if actor has no items', () => {
      const mockActor = {};

      const result = SpellGrantDetection.getSpellGrantsForLevel(mockActor, 3, 'class-1');
      
      expect(result).toEqual([]);
    });
  });
});
