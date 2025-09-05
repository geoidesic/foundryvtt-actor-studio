import { TreasureRoller } from './TreasureRoller.js';
import { MagicItemGenerator } from './MagicItemGenerator.js';
import { MODULE_ID } from './constants.ts';
import { getPacksFromSettings } from './Utility.js';

/**
 * Processes module flags on an actor before token creation
 * @param {Object} actor - The actor document
 * @returns {Promise<Object>} - The processed actor data
 */
export async function processTokenFlags(actor) {
  console.log(`[${MODULE_ID}] ====== processTokenFlags called ======`);
  console.log(`[${MODULE_ID}] Actor:`, actor.name);
  console.log(`[${MODULE_ID}] Actor flags:`, actor.flags);
  
  if (!actor || !actor.flags || !actor.flags[MODULE_ID]) {
    console.log(`[${MODULE_ID}] No module flags found, returning early`);
    return actor;
  }

  const flags = actor.flags[MODULE_ID];
  console.log(`[${MODULE_ID}] Module flags to process:`, flags);
  
  const updates = {};

  // Process random gold if enabled
  if (flags.enableRandomGold) {
    console.log(`[${MODULE_ID}] Processing random gold...`);
    const goldResult = await processRandomGold(actor);
    if (goldResult) {
      updates['system.currency'] = goldResult;
    }
  }

  // Process magic item roll if enabled
  if (flags.enableMagicItemRoll) {
    console.log(`[${MODULE_ID}] Processing magic item roll...`);
    const magicItemsResult = await processMagicItemRoll(actor);
    if (magicItemsResult && magicItemsResult.length > 0) {
      // Only add new magic items, don't modify existing items
      updates['items'] = magicItemsResult;
    }
  }

  // Process HP roll if enabled
  if (flags.rollHP) {
    console.log(`[${MODULE_ID}] Processing HP roll...`);
    const hpResult = await processHPRoll(actor);
    if (hpResult) {
      updates['system.attributes.hp.max'] = hpResult;
      updates['system.attributes.hp.value'] = hpResult;
    }
  }

  // Log the final updates
  console.log(`[${MODULE_ID}] Final updates object:`, updates);
  
  // Apply the updates if there are any
  if (Object.keys(updates).length > 0) {
    try {
      console.log(`[${MODULE_ID}] Applying updates to actor...`);
      
      // For items, we need to use a different approach to avoid validation errors
      if (updates.items) {
        // Add new items one by one to avoid conflicts
        for (const item of updates.items) {
          try {
            await actor.createEmbeddedDocuments('Item', [item]);
            console.log(`[${MODULE_ID}] Added item: ${item.name}`);
          } catch (itemError) {
            console.error(`[${MODULE_ID}] Error adding item ${item.name}:`, itemError);
          }
        }
        // Remove items from updates since we handled them separately
        delete updates.items;
      }
      
      // Apply remaining updates
      if (Object.keys(updates).length > 0) {
        await actor.updateSource(updates);
        console.log(`[${MODULE_ID}] Applied remaining updates:`, updates);
      }
      
    } catch (error) {
      console.error(`[${MODULE_ID}] Error applying updates:`, error);
    }
  }

  console.log(`[${MODULE_ID}] ====== processTokenFlags completed ======`);
  return actor;
}

/**
 * Manual test function to test flag processing on an actor
 * This can be called from the console for testing purposes
 * @param {string} actorId - The ID of the actor to test
 */
export async function testTokenFlagProcessing(actorId) {
  try {
    console.log(`[${MODULE_ID}] ====== Testing token flag processing ======`);
    
    // Get the actor by ID
    const actor = game.actors.get(actorId);
    if (!actor) {
      console.error(`[${MODULE_ID}] Actor not found with ID:`, actorId);
      return;
    }
    
    console.log(`[${MODULE_ID}] Testing on actor:`, actor.name);
    console.log(`[${MODULE_ID}] Actor flags:`, actor.flags);
    console.log(`[${MODULE_ID}] Module flags:`, actor.flags?.[MODULE_ID]);
    
    // Process the flags
    await processTokenFlags(actor);
    
    console.log(`[${MODULE_ID}] ====== Test completed ======`);
  } catch (error) {
    console.error(`[${MODULE_ID}] Error in test:`, error);
  }
}

