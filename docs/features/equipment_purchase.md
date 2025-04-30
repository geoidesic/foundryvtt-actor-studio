# Equipment Purchase Feature

## Overview

The Equipment Purchase feature allows players to spend their starting gold, determined during the Ability Score/Gold step, to buy equipment from configured compendiums. This provides an alternative or supplement to the standard Starting Equipment selection.

## Requirements

*   The feature must be enabled via the `enableEquipmentPurchase` setting in the module configuration (See [Configuration Guide](../setup/configuration.md)).
*   The character must have received starting gold (either via standard class/background rules or the optional "roll for gold" method).
*   Appropriate compendiums containing equipment items must be selected in the module's Compendium Sources settings under the "Equipment" category.

## How it Works

1.  **Activation:** If the requirements are met, a "Shop" tab will appear in the Actor Studio application after the standard "Equipment Selection" step is completed (or if starting equipment is skipped).
2.  **Gold Initialization:** The shop automatically receives the character's calculated starting gold amount.
3.  **Item Loading:** Items from the compendiums designated as "Equipment" sources in the settings are loaded into the shop interface. Only items with a defined price (cost and denomination) are included. Duplicate items (by name) are ignored.
4.  **Shopping:** Players can browse available items, add them to a virtual cart, and see the total cost update dynamically.
5.  **Finalization:** Clicking "Finalize Purchase" performs the following actions:
    *   Checks if the character has enough gold for the items in the cart.
    *   Adds the purchased items to the character's inventory on the actual Actor sheet. If the actor already owns an item, its quantity is increased; otherwise, a new item is created.
    *   Updates the character's currency on the Actor sheet to reflect the remaining gold after the purchase.
    *   Closes the Actor Studio application.

## Shop Interface (`ShopTab.svelte`)

The "Shop" tab presents the following interface:

*   **Left Panel:**
    *   **Available Gold:** Displays the starting gold allocated to the character, broken down into GP, SP, and CP.
    *   **Cart Total:** Shows the total cost of items currently in the cart, converted to GP, SP, CP.
    *   **Remaining Gold:** Dynamically calculates and displays the gold the character will have left after the purchase. This turns red if the cart total exceeds available gold.
    *   **Cart Items:** Lists the items added to the cart, showing their icon, name, price, and quantity. A trash icon allows removing items.
    *   **Finalize Purchase Button:** Becomes active when items are in the cart and the total cost does not exceed available gold.
*   **Right Panel:**
    *   **Available Equipment:** Lists all purchasable items loaded from the configured compendiums.
    *   **Categories:** Items are grouped by type (e.g., Weapons, Equipment, Tools, Consumables).
    *   **Item Rows:** Each item displays its icon, name, price, and an "Add to Cart" button (`+`). *Note: Currently, clicking '+' adds the item's base quantity (e.g., 20 arrows if the item quantity is 20) to the cart.*

## State Management (`equipmentShop.js`)

This store manages the core state for the feature:

*   `shopItems`: List of available item documents loaded from compendiums.
*   `shopCart`: A Map storing the items in the cart (`itemId` -> `quantity`).
*   `availableGold`: The character's starting gold in copper.
*   `cartTotalCost`: The calculated total cost of the cart in copper.
*   `remainingGold`: Derived store calculating `availableGold - cartTotalCost`.

## Configuration

Ensure the `enableEquipmentPurchase` setting is checked and that you have selected compendiums under the "Equipment" category in the Compendium Sources settings for items to appear in the shop.
