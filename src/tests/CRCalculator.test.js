// Test file for CRCalculator
// Run with: bun src/tests/CRCalculator.test.js

import { describe, it, expect } from 'vitest';
import { CRCalculator } from '../helpers/CRCalculator.js';

describe('CRCalculator', () => {
  describe('calculateCurrentCR', () => {
    it('should calculate CR 5 for a Cambion-like creature', async () => {
      // Mock Cambion data based on Monster Manual
      const cambion = {
        system: {
          attributes: {
            hp: { max: 138, value: 138 }, // Cambion has 138 HP
            ac: { value: 17 } // Cambion has AC 17
          },
          abilities: {
            str: { value: 18 }, // +4 modifier
            dex: { value: 16 }, // +3 modifier  
            con: { value: 16 }, // +3 modifier
            int: { value: 14 }, // +2 modifier
            wis: { value: 12 }, // +1 modifier
            cha: { value: 16 }  // +3 modifier
          },
          details: {
            cr: 5
          },
          items: [
            {
              name: 'Multiattack',
              type: 'feat',
              system: {
                description: { value: 'The cambion makes two melee attacks.' }
              }
            },
            {
              name: 'Claw',
              type: 'weapon',
              system: {
                damage: { parts: [['1d6+4', 'slashing']] },
                attack: { bonus: 7 }
              }
            },
            {
              name: 'Fire Ray',
              type: 'feat',
              system: {
                description: { value: 'Ranged Spell Attack: +7 to hit, range 60 ft., one target. Hit: 17 (5d6) fire damage.' }
              }
            },
            {
              name: 'Spellcasting',
              type: 'feat',
              system: {
                description: { value: 'The cambion is a 5th-level spellcaster.' }
              }
            }
          ]
        }
      };

  const result = await CRCalculator.calculateCurrentCR(cambion);
      
      console.log('Cambion CR calculation result:', result);
      
      // The Cambion should calculate to around CR 5
      // Defensive CR: HP 138 falls in CR 5 range (131-145), AC 17 is +2 above expected 15
      // Offensive CR: Multiple attacks + spellcasting should be around CR 5
      expect(result.defensiveCR).toBeGreaterThanOrEqual(4);
      expect(result.offensiveCR).toBeGreaterThanOrEqual(4);
      expect(result.calculatedCR).toBeGreaterThanOrEqual(4);
      expect(result.calculatedCR).toBeLessThanOrEqual(6);
    });

  it('should handle multi-attack correctly', async () => {
      const multiAttackCreature = {
        system: {
          attributes: {
            hp: { max: 100, value: 100 },
            ac: { value: 13 }
          },
          abilities: {
            str: { value: 16 }, // +3 modifier
            dex: { value: 14 }, // +2 modifier
            con: { value: 14 }, // +2 modifier
            int: { value: 10 }, // +0 modifier
            wis: { value: 10 }, // +0 modifier
            cha: { value: 10 }  // +0 modifier
          },
          details: { cr: 3 },
          items: [
            {
              name: 'Multiattack',
              type: 'feat',
              system: {
                description: { value: 'The creature makes three attacks.' }
              }
            },
            {
              name: 'Sword',
              type: 'weapon',
              system: {
                damage: { parts: [['1d8+3', 'slashing']] },
                attack: { bonus: 5 }
              }
            }
          ]
        }
      };

  const result = await CRCalculator.calculateCurrentCR(multiAttackCreature);
      
      // Multi-attack should significantly increase offensive CR
      expect(result.offensiveCR).toBeGreaterThan(1);
    });

  it('should calculate attack bonuses from ability scores when not explicitly provided', async () => {
      const creature = {
        system: {
          attributes: {
            hp: { max: 50, value: 50 },
            ac: { value: 13 }
          },
          abilities: {
            str: { value: 18 }, // +4 modifier
            dex: { value: 14 }, // +2 modifier
            con: { value: 14 }, // +2 modifier
            int: { value: 10 }, // +0 modifier
            wis: { value: 10 }, // +0 modifier
            cha: { value: 10 }  // +0 modifier
          },
          details: { cr: 2 },
          items: [
            {
              name: 'Sword',
              type: 'weapon',
              system: {
                damage: { parts: [['1d8+4', 'slashing']] }
                // No explicit attack bonus
              }
            }
          ]
        }
      };

  const result = await CRCalculator.calculateCurrentCR(creature);
      
      // Should calculate attack bonus from STR (+4) + proficiency (+2) = +6
      expect(result.offensiveCR).toBeGreaterThan(0);
    });
  });

  describe('CR Tables', () => {
    it('should have complete offensive CR table', () => {
      // Check that all CR levels have offensive data
      const crs = Object.keys(CRCalculator.CR_TABLES.offensive);
      expect(crs).toContain('0');
      expect(crs).toContain('0.125');
      expect(crs).toContain('0.25');
      expect(crs).toContain('0.5');
      expect(crs).toContain('1');
      expect(crs).toContain('5');
      expect(crs).toContain('10');
      expect(crs).toContain('20');
      expect(crs).toContain('30');
    });

    it('should have correct DPR ranges for CR 5', () => {
      const cr5Data = CRCalculator.CR_TABLES.offensive[5];
      expect(cr5Data).toBeDefined();
      expect(cr5Data.dpr).toEqual([33, 38]);
      expect(cr5Data.attack).toBe(6);
      expect(cr5Data.save).toBe(14);
    });
  });
});
