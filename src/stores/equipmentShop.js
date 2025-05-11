import { writable, derived, get } from 'svelte/store';
import { MODULE_ID } from '~/src/helpers/constants';
// Import extractItemsFromPacksAsync instead of Sync
import { getPacksFromSettings, extractItemsFromPacksAsync } from '~/src/helpers/Utility'; 
import { goldRoll } from '~/src/stores/storeDefinitions';
import { totalGoldFromChoices } from '~/src/stores/goldChoices';
import { readOnlyTabs } from '~/src/stores/index';

// Store for managing the state of the equipment shop

// List of items available in the shop, fetched from selected compendiums
export const shopItems = writable([]);

// Items currently selected/added to the virtual cart (Map<itemId, { quantity, itemData }>)
export const shopCart = writable(new Map());

// Character's available gold (in copper)
export const availableGold = writable(0);

// Total cost of items in the cart (in copper)
export const cartTotalCost = writable(0);

// Remaining gold after purchase (in copper)
export const remainingGold = derived(
  [availableGold, cartTotalCost],
  ([$availableGold, $cartTotalCost]) => {
    return $availableGold - $cartTotalCost;
  }
);

// Initialize gold amount based on character's gold choices or roll
export function initializeGold() {
  try {
    // Use the appropriate gold source based on DnD5e version
    let goldValue = 0;
    
    if (window.GAS.dnd5eVersion === 4) {
      // For 5e v4, get gold from gold choices
      goldValue = get(totalGoldFromChoices);
      window.GAS.log.d('[SHOP] Using totalGoldFromChoices for v4:', goldValue);
    } else {
      // For 5e v3, use goldRoll
      goldValue = get(goldRoll);
      window.GAS.log.d('[SHOP] Using goldRoll for v3:', goldValue);
    }
    
    // Convert gold to copper (1 gp = 100 cp)
    const goldValueInCopper = goldValue * 100;
    window.GAS.log.d('[SHOP] Setting available gold:', goldValueInCopper);
    
    // Update the store
    availableGold.set(goldValueInCopper);
    
    return goldValueInCopper;
  } catch (error) {
    console.error('[SHOP] Error initializing gold:', error);
    return 0;
  }
}

// Make the store globally available for other components to access
if (window.GAS) {
  window.GAS.availableGold = availableGold;
  window.GAS.shopItems = shopItems;
  window.GAS.shopCart = shopCart;
  window.GAS.cartTotalCost = cartTotalCost;
  window.GAS.remainingGold = remainingGold;
  window.GAS.initializeShopGold = initializeGold;
}

// Function to fetch items from compendiums
export async function loadShopItems() {
  try {
    // Get equipment compendium sources from settings
    const packs = getPacksFromSettings("equipment");
    
    if (!packs || packs.length === 0) {
      shopItems.set([]);
      console.warn("No equipment compendiums configured");
      return;
    }

    // Define the basic keys available in the default index
    const indexKeys = [
      "_id",
      "name",
      "img",
      "type",
      "uuid" // Keep uuid to fetch full item later
    ];
    
    // Define keys that are likely NOT in the index and need async loading
    const nonIndexKeys = [
      "system.price.value",
      "system.price.denomination",
      "system.quantity"
    ];

    // Extract item data using extractItemsFromPacksAsync
    // This will fetch nonIndexKeys if they aren't in the default index
    let lightweightItems = await extractItemsFromPacksAsync(packs, indexKeys, nonIndexKeys);
    
    // Filter for relevant types and items with a price
    lightweightItems = lightweightItems.filter(item => 
      ["weapon", "equipment", "tool", "consumable", "backpack"].includes(item.type) &&
      item.system?.price?.value // Now this data should be available
    );

    // Handle duplicates - keep only the first instance of each item name
    const seenItems = new Map();
    const uniqueLightweightItems = [];
    for (const item of lightweightItems) {
      // Use item name for deduplication to avoid duplicate items in the shop UI
      const uniqueKey = item.name.toLowerCase();
      if (!seenItems.has(uniqueKey)) {
        uniqueLightweightItems.push(item);
        seenItems.set(uniqueKey, true);
      } else {
         window.GAS.log.d(`[SHOP] Skipping duplicate item: ${item.name} (uuid: ${item.uuid})`);
      }
    }

    // Sort items by name
    uniqueLightweightItems.sort((a, b) => a.name.localeCompare(b.name));
    
    // Update the store with lightweight items
    shopItems.set(uniqueLightweightItems);
    window.GAS.log.d('[SHOP] Loaded lightweight items:', uniqueLightweightItems.length);
    
  } catch (error) {
    console.error("Error loading shop items:", error);
    shopItems.set([]);
  }
}