// Make the test function available globally for console testing
if (typeof window !== 'undefined') {
  window.testTokenFlagProcessing = testTokenFlagProcessing;
}

/**
 * Processes random gold generation for an NPC
 * @param {Object} actor - The actor document
 * @returns {Promise<Object>} - The currency object with rolled values
 */
async function processRandomGold(actor) {
  try {
    const currency = TreasureRoller.rollIndividualTreasure(actor);
    
    // Log the gold roll
    const rollMessage = `Rolling random gold for ${actor.name}: ${currency.gp} GP, ${currency.sp} SP, ${currency.cp} CP`;
    console.log(`[${MODULE_ID}] ${rollMessage}`);
    
    return currency;
  } catch (error) {
    console.error(`[${MODULE_ID}] Error processing random gold:`, error);
    return null;
  }
}

/**
 * Processes magic item generation for an NPC
 * @param {Object} actor - The actor document
 * @returns {Promise<Array>} - Array of magic item data
 */
async function processMagicItemRoll(actor) {
  try {
    // Get equipment packs from settings for magic item generation
    const equipmentPacks = getPacksFromSettings("equipment");
    console.log(`[${MODULE_ID}] Equipment packs for magic item generation:`, equipmentPacks);
    
    const magicItems = await MagicItemGenerator.generateIndividualMagicItemObjects(actor, equipmentPacks);
    
    if (magicItems && magicItems.length > 0) {
      // Fix the item structure to match what Foundry expects
      const fixedMagicItems = magicItems.map(item => {
        // The extractItemsFromPacksAsync returns items with name->label mapping
        const fixedItem = {
          name: item.name || item.label || 'Unknown Magic Item',
          type: item.type || 'equipment',
          img: item.img || 'icons/svg/mystery-man.svg',
          system: item.system || {},
          flags: item.flags || {}
        };
        
        // Copy any other properties that might be needed
        if (item._id) fixedItem._id = item._id;
        if (item.uuid) fixedItem.uuid = item.uuid;
        
        return fixedItem;
      });
      
      // Log the magic item roll
      const itemNames = fixedMagicItems.map(item => item.name).join(', ');
      console.log(`[${MODULE_ID}] Rolling magic items for ${actor.name}: ${itemNames}`);
      
      return fixedMagicItems;
    }
    
    return null;
  } catch (error) {
    console.error(`[${MODULE_ID}] Error processing magic item roll:`, error);
    return null;
  }
}

/**
 * Processes HP roll for an NPC
 * @param {Object} actor - The actor document
 * @returns {Promise<number>} - The rolled HP value
 */
async function processHPRoll(actor) {
  try {
    // Get the HP formula from the actor
    const hpFormula = actor.system?.attributes?.hp?.formula;
    if (!hpFormula) {
      console.log(`[${MODULE_ID}] No HP formula found for ${actor.name}`);
      return null;
    }

    console.log(`[${MODULE_ID}] Rolling HP for ${actor.name}: ${hpFormula}`);
    
    // Try synchronous evaluation first
    try {
      const syncRoll = new Roll(hpFormula);
      const result = syncRoll.evaluateSync();
      const hpValue = result.total;
      console.log(`[${MODULE_ID}] Rolling HP for ${actor.name}: ${hpFormula} = ${hpValue} (sync)`);
      return hpValue;
    } catch (syncError) {
      console.log(`[${MODULE_ID}] Sync evaluation failed, trying async:`, syncError.message);
      
      // Create a fresh Roll object for async evaluation
      const asyncRoll = new Roll(hpFormula);
      await asyncRoll.evaluate();
      const hpValue = asyncRoll.total;
      console.log(`[${MODULE_ID}] Rolling HP for ${actor.name}: ${hpFormula} = ${hpValue} (async)`);
      return hpValue;
    }
  } catch (error) {
    console.error(`[${MODULE_ID}] Error processing HP roll:`, error);
    return null;
  }
}
