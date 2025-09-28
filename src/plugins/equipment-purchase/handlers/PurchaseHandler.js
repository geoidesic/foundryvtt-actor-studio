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

  // Helper to get total copper value for a single item and quantity
  static getItemCopperValue(item, quantity) {
    if (!item || !item.system?.price) return 0;
    const value = item.system.price.value || 0;
    const denomination = item.system.price.denomination || 'cp';

    let multiplier = 1;
    switch (denomination) {
      case 'gp': multiplier = 100; break;
      case 'sp': multiplier = 10; break;
      case 'pp': multiplier = 1000; break;
      case 'ep': multiplier = 50; break;
      default: multiplier = 1; // cp
    }

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
