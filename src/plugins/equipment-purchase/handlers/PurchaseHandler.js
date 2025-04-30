// Handles currency conversion and item cost calculations for the shop
export class PurchaseHandler {
  constructor() {
    // Default setup
  }

  // Format a copper value to display GP, SP, CP
  static formatCurrency(totalCopper) {
    // Convert total copper value into GP, SP, CP object
    const gp = Math.floor(totalCopper / 100);
    const sp = Math.floor((totalCopper % 100) / 10);
    const cp = totalCopper % 10;
    return { gp, sp, cp };
  }

  // Calculate the total cost of items in cart
  static calculateTotalCost(items, cart) {
    let totalCopper = 0;
    
    cart.forEach((quantity, itemId) => {
      const item = items.find(i => i.id === itemId);
      if (item && item.system?.price) {
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
        
        totalCopper += value * multiplier * quantity;
      }
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
