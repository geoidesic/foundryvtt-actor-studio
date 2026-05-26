import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { PurchaseHandler } from '../plugins/equipment-purchase/handlers/PurchaseHandler.js';

describe('Shop currency conversion regression (#252)', () => {
  let originalConfig;

  beforeEach(() => {
    originalConfig = global.CONFIG;
    global.CONFIG = {
      DND5E: {
        currencies: {
          cp: { conversion: 0.01 },
          sp: { conversion: 0.1 },
          gp: { conversion: 1 },
          ep: { conversion: 0.5 },
          pp: { conversion: 10 },
          credits: { conversion: 0.2 }
        }
      }
    };
  });

  afterEach(() => {
    global.CONFIG = originalConfig;
  });

  it('treats rations (5sp) as affordable with 7gp remaining', () => {
    const remainingGoldInCopper = 700;
    const rations = {
      name: 'Rations',
      system: {
        price: {
          value: 5,
          denomination: 'sp'
        }
      }
    };

    const priceInCopper = PurchaseHandler.getItemCopperValue(rations, 1);

    expect(priceInCopper).toBe(50);
    expect(priceInCopper <= remainingGoldInCopper).toBe(true);
  });

  it('uses CONFIG.DND5E currency conversions for custom denominations', () => {
    const item = {
      name: 'Rail Ticket',
      system: {
        price: {
          value: 3,
          denomination: 'credits'
        }
      }
    };

    // conversion 0.2 gp => 20 copper per credit, so 3 credits = 60 copper
    expect(PurchaseHandler.getItemCopperValue(item, 1)).toBe(60);
  });

  it('falls back to default denomination table when CONFIG is unavailable', () => {
    global.CONFIG = undefined;

    const item = {
      name: 'Torch',
      system: {
        price: {
          value: 1,
          denomination: 'sp'
        }
      }
    };

    expect(PurchaseHandler.getItemCopperValue(item, 1)).toBe(10);
  });
});
