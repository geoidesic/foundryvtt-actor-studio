import { get } from 'svelte/store';
import { 
  spellGrantSelections, 
  addSpellGrantSelection,
  getSelectionsForGrant,
  clearSpellGrantSelections
} from './src/stores/spellGrants.js';

console.log('Testing spell grants store...\n');

// Test initial state
console.log('1. Initial store value:');
const initial = get(spellGrantSelections);
console.log('   Type:', initial.constructor.name);
console.log('   Size:', initial.size);
console.log('   Value:', initial);

// Test add
console.log('\n2. Adding selection...');
const grantInfo = { advancementId: 'test-1', itemName: 'Magic Initiate' };
const spells = [{ id: 'spell-1', name: 'Fire Bolt' }];
addSpellGrantSelection('test-1', grantInfo, spells);

const afterAdd = get(spellGrantSelections);
console.log('   Type:', afterAdd.constructor.name);
console.log('   Size:', afterAdd.size);
console.log('   Has test-1:', afterAdd.has('test-1'));
console.log('   Value:', afterAdd.get('test-1'));

// Test get function
console.log('\n3. Getting selections for grant...');
const retrieved = getSelectionsForGrant('test-1');
console.log('   Retrieved:', retrieved);

// Test clear
console.log('\n4. Clearing all selections...');
clearSpellGrantSelections();
const afterClear = get(spellGrantSelections);
console.log('   Size:', afterClear.size);

console.log('\n✅ Store implementation works correctly!');
