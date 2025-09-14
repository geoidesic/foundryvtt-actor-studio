// Treasure tables for individual treasure by CR
import { parseCR, ensureNumberCR } from '~/src/lib/cr.js';

export class TreasureRoller {
  
  // Individual Treasure by CR
  static TREASURE_BY_CR = {
    // CR 0-4
    0: { cp: [5, 6], sp: [1, 4], ep: [0, 0], gp: [0, 0], pp: [0, 0] },
    1: { cp: [5, 6], sp: [1, 4], ep: [0, 0], gp: [0, 0], pp: [0, 0] },
    2: { cp: [5, 6], sp: [1, 4], ep: [0, 0], gp: [0, 0], pp: [0, 0] },
    3: { cp: [5, 6], sp: [1, 4], ep: [0, 0], gp: [0, 0], pp: [0, 0] },
    4: { cp: [5, 6], sp: [1, 4], ep: [0, 0], gp: [0, 0], pp: [0, 0] },
    
    // CR 5-10
    5: { cp: [2, 12, 10], sp: [2, 4, 10], ep: [0, 0], gp: [3, 6], pp: [0, 0] },
    6: { cp: [2, 12, 10], sp: [2, 4, 10], ep: [0, 0], gp: [3, 6], pp: [0, 0] },
    7: { cp: [2, 12, 10], sp: [2, 4, 10], ep: [0, 0], gp: [3, 6], pp: [0, 0] },
    8: { cp: [2, 12, 10], sp: [2, 4, 10], ep: [0, 0], gp: [3, 6], pp: [0, 0] },
    9: { cp: [2, 12, 10], sp: [2, 4, 10], ep: [0, 0], gp: [3, 6], pp: [0, 0] },
    10: { cp: [2, 12, 10], sp: [2, 4, 10], ep: [0, 0], gp: [3, 6], pp: [0, 0] },
    
    // CR 11-16
    11: { cp: [4, 6, 100], sp: [1, 6, 10], ep: [0, 0], gp: [2, 4, 10], pp: [3, 6] },
    12: { cp: [4, 6, 100], sp: [1, 6, 10], ep: [0, 0], gp: [2, 4, 10], pp: [3, 6] },
    13: { cp: [4, 6, 100], sp: [1, 6, 10], ep: [0, 0], gp: [2, 4, 10], pp: [3, 6] },
    14: { cp: [4, 6, 100], sp: [1, 6, 10], ep: [0, 0], gp: [2, 4, 10], pp: [3, 6] },
    15: { cp: [4, 6, 100], sp: [1, 6, 10], ep: [0, 0], gp: [2, 4, 10], pp: [3, 6] },
    16: { cp: [4, 6, 100], sp: [1, 6, 10], ep: [0, 0], gp: [2, 4, 10], pp: [3, 6] },
    
    // CR 17+
    17: { cp: [2, 4, 1000], sp: [2, 4, 100], ep: [0, 0], gp: [2, 4, 100], pp: [2, 4, 10] },
    18: { cp: [2, 4, 1000], sp: [2, 4, 100], ep: [0, 0], gp: [2, 4, 100], pp: [2, 4, 10] },
    19: { cp: [2, 4, 1000], sp: [2, 4, 100], ep: [0, 0], gp: [2, 4, 100], pp: [2, 4, 10] },
    20: { cp: [2, 4, 1000], sp: [2, 4, 100], ep: [0, 0], gp: [2, 4, 100], pp: [2, 4, 10] },
    21: { cp: [2, 4, 1000], sp: [2, 4, 100], ep: [0, 0], gp: [2, 4, 100], pp: [2, 4, 10] },
    22: { cp: [2, 4, 1000], sp: [2, 4, 100], ep: [0, 0], gp: [2, 4, 100], pp: [2, 4, 10] },
    23: { cp: [2, 4, 1000], sp: [2, 4, 100], ep: [0, 0], gp: [2, 4, 100], pp: [2, 4, 10] },
    24: { cp: [2, 4, 1000], sp: [2, 4, 100], ep: [0, 0], gp: [2, 4, 100], pp: [2, 4, 10] },
    25: { cp: [2, 4, 1000], sp: [2, 4, 100], ep: [0, 0], gp: [2, 4, 100], pp: [2, 4, 10] },
    26: { cp: [2, 4, 1000], sp: [2, 4, 100], ep: [0, 0], gp: [2, 4, 100], pp: [2, 4, 10] },
    27: { cp: [2, 4, 1000], sp: [2, 4, 100], ep: [0, 0], gp: [2, 4, 100], pp: [2, 4, 10] },
    28: { cp: [2, 4, 1000], sp: [2, 4, 100], ep: [0, 0], gp: [2, 4, 100], pp: [2, 4, 10] },
    29: { cp: [2, 4, 1000], sp: [2, 4, 100], ep: [0, 0], gp: [2, 4, 100], pp: [2, 4, 10] },
    30: { cp: [2, 4, 1000], sp: [2, 4, 100], ep: [0, 0], gp: [2, 4, 100], pp: [2, 4, 10] }
  };