// Calculate the total cost in copper for an item
// This function now expects the full item data, which will be retrieved when adding to cart
function getItemCostInCopper(itemData, quantity) {
  if (!itemData?.system?.price) return 0;
  
  const value = itemData.system.price.value || 0;
  const denomination = itemData.system.price.denomination || 'cp';
  
  // Convert to copper based on denomination
  let multiplier = 1;
  switch (denomination) {
    case 'gp': multiplier = 100; break;
    case 'sp': multiplier = 10; break;
    case 'pp': multiplier = 1000; break;
    case 'ep': multiplier = 50; break;
    default: multiplier = 1; // cp
  }
  
  // Get the base quantity of the item (if it comes in a pack/bundle)
  const baseQuantity = itemData.system.quantity || 1;
  
  // Calculate price per unit: If an item comes in a pack (like 20 arrows),
  // we need to divide the total price by the pack quantity to get price per unit
  const pricePerUnit = (value * multiplier) / baseQuantity;
  
  // Calculate total cost: Price per unit * desired quantity
  return pricePerUnit * quantity;
}

// Function to update cart and totals
// Now accepts fullItemData to store in the cart map
export function updateCart(itemId, quantity, fullItemData) {
  shopCart.update(cart => {
    const newCart = new Map(cart);
    
    if (quantity <= 0) {
      newCart.delete(itemId);
    } else {
      // Store quantity and the full item data
      newCart.set(itemId, { quantity: quantity, itemData: fullItemData }); 
    }
    
    return newCart;
  });
  
  // Recalculate cart total
  updateTotals();
}

// Update cart total and remaining gold
function updateTotals() {
  // Get current values to avoid subscription leaks
  // No longer need shopItems here, get itemData from cart
  const cart = get(shopCart);
  
  let total = 0;
  
  // Calculate cart total using itemData stored in the cart
  cart.forEach(({ quantity, itemData }, itemId) => {
    if (itemData) {
      total += getItemCostInCopper(itemData, quantity);
    }
  });
  
  // Update cart total - this will automatically update the derived remainingGold store
  cartTotalCost.set(total);
}

// Function to finalize the purchase and add items to the actor
export async function finalizePurchase(actor) {
  if (!actor) {
    ui.notifications.error("No active character");
    return false;
  }
  
  try {
    // Get the current cart and items
    const currentCart = get(shopCart);
    const currentTotal = get(cartTotalCost);
    const currentAvailable = get(availableGold);
    
    // Check if enough gold
    if (currentTotal > currentAvailable) {
      ui.notifications.error("Not enough gold for purchase");
      return false;
    }
    
    // Calculate remaining gold
    const remainingGoldValue = currentAvailable - currentTotal;
    
    // Add remaining gold to character (instead of deducting spent gold)
    const gpValue = Math.floor(remainingGoldValue / 100);
    const spValue = Math.floor((remainingGoldValue % 100) / 10);
    const cpValue = remainingGoldValue % 10;
    
    // Update actor currency first
    await actor.update({
      "system.currency.gp": (actor.system.currency.gp || 0) + gpValue,
      "system.currency.sp": (actor.system.currency.sp || 0) + spValue,
      "system.currency.cp": (actor.system.currency.cp || 0) + cpValue
    });
    
    // Create a batch of items to add to character
    const itemsToCreate = [];
    const itemsToUpdate = []; // Track updates separately

    // Add items to character using itemData from the cart
    for (const [itemId, { quantity, itemData }] of currentCart.entries()) {
      if (itemData) {
        // Check if actor already has this item by name
        const existingItem = actor.items.find(i => i.name === itemData.name); 
        
        if (existingItem) {
          // Prepare update for existing item
          itemsToUpdate.push({
            _id: existingItem._id,
            "system.quantity": (existingItem.system.quantity || 0) + quantity
          });
        } else {
          // Prepare to create new item from the full itemData
          const newItemObject = typeof itemData.toObject === 'function' 
              ? itemData.toObject() 
              : foundry.utils.deepClone(itemData);

          // Ensure the quantity is set correctly for the purchased amount
          newItemObject.system.quantity = quantity; 
          
          itemsToCreate.push(newItemObject);
        }
      }
    }
    
    // Update existing items in a single batch
    if (itemsToUpdate.length > 0) {
       await actor.updateEmbeddedDocuments("Item", itemsToUpdate);
    }

    // Create all new items in a single batch for better performance
    if (itemsToCreate.length > 0) {
      await actor.createEmbeddedDocuments("Item", itemsToCreate);
    }
    
    // Clear the cart
    shopCart.set(new Map());
    updateTotals(); // Recalculate totals (should be 0)

    // Make the shop tab readonly
    readOnlyTabs.update(tabs => [...tabs, 'shop']);
    
    return true;
  } catch (error) {
    console.error("Error finalizing purchase:", error);
    ui.notifications.error("Failed to complete purchase: " + error.message);
    return false;
  }
}
