import { describe, it, expect, vi } from 'vitest';
import { parseEquipmentGoldOptions } from '../stores/equipmentGold.js';

// Mock the window.GAS object
global.window = {
  GAS: {
    log: {
      d: vi.fn()
    }
  }
};

describe('Equipment Gold Parsing', () => {
  it('should parse Fighter class variable gold options', () => {
    const mockFighterClass = {
      system: {
        description: {
          value: `
            <td><p><em>Choose A, B, or C:</em> (A) Chain Mail, Greatsword, Flail, 8 Javelins, Dungeoneer's Pack, and <span class="award-block dnd5e2" data-award-command=" 4GP">4 <i class="currency gp"></i></span>; (B) Studded Leather Armor, Scimitar, Shortsword, Longbow, 20 Arrows, Quiver, Dungeoneer's Pack, and <span class="award-block dnd5e2" data-award-command=" 11GP">11 <i class="currency gp"></i></span>; or (C) <span class="award-block dnd5e2" data-award-command=" 155GP">155 <i class="currency gp"></i></span></p></td>
          `
        }
      }
    };
    
    const result = parseEquipmentGoldOptions(mockFighterClass);
    
    expect(result.hasVariableGold).toBe(true);
    expect(result.goldOptions).toHaveLength(3);
    
    // Check that gold amounts are correctly parsed and sorted
    expect(result.goldOptions[0].goldAmount).toBe(4);
    expect(result.goldOptions[1].goldAmount).toBe(11);
    expect(result.goldOptions[2].goldAmount).toBe(155);
    
    // Check that choice letters are extracted
    expect(result.goldOptions[0].choice).toBe('A');
    expect(result.goldOptions[1].choice).toBe('B');
    expect(result.goldOptions[2].choice).toBe('C');
    
    // Check that descriptions are meaningful
    expect(result.goldOptions[0].description).toContain('A:');
    expect(result.goldOptions[1].description).toContain('B:');
    expect(result.goldOptions[2].description).toContain('C:');
  });

  it('should handle classes without variable gold', () => {
    const mockRegularClass = {
      system: {
        description: {
          value: `
            <p>You start with the following equipment: Leather armor, simple weapon, and <span class="award-block dnd5e2" data-award-command=" 50GP">50 <i class="currency gp"></i></span></p>
          `
        }
      }
    };
    
    const result = parseEquipmentGoldOptions(mockRegularClass);
    
    expect(result.hasVariableGold).toBe(false);
    expect(result.goldOptions).toHaveLength(1);
    expect(result.goldOptions[0].goldAmount).toBe(50);
    expect(result.goldOptions[0].choice).toBe('default');
  });

  it('should handle empty or invalid input', () => {
    const result1 = parseEquipmentGoldOptions(null);
    expect(result1.hasVariableGold).toBe(false);
    expect(result1.goldOptions).toHaveLength(0);
    
    const result2 = parseEquipmentGoldOptions({});
    expect(result2.hasVariableGold).toBe(false);
    expect(result2.goldOptions).toHaveLength(0);
    
    const result3 = parseEquipmentGoldOptions({ system: { description: { value: '' } } });
    expect(result3.hasVariableGold).toBe(false);
    expect(result3.goldOptions).toHaveLength(0);
  });
  
  it('should not treat multiple GP mentions in text as variable gold', () => {
    const mockBackground = {
      system: {
        description: {
          value: `<p>You start with 100 GP and can buy equipment worth 50 GP. The merchant has items ranging from 10 GP to 25 GP.</p>`
        }
      }
    };

    const result = parseEquipmentGoldOptions(mockBackground);
    
    // Should not be variable since these are just mentions, not award commands
    expect(result.hasVariableGold).toBe(false);
    // Should handle this as no variable gold scenario
    expect(result.goldOptions.length).toBeLessThanOrEqual(1);
  });
});
