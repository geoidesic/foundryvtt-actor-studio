// Combined console check for Sorcerer test actor state
const testActor = game.actors.find(a => a.name.startsWith("Quench Sorcerer Automation"));
if (!testActor) {
  console.log("❌ No test actor found - creation likely failed completely.");
} else {
  console.log("✅ Test Actor Found:", testActor.name);
  
  // Check Sorcerer class
  const sorcererClass = testActor.items.find(i => i.type === 'class' && i.system?.identifier === 'sorcerer');
  console.log("Sorcerer Class:", sorcererClass ? `✅ Level ${sorcererClass.system?.levels}` : "❌ Not found");
  
  // Check background
  const background = testActor.items.find(i => i.type === 'background');
  console.log("Background:", background ? `✅ ${background.name}` : "❌ Not found");
  
  // Check race
  const race = testActor.items.find(i => i.type === 'race' || i.type === 'species');
  console.log("Race/Species:", race ? `✅ ${race.name}` : "❌ Not found");
  
  // Check spells
  const spells = testActor.items.filter(i => i.type === 'spell');
  const cantrips = spells.filter(s => s.system?.level === 0);
  const level1Spells = spells.filter(s => s.system?.level === 1);
  console.log("Total Spells:", spells.length);
  console.log("Cantrips (Lv.0):", cantrips.length, cantrips.map(s => s.name));
  console.log("Level 1 Spells:", level1Spells.length, level1Spells.map(s => s.name));
  
  // Expected: ~4 cantrips, ~2 spells for Sorcerer Lv.1
  const hasExpectedSpells = cantrips.length >= 4 && level1Spells.length >= 2;
  console.log("Has Expected Spells?", hasExpectedSpells ? "✅ Yes" : "❌ No (UI timeout but spells embedded?)");
  
  // Summary
  const allGood = sorcererClass && background && race && hasExpectedSpells;
  console.log("Overall Status:", allGood ? "✅ Creation succeeded despite UI timeout" : "❌ Issues found");
}