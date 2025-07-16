import { writable, derived, get } from 'svelte/store';
import { MODULE_ID } from '~/src/helpers/constants';
// Import extractItemsFromPacksAsync instead of Sync
import { getPacksFromSettings, extractItemsFromPacksAsync } from '../helpers/Utility.js';
import { goldRoll } from '~/src/stores/storeDefinitions';
import { totalGoldFromChoices } from '~/src/stores/goldChoices';
import { readOnlyTabs } from './index.js';
import { handleContainerContents } from '../lib/workflow.js';

// Import fromUuid for container handling
const { fromUuid } = foundry.utils;

// Store for managing the state of the equipment shop

// List of items available in the shop, fetched from selected compendiums
export const shopItems = writable([]);

// Items currently selected/added to the virtual cart (Map<itemId, { quantity, itemData }>)
export const shopCart = writable(new Map());

// Available gold using the working totalGoldFromChoices derived store (in copper)
export const availableGold = derived(totalGoldFromChoices, $totalGoldFromChoices => ($totalGoldFromChoices || 0) * 100);

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
  if (window.GAS.dnd5eVersion < 4) {
    // For 5e v3, use goldRoll (legacy)
    const goldValue = get(goldRoll);
    return goldValue * 100;
  }
  // For v4+, availableGold is derived from totalGoldFromChoices and always up to date
  return get(availableGold);
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
    
    // Filter for items with a price (any item type is allowed if it has a price)
    lightweightItems = lightweightItems.filter(item => 
      item.system?.price?.value // Only require that the item has a price
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
    
    // Add enrichedName property for Foundry enrichers
    for (const item of uniqueLightweightItems) {
      if (item.uuid && item.name) {
        item.enrichedName = `@UUID[${item.uuid}]{${item.name}}`;
      } else {
        item.enrichedName = item.name;
      }
    }

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
export function updateCart(itemId, quantity, fullItemData, uuid = null) {
  shopCart.update(cart => {
    const newCart = new Map(cart);
    
    if (quantity <= 0) {
      newCart.delete(itemId);
    } else {
      // Store quantity, the full item data, and UUID for container handling
      newCart.set(itemId, { quantity: quantity, itemData: fullItemData, uuid: uuid }); 
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
  window.GAS.log.d('[SHOP] finalizePurchase called with actor:', actor?.name);
  
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
    const newItemsInfo = []; // Track info about new items for container handling

    window.GAS.log.d('[SHOP] Processing cart with', currentCart.size, 'items');

    // Add items to character using itemData from the cart
    for (const [itemId, { quantity, itemData, uuid }] of currentCart.entries()) {
      if (itemData) {
        window.GAS.log.d('[SHOP] Processing cart item:', itemData.name, 'Type:', itemData.type, 'Quantity:', quantity, 'UUID:', uuid);
        
        // Check if actor already has this item by name
        const existingItem = actor.items.find(i => i.name === itemData.name); 
        
        if (existingItem) {
          window.GAS.log.d('[SHOP] Found existing item, will update quantity');
          // Prepare update for existing item
          itemsToUpdate.push({
            _id: existingItem._id,
            "system.quantity": (existingItem.system.quantity || 0) + quantity
          });
        } else {
          window.GAS.log.d('[SHOP] New item, will create');
          // Prepare to create new item from the full itemData
          const newItemObject = typeof itemData.toObject === 'function' 
              ? itemData.toObject() 
              : foundry.utils.deepClone(itemData);

          // Ensure the quantity is set correctly for the purchased amount
          newItemObject.system.quantity = quantity; 
          
          itemsToCreate.push(newItemObject);
          
          // Track info for container handling
          newItemsInfo.push({
            itemData: itemData,
            uuid: uuid,
            cartItemId: itemId
          });
        }
      }
    }
    
    window.GAS.log.d('[SHOP] Items to create:', itemsToCreate.length, 'Items to update:', itemsToUpdate.length);
    
    // Update existing items in a single batch
    if (itemsToUpdate.length > 0) {
       await actor.updateEmbeddedDocuments("Item", itemsToUpdate);
    }

    // Create all new items in a single batch for better performance
    if (itemsToCreate.length > 0) {
      window.GAS.log.d('[SHOP] Creating', itemsToCreate.length, 'new items');
      const createdItems = await actor.createEmbeddedDocuments("Item", itemsToCreate);
      window.GAS.log.d('[SHOP] Created items:', createdItems.length);
      
      // Handle container contents for each newly created item
      for (let i = 0; i < createdItems.length; i++) {
        const createdItem = createdItems[i];
        const newItemInfo = newItemsInfo[i];
        
        if (newItemInfo) {
          window.GAS.log.d('[SHOP] Processing item for container contents:', newItemInfo.itemData.name, 'Type:', newItemInfo.itemData.type, 'UUID:', newItemInfo.uuid);
          
          // Use the stored UUID to fetch the source item for container handling
          if (newItemInfo.uuid) {
            try {
              const sourceItem = await fromUuid(newItemInfo.uuid);
              if (sourceItem) {
                await handleContainerContents(sourceItem, createdItem, actor);
              } else {
                window.GAS.log.d('[SHOP] Could not fetch source item from UUID:', newItemInfo.uuid);
              }
            } catch (error) {
              console.error('Error handling container contents for shop item:', newItemInfo.itemData.name, error);
            }
          } else {
            window.GAS.log.d('[SHOP] No UUID stored for item, skipping container handling');
          }
        }
      }
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
