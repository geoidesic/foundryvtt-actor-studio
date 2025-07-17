// Test Magic Initiate parsing standalone
import { parseFeatSpellRequirements } from './src/stores/spellSelection.js';

// Mock window.GAS for testing
global.window = {
  GAS: {
    log: {
      d: console.log
    }
  }
};

// Test Magic Initiate feat data (similar to what FoundryVTT would have)
const mockActorWithMagicInitiate = {
  name: 'Test Fighter',
  items: [
    {
      _id: 'feat-magic-initiate',
      type: 'feat',
      name: 'Magic Initiate (Wizard)',
      system: {
        description: {
          value: '<p>Choose a class: bard, cleric, druid, sorcerer, warlock, or wizard. You learn two cantrips of your choice from that class\'s spell list.</p><p>In addition, choose one 1st-level spell from that same list. You learn that spell and can cast it at its lowest level.</p>'
        }
      }
    }
  ]
};

console.log('🧪 Testing Magic Initiate parsing...');
console.log('Raw description:', mockActorWithMagicInitiate.items[0].system.description.value);

const requirements = parseFeatSpellRequirements(mockActorWithMagicInitiate);

console.log('📊 Parsing Results:');
console.log('  - Cantrips:', requirements.cantrips);
console.log('  - Spells:', requirements.spells);
console.log('  - Source:', requirements.source);

// Expected: cantrips: 2, spells: 1
const success = requirements.cantrips === 2 && requirements.spells === 1;
console.log(success ? '✅ Test PASSED' : '❌ Test FAILED');

// Test another variant
const mockActorWithMagicInitiateVariant = {
  name: 'Test Fighter 2',
  items: [
    {
      _id: 'feat-magic-initiate-2',
      type: 'feat', 
      name: 'Magic Initiate',
      system: {
        description: {
          value: 'You learn two cantrips and one 1st-level spell from the wizard spell list.'
        }
      }
    }
  ]
};

console.log('\n🧪 Testing Magic Initiate variant...');
const requirements2 = parseFeatSpellRequirements(mockActorWithMagicInitiateVariant);
console.log('📊 Variant Results:');
console.log('  - Cantrips:', requirements2.cantrips);
console.log('  - Spells:', requirements2.spells);
console.log('  - Source:', requirements2.source);

const success2 = requirements2.cantrips === 2 && requirements2.spells === 1;
console.log(success2 ? '✅ Variant Test PASSED' : '❌ Variant Test FAILED');
