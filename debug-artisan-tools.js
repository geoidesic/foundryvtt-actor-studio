/**
 * Debug script to test artisan tools selection in AND groups
 */

// Mock FoundryVTT globals
global.window = {
  GAS: {
    log: {
      d: (...args) => console.log('[DEBUG]', ...args),
      w: (...args) => console.log('[WARN]', ...args),
      e: (...args) => console.log('[ERROR]', ...args)
    },
    dnd5eVersion: 4,
    dnd5eRules: '2024'
  }
};
global.game = {
  settings: {
    get: (module, key) => {
      if (key === 'enableEquipmentSelection') return true;
      return null;
    }
  },
  i18n: {
    localize: (key) => key
  }
};

// Mock Svelte store functions
const stores = new Map();
const mockWritable = (initialValue) => {
  const subscribers = new Set();
  let value = initialValue;
  
  return {
    subscribe: (fn) => {
      subscribers.add(fn);
      fn(value);
      return () => subscribers.delete(fn);
    },
    set: (newValue) => {
      value = newValue;
      subscribers.forEach(fn => fn(value));
    },
    update: (fn) => {
      value = fn(value);
      subscribers.forEach(fn => fn(value));
    }
  };
};

const mockGet = (store) => {
  let value;
  store.subscribe(v => value = v)();
  return value;
};

// Set up mocks for imports
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Mock svelte/store
const svelteStore = {
  writable: mockWritable,
  derived: (stores, fn) => {
    const result = mockWritable(null);
    // Simple derived implementation
    const update = () => {
      const values = Array.isArray(stores) 
        ? stores.map(s => mockGet(s))
        : [mockGet(stores)];
      result.set(fn(...values));
    };
    if (Array.isArray(stores)) {
      stores.forEach(s => s.subscribe(update));
    } else {
      stores.subscribe(update);
    }
    update();
    return result;
  },
  get: mockGet
};

// Load the actual equipmentSelections module with mocked dependencies
const module = await import('./src/stores/equipmentSelections.js');

const {
  equipmentSelections,
  handleSelection,
  selectEquipment,
  GRANULAR_TYPES
} = module;

console.log('\n=== TESTING ARTISAN TOOLS IN AND GROUP ===\n');

// Set up test data for artificer with artisan tools in AND group
const testAndGroup = {
  id: 'and-group-1',
  type: 'standalone',
  label: 'Two simple weapons AND artisan tools',
  sort: 0,
  inProgress: true,
  completed: false,
  selectedItemId: null,
  selectedItem: null,
  granularSelections: null,
  items: [{
    _id: 'and-item-1',
    type: 'AND',
    label: 'Two simple weapons AND artisan tools',
    children: [
      {
        _id: 'weapon-child-1',
        type: 'weapon',
        key: 'sim',
        count: 2,
        label: '2× simple weapon'
      },
      {
        _id: 'tool-child-1',
        type: 'tool',
        key: 'art',
        count: 1,
        label: "artisan's tools"
      }
    ]
  }]
};

// Initialize the store with our test data
equipmentSelections.set({
  'and-group-1': testAndGroup
});

console.log('Initial state:');
console.log(JSON.stringify(mockGet(equipmentSelections), null, 2));

console.log('\n--- Simulating user click on "artisan\'s tools" ---\n');

// Simulate clicking on the artisan tools item
const artisanToolsItem = testAndGroup.items[0].children[1];
console.log('Clicked item:', artisanToolsItem);

// Call handleSelection
handleSelection(false, 'and-group-1', artisanToolsItem);

console.log('\n--- State after handleSelection ---\n');
const stateAfterClick = mockGet(equipmentSelections);
console.log(JSON.stringify(stateAfterClick, null, 2));

console.log('\n--- Checking configurableSelections filter conditions ---\n');
const group = stateAfterClick['and-group-1'];
console.log('Group has selectedItem:', !!group.selectedItem);
console.log('Group inProgress:', group.inProgress);
console.log('Group completed:', group.completed);
if (group.selectedItem) {
  console.log('selectedItem.type:', group.selectedItem.type);
  console.log('selectedItem.children:', group.selectedItem.children?.map(c => ({ type: c.type, label: c.label })));
  const hasGranularChildren = group.selectedItem.type === 'AND' && 
    group.selectedItem.children?.some(child => GRANULAR_TYPES.includes(child.type));
  console.log('Has granular children:', hasGranularChildren);
  console.log('Should pass configurableSelections filter:', hasGranularChildren);
}

console.log('\n=== TEST COMPLETE ===\n');
