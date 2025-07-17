// Test script to verify Magic Initiate fix
// Run this in the browser console when you have a Fighter with Magic Initiate feat

console.log('=== Magic Initiate Fix Test ===');

// Test 1: Check if parseFeatSpellRequirements is working
if (window.GAS && window.GAS.parseFeatSpellRequirements) {
  console.log('✅ parseFeatSpellRequirements is available globally');
} else {
  console.log('❌ parseFeatSpellRequirements not available globally');
}

// Test 2: Get the current actor (should be Fighter with Magic Initiate)
const currentActor = game.actors.find(a => a.name.includes('Fighter') || a.classes?.fighter);
if (currentActor) {
  console.log('✅ Found Fighter actor:', currentActor.name);
  
  // Test 3: Check if Magic Initiate feat exists
  const magicInitiateFeat = currentActor.items.find(i => i.name.toLowerCase().includes('magic initiate'));
  if (magicInitiateFeat) {
    console.log('✅ Found Magic Initiate feat:', magicInitiateFeat.name);
    console.log('   Description:', magicInitiateFeat.system.description.value.substring(0, 100) + '...');
    
    // Test 4: Test the parsing function directly
    try {
      // Import and test the parsing function
      import('/modules/foundryvtt-actor-studio/src/stores/spellSelection.js').then(({ parseFeatSpellRequirements }) => {
        const result = parseFeatSpellRequirements(currentActor);
        console.log('✅ Parser result:', result);
        
        if (result.cantrips === 2 && result.spells === 1) {
          console.log('🎉 SUCCESS: Magic Initiate parsing works correctly!');
          console.log('   - Cantrips: 2 ✅');
          console.log('   - Spells: 1 ✅');
        } else {
          console.log('❌ FAILED: Incorrect parsing result');
          console.log('   Expected: { cantrips: 2, spells: 1 }');
          console.log('   Got:', result);
        }
      }).catch(error => {
        console.log('❌ Error importing spellSelection:', error);
      });
    } catch (error) {
      console.log('❌ Error testing parser:', error);
    }
  } else {
    console.log('❌ No Magic Initiate feat found on Fighter');
  }
} else {
  console.log('❌ No Fighter actor found');
}

// Test 5: Check if spell selection should show
if (window.GAS && window.GAS.workflowFSM) {
  const shouldShow = window.GAS.workflowFSM._shouldShowSpellSelection();
  console.log('Spell selection should show:', shouldShow);
} else {
  console.log('❌ WorkflowFSM not available');
}

console.log('=== Test Complete ===');
