// Debug script to test the gold amount mapping logic
console.log('Debug: Fighter variable gold mapping');

// Simulate Fighter gold options
const fighterGoldOptions = [
  { choice: 'A', goldAmount: 4, description: "Chain Mail group" },
  { choice: 'B', goldAmount: 11, description: "Studded Leather group" },
  { choice: 'C', goldAmount: 155, description: "Gold only choice" }
];

// Simulate equipment groups (assuming we have 2 choice groups)
const mockGroups = [
  { id: 'group1', type: 'choice', name: 'Chain Mail group' },
  { id: 'group2', type: 'choice', name: 'Studded Leather group' }
];

// Test the mapping logic
function getGoldAmountForGroup(group, groupIndex, goldOptions) {
  const choiceLetter = String.fromCharCode(65 + groupIndex); // A=65, B=66, C=67
  const goldOption = goldOptions.find(opt => opt.choice === choiceLetter);
  return goldOption?.goldAmount || null;
}

console.log('\nTesting mapping:');
mockGroups.forEach((group, index) => {
  const goldAmount = getGoldAmountForGroup(group, index, fighterGoldOptions);
  console.log(`Group ${index} (${group.name}): ${goldAmount} GP (Choice ${String.fromCharCode(65 + index)})`);
});

console.log('\nExpected result:');
console.log('Group 0 (Chain Mail): 4 GP (Choice A)');
console.log('Group 1 (Studded Leather): 11 GP (Choice B)');
