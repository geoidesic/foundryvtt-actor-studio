// Test Magic Initiate regex patterns
const testDescriptions = [
  'Choose a class: bard, cleric, druid, sorcerer, warlock, or wizard. You learn two cantrips of your choice from that class\'s spell list. In addition, choose one 1st-level spell from that same list.',
  'You learn two cantrips and one 1st-level spell from the wizard spell list.',
  'You learn 2 cantrips and 1 spell of 1st level from the cleric spell list.',
];

function testRegexPatterns(description) {
  console.log('📝 Description:', description.substring(0, 100) + '...');
  
  // Test cantrip matching
  const cantripMatch = description.match(/(?:learn|gain)\s+(\w+)\s+cantrips?/i);
  console.log('🔮 Cantrip match:', cantripMatch);
  
  // Test spell matching - multiple patterns
  const spellMatch1 = description.match(/(?:learn|gain)\s+(?:one|1|a)\s+(?:1st-level\s+)?spells?/i);
  const spellMatch2 = description.match(/(?:one|1)\s+(?:1st-level\s+)?spells?/i);
  const spellMatch3 = description.includes('1st-level spell');
  
  console.log('🎯 Spell match 1:', spellMatch1);
  console.log('🎯 Spell match 2:', spellMatch2);
  console.log('🎯 Spell match 3:', spellMatch3);
  
  const anySpellMatch = spellMatch1 || spellMatch2 || spellMatch3;
  console.log('✨ Any spell match:', !!anySpellMatch);
  
  console.log('---');
}

console.log('🧪 Testing Magic Initiate Regex Patterns\n');

testDescriptions.forEach(testRegexPatterns);

// Test the exact pattern from the logs
console.log('🔍 Testing exact log pattern:');
const logDescription = 'choose a class: bard, cleric, druid, sorcerer, warlock, or wizard. you learn two cantrips of your choice from that class\'s spell list. in addition, choose one 1st-level spell from that same list. you learn that spell and can cast it at its lowest level.';
testRegexPatterns(logDescription);
