// Handles currency conversion and item cost calculations for the shop
export class PurchaseHandler {
  constructor() {
    // Default setup
  }

  // Format a copper value to display GP, SP, CP (legacy method)
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

  // Convert any coin denomination to copper
  static toCopper(amount, denomination) {
    const multipliers = {
      'pp': 1000, // 1 PP = 10 GP = 1000 CP
      'gp': 100,  // 1 GP = 100 CP
      'ep': 50,   // 1 EP = 5 SP = 50 CP
      'sp': 10,   // 1 SP = 10 CP
      'cp': 1     // 1 CP = 1 CP
    };
    
    return amount * (multipliers[denomination] || 1);
  }

  // Convert copper to all coin denominations
  static fromCopper(totalCopper) {
    const isNegative = totalCopper < 0;
    const absCopper = Math.abs(totalCopper);
    
    let pp = Math.floor(absCopper / 1000);
    let gp = Math.floor((absCopper % 1000) / 100);
    let ep = Math.floor((absCopper % 100) / 50);
    let sp = Math.floor((absCopper % 50) / 10);
    let cp = absCopper % 10;

    // Apply the sign to the largest nonzero denomination
    if (isNegative) {
      if (pp > 0) {
        pp = -pp;
      } else if (gp > 0) {
        gp = -gp;
      } else if (ep > 0) {
        ep = -ep;
      } else if (sp > 0) {
        sp = -sp;
      } else {
        cp = -cp;
      }
    }
    
    return { pp, gp, ep, sp, cp };
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
        totalCopper += this.toCopper(value, denomination) * quantity;
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
