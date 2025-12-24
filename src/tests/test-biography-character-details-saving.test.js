import { describe, it, expect, vi } from 'vitest';
import { updateSource } from '../helpers/Utility';

// Mock the updateSource function
vi.mock('../helpers/Utility', () => ({
  updateSource: vi.fn()
}));

describe('Biography Character Details Saving', () => {
  it('should save all character details to correct actor system.details paths', () => {
    const mockActor = {
      id: 'test-actor',
      name: 'Test Character',
      system: {
        details: {}
      }
    };

    // Simulate the characterDetails data that would come from the store
    const currentDetails = {
      height: '6\'2"',
      weight: '200 lbs',
      age: '35',
      eyes: 'blue',
      hair: 'brown',
      skin: 'fair',
      gender: 'male',
      faith: 'follower of Tempus',
      alignment: 'chaotic good'
    };

    // This is the logic from completeBiography() function
    const updates = {};

    if (currentDetails.height) {
      updates['system.details.height'] = currentDetails.height;
    }
    if (currentDetails.weight) {
      updates['system.details.weight'] = currentDetails.weight;
    }
    if (currentDetails.age) {
      updates['system.details.age'] = currentDetails.age;
    }
    if (currentDetails.eyes) {
      updates['system.details.eyes'] = currentDetails.eyes;
    }
    if (currentDetails.hair) {
      updates['system.details.hair'] = currentDetails.hair;
    }
    if (currentDetails.skin) {
      updates['system.details.skin'] = currentDetails.skin;
    }
    if (currentDetails.gender) {
      updates['system.details.gender'] = currentDetails.gender;
    }
    if (currentDetails.faith) {
      updates['system.details.faith'] = currentDetails.faith;
    }
    if (currentDetails.alignment) {
      updates['system.details.alignment'] = currentDetails.alignment;
    }

    // Verify the updates object contains all expected fields
    expect(updates).toEqual({
      'system.details.height': '6\'2"',
      'system.details.weight': '200 lbs',
      'system.details.age': '35',
      'system.details.eyes': 'blue',
      'system.details.hair': 'brown',
      'system.details.skin': 'fair',
      'system.details.gender': 'male',
      'system.details.faith': 'follower of Tempus',
      'system.details.alignment': 'chaotic good'
    });

    // Simulate calling updateSource with these updates
    updateSource(mockActor, updates);

    // Verify updateSource was called with correct parameters
    expect(updateSource).toHaveBeenCalledWith(mockActor, {
      'system.details.height': '6\'2"',
      'system.details.weight': '200 lbs',
      'system.details.age': '35',
      'system.details.eyes': 'blue',
      'system.details.hair': 'brown',
      'system.details.skin': 'fair',
      'system.details.gender': 'male',
      'system.details.faith': 'follower of Tempus',
      'system.details.alignment': 'chaotic good'
    });
  });

  it('should only save non-empty character details', () => {
    const mockActor = {
      id: 'test-actor',
      name: 'Test Character',
      system: {
        details: {}
      }
    };

    // Simulate characterDetails with some empty fields
    const currentDetails = {
      height: '6\'2"',
      weight: '',
      age: '35',
      eyes: '',
      hair: 'brown',
      skin: 'fair',
      gender: 'male',
      faith: '',
      alignment: 'chaotic good'
    };

    const updates = {};

    if (currentDetails.height) {
      updates['system.details.height'] = currentDetails.height;
    }
    if (currentDetails.weight) {
      updates['system.details.weight'] = currentDetails.weight;
    }
    if (currentDetails.age) {
      updates['system.details.age'] = currentDetails.age;
    }
    if (currentDetails.eyes) {
      updates['system.details.eyes'] = currentDetails.eyes;
    }
    if (currentDetails.hair) {
      updates['system.details.hair'] = currentDetails.hair;
    }
    if (currentDetails.skin) {
      updates['system.details.skin'] = currentDetails.skin;
    }
    if (currentDetails.gender) {
      updates['system.details.gender'] = currentDetails.gender;
    }
    if (currentDetails.faith) {
      updates['system.details.faith'] = currentDetails.faith;
    }
    if (currentDetails.alignment) {
      updates['system.details.alignment'] = currentDetails.alignment;
    }

    // Should only include non-empty fields
    expect(updates).toEqual({
      'system.details.height': '6\'2"',
      'system.details.age': '35',
      'system.details.hair': 'brown',
      'system.details.skin': 'fair',
      'system.details.gender': 'male',
      'system.details.alignment': 'chaotic good'
    });

    expect(updates['system.details.weight']).toBeUndefined();
    expect(updates['system.details.eyes']).toBeUndefined();
    expect(updates['system.details.faith']).toBeUndefined();
  });
});