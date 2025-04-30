import { writable, derived, get } from 'svelte/store';
import { MODULE_ID } from '~/src/helpers/constants';
import { getPacksFromSettings } from '~/src/helpers/Utility';
import { goldRoll } from '~/src/stores/storeDefinitions';
import { totalGoldFromChoices } from '~/src/stores/goldChoices';

// Store for managing the state of the equipment shop

// List of items available in the shop, fetched from selected compendiums
export const shopItems = writable([]);

// Items currently selected/added to the virtual cart (Map<itemId, quantity>)
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

    let allItems = [];
    const seenItems = new Map(); // Track items by name to avoid duplicates
    
    // Fetch items from each pack
    for (const pack of packs) {
      const index = await pack.getIndex();
      
      for (const entry of index) {
        // Only include equipment, weapons, tools, and consumables
        const item = await pack.getDocument(entry._id);
        
        if (["weapon", "equipment", "tool", "consumable", "backpack"].includes(item.type)) {
          // Make sure the item has a price
          if (item.system?.price?.value) {
            // Check if we've already seen an item with this name
            if (!seenItems.has(item.name)) {
              allItems.push(item);
              seenItems.set(item.name, true);
            } else {
              window.GAS.log.d(`[SHOP] Skipping duplicate item: ${item.name}`);
            }
          }
        }
      }
    }
    
    // Sort items by name
    allItems.sort((a, b) => a.name.localeCompare(b.name));
    
    // Update the store
    shopItems.set(allItems);
    window.GAS.log.d('[SHOP] Loaded items:', allItems.length);
    
  } catch (error) {
    console.error("Error loading shop items:", error);
    shopItems.set([]);
  }
}

// Calculate the total cost in copper for an item
function getItemCostInCopper(item, quantity) {
  if (!item?.system?.price) return 0;
  
  const value = item.system.price.value || 0;
  const denomination = item.system.price.denomination || 'cp';
  
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
  const baseQuantity = item.system.quantity || 1;
  
  // Calculate price per unit: If an item comes in a pack (like 20 arrows),
  // we need to divide the total price by the pack quantity to get price per unit
  const pricePerUnit = (value * multiplier) / baseQuantity;
  
  // Calculate total cost: Price per unit * desired quantity
  return pricePerUnit * quantity;
}

// Function to update cart and totals
export function updateCart(itemId, quantity) {
  shopCart.update(cart => {
    const newCart = new Map(cart);
    
    if (quantity <= 0) {
      newCart.delete(itemId);
    } else {
      newCart.set(itemId, quantity);
    }
    
    return newCart;
  });
  
  // Recalculate cart total
  updateTotals();
}

// Update cart total and remaining gold
function updateTotals() {
  // Get current values to avoid subscription leaks
  const items = get(shopItems);
  const cart = get(shopCart);
  const availableGoldValue = get(availableGold);
  
  let total = 0;
  
  // Calculate cart total
  cart.forEach((quantity, itemId) => {
    const item = items.find(i => i.id === itemId);
    if (item) {
      total += getItemCostInCopper(item, quantity);
    }
  });
  
  // Update cart total - this will automatically update the derived remainingGold store
  cartTotalCost.set(total);
  
  // No need to set remainingGold manually as it's a derived store that updates automatically
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
    const currentItems = get(shopItems);
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
    
    await actor.update({
      "system.currency.gp": (actor.system.currency.gp || 0) + gpValue,
      "system.currency.sp": (actor.system.currency.sp || 0) + spValue,
      "system.currency.cp": (actor.system.currency.cp || 0) + cpValue
    });
    
    // Create a batch of items to add to character
    const itemsToCreate = [];
    
    // Add items to character
    for (const [itemId, quantity] of currentCart.entries()) {
      const item = currentItems.find(i => i.id === itemId);
      if (item) {
        // Check if actor already has this item
        const existingItem = actor.items.find(i => i.name === item.name);
        
        if (existingItem) {
          // Update quantity of existing item
          await existingItem.update({
            "system.quantity": (existingItem.system.quantity || 0) + quantity
          });
        } else {
          // Prepare to create new item
          const newItem = foundry.utils.deepClone(item.toObject());
          
          // Set the quantity correctly for the purchased amount
          newItem.system.quantity = quantity;
          
          itemsToCreate.push(newItem);
        }
      }
    }
    
    // Create all new items in a single batch for better performance
    if (itemsToCreate.length > 0) {
      await actor.createEmbeddedDocuments("Item", itemsToCreate);
    }
    
    // Clear the cart
    shopCart.set(new Map());
    updateTotals();
    
    return true;
  } catch (error) {
    console.error("Error finalizing purchase:", error);
    ui.notifications.error("Failed to complete purchase: " + error.message);
    return false;
  }
}
