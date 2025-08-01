import { describe, it, expect, vi, beforeEach } from 'vitest';
import { filterPackForDTPackItems } from '../helpers/Utility.js';

// Mock the global game object
global.game = {
  modules: {
    get: vi.fn()
  },
  settings: {
    get: vi.fn()
  },
  user: {
    isGM: false
  },
  membership: {
    RANKS: {
      member: 1,
      benefactor: 2,
      benefactorOfKnowledge: 3
    },
    hasPermission: vi.fn(),
    membershipLevel: -1,
    DEVELOPER_IS_ADMIN: false
  }
};

// Mock the DTPlugin
global.DTPlugin = {
  packHasDTFolders: vi.fn(),
  getDTFolderIdsFromPack: vi.fn()
};

// Mock the MODULE_ID
global.MODULE_ID = 'actor-studio';

describe('Donation Tracker GM Bypass', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock setup
    game.modules.get.mockReturnValue({ active: true });
    game.settings.get.mockImplementation((moduleId, key) => {
      if (key === 'enable-donation-tracker') return true;
      if (key === 'enable-donation-tracker-unregistered-access') return false;
      return 'TestFolder';
    });
    
    DTPlugin.packHasDTFolders.mockReturnValue(true);
    DTPlugin.getDTFolderIdsFromPack.mockImplementation((pack, filterByPermissions) => {
      if (filterByPermissions) {
        return ['folder1', 'folder2'];
      }
      return ['folder1', 'folder2', 'folder3', 'folder4'];
    });
  });

  it('should allow Game Masters to bypass donation tracker restrictions', () => {
    // Set up as Game Master
    game.user.isGM = true;
    
    const mockFolders = [
      { id: 'folder1', name: 'TestFolder' },
      { id: 'folder2', name: 'TestFolder' },
      { id: 'folder3', name: 'TestFolder' },
      { id: 'folder4', name: 'TestFolder' }
    ];
    
    const mockPack = {
      folders: Object.assign(mockFolders, {
        get: vi.fn().mockImplementation((id) => {
          return mockFolders.find(f => f.id === id) || null;
        })
      })
    };
    
    const mockEntries = [
      ['item1', { folder: 'folder1' }],
      ['item2', { folder: 'folder2' }],
      ['item3', { folder: 'folder3' }], // This would normally be filtered out
      ['item4', { folder: 'folder4' }]  // This would normally be filtered out
    ];
    
    const result = filterPackForDTPackItems(mockPack, mockEntries);
    
    // Game Masters should see all entries regardless of donation tracker status
    expect(result).toEqual(mockEntries);
  });

  it('should allow Game Masters to bypass restrictions even when DEVELOPER_IS_ADMIN is false', () => {
    // Set up as Game Master but not DEVELOPER_IS_ADMIN
    game.user.isGM = true;
    game.membership.DEVELOPER_IS_ADMIN = false;
    
    const mockFolders = [
      { id: 'folder1', name: 'TestFolder' },
      { id: 'folder2', name: 'TestFolder' },
      { id: 'folder3', name: 'TestFolder' },
      { id: 'folder4', name: 'TestFolder' }
    ];
    
    const mockPack = {
      folders: Object.assign(mockFolders, {
        get: vi.fn().mockImplementation((id) => {
          return mockFolders.find(f => f.id === id) || null;
        })
      })
    };
    
    const mockEntries = [
      ['item1', { folder: 'folder1' }],
      ['item2', { folder: 'folder2' }],
      ['item3', { folder: 'folder3' }],
      ['item4', { folder: 'folder4' }]
    ];
    
    const result = filterPackForDTPackItems(mockPack, mockEntries);
    
    // Game Masters should see all entries even without DEVELOPER_IS_ADMIN
    expect(result).toEqual(mockEntries);
  });

  it('should not apply donation tracker filtering when module is disabled', () => {
    game.user.isGM = false;
    game.settings.get.mockImplementation((moduleId, key) => {
      if (key === 'enable-donation-tracker') return false;
      return 'TestFolder';
    });
    
    const mockFolders = [
      { id: 'folder1', name: 'TestFolder' },
      { id: 'folder2', name: 'TestFolder' },
      { id: 'folder3', name: 'TestFolder' },
      { id: 'folder4', name: 'TestFolder' }
    ];
    
    const mockPack = {
      folders: Object.assign(mockFolders, {
        get: vi.fn().mockImplementation((id) => {
          return mockFolders.find(f => f.id === id) || null;
        })
      })
    };
    
    const mockEntries = [
      ['item1', { folder: 'folder1' }],
      ['item2', { folder: 'folder2' }],
      ['item3', { folder: 'folder3' }],
      ['item4', { folder: 'folder4' }]
    ];
    
    const result = filterPackForDTPackItems(mockPack, mockEntries);
    
    // When donation tracker is disabled, all entries should be returned
    expect(result).toEqual(mockEntries);
  });

  it('should not apply donation tracker filtering when pack has no DT folders', () => {
    game.user.isGM = false;
    DTPlugin.packHasDTFolders.mockReturnValue(false);
    
    const mockFolders = [
      { id: 'folder1', name: 'TestFolder' },
      { id: 'folder2', name: 'TestFolder' },
      { id: 'folder3', name: 'TestFolder' },
      { id: 'folder4', name: 'TestFolder' }
    ];
    
    const mockPack = {
      folders: Object.assign(mockFolders, {
        get: vi.fn().mockImplementation((id) => {
          return mockFolders.find(f => f.id === id) || null;
        })
      })
    };
    
    const mockEntries = [
      ['item1', { folder: 'folder1' }],
      ['item2', { folder: 'folder2' }],
      ['item3', { folder: 'folder3' }],
      ['item4', { folder: 'folder4' }]
    ];
    
    const result = filterPackForDTPackItems(mockPack, mockEntries);
    
    // When pack has no DT folders, all entries should be returned
    expect(result).toEqual(mockEntries);
  });
}); 