  /**
   * Roll dice using Foundry's dice system
   * @param {number} numDice - Number of dice to roll
   * @param {number} diceSize - Size of dice (e.g., 4, 6, 8, 10, 12, 20)
   * @param {number} multiplier - Multiplier for the result (default 1)
   * @returns {number} - The rolled result
   */
  static rollDice(numDice, diceSize, multiplier = 1) {
    if (typeof game !== 'undefined' && game.dice) {
      // Use Foundry's dice system if available
      const roll = new Roll(`${numDice}d${diceSize}`);
      roll.evaluate({ async: false });
      return roll.total * multiplier;
    } else {
      // Fallback for testing or non-Foundry environments
      let total = 0;
      for (let i = 0; i < numDice; i++) {
        total += Math.floor(Math.random() * diceSize) + 1;
      }
      return total * multiplier;
    }
  }

  /**
   * Roll coins for a given denomination based on the formula
   * @param {Array} formula - [numDice, diceSize, multiplier] or [numDice, diceSize] or [0, 0] for none
   * @returns {number} - The amount of coins rolled
   */
  static rollCoins(formula) {
    if (!formula || formula.length < 2 || (formula[0] === 0 && formula[1] === 0)) {
      return 0;
    }
    
    const [numDice, diceSize, multiplier = 1] = formula;
    return this.rollDice(numDice, diceSize, multiplier);
  }

  /**
   * Get the CR value from an NPC
   * @param {Object} npc - The NPC document
   * @returns {number} - The challenge rating as a number
   */
  static getCRFromNPC(npc) {
  if (!npc || !npc.system) return 0;
  const raw = npc.system.details?.cr;
  // parseCR returns NaN for unparseable values; ensureNumberCR falls back to 0
  return ensureNumberCR(raw, 0);
  }

  /**
   * Roll treasure for an individual NPC based on their CR
   * @param {Object} npc - The NPC document
   * @returns {Object} - Object with pp, gp, ep, sp, cp properties
   */
  static rollIndividualTreasure(npc) {
    const cr = this.getCRFromNPC(npc);
    
    // Find the appropriate treasure table entry
    const crKey = this.findTreasureTableCR(cr);
    const treasureTable = this.TREASURE_BY_CR[crKey];
    
    if (!treasureTable) {
      console.warn(`No treasure table found for CR ${cr}`);
      return { pp: 0, gp: 0, ep: 0, sp: 0, cp: 0 };
    }
    
    // Roll for each coin type
    const result = {
      pp: this.rollCoins(treasureTable.pp),
      gp: this.rollCoins(treasureTable.gp),
      ep: this.rollCoins(treasureTable.ep),
      sp: this.rollCoins(treasureTable.sp),
      cp: this.rollCoins(treasureTable.cp)
    };
    
    return result;
  }

  /**
   * Find the appropriate CR key for the treasure table
   * @param {number} cr - The challenge rating
   * @returns {number} - The CR key to use for the treasure table
   */
  static findTreasureTableCR(cr) {
    if (cr <= 4) return Math.floor(cr);
    if (cr <= 10) return Math.min(10, Math.max(5, Math.floor(cr)));
    if (cr <= 16) return Math.min(16, Math.max(11, Math.floor(cr)));
    return Math.min(30, Math.max(17, Math.floor(cr)));
  }

  /**
   * Get a description of what will be rolled for the given NPC
   * @param {Object} npc - The NPC document
   * @returns {string} - Description of the treasure roll
   */
  static getTreasureRollDescription(npc) {
    const cr = this.getCRFromNPC(npc);
    const crKey = this.findTreasureTableCR(cr);
    const treasureTable = this.TREASURE_BY_CR[crKey];
    
    if (!treasureTable) {
      return `No treasure table for CR ${cr}`;
    }
    
    const parts = [];
    
    if (treasureTable.pp[0] > 0) {
      const [num, die, mult = 1] = treasureTable.pp;
      parts.push(`${num}d${die}${mult > 1 ? ` × ${mult}` : ''} PP`);
    }
    
    if (treasureTable.gp[0] > 0) {
      const [num, die, mult = 1] = treasureTable.gp;
      parts.push(`${num}d${die}${mult > 1 ? ` × ${mult}` : ''} GP`);
    }
    
    if (treasureTable.ep[0] > 0) {
      const [num, die, mult = 1] = treasureTable.ep;
      parts.push(`${num}d${die}${mult > 1 ? ` × ${mult}` : ''} EP`);
    }
    
    if (treasureTable.sp[0] > 0) {
      const [num, die, mult = 1] = treasureTable.sp;
      parts.push(`${num}d${die}${mult > 1 ? ` × ${mult}` : ''} SP`);
    }
    
    if (treasureTable.cp[0] > 0) {
      const [num, die, mult = 1] = treasureTable.cp;
      parts.push(`${num}d${die}${mult > 1 ? ` × ${mult}` : ''} CP`);
    }
    
    return parts.length > 0 ? `CR ${cr}: ${parts.join(', ')}` : `CR ${cr}: No coins`;
  }
}
