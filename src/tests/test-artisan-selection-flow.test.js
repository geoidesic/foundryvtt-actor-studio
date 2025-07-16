import { describe, it, expect, vi } from 'vitest';

// Mock Svelte stores with proper state management
const mockWritableState = {};
const mockWritable = (initialValue) => {
  const id = Math.random().toString(36);
  mockWritableState[id] = initialValue;
  
  return {
    set: vi.fn((value) => { mockWritableState[id] = value; }),
    update: vi.fn((fn) => { mockWritableState[id] = fn(mockWritableState[id]); }),
    subscribe: vi.fn(),
    _id: id,
    _getValue: () => mockWritableState[id]
  };
};

const mockDerived = (stores, fn) => ({
  set: vi.fn(),
  update: vi.fn(), 
  subscribe: vi.fn(),
  _getValue: () => {
    if (Array.isArray(stores)) {
      return fn(stores.map(store => store._getValue ? store._getValue() : store));
    } else {
      return fn(stores._getValue ? stores._getValue() : stores);
    }
  }
});

vi.mock('svelte/store', () => ({
  writable: mockWritable,
  derived: mockDerived,
  get: vi.fn((store) => store._getValue ? store._getValue() : null)
}));

describe('Artisan Equipment Selection Flow', () => {
  it('should add 32 GP to total when Artisan equipment is selected', async () => {
    console.log('🔧 FULL FLOW TEST: Artisan Equipment Selection');
    console.log('=============================================');
    
    const { 
      parseEquipmentGoldOptions, 
      setEquipmentGoldChoice, 
      equipmentGoldOptions,
      totalEquipmentGold
    } = await import('~/src/stores/equipmentGold');
    
    // Step 1: Parse Artisan background
    const artisanBackground = {
      system: {
        description: {
          value: `<p><strong>Equipment:</strong> Choose A or B: (A) <em>Artisan's Tools</em> (same as above), 2 <em>Pouches</em>, <em>Traveler's Clothes</em>, 32 GP; or (B) 50 GP</p>`
        },
        wealth: 15
      }
    };
    
    const artisanParsed = parseEquipmentGoldOptions(artisanBackground);
    console.log('Step 1 - Artisan parsed:', artisanParsed);
    
    // Step 2: Simulate user selecting "Equipment + 32 gp" option
    // This should happen when handleBackgroundChoice('equipment') is called
    const equipmentGoldAmount = artisanParsed.standardEquipmentGold; // Should be 32
    console.log('Step 2 - Setting equipment gold amount:', equipmentGoldAmount);
    
    setEquipmentGoldChoice('fromBackground', 'default', equipmentGoldAmount);
    
    // Step 3: Check the equipment gold options state
    const currentState = equipmentGoldOptions._getValue();
    console.log('Step 3 - Equipment gold options state:', currentState);
    
    // Step 4: Check total equipment gold
    const totalGold = totalEquipmentGold._getValue();
    console.log('Step 4 - Total equipment gold:', totalGold);
    
    // Verify the flow
    expect(artisanParsed.standardEquipmentGold).toBe(32);
    expect(currentState.fromBackground.currentGoldAmount).toBe(32);
    expect(totalGold).toBe(32);
    
    console.log('✅ Artisan equipment selection correctly adds 32 GP to total');
    console.log('✅ This should appear next to "Gold" heading with coin icon');
  });
});
