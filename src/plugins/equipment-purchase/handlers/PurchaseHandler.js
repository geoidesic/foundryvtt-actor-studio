// Handles currency conversion and item cost calculations for the shop
export class PurchaseHandler {
  constructor() {
    // Default setup
  }

  // Format a copper value to display GP, SP, CP
  static formatCurrency(totalCopper) {
    // Handle negative values
    const isNegative = totalCopper < 0;
    const absCopper = Math.abs(totalCopper);
    let gp = Math.floor(absCopper / 100);
    let sp = Math.floor((absCopper % 100) / 10);
    let cp = absCopper % 10;

    // Apply the sign to the largest nonzero denomination
    if (isNegative) {
      if (gp > 0) {
        gp = -gp;
      } else if (sp > 0) {
        sp = -sp;
      } else {
        cp = -cp;
      }
    }
    return { gp, sp, cp };
  }

  // Get the copper multiplier for a currency denomination.
  // Prefers CONFIG.DND5E.currencies so custom/renamed currencies (e.g. "credits")
  // from other modules are handled correctly, with a hardcoded fallback.
  static getDenominationMultiplier(denomination) {
    const currencyConfig = CONFIG?.DND5E?.currencies?.[denomination];
    if (currencyConfig?.conversion !== undefined) {
      // conversion is in gold-piece units (e.g. cp=0.01, sp=0.1, gp=1, pp=10)
      return currencyConfig.conversion * 100;
    }
    switch (denomination) {
      case 'gp': return 100;
      case 'sp': return 10;
      case 'pp': return 1000;
      case 'ep': return 50;
      default: return 1; // cp
    }
  }

  // Helper to get total copper value for a single item and quantity
  static getItemCopperValue(item, quantity) {
    if (!item || !item.system?.price) return 0;
    const value = item.system.price.value || 0;
    const denomination = item.system.price.denomination || 'cp';

    const multiplier = PurchaseHandler.getDenominationMultiplier(denomination);

    return value * multiplier * quantity;
  }

  // Calculate the total cost of items in cart
  static calculateTotalCost(items, cart) {
    let totalCopper = 0;

    cart.forEach((quantity, itemId) => {
      const item = items.find(i => i.id === itemId);
      totalCopper += PurchaseHandler.getItemCopperValue(item, quantity);
    });

    return totalCopper;
  }

  // Format price for display
  static formatPrice(value, denomination) {
    if (!value) return "0 cp";
    
    // If no denomination provided, default to copper
    denomination = denomination || "cp";
    
    return `${value} ${denomination}`;
  }
}
