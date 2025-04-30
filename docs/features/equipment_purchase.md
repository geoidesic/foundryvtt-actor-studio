# Equipment Purchase Feature

This feature allows players to purchase equipment using starting gold awarded during character creation.

## Requirements

- The feature must be enabled via the `enableEquipmentPurchase` setting in the module configuration.
- The character must have received starting gold (either via 2014 or 2024 rules during the Ability Score step).

## Functionality

1.  **Shop Tab:** If the requirements are met, a new "Shop" tab appears in the Actor Studio application after the "Equipment Selection" step.
2.  **Compendium Sources:** A new "Equipment" section is added to the Compendium Sources settings, allowing the GM to specify which compendiums provide items for the shop.
3.  **Shop Interface:**
    *   **Left Panel:** Displays the character's available starting gold (broken down into GP, SP, CP) and the calculated remaining gold after potential purchases.
    *   **Right Panel:** Lists items available for purchase from the configured Equipment compendiums. Each item shows its name, cost, and a quantity input with +/- buttons.
4.  **Purchasing:**
    *   Adjusting item quantities updates the total cost and remaining gold dynamically.
    *   Currency conversion (GP/SP/CP) is handled automatically.
    *   A "Finalize Purchase" button (functionality TBD - likely adds items to the character sheet and deducts gold) is present.

## Components

- `ShopTab.svelte` (Organism): The main UI for the shop.
- `GoldDisplay.svelte` (Molecule): Displays currency amounts.

## State Management

- `equipmentShop.js` (Store): Manages available items, cart contents, and currency totals.

## Logic

- `PurchaseHandler.js`: Contains logic for currency conversion and cost calculation.
- `settings.js` (within plugin): Registers the feature's settings.
- `compendiumSourcesSubmenu.js` (modified): Includes UI for selecting equipment compendiums.
