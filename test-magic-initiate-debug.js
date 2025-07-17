/**
 * Debug script to test Magic Initiate detection
 * Run this in FoundryVTT browser console after creating a Fighter with Magic Initiate feat
 */

console.log('🧙‍♂️ Testing Magic Initiate detection...');

// Get the currently selected actor
const testActor = game.user.character || Array.from(game.actors)[0];

if (!testActor) {
  console.log('❌ No test actor found. Create a character first.');
} else {
  console.log('🎭 Testing with actor:', testActor.name);
  
  // Check if actor has feats
  const feats = testActor.items.filter(item => item.type === 'feat');
  console.log('📜 Found feats:', feats.length);
  
  feats.forEach((feat, index) => {
    console.log(`  ${index + 1}. ${feat.name}`);
    console.log(`     Type: ${feat.type}`);
    console.log(`     Description: ${feat.system?.description?.value?.substring(0, 100)}...`);
  });
  
  // Test the spell detection logic from WorkflowStateMachine
  console.log('\n🔍 Testing spell-granting feat detection...');
  
  let hasFeatSpellcasting = false;
  const items = testActor.items;
  
  for (const item of items) {
    if (item.type === 'feat') {
      const itemName = (item.name || '').toLowerCase();
      const description = (item?.system?.description?.value || '').toLowerCase();
      
      console.log(`\n📋 Checking feat: ${item.name}`);
      console.log(`   Name (lowercase): "${itemName}"`);
      console.log(`   Description snippet: "${description.substring(0, 200)}..."`);
      
      // Check for common spell-granting feats
      const spellGrantingFeats = [
        'magic initiate', 'ritual caster', 'fey touched', 'shadow touched',
        'telekinetic', 'telepathic', 'eldritch adept', 'aberrant dragonmark'
      ];
      
      const isSpellGrantingFeat = spellGrantingFeats.some(featName => {
        const nameMatch = itemName.includes(featName);
        const descMatch = description.includes(featName);
        console.log(`   Checking "${featName}": name=${nameMatch}, desc=${descMatch}`);
        return nameMatch || descMatch;
      });
      
      const hasLearnSpell = description.includes('you learn') && description.includes('spell');
      console.log(`   Has "you learn...spell": ${hasLearnSpell}`);
      
      if (isSpellGrantingFeat || hasLearnSpell) {
        hasFeatSpellcasting = true;
        console.log(`   ✅ FOUND spell-granting feat: ${itemName}`);
        break;
      } else {
        console.log(`   ❌ Not a spell-granting feat`);
      }
    }
  }
  
  console.log(`\n🎯 Final result: hasFeatSpellcasting = ${hasFeatSpellcasting}`);
  
  // Test if WorkflowStateMachine function works
  if (window.GAS?.workflowFSM?._shouldShowSpellSelection) {
    console.log('\n🔧 Testing WorkflowStateMachine._shouldShowSpellSelection...');
    const result = window.GAS.workflowFSM._shouldShowSpellSelection(testActor);
    console.log(`   Result: ${result}`);
  } else {
    console.log('\n❌ WorkflowStateMachine._shouldShowSpellSelection not available');
  }
}

console.log('\n🏁 Magic Initiate test complete!');